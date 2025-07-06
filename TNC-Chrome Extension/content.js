chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "extractText") {
    const elements = Array.from(document.querySelectorAll("body *"))
      .filter(el => el.innerText && el.offsetParent !== null && el.innerText.length > 100)
      .map(el => el.innerText.trim());

    const fullText = elements.join("\n\n");
    sendResponse({ text: fullText });
  }

  if (msg.action === "extractSelection") {
    const selection = window.getSelection()?.toString()?.trim();
    sendResponse({ text: selection || "" });
  }
});
