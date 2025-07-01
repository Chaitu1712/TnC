# 📜 T&C Analyzer – Lightweight Desktop AI for Terms & Conditions

**T&C Analyzer** is a lightweight Windows desktop app that monitors your screen for Terms & Conditions and summarizes them using **AI** — all triggered with a global hotkey.

This is perfect for quickly understanding what you're agreeing to when installing apps, signing up for services, or navigating tricky popups.

---

## 🚀 Features

✅ Extracts on-screen Terms & Conditions using Windows Accessibility API  
✅ Launches silently to tray and listens in the background  
✅ Triggered via `Ctrl + Alt + Shift + T` hotkey  
✅ Summarizes and flags **harmful clauses** using **Gemini 2.5 Flash**  
✅ Built with modern lightweight tools: Neutralino.js + Python + PyInstaller

---

## 🧱 Tech Stack

| Layer         | Tool / Tech              | Notes                                             |
|--------------|---------------------------|--------------------------------------------------|
| Shell        | [Neutralino.js](https://neutralino.js.org/) | Minimal native wrapper around HTML + JS          |
| Backend      | Python 3.12               | Handles accessibility, extraction, and Gemini AI |
| AI API       | Gemini 2.5 Flash          | Summarizes and flags clauses                     |
| Hotkey       | PyInstaller `.exe`        | Global hotkey listener compiled from Python      |

---

## 🛠️ Installation & Setup

### ⚙️ 1. Clone the repo
```bash
git clone https://github.com/your-username/TnC-Analyzer.git
cd TnC-Analyzer
```
### 📦 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 💡 3. Install Neutralino.js globally
```bash
npm install -g @neutralinojs/neu
```

### 🧪 4. Run the app (development mode)
``` bash
neu run
```

### 🚀 5. Trigger the analyzer
Press: Ctrl + Alt + Shift + T
🧠 It will extract the visible T&C and analyze it.

---
## 🔐 Environment Variables
Create a .env file in the project root with your Gemini API key:
```bash
GEMINI_API_KEY=your_api_key_here
```

---
## 🔁 Build Hotkey Listener
To compile the hotkey listener as a .exe:

```bash
pyinstaller --onefile --noconsole python_files/hotkey_listener.py
```
It will output hotkey_listener.exe in /dist/, which should be moved into python_files/.

---
## 📚 Roadmap
[x] Accessibility-based extraction of T&Cs

[x] Global hotkey trigger via background process

[x] Gemini AI integration (summary + harmful clauses)

 Parse and render analysis in the UI

 Scroll-capture fallback (OCR)

 Chrome Extension (future phase)

---
## 🤝 Contributing

Pull requests are welcome — especially around:

- Better clause detection
- Frontend rendering
- Cross-platform compatibility (macOS/Linux)

---
## 🧑‍💻 License

MIT License

* * *

## ✨ Credits

Built by Chaitanya Pandey 
Powered by Google Gemini, Neutralino.js, and Python.