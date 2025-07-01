import os
import time
import gc
import win32gui
from pathlib import Path
from ctypes import cast, POINTER
from comtypes import CoInitialize, CoUninitialize
from comtypes.client import GetModule, CreateObject

# Setup UI Automation
UIA_dll = GetModule("UIAutomationCore.dll")
IUIAutomation = POINTER(UIA_dll.IUIAutomation)
IUIAutomationTextPattern = POINTER(UIA_dll.IUIAutomationTextPattern)
UIA_TextPatternId = 10014

import warnings
warnings.filterwarnings("ignore")

def get_text_from_focused_window():
    """Extracts accessible text from the currently focused window."""
    automation = CreateObject("{ff48dba4-60ef-4201-aa87-54103eef594e}", interface=UIA_dll.IUIAutomation)
    hwnd = win32gui.GetForegroundWindow()
    if not hwnd:
        return ""

    element = automation.ElementFromHandle(hwnd)
    if not element:
        return ""

    condition = automation.CreatePropertyCondition(UIA_dll.UIA_IsTextPatternAvailablePropertyId, True)
    text_elements = element.FindAll(UIA_dll.TreeScope_Descendants, condition)

    collected = []
    for i in range(text_elements.Length):
        try:
            pattern = text_elements.GetElement(i).GetCurrentPattern(UIA_TextPatternId)
            if pattern:
                tp = cast(pattern, IUIAutomationTextPattern)
                doc_range = tp.DocumentRange
                collected.append(doc_range.GetText(-1).strip())
        except Exception:
            continue

    del text_elements, condition, element, automation
    return "\n\n".join(filter(None, collected))


def main():

    CoInitialize()
    try:
        print("Extracting text...")
        extracted = get_text_from_focused_window()
        print(f"Extracted {len(extracted)} characters.")

        if not extracted.strip():
            print("No text found in the active window.")
            return

        with open("tnc_input.txt", "w", encoding="utf-8") as f:
            f.write(extracted)

    finally:
        gc.collect()
        CoUninitialize()
        time.sleep(0.1)


if __name__ == "__main__":
    main()
