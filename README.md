# 🔍 Recon Dork Checklist

> A bug bounty dorking tool — available as a **Browser Extension** and a **standalone HTML file**.

![Version](https://img.shields.io/badge/version-2.0.0-4ecdc4?style=flat-square)
![Manifest](https://img.shields.io/badge/manifest-v3-5ba4ff?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-69e08a?style=flat-square)
![Dorks](https://img.shields.io/badge/dorks-65%2B-ffd166?style=flat-square)

---

## What is this?

A search engine dorking checklist built for bug bounty hunters. It organizes 65+ Google dorks across 7 categories, tracks your progress, and opens searches directly in your preferred search engine — all without a backend or login.

---

## Two Versions

| | Browser Extension | HTML File |
|---|---|---|
| **Installation** | Load in Chrome/Edge/Brave | Open in any browser |
| **Storage** | `chrome.storage.local` (isolated per browser) | `localStorage` |
| **Opens links** | New tab (no popup blocker issues) | Direct window.open |
| **Best for** | Daily use during recon | Sharing, offline use, one-time runs |

---

## Features

- **65+ dorks** across 7 categories: Exposed Files, Credentials, Admin Panels, Databases, Error Pages, Cloud Storage, Sensitive Endpoints
- **7 search engines**: Google, Bing, Yandex, DuckDuckGo, Shodan, GitHub, Censys
- **Per-category browser selection** — set a different engine for each category
- **Add custom dorks and categories** — your own dorks saved locally
- **Priority tags** (High / Medium / Low) — click to cycle
- **Notes per dork** — add context or findings
- **Progress tracking** — per category and global
- **Search history** — log of every dork you ran with timestamp
- **Export / Import** — JSON backup of all custom data and progress
- **Bulk actions** — check/uncheck/copy all dorks in a category
- **Filter + priority filter** — find what you need fast
- **Two themes** — Dark and Soft

---

## Install: Browser Extension (Chrome / Edge / Brave)

```bash
# 1. Clone or download this repo
git clone https://github.com/YOUR_USERNAME/recon-dork-checklist.git

# 2. Open your browser's extension page
#    Chrome:  chrome://extensions
#    Edge:    edge://extensions
#    Brave:   brave://extensions

# 3. Enable "Developer mode" (top right toggle)

# 4. Click "Load unpacked" and select the /extension folder
```

That's it. The 🔍 icon will appear in your toolbar.

---

## Install: HTML Version

No installation needed. Just open `html-version/recon-dork-checklist-v2.html` in your browser.

> To use it offline, download the file and open it locally. All data is stored in `localStorage`.

---

## Supported Engines by Category

| Category | Default Engines |
|---|---|
| Exposed Files & Docs | Google, Bing, Yandex, DuckDuckGo |
| Credentials & Secrets | Google, GitHub, Bing |
| Admin Panels | Google, Bing, Yandex |
| Exposed Databases | Shodan, Censys, Google |
| Error Messages | Google, Bing |
| Cloud & Storage | Google, Bing |
| Sensitive Endpoints | Google, Bing |

---

## Categories

```
📁 Exposed Files & Docs      — config files, office docs, S3 buckets, directory listings
🔑 Credentials & Secrets     — .env files, API keys, SSH keys, DB connection strings
🖥️ Admin Panels              — phpMyAdmin, Jenkins, Grafana, cPanel, Kibana
🗄️ Exposed Databases         — MongoDB, Elasticsearch, Redis, Firebase, CouchDB
🐛 Error Messages & Debug    — SQL errors, stack traces, PHP warnings, Django debug
☁️ Cloud & Storage           — S3, Azure, GCP, Firebase, Docker, Kubernetes
🔎 Sensitive Params          — tokens in URLs, session IDs, backup files, Swagger
```

---

## Usage

1. Enter target domain in the input field (e.g. `example.com`)
2. Select your preferred search engine (global or per-category)
3. Click 🔗 on any dork to open the search in a new tab
4. Check the checkbox when done
5. Add notes with 📝
6. Track progress via the stats bar

---

## Data & Privacy

- All data stays local — no servers, no tracking, no accounts
- Extension uses `chrome.storage.local`
- HTML version uses `localStorage`
- Use Export/Import to transfer data between devices

---

## License

MIT — use it, fork it, modify it.

---

*Built for educational and authorized security research purposes only. Always get proper authorization before running dorks against any target.*
