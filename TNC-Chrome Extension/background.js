chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("geminiApiKey", (data) => {
    if (!data.geminiApiKey) {
      chrome.tabs.create({ url: chrome.runtime.getURL("setup.html") });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeText" && request.text && request.key) {
    (async () => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${request.key}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `
You are a legal assistant. Analyze this T&C and return:
1. A short summary.
2. A list of harmful clauses with:
- The clause text
- The reason it may be harmful
- A severity level: low | medium | high

Return **only raw JSON** in the format:
{
  "summary": "...",
  "harmful_clauses": [
    {
      "clause": "...",
      "reason": "...",
      "severity": "low" | "medium" | "high"
    }
  ]
}

Text:
${request.text}
                      `
                    }
                  ]
                }
              ]
            })
          }
        );

        const json = await response.json();
        const resultText = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        sendResponse({ result: resultText });
      } catch (err) {
        console.error("❌ Gemini fetch error:", err);
        sendResponse({ error: err.toString() });
      }
    })();

    return true; // Keep message channel open for async response
  }
});
