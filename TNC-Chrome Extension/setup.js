document.getElementById("save-btn").onclick = () => {
  const key = document.getElementById("api-key").value.trim();
  chrome.storage.local.set({ geminiApiKey: key }, () => {
    alert("✅ API key saved!");
    window.close();
  });
};
