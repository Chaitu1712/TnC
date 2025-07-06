const apiKeyInput = document.getElementById("api-key");
const saveKeyBtn = document.getElementById("save-key-btn");
const resetKeyBtn = document.getElementById("reset-key-btn");
const analyzePageBtn = document.getElementById("analyze-page-btn");
const analyzeSelectionBtn = document.getElementById("analyze-selection-btn");

const summaryBox = document.getElementById("summary-box");
const clauseContainer = document.getElementById("clauses-container");
const errorBox = document.getElementById("error-box");

const apiSection = document.getElementById("api-key-section");
const analyzerSection = document.getElementById("analyzer-section");

chrome.storage.local.get("geminiApiKey", (data) => {
  if (data.geminiApiKey) {
    apiSection.classList.add("d-none");
    analyzerSection.classList.remove("d-none");
  }
});

saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key.startsWith("sk-")) return alert("Invalid API key format.");
  chrome.storage.local.set({ geminiApiKey: key }, () => {
    apiSection.classList.add("d-none");
    analyzerSection.classList.remove("d-none");
  });
});

resetKeyBtn.addEventListener("click", () => {
  chrome.storage.local.remove("geminiApiKey", () => {
    apiSection.classList.remove("d-none");
    analyzerSection.classList.add("d-none");
    summaryBox.classList.add("d-none");
    clauseContainer.innerHTML = "";
    errorBox.classList.add("d-none");
    apiKeyInput.value = "";
  });
});

analyzePageBtn.addEventListener("click", () => {
  summaryBox.classList.add("d-none");
  clauseContainer.innerHTML = "Extracting from page...";
  analyze("extractText");
});

analyzeSelectionBtn.addEventListener("click", () => {
  summaryBox.classList.add("d-none");
  clauseContainer.innerHTML = "Using selected text...";
  analyze("extractSelection");
});

function analyze(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Message send error:", chrome.runtime.lastError.message);
        errorBox.textContent = "⚠️ Could not connect to this page. Try reloading.";
        errorBox.classList.remove("d-none");
        return;
      }

      if (!response?.text) {
        errorBox.textContent = "⚠️ No text found.";
        errorBox.classList.remove("d-none");
        return;
      }

      chrome.storage.local.get("geminiApiKey", (data) => {
        chrome.runtime.sendMessage(
          {
            action: "analyzeText",
            text: response.text,
            key: data.geminiApiKey
          },
          (res) => {
            if (chrome.runtime.lastError) {
              console.error("❌ Background error:", chrome.runtime.lastError.message);
              errorBox.textContent = "⚠️ Failed to reach background script.";
              errorBox.classList.remove("d-none");
              return;
            }

            if (!res || res.error) {
              errorBox.textContent = "⚠️ Gemini error: " + (res?.error || "No response.");
              errorBox.classList.remove("d-none");
              return;
            }

            try {
              console.log("📦 Raw Gemini Response:", res.result);
              const cleaned = res.result.trim().replace(/^```json\s*/, "").replace(/```$/, "");
              const parsed = JSON.parse(cleaned);
              renderResults(parsed);
            } catch (e) {
              console.error("❌ JSON parsing error:", e);
              console.log("📦 Raw (unparsed) response:", res.result);
              errorBox.textContent = "⚠️ Could not parse Gemini response.";
              errorBox.classList.remove("d-none");
            }
          }
        );
      });
    });
  });
}

function renderResults(data) {
  summaryBox.classList.remove("d-none");
  clauseContainer.innerHTML = "";
  errorBox.classList.add("d-none");

  summaryBox.textContent = data.summary || "No summary provided.";

  if (!Array.isArray(data.harmful_clauses) || data.harmful_clauses.length === 0) {
    clauseContainer.innerHTML = "<p>No harmful clauses detected.</p>";
    return;
  }

  const sevMap = {
    high: "danger",
    medium: "warning",
    low: "success"
  };

  data.harmful_clauses.forEach(clause => {
    const severity = clause.severity?.toLowerCase() || "unknown";
    const color = sevMap[severity] || "secondary";

    const card = document.createElement("div");
    card.className = "card border-" + color + " mb-3";

    card.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center">
        <span><strong>Severity:</strong></span>
        <span class="badge bg-${color} text-uppercase">${severity}</span>
      </div>
      <div class="card-body">
        <h6 class="card-title">Clause</h6>
        <p class="card-text"><em>${clause.clause}</em></p>
        <h6 class="card-title">Reason</h6>
        <p class="card-text">${clause.reason}</p>
      </div>
    `;
    clauseContainer.appendChild(card);
  });
}
