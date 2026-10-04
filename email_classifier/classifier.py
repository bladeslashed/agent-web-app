"""Laya Neural Email Classifier & Reader Harness.
Uses the Laya typed decision agent on GPU/CPU to categorize emails into:
spam, junk, school, website, game, personal.

Reads email data from:
1. Live IMAP email server (Gmail, Outlook, Yahoo, School webmail)
2. Local .eml files (single file or entire directory)
3. .mbox mailbox archive files (Google Takeout / Thunderbird)
4. JSON / CSV email dump files
5. Interactive manual prompt
6. Modern Web GUI (--gui)
"""

import argparse
import csv
import email
import getpass
import html
import imaplib
import json
import mailbox
import os
import re
import sys
import time
from dataclasses import dataclass
from email.header import decode_header
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, Iterator, List, Optional, Tuple

# Ensure current and parent directory are in python path
_curr = Path(__file__).parent.resolve()
_parent = _curr.parent.resolve()
for _p in [str(_curr), str(_parent)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from rich import box
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from laya_agent import PyTorchLayaAgent


# ---------------------------------------------------------
# Helper to locate model directory
# ---------------------------------------------------------

def resolve_model_dir() -> str:
    candidates = [
        _curr / "models" / "pytorch_laya",
        _parent / "models" / "pytorch_laya",
        Path("models/pytorch_laya"),
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    return "models/pytorch_laya"


# ---------------------------------------------------------
# Data Structures & HTML Stripper
# ---------------------------------------------------------

class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []

    def handle_data(self, d):
        self.result.append(d)

    def get_text(self) -> str:
        return " ".join(self.result).strip()


def strip_html(html_content: str) -> str:
    try:
        extractor = HTMLTextExtractor()
        extractor.feed(html_content)
        cleaned = extractor.get_text()
        return re.sub(r"\s+", " ", cleaned).strip()
    except Exception:
        return re.sub(r"<[^>]+>", " ", html_content).strip()


def decode_mime_header(header_val: Optional[str]) -> str:
    if not header_val:
        return ""
    decoded_fragments = decode_header(header_val)
    out = []
    for fragment, encoding in decoded_fragments:
        if isinstance(fragment, bytes):
            try:
                out.append(fragment.decode(encoding or "utf-8", errors="replace"))
            except Exception:
                out.append(fragment.decode("latin1", errors="replace"))
        else:
            out.append(str(fragment))
    return " ".join(out).strip()


@dataclass
class EmailRecord:
    sender: str
    subject: str
    body: str
    date: str = ""
    source: str = ""

    def snippet(self, max_chars: int = 350) -> str:
        clean = " ".join(self.body.split())
        if len(clean) > max_chars:
            return clean[:max_chars] + "..."
        return clean


# ---------------------------------------------------------
# Readers for Email Files (.eml, .mbox, .json, .csv)
# ---------------------------------------------------------

def extract_body_from_message(msg: email.message.Message) -> str:
    body_plain = ""
    body_html = ""

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            if "attachment" in content_disposition:
                continue

            try:
                payload = part.get_payload(decode=True)
                if not payload:
                    continue
                charset = part.get_content_charset() or "utf-8"
                text = payload.decode(charset, errors="replace")
            except Exception:
                continue

            if content_type == "text/plain" and not body_plain:
                body_plain = text
            elif content_type == "text/html" and not body_html:
                body_html = text
    else:
        try:
            payload = msg.get_payload(decode=True)
            charset = msg.get_content_charset() or "utf-8"
            text = payload.decode(charset, errors="replace") if payload else ""
            if msg.get_content_type() == "text/html":
                body_html = text
            else:
                body_plain = text
        except Exception:
            body_plain = str(msg.get_payload() or "")

    if body_plain.strip():
        return body_plain.strip()
    if body_html.strip():
        return strip_html(body_html)
    return "(No text body)"


def parse_eml_bytes(data: bytes, source_name: str = "") -> EmailRecord:
    msg = email.message_from_bytes(data)
    sender = decode_mime_header(msg.get("From", "(Unknown Sender)"))
    subject = decode_mime_header(msg.get("Subject", "(No Subject)"))
    date = decode_mime_header(msg.get("Date", ""))
    body = extract_body_from_message(msg)
    return EmailRecord(sender=sender, subject=subject, body=body, date=date, source=source_name)


def load_eml_file(path: str) -> EmailRecord:
    with open(path, "rb") as f:
        return parse_eml_bytes(f.read(), source_name=os.path.basename(path))


def load_eml_dir(dir_path: str, max_emails: Optional[int] = None) -> List[EmailRecord]:
    p = Path(dir_path)
    records = []
    eml_files = list(p.glob("**/*.eml")) + list(p.glob("**/*.msg"))
    if max_emails:
        eml_files = eml_files[:max_emails]
    for file_path in eml_files:
        try:
            records.append(load_eml_file(str(file_path)))
        except Exception as e:
            print(f"Skipping {file_path.name}: {e}")
    return records


def load_mbox_file(path: str, max_emails: Optional[int] = None) -> List[EmailRecord]:
    mbox = mailbox.mbox(path)
    records = []
    count = 0
    for key, msg in mbox.items():
        sender = decode_mime_header(msg.get("From", "(Unknown Sender)"))
        subject = decode_mime_header(msg.get("Subject", "(No Subject)"))
        date = decode_mime_header(msg.get("Date", ""))
        body = extract_body_from_message(msg)
        records.append(EmailRecord(sender=sender, subject=subject, body=body, date=date, source=f"{os.path.basename(path)}:#{key}"))
        count += 1
        if max_emails and count >= max_emails:
            break
    return records


def load_json_or_csv(path: str, max_emails: Optional[int] = None) -> List[EmailRecord]:
    records = []
    if path.endswith(".json"):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            data = data.get("emails", [data])
        for idx, item in enumerate(data):
            sender = item.get("from") or item.get("sender") or "(Unknown)"
            subject = item.get("subject") or "(No Subject)"
            body = item.get("body") or item.get("content") or item.get("snippet") or ""
            date = item.get("date") or ""
            records.append(EmailRecord(sender=sender, subject=subject, body=body, date=date, source=f"JSON #{idx+1}"))
            if max_emails and len(records) >= max_emails:
                break
    elif path.endswith(".csv"):
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                sender = row.get("from") or row.get("sender") or row.get("From") or "(Unknown)"
                subject = row.get("subject") or row.get("Subject") or "(No Subject)"
                body = row.get("body") or row.get("content") or row.get("Body") or row.get("snippet") or ""
                date = row.get("date") or row.get("Date") or ""
                records.append(EmailRecord(sender=sender, subject=subject, body=body, date=date, source=f"CSV row #{idx+1}"))
                if max_emails and len(records) >= max_emails:
                    break
    return records


# ---------------------------------------------------------
# Live IMAP Email Fetcher
# ---------------------------------------------------------

COMMON_IMAP_SERVERS = {
    "gmail.com": "imap.gmail.com",
    "googlemail.com": "imap.gmail.com",
    "outlook.com": "outlook.office365.com",
    "hotmail.com": "outlook.office365.com",
    "live.com": "outlook.office365.com",
    "yahoo.com": "imap.mail.yahoo.com",
    "icloud.com": "imap.mail.me.com",
}


def fetch_emails_from_imap(
    host: str,
    user: str,
    password: str,
    port: int = 993,
    folder: str = "INBOX",
    limit: int = 50,
    unread_only: bool = False,
    console: Optional[Console] = None,
) -> List[EmailRecord]:
    c = console or Console()
    c.print(f"[bold cyan]Connecting via SSL to IMAP server:[/bold cyan] {host}:{port} as [bold]{user}[/bold]...")

    mail = imaplib.IMAP4_SSL(host, port)
    mail.login(user, password)
    status, _ = mail.select(folder, readonly=True)
    if status != "OK":
        raise RuntimeError(f"Could not open IMAP folder '{folder}'")

    search_criterion = "UNSEEN" if unread_only else "ALL"
    status, msg_ids = mail.search(None, search_criterion)
    if status != "OK" or not msg_ids[0]:
        c.print("[yellow]No emails found matching query in folder.[/yellow]")
        mail.logout()
        return []

    id_list = msg_ids[0].split()
    total_found = len(id_list)
    target_ids = id_list[-limit:] if total_found > limit else id_list
    target_ids.reverse()

    c.print(f"[green]Found {total_found} emails. Fetching newest {len(target_ids)}...[/green]")
    records = []

    for msg_id in target_ids:
        res, data = mail.fetch(msg_id, "(RFC822)")
        if res != "OK":
            continue
        raw_email = data[0][1]
        record = parse_eml_bytes(raw_email, source_name=f"IMAP:{folder} #{msg_id.decode('ascii')}")
        records.append(record)

    mail.logout()
    return records


# ---------------------------------------------------------
# Laya Neural Decision Classifier
# ---------------------------------------------------------

class LayaEmailClassifier:
    """Laya typed neural decision agent for email categorization."""

    CATEGORIES = {
        "spam": ("red", "Malicious phishing scams, fake lottery prizes, fraudulent crypto offers, wire fraud, or malicious links."),
        "junk": ("magenta", "Retail marketing promotions, commercial sales coupons, fashion newsletters, discount advertisements, or promotional bulk emails."),
        "school": ("blue", "Educational announcements, university or school notices, class homework assignments, Canvas/Blackboard updates, or teacher communications."),
        "website": ("cyan", "Account verifications, login 2FA codes, password reset requests, security notices, GitHub tokens, or automated web service notifications."),
        "game": ("green", "Steam wishlist/sale alerts, Epic Games receipts, PlayStation/Xbox notifications, game patches, or gaming community updates."),
        "personal": ("gold1", "Direct conversational emails from friends, family, or colleagues discussing personal plans, dinner, meetings, or casual catchups."),
    }

    def __init__(self, model_dir: Optional[str] = None, device: Optional[str] = None):
        self.console = Console()
        resolved = model_dir or resolve_model_dir()
        self.console.print(f"[bold cyan]Initializing Laya Neural Model from {resolved}...[/bold cyan]")
        self.agent = PyTorchLayaAgent(model_dir=resolved, max_length=768, device=device)
        self.device_name = str(self.agent.device).upper()
        self.console.print(f"[bold green]Laya Email Classifier ready on: {self.device_name}[/bold green]\n")

    @staticmethod
    def extract_signals(sender: str, subject: str, body: str) -> Dict:
        combined = (sender + " " + subject + " " + body).lower()
        sender_lower = sender.lower()
        subject_lower = subject.lower()

        signals = []
        likely = None
        base_priority = 2.5
        urgent_flag = False

        if any(k in combined for k in [
            "crypto jackpot", "claim your btc", "bitcoin deposit", "wire transfer",
            "urgent secret key", "western union", "million dollars", "wallet address won",
            "inheritance fund", "urgent payment to verify account", "claim lottery"
        ]):
            signals.append("High-probability fraudulent scam / phishing payload detected")
            likely = "spam"
            base_priority = 1.0
        elif any(d in sender_lower for d in [".edu", "canvas", "blackboard", "classroom", "school", "university", "faculty", "ac.uk"]) or \
             any(k in subject_lower for k in ["assignment", "homework", "exam", "syllabus", "midterm", "grade", "due friday", "due today", "lecture"]):
            signals.append("Educational institution / academic coursework notification")
            likely = "school"
            base_priority = 4.2
            if any(u in subject_lower for u in ["due", "urgent", "exam", "deadline"]):
                urgent_flag = True
                base_priority = 4.8
        elif any(g in sender_lower for g in ["steam", "epicgames", "riotgames", "blizzard", "playstation", "xbox", "discord", "nintendo", "roblox", "twitch", "ubisoft", "ea.com"]) or \
             any(g in subject_lower for g in ["steam wishlist", "patch notes", "game sale", "dlc", "battle pass", "esports", "epic games"]):
            signals.append("Gaming platform / digital store alert")
            likely = "game"
            base_priority = 2.2
        elif any(w in sender_lower for w in ["github", "google.com", "apple.com", "microsoft", "paypal", "stripe", "uber", "amazon", "security-alert", "no-reply", "noreply", "accounts@", "billing@"]) or \
             any(w in subject_lower for w in ["access token", "security alert", "verification code", "password reset", "2fa", "two-factor", "order confirmation", "receipt for", "invoice", "shipped"]):
            signals.append("Web service transactional alert or security event")
            likely = "website"
            if any(s in subject_lower for s in ["security alert", "access token", "password reset", "unauthorized", "suspicious login"]):
                urgent_flag = True
                base_priority = 5.0
            else:
                base_priority = 3.8
        elif any(m in combined for m in ["unsubscribe", "flash sale", "% off", "clearance", "promo code", "limited time offer", "discount", "weekly deals", "catalogue", "newsletter"]):
            signals.append("Commercial marketing promotion / retail newsletter (Safe bulk mail, not scam)")
            likely = "junk"
            base_priority = 1.6
        elif any(d in sender_lower for d in ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", "@icloud.com", "@me.com"]):
            signals.append("Direct communication from personal email address")
            likely = "personal"
            base_priority = 4.0

        return {
            "summary": "; ".join(signals) if signals else "General incoming correspondence",
            "likely": likely,
            "base_priority": base_priority,
            "urgent_flag": urgent_flag,
        }

    def classify(self, email: EmailRecord) -> Dict:
        sender = (email.sender or "(Unknown)")[:120]
        subject = (email.subject or "(No Subject)")[:160]

        clean_body = " ".join((email.body or "").split())
        try:
            body_tokens = self.agent.tok.backend.encode(clean_body).ids
            if len(body_tokens) > 300:
                clean_body = self.agent.tok.backend.decode(body_tokens[:300])
        except Exception:
            clean_body = clean_body[:500]

        sig = self.extract_signals(sender, subject, clean_body)

        prompt = (
            f"Email Sender: {sender}\n"
            f"Email Subject: {subject}\n"
            f"Email Body Content: {clean_body}"
        )

        criteria = {
            "game": "Gaming platform alerts, Steam wishlist, game sales, patch updates.",
            "school": "Academic coursework, homework, assignments, university notices.",
            "website": "Account security, access tokens, 2FA, password resets, cloud receipts.",
            "personal": "Direct 1-on-1 human chat from friends, family, or colleagues.",
            "junk": "Commercial retail marketing, store sales, clearance promotions, shopping newsletters.",
            "spam": "Scams, fake cryptocurrency, lottery fraud, phishing, wire theft.",
        }

        questions = {
            "category": {
                "type": "choice",
                "instructions": "Choose the category that best classifies this email.",
                "criteria": criteria,
            },
            "urgency": {
                "type": "noul",
                "instructions": "Does this email require urgent or immediate human attention?",
            },
        }

        t0 = time.perf_counter()
        res = self.agent.predict(prompt, questions)
        inference_ms = (time.perf_counter() - t0) * 1000

        ans = res["answers"]
        predicted_cat = ans["category"]["choice"].lower()
        urgency_score = ans["urgency"]["noul"]

        base = sig["base_priority"]
        if predicted_cat == "spam":
            calc_priority = 1.0
        elif predicted_cat == "junk":
            calc_priority = 1.5 if urgency_score < 0.5 else 2.0
        elif predicted_cat == "game":
            calc_priority = 2.2 if urgency_score < 0.5 else 2.8
        elif predicted_cat == "personal":
            calc_priority = 4.0 if urgency_score < 0.5 else 4.7
        elif predicted_cat == "school":
            calc_priority = 4.3 if urgency_score < 0.5 else 5.0
        elif predicted_cat == "website":
            calc_priority = 3.8 if urgency_score < 0.5 else 5.0
        else:
            calc_priority = base

        if sig["urgent_flag"]:
            calc_priority = min(5.0, calc_priority + 0.5)

        calc_priority = min(5.0, max(1.0, round(calc_priority, 1)))

        return {
            "category": predicted_cat,
            "probabilities": ans["category"]["probabilities"],
            "urgency_score": urgency_score,
            "importance": calc_priority,
            "signals": sig["summary"],
            "inference_ms": inference_ms,
        }

    def process_and_display(self, records: List[EmailRecord]):
        if not records:
            self.console.print("[yellow]No emails to process.[/yellow]")
            return

        summary_table = Table(
            title=f"Laya Email Categorization Summary ({len(records)} emails)",
            box=box.ROUNDED,
            expand=True,
        )
        summary_table.add_column("#", width=4, justify="right")
        summary_table.add_column("Category", style="bold", width=12)
        summary_table.add_column("Sender", style="dim", width=26)
        summary_table.add_column("Subject", style="bold white", width=34)
        summary_table.add_column("Priority (1-5)", width=15, justify="center")
        summary_table.add_column("Urgent", width=8, justify="center")
        summary_table.add_column("Latency", width=9, justify="right")

        category_counts: Dict[str, int] = {k: 0 for k in self.CATEGORIES}

        self.console.print(f"\n[bold cyan]Processing {len(records)} emails through Laya Neural Engine...[/bold cyan]\n")

        for i, rec in enumerate(records, start=1):
            res = self.classify(rec)
            cat = res["category"].lower()
            category_counts[cat] = category_counts.get(cat, 0) + 1

            color, _ = self.CATEGORIES.get(cat, ("white", ""))
            urgent_str = "[bold red]YES[/bold red]" if res["urgency_score"] > 0.55 else "[dim]No[/dim]"
            priority_score = res["importance"]
            stars = "★" * int(round(priority_score))

            sender_display = rec.sender[:24] + ".." if len(rec.sender) > 26 else rec.sender
            subj_display = rec.subject[:32] + ".." if len(rec.subject) > 34 else rec.subject

            summary_table.add_row(
                str(i),
                f"[{color}]{cat.upper()}[/{color}]",
                sender_display,
                subj_display,
                f"[yellow]{stars}[/yellow] ({priority_score:.1f}/5)",
                urgent_str,
                f"{res['inference_ms']:.0f} ms",
            )

        self.console.print(summary_table)

        stats_table = Table(box=box.SIMPLE, show_header=False)
        stats_table.add_column("Cat")
        stats_table.add_column("Count")
        for cat, count in category_counts.items():
            if count > 0:
                color, _ = self.CATEGORIES.get(cat, ("white", ""))
                stats_table.add_row(f"[{color}]{cat.upper()}[/{color}]", f"[bold]{count}[/bold] email(s)")

        self.console.print(Panel(stats_table, title="[bold cyan]Category Distribution[/bold cyan]", border_style="cyan"))


# ---------------------------------------------------------
# CLI & Modes
# ---------------------------------------------------------

def run_interactive_mode(classifier: LayaEmailClassifier):
    console = classifier.console
    console.print("[bold cyan]─── Laya Interactive Email Classifier ───[/bold cyan]")
    console.print("Type or paste email details. Enter 'q' on sender to quit.\n")

    while True:
        try:
            sender = console.input("[bold yellow]Sender (From):[/bold yellow] ").strip()
            if not sender or sender.lower() in ["q", "quit", "exit"]:
                break
            subject = console.input("[bold yellow]Subject:[/bold yellow] ").strip()
            body = console.input("[bold yellow]Body / Content snippet:[/bold yellow] ").strip()

            email_rec = EmailRecord(sender=sender, subject=subject, body=body, source="Interactive")

            with console.status("[bold cyan]Laya is analyzing...[/bold cyan]"):
                res = classifier.classify(email_rec)

            cat = res["category"].lower()
            color, _ = classifier.CATEGORIES.get(cat, ("white", ""))

            detail_table = Table(box=box.ROUNDED, expand=True)
            detail_table.add_column("Metric", style="bold cyan", width=22)
            detail_table.add_column("Value")

            detail_table.add_row("Assigned Category", f"[bold {color}]{cat.upper()}[/bold {color}]")
            detail_table.add_row("Urgency Score", f"{res['urgency_score']*100:.1f}%")
            detail_table.add_row("Priority Score (1-5)", f"[yellow]{'★' * int(round(res['importance']))}[/yellow] ({res['importance']:.1f}/5)")
            detail_table.add_row("GPU Inference Speed", f"[green]{res['inference_ms']:.1f} ms[/green]")

            probs_sorted = sorted(res["probabilities"].items(), key=lambda x: x[1], reverse=True)
            prob_str = " | ".join([f"{k}: {v*100:.1f}%" for k, v in probs_sorted])
            detail_table.add_row("Probabilities", prob_str)

            console.print(detail_table)
            console.print("-" * 60 + "\n")
        except (KeyboardInterrupt, EOFError):
            break


def main():
    parser = argparse.ArgumentParser(
        description="Laya Neural Email Classifier - Read and classify live or stored email data."
    )
    parser.add_argument("--gui", action="store_true", help="Launch interactive browser Web GUI dashboard")
    parser.add_argument("--port", type=int, default=8765, help="Port for Web GUI (default: 8765)")

    # File options
    parser.add_argument("--file", "-f", type=str, help="Path to a single .eml, .mbox, .json, or .csv file")
    parser.add_argument("--dir", "-d", type=str, help="Path to a directory containing .eml files")
    parser.add_argument("--limit", "-n", type=int, default=50, help="Max emails to process from file/dir/IMAP (default: 50)")

    # IMAP Live options
    parser.add_argument("--imap", action="store_true", help="Connect directly to a live IMAP mailbox (Gmail, Outlook, etc.)")
    parser.add_argument("--imap-server", type=str, help="IMAP server hostname (e.g., imap.gmail.com, outlook.office365.com)")
    parser.add_argument("--imap-user", type=str, help="Email address / IMAP username")
    parser.add_argument("--imap-password", type=str, help="Email password or App Password (will prompt securely if omitted)")
    parser.add_argument("--imap-folder", type=str, default="INBOX", help="IMAP folder name (default: INBOX)")
    parser.add_argument("--unread-only", action="store_true", help="Only fetch unread emails via IMAP")

    # Model options
    parser.add_argument("--model-dir", type=str, default=None, help="Path to PyTorch Laya model weights")
    parser.add_argument("--device", type=str, default=None, help="Inference device: 'cuda' or 'cpu'")
    args = parser.parse_args()

    if args.gui:
        from server import launch_gui
        launch_gui(port=args.port, open_browser=True, model_dir=args.model_dir)
        return

    console = Console()
    records: List[EmailRecord] = []

    if args.imap:
        user = args.imap_user
        if not user:
            user = console.input("[bold yellow]Enter your email address:[/bold yellow] ").strip()

        server = args.imap_server
        if not server:
            domain = user.split("@")[-1].lower() if "@" in user else ""
            server = COMMON_IMAP_SERVERS.get(domain)
            if not server:
                server = console.input(f"[bold yellow]Enter IMAP server for {domain} (e.g. imap.mail.com):[/bold yellow] ").strip()

        password = args.imap_password
        if not password:
            console.print("[dim](Tip: For Gmail or Outlook with 2FA, use an App Password created in your account settings)[/dim]")
            password = getpass.getpass("Enter email / app password: ")

        try:
            records = fetch_emails_from_imap(
                host=server,
                user=user,
                password=password,
                folder=args.imap_folder,
                limit=args.limit,
                unread_only=args.unread_only,
                console=console,
            )
        except Exception as e:
            console.print(f"[bold red]IMAP connection error:[/bold red] {e}")
            sys.exit(1)

    elif args.file:
        file_path = args.file
        if not os.path.exists(file_path):
            console.print(f"[bold red]File not found:[/bold red] {file_path}")
            sys.exit(1)

        console.print(f"[cyan]Loading email data from file:[/cyan] {file_path}")
        if file_path.endswith((".eml", ".msg")):
            records = [load_eml_file(file_path)]
        elif file_path.endswith(".mbox"):
            records = load_mbox_file(file_path, max_emails=args.limit)
        elif file_path.endswith((".json", ".csv")):
            records = load_json_or_csv(file_path, max_emails=args.limit)
        else:
            records = [load_eml_file(file_path)]

    elif args.dir:
        dir_path = args.dir
        if not os.path.isdir(dir_path):
            console.print(f"[bold red]Directory not found:[/bold red] {dir_path}")
            sys.exit(1)
        console.print(f"[cyan]Scanning .eml files in directory:[/cyan] {dir_path}")
        records = load_eml_dir(dir_path, max_emails=args.limit)

    classifier = LayaEmailClassifier(model_dir=args.model_dir, device=args.device)

    if records:
        classifier.process_and_display(records)
    else:
        run_interactive_mode(classifier)


if __name__ == "__main__":
    main()
