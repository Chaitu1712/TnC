import os
import sys
import keyboard
from pathlib import Path

# Determine script or .exe directory
if getattr(sys, 'frozen', False):
    BASE_DIR = Path(sys.executable).parent
else:
    BASE_DIR = Path(__file__).resolve().parent

PID_FILE = BASE_DIR / "hotkey_listener.pid"
SIGNAL_FILE = BASE_DIR / "show_window.signal"

# Write the current process ID to a file
try:
    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))
except Exception as e:
    print(f"Failed to write PID file: {e}")

def on_hotkey():
    try:
        SIGNAL_FILE.touch()
        print("Hotkey triggered — signal file created.")
    except Exception as e:
        print(f"Failed to create signal file: {e}")

keyboard.add_hotkey('ctrl+alt+shift+t', on_hotkey)

print("Hotkey listener is running... Press Ctrl+Alt+Shift+T")
keyboard.wait()
