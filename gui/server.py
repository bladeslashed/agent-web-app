"""Laya Neural Email Classifier Web GUI Server.
Hosts a local browser dashboard on http://127.0.0.1:8765.
Connects directly to IMAP (up to 500+ emails) or parses local files,
running GPU inference with Laya.
"""

import argparse
import cgi
import http.server
import json
import os
import socketserver
import sys
import threading
import time
import urllib.parse
import webbrowser
from pathlib import Path
from typing import List

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

_curr = Path(__file__).resolve().parent
_parent = _curr.parent
for _p in [str(_curr), str(_parent), str(_parent / "email_classifier"), str(_curr / "email_classifier")]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from rich.console import Console

# Import from local classifier module
try:
    from classifier import (
        COMMON_IMAP_SERVERS,
        EmailRecord,
        LayaEmailClassifier,
        fetch_emails_from_imap,
        load_eml_file,
        load_json_or_csv,
        load_mbox_file,
        parse_eml_bytes,
    )
except ImportError:
    try:
        from email_classifier.classifier import (
            COMMON_IMAP_SERVERS,
            EmailRecord,
            LayaEmailClassifier,
            fetch_emails_from_imap,
            load_eml_file,
            load_json_or_csv,
            load_mbox_file,
            parse_eml_bytes,
        )
    except ImportError:
        from email_classifier_laya import (
            COMMON_IMAP_SERVERS,
            EmailRecord,
            LayaEmailClassifier,
            fetch_emails_from_imap,
            load_eml_file,
            load_json_or_csv,
            load_mbox_file,
            parse_eml_bytes,
        )

console = Console()
classifier_instance: LayaEmailClassifier = None

if (_curr / "index.html").exists():
    STATIC_DIR = _curr
elif (_curr / "gui" / "index.html").exists():
    STATIC_DIR = _curr / "gui"
elif (_parent / "gui" / "index.html").exists():
    STATIC_DIR = _parent / "gui"
else:
    STATIC_DIR = _curr


class EmailClassifierHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def log_message(self, format, *args):
        # Silence routine static asset logs for clean output
        if "/api/" in (args[0] if args else ""):
            console.print(f"[dim cyan]API: {args[0]}[/dim cyan]")

    def send_json(self, status_code: int, data: dict):
        response_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/status":
            device = classifier_instance.device_name if classifier_instance else "CUDA"
            self.send_json(200, {"status": "ok", "device": device})
            return

        if parsed.path == "/api/load_sample":
            sample_path = None
            for cand in [
                _curr / "test_emails.json",
                _curr / "email_classifier" / "test_emails.json",
                _parent / "test_emails.json",
                _parent / "email_classifier" / "test_emails.json",
            ]:
                if cand.exists():
                    sample_path = cand
                    break

            if not sample_path or not sample_path.exists():
                self.send_json(404, {"error": "test_emails.json not found"})
                return

            records = load_json_or_csv(str(sample_path))
            results = []
            for r in records:
                res = classifier_instance.classify(r)
                results.append({
                    "sender": r.sender,
                    "subject": r.subject,
                    "body": r.body,
                    "date": r.date,
                    **res
                })
            self.send_json(200, {"status": "ok", "results": results})
            return

        # Default static file serving from gui directory
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/classify_single":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8", errors="replace")
            data = json.loads(body)

            rec = EmailRecord(
                sender=data.get("sender", "(Unknown)"),
                subject=data.get("subject", "(No Subject)"),
                body=data.get("body", ""),
                date=time.strftime("%a, %d %b %Y %H:%M:%S")
            )
            res = classifier_instance.classify(rec)
            self.send_json(200, res)
            return

        if parsed.path == "/api/classify_imap":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8", errors="replace")
            data = json.loads(body)

            user = data.get("user", "").strip()
            password = data.get("pass", "").strip()
            host = data.get("host", "").strip() or "imap.gmail.com"
            limit = int(data.get("limit", 50))
            unread_only = bool(data.get("unreadOnly", False))

            if not user or not password:
                self.send_json(400, {"error": "Email address and App Password are required."})
                return

            try:
                console.print(f"[bold cyan]GUI fetching up to {limit} emails via IMAP from {host}...[/bold cyan]")
                records = fetch_emails_from_imap(
                    host=host,
                    user=user,
                    password=password,
                    limit=limit,
                    unread_only=unread_only,
                    console=console
                )

                results = []
                for idx, r in enumerate(records, start=1):
                    res = classifier_instance.classify(r)
                    results.append({
                        "sender": r.sender,
                        "subject": r.subject,
                        "body": r.body,
                        "date": r.date,
                        **res
                    })

                console.print(f"[bold green]Successfully classified {len(results)} emails via GPU![/bold green]")
                self.send_json(200, {"status": "ok", "results": results})
            except Exception as e:
                console.print(f"[bold red]IMAP Error:[/bold red] {e}")
                self.send_json(500, {"error": str(e)})
            return

        if parsed.path == "/api/classify_file":
            # Read multipart form data
            content_type = self.headers.get("Content-Type", "")
            if not content_type.startswith("multipart/form-data"):
                self.send_json(400, {"error": "Expected multipart/form-data"})
                return

            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={"REQUEST_METHOD": "POST", "CONTENT_TYPE": content_type}
            )

            file_item = form.get("file") if "file" in form else None
            if not file_item or not file_item.file:
                self.send_json(400, {"error": "No file uploaded"})
                return

            filename = file_item.filename or "upload.eml"
            file_bytes = file_item.file.read()

            records = []
            if filename.endswith(".json"):
                data = json.loads(file_bytes.decode("utf-8", errors="replace"))
                if isinstance(data, dict):
                    data = data.get("emails", [data])
                for idx, item in enumerate(data):
                    records.append(EmailRecord(
                        sender=item.get("from") or item.get("sender") or "(Unknown)",
                        subject=item.get("subject") or "(No Subject)",
                        body=item.get("body") or item.get("content") or "",
                        date=item.get("date") or "",
                        source=f"{filename} #{idx+1}"
                    ))
            elif filename.endswith((".eml", ".msg")):
                records = [parse_eml_bytes(file_bytes, source_name=filename)]
            else:
                records = [parse_eml_bytes(file_bytes, source_name=filename)]

            results = []
            for r in records:
                res = classifier_instance.classify(r)
                results.append({
                    "sender": r.sender,
                    "subject": r.subject,
                    "body": r.body,
                    "date": r.date,
                    **res
                })

            self.send_json(200, {"status": "ok", "results": results})
            return

        self.send_json(404, {"error": "Not Found"})


def launch_gui(port: int = 8765, open_browser: bool = True):
    global classifier_instance
    console.print(f"[bold cyan]Initializing Laya Neural Model on device...[/bold cyan]")
    classifier_instance = LayaEmailClassifier()

    server_address = ("127.0.0.1", port)
    try:
        httpd = socketserver.ThreadingTCPServer(server_address, EmailClassifierHandler)
    except OSError:
        port = port + 1
        server_address = ("127.0.0.1", port)
        httpd = socketserver.ThreadingTCPServer(server_address, EmailClassifierHandler)

    url = f"http://127.0.0.1:{port}"
    console.print(f"\n[bold gold1]═════════════════════════════════════════════════════════[/bold gold1]")
    console.print(f"[bold white]  LAYA EMAIL CLASSIFIER WEB GUI STARTED: [bold cyan]{url}[/bold cyan][/bold white]")
    console.print(f"[bold gold1]═════════════════════════════════════════════════════════[/bold gold1]")
    console.print(f"[dim]Supports live IMAP (Gmail/Outlook), drag-and-drop files, and batch processing up to 500+ emails.[/dim]\n")

    if open_browser:
        threading.Timer(1.0, lambda: webbrowser.open(url)).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        console.print("\n[yellow]Shutting down GUI server...[/yellow]")
        httpd.server_close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Laya Neural Email Classifier Web GUI")
    parser.add_argument("--port", type=int, default=8765, help="Port to run GUI server on (default: 8765)")
    parser.add_argument("--no-browser", action="store_true", help="Don't open browser automatically")
    args = parser.parse_args()

    launch_gui(port=args.port, open_browser=not args.no_browser)
