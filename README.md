# 📜 T&C Analyzer – AI-Powered Terms & Conditions Summarizer

![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)
![Platform: Windows + Chrome](https://img.shields.io/badge/platform-Windows%20%7C%20Chrome-blue)
![Gemini API](https://img.shields.io/badge/API-Gemini%202.5%20Flash-brightgreen)

**T&C Analyzer** helps you understand the fine print. It reads Terms & Conditions from apps and websites and uses **AI (Gemini 2.5 Flash)** to summarize and flag harmful clauses — with severity ratings.

Two versions:
- 🖥️ **Windows Desktop App** — Works system-wide with hotkey.
- 🌐 **Chrome Extension** — Works on websites using DOM extraction.

---

## 🚀 Features

✅ AI-generated **summary** of Terms & Conditions  
✅ Highlights **harmful clauses** with reasons and severity (low / medium / high)  
✅ Lightweight, fast, and runs in the background  
✅ Global hotkey for desktop: `Ctrl + Alt + Shift + T`  
✅ Works in-app (desktop) and on web (browser extension)  

---

## 🧱 Tech Stack

| Layer        | Tool / Tech                         | Notes                                                 |
|--------------|--------------------------------------|--------------------------------------------------------|
| AI Engine    | Google Gemini 2.5 Flash             | Summarizes & analyzes clauses                         |
| Desktop UI   | Neutralino.js                       | Lightweight shell for HTML/JS app                     |
| Desktop Backend | Python (pywin32 + UIAutomation) | Extracts visible T&C text from active windows         |
| Chrome Ext.  | Manifest V3 + JS/Bootstrap          | Browser extension for DOM-based T&C detection         |
| Hotkey       | PyInstaller `.exe` listener         | Global hotkey trigger on Windows                      |
| UI Frontend  | Bootstrap 5                         | Shared styling in both app and extension              |

---

# 🖥️ Windows Desktop App

### 📦 Installation

1. **Clone the repo**
```bash
git clone https://github.com/your-username/TnC-Analyzer.git
cd TnC-Analyzer
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Install Neutralino**
```bash
npm install -g @neutralinojs/neu
```

4. **Add Gemini API key**
Create a `.env` file:
```env
GEMINI_API_KEY=your_gemini_key
```

5. **Compile the hotkey listener**
```bash
pyinstaller --onefile --noconsole python_files/hotkey_listener.py
```
Move `dist/hotkey_listener.exe` to `python_files/hotkey_listener.exe`

---

### ▶️ Run (Dev Mode)

```bash
neu run
```

Press your global hotkey:
```
Ctrl + Alt + Shift + T
```

🧠 The app will extract T&C text, analyze it using Gemini, and show a summary + harmful clauses in the UI.

---

### 📦 Build Final `.exe` App

```bash
neu build --release
```

Then:
- Copy your `python_files/` folder into `dist/TNC-Analyzer/`
- Ensure `neutralino.config.json` includes:

```json
"include": [
  "python_files/**",
  "resources/**",
  "js/**",
  "index.html",
  "styles.css"
]
```

---

# 🌐 Chrome Extension

### ✅ Features

- Extracts T&C text from webpages and modals
- Uses AI to generate a summary and flag harmful clauses
- Offers both:
  - Analyze **entire page**
  - Analyze **selected text**
- Works via popup, no background injection unless triggered

---

### 🔧 Installation (Local Testing)

1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load Unpacked**
4. Select the `tnc-extension/` directory

---

### 🔑 First-Time Setup

1. After install, a tab opens: `setup.html`
2. Enter your **Gemini API key**
3. The key is stored securely using `chrome.storage.local`

---

### 🧠 How It Works

- Content script (`content.js`) extracts visible text from modals and paragraphs.
- Popup triggers extraction and sends it to `background.js`.
- Background script calls Gemini and returns structured JSON to the popup.
- Results are shown as **Bootstrap cards** with severity indicators.

---

### 🗂️ File Structure

```
tnc-extension/
│
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── setup.html
├── setup.js
├── styles.css
└── icons/
```

---

## 🔁 Roadmap

| Feature                              | Status  |
|-------------------------------------|---------|
| Accessibility text extraction       | ✅ Done |
| Gemini 2.5 integration              | ✅ Done |
| Global hotkey trigger               | ✅ Done |
| Chrome extension                    | ✅ Done |
| Filter/sort clauses by severity     | ✅ Done |
| UI styling with Bootstrap           | ✅ Done |
| OCR fallback (desktop)              | 🕗 Planned |
| Dark mode toggle                    | 🕗 Planned |
| Clause export/download              | 🕗 Planned |

---

## 🤝 Contributing

Pull requests and feedback welcome!

We're especially looking for help with:
- Improving clause filtering logic
- Auto-injecting content script when needed
- OCR fallback for inaccessible apps (desktop)
- Improving UI/UX polish

---

## 🧑‍💻 License

MIT License

---

## ✨ Credits

Created by [Chaitanya Pandey](https://github.com/Chaitu1712)

Powered by:
- [Gemini by Google](https://ai.google.dev/)
- [Neutralino.js](https://neutralino.js.org/)
- [Bootstrap 5](https://getbootstrap.com/)
- [Python](https://www.python.org/)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
