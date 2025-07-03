# 📜 T&C Analyzer – Lightweight Desktop AI for Terms & Conditions

**T&C Analyzer** is a privacy-focused Windows desktop app that reads and summarizes Terms & Conditions using **AI**, triggered via a global hotkey. Stay informed before you agree — without reading pages of legalese.

---

## 🚀 Features

✅ Extracts T&C text from any focused app using Windows Accessibility API  
✅ AI-powered summary with Gemini 2.5 Flash  
✅ Flags potentially **harmful clauses** (with severity: high, medium, low)  
✅ Always-on tray app with **global hotkey** trigger: `Ctrl + Alt + Shift + T`  
✅ Built for speed: small, silent, and resource-light  
✅ Fully self-contained `.exe` build using Neutralino.js + Python

---

## 🧱 Tech Stack

| Layer         | Tool / Tech                  | Notes                                             |
|---------------|------------------------------|--------------------------------------------------|
| Shell         | [Neutralino.js](https://neutralino.js.org/) | Lightweight native shell for HTML + JS          |
| Backend       | Python 3.12                  | Handles UI Automation + Gemini calls             |
| AI API        | Gemini 2.5 Flash             | Summarizes and flags clauses                     |
| Hotkey        | PyInstaller `.exe`           | Global hotkey listener (compiled Python)         |
| Packaging     | `neu build --release`        | Finalizes app for distribution                   |

---

## 🛠️ Installation & Setup

### 1. Clone the repo
```bash
git clone https://github.com/your-username/TnC-Analyzer.git
cd TnC-Analyzer
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Install Neutralino.js
```bash
npm install -g @neutralinojs/neu
```

### 4. Add your Gemini API key
Create a `.env` file:
```env
GEMINI_API_KEY=your_api_key_here
```

---

## ▶️ Run in Development Mode

```bash
neu run
```

Then press:
```plaintext
Ctrl + Alt + Shift + T
```

🧠 The app extracts text from the active window and sends it to Gemini for analysis. The results (summary + harmful clauses) appear in the app UI.

---

## 🔐 Hotkey Listener – Compilation

You must compile the hotkey listener into an invisible `.exe`:

```bash
pyinstaller --onefile --noconsole python_files/hotkey_listener.py
```

- Output: `dist/hotkey_listener.exe`
- Move to: `python_files/hotkey_listener.exe`
- The listener writes its own `.pid` file so it can be terminated cleanly.

---

## 🧱 Build the Final Windows App

Run this from the root:

```bash
neu build --release
```

This creates a distributable app inside `dist/` with:

- `TNC-Analyzer.exe`
- Packaged JS/HTML/CSS and resources

Then 
- Copy Your `python_files/` (including `.exe`, `.py`, and scripts) into dist/TNC_Analyzer folder
📁 Inside `neutralino.config.json`, ensure you have:

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

## 🔁 Roadmap

- [x] Accessibility-based text extraction
- [x] Global hotkey trigger
- [x] Gemini API analysis
- [x] Dynamic JSON UI rendering (Bootstrap)
- [x] Sort & filter clauses by severity
- [x] Runtime `.pid` management for listener control
- [ ] OCR fallback for scrollable/non-accessible views
- [ ] Chrome Extension version

---

## 🤝 Contributing

Pull requests are welcome!

We're especially looking for help with:
- Improving clause extraction fidelity
- Supporting macOS/Linux (currently Windows-only)
- UI improvements, dark mode, animations

---

## 🧑‍💻 License

MIT License

---

## ✨ Credits

Created by [Chaitanya Pandey](https://github.com/your-username)  
Powered by:
- [Google Gemini API](https://ai.google.dev/)
- [Neutralino.js](https://neutralino.js.org/)
- [Python](https://www.python.org/)

---
