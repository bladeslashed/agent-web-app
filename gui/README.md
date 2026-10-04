# Laya Neural Email Classifier & Web GUI

A high-performance, GPU-accelerated email categorization and prioritization system powered by the **Laya typed decision agent** (ModernBERT bidirectional encoder).

---

## Features

- **6 Distinct Categories**:
  - `SPAM`: Malicious phishing, crypto scams, wire fraud, fake lottery prizes.
  - `JUNK`: Commercial marketing promotions, store sales, clearance flyers, shopping newsletters.
  - `SCHOOL`: Coursework, assignments, Canvas/Blackboard alerts, teacher communications, exams.
  - `WEBSITE`: Account security, 2FA codes, password resets, cloud receipts, order shipping.
  - `GAME`: Steam wishlist alerts, digital game purchases, patch notes, esports, Discord gaming.
  - `PERSONAL`: Direct 1-on-1 human conversations between friends, family, or colleagues.
- **Calibrated Priority Scale (1.0 to 5.0 Stars)**: Dynamically weights category criticality, security events, deadlines, and urgency.
- **Urgency Detection**: Uses Laya's neural `noul` question head to identify emails requiring immediate human action.
- **Multiple Data Ingestion Modes**:
  - **Live IMAP**: Connects directly over SSL to Gmail, Outlook, Yahoo, or university inboxes without needing third-party proxy services or MCP servers.
  - **Local Files**: Reads `.eml`, `.msg`, `.mbox` (Google Takeout / Thunderbird), `.json`, and `.csv`.
  - **Interactive CLI**: Manual typing / pasting.
  - **Modern Web GUI**: Full-featured browser dashboard with real-time progress bar, category filter pills, search, neural probability distribution drawer, and JSON export.

---

## Requirements

### Python & Hardware
- **Python**: `>= 3.10`
- **Hardware**: NVIDIA GPU with CUDA recommended for ultra-low latency (<50ms/email); also runs on CPU.

### Dependencies
Install dependencies using `pip` or `uv`:

```bash
pip install -r requirements.txt
```

*(Packages: `torch`, `rich`, `tokenizers`, `safetensors`, `numpy`)*

### Model Checkpoint
Ensure the Laya model weights are placed in `models/pytorch_laya/` (or relative path configured):
- `model.safetensors`
- `rl_agent_config.json`
- `tokenizer/`

---

## Quick Start

### 1. Launch the Web GUI Dashboard

Run the standalone GUI server to open the interactive dashboard in your default browser at `http://127.0.0.1:8765`:

```bash
# Using Python
python server.py

# Or via classifier launcher:
python classifier.py --gui
```

#### GUI Capabilities:
- **Batch Processing**: Select limits of **20, 50, 100, 250, 500+ emails**.
- **Live IMAP Connection**: Enter email, App Password, and server to analyze live unread emails.
- **File Drag-and-Drop**: Upload `.json`, `.csv`, `.eml`, or `.mbox` files.
- **Interactive Detail Drawer**: Click any email row to view full body text and a horizontal bar chart of Laya's neural probability distribution.
- **Export**: Save classified results to JSON with one click.

---

### 2. Command-Line Interface (CLI)

#### Live IMAP Inbox Fetch
Connect to any standard IMAP server (e.g., Gmail):
```bash
python classifier.py --imap --imap-server imap.gmail.com --imap-user your.email@gmail.com --unread-only --limit 50
```
*(Tip: For Gmail or Outlook with 2FA, generate a 16-character App Password in your account security settings).*

#### Single File / Archive Classification
```bash
# JSON / CSV file
python classifier.py --file test_emails.json

# Mailbox archive (.mbox)
python classifier.py --file All_Mail.mbox --limit 100

# Directory of .eml files
python classifier.py --dir path/to/eml_folder/ --limit 50
```

#### Interactive Terminal Mode
Run without arguments to manually type or paste emails:
```bash
python classifier.py
```

---

## Project Structure

```
email_classifier/
├── classifier.py         # Core classification engine, signal extractor, and CLI
├── server.py             # Multi-threaded HTTP API server for Web GUI
├── gui/                  # Modern Web GUI frontend
│   ├── index.html        # Dashboard markup & layout
│   ├── style.css         # Glassmorphism dark-mode stylesheet
│   └── app.js            # Frontend logic, charts, filtering & search
├── test_emails.json      # Sample email dataset for testing
├── requirements.txt      # Python dependencies
└── README.md             # Project documentation
```
