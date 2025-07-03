const initialState = document.getElementById("initial-state");
const loadingState = document.getElementById("loading-state");
const resultState = document.getElementById("results-state");
function setTray() {
    if (NL_MODE !== "window") {
        console.log("Tray only available in window mode.");
        return;
    }

    const tray = {
        icon: "/resources/icons/trayIcon.png",
        menuItems: [
            { id: "SHOW", text: "Show" },
            { id: "SEP", text: "-" },
            { id: "QUIT", text: "Quit" }
        ]
    };

    Neutralino.os.setTray(tray);
}

async function onTrayMenuItemClicked(event) {
    switch (event.detail.id) {
        case "SHOW":
            Neutralino.window.show();
            break;
        case "QUIT":
            await stopHotkeyListener(); // Stop listener before exiting
            Neutralino.app.exit();
            break;
    }
}

async function onWindowClose() {
    if (initialState.classList.contains("d-none"))
        initialState.classList.remove("d-none");
    if (!loadingState.classList.contains("d-none"))
        loadingState.classList.add("d-none");
    if (!resultState.classList.contains("d-none"))
        resultState.classList.add("d-none");
    await Neutralino.window.setAlwaysOnTop(false);
    Neutralino.window.hide();
}

// Check every second for the signal file created by Python hotkey listener
async function checkForShowSignal() {
    try {
        const files = await Neutralino.filesystem.readDirectory("././python_files");
        const shouldShow = files.some(f => f.entry === "show_window.signal");
        if (shouldShow) {
            await Neutralino.filesystem.remove("././python_files/show_window.signal");
            await Neutralino.window.show();
            const files = await Neutralino.filesystem.readDirectory(".");
            initialState.classList.add("d-none");
            loadingState.classList.remove("d-none");
            await Neutralino.os.execCommand("python ././python_files/main.py");
            await Neutralino.window.setAlwaysOnTop(true); // or setAlwaysOnTop();
            await Neutralino.window.focus();
            const geminiResult = await Neutralino.os.execCommand("python ././python_files/gemini.py");
            var file_name = geminiResult.stdOut;
            file_name = file_name.trim();
            try {
                const fileContent = await Neutralino.filesystem.readFile(file_name);
                const analysis = JSON.parse(fileContent);
                await Neutralino.filesystem.remove(file_name);
                loadingState.classList.add("d-none");
                displayResults(analysis);
            }
            catch (e) {
                console.error("Error reading analysis file:", e);
            }
        }
    } catch (e) {
        console.error("Signal check error:", e);
    }
}

// Start the Python hotkey listener in background
async function startHotkeyListener() {
    try {
        const hotkey=await Neutralino.os.execCommand(' start  ././python_files/hotkey_listener.exe', { background: true });
        console.log("Hotkey listener started.", hotkey);
    } catch (e) {
        console.error("Failed to start hotkey listener:", e);
    }
}

// Stop the Python hotkey listener process
async function stopHotkeyListener() {
    try {
        const pidPath = "././python_files/hotkey_listener.pid";
        const files = await Neutralino.filesystem.readDirectory("././python_files");
        const hasPid = files.some(f => f.entry === "hotkey_listener.pid");

        if (!hasPid) {
            console.warn("⚠️ No hotkey_listener.pid file found.");
            return;
        }

        const pidContent = await Neutralino.filesystem.readFile(pidPath);
        const pid = parseInt(pidContent.trim(), 10);

        if (isNaN(pid)) {
            console.warn("⚠️ Invalid PID in file:", pidContent);
            return;
        }

        console.log("🛑 Killing listener with PID:", pid);
        await Neutralino.os.execCommand(`taskkill /PID ${pid} /F`);

        await Neutralino.filesystem.remove(pidPath);
        console.log("✅ Listener process terminated and pid file removed.");
    } catch (e) {
        console.error("❌ Failed to stop hotkey listener:", e);
    }
}

// INIT
Neutralino.init();

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);

if (NL_OS !== "Darwin") {
    setTray();
}

Neutralino.events.on("ready", async () => {
    await startHotkeyListener();    // Start listener when app is ready
    await Neutralino.window.setSize({ width: 900, height: 600 });
    runCleanup();
    setInterval(checkForShowSignal, 1000);    // Poll for signal file
});
async function runCleanup() {
    // Remove old signal files
    const files = await Neutralino.filesystem.readDirectory(".");
    const analyzerFiles = files
        .filter(f => f.type === "FILE" && f.entry.startsWith("tnc_analyzer_") && f.entry.endsWith(".json"))
        .sort((a, b) => b.modified - a.modified);
    for (const file of analyzerFiles) {
        await Neutralino.filesystem.remove(file.entry);
    }
}

function displayResults(analysis) {
    resultState.classList.remove("d-none");

    const summaryText = document.getElementById("summary-text");
    const container = document.getElementById("harmful-clauses-container");
    const errorContainer = document.getElementById("error-container");

    summaryText.textContent = analysis.summary || "No summary provided.";
    errorContainer.classList.add("d-none");
    container.innerHTML = "";

    const clauses = Array.isArray(analysis.harmful_clauses) ? analysis.harmful_clauses : [];

    let currentClauses = [...clauses]; // Clone for filtering

    const filterSelect = document.getElementById("severity-filter");
    const sortSelect = document.getElementById("sort-order");

    function renderFilteredAndSortedClauses() {
        let filtered = [...currentClauses];
        const filterVal = filterSelect.value;
        const sortVal = sortSelect.value;

        if (filterVal !== "all") {
            filtered = filtered.filter(c => c.severity.toLowerCase() === filterVal);
        }

        filtered.sort((a, b) => {
            const sevOrder = { high: 3, medium: 2, low: 1 };
            return sortVal === "high"
                ? sevOrder[b.severity] - sevOrder[a.severity]
                : sevOrder[a.severity] - sevOrder[b.severity];
        });

        container.innerHTML = "";
        for (const clause of filtered) {
            const badgeColor = {
                high: "danger",
                medium: "warning",
                low: "success"
            }[clause.severity?.toLowerCase()] || "secondary";

            const card = document.createElement("div");
            card.className = "card mb-3 border-" + badgeColor;

            card.innerHTML = `
                <div class="card-header bg-${badgeColor} text-white">
                    Severity: ${clause.severity}
                </div>
                <div class="card-body">
                    <h6 class="card-title">Clause</h6>
                    <p class="card-text"><em>${clause.clause}</em></p>
                    <h6 class="card-title">Reason</h6>
                    <p class="card-text">${clause.reason}</p>
                </div>
            `;
            container.appendChild(card);
        }
    }

    // Bind dropdown changes
    filterSelect.onchange = renderFilteredAndSortedClauses;
    sortSelect.onchange = renderFilteredAndSortedClauses;

    renderFilteredAndSortedClauses();
}
document.getElementById("reset-button").addEventListener("click", () => {
    resultState.classList.add("d-none");
    initialState.classList.remove("d-none");
});