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

function onTrayMenuItemClicked(event) {
    switch (event.detail.id) {
        case "SHOW":
            Neutralino.window.show();
            break;
        case "QUIT":
            stopHotkeyListener(); // Stop listener before exiting
            Neutralino.app.exit();
            break;
    }
}

function onWindowClose() {
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
            console.log("running main.py");
            const result = await Neutralino.os.execCommand("python ././python_files/main.py");
            console.log("running gemini.py");
            const geminiResult = await Neutralino.os.execCommand("python ././python_files/gemini.py");
            var file_name= geminiResult.stdOut;
            file_name = file_name.trim();
            console.log("Gemini result file:", file_name);
            try {
                const fileContent = await Neutralino.filesystem.readFile(file_name);
                const analysis = JSON.parse(fileContent);
                console.log("Analysis result:", analysis);
                await Neutralino.filesystem.remove(file_name); 
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
        await Neutralino.os.execCommand(' start  ././python_files/hotkey_listener.exe',{background: true});
    } catch (e) {
        console.error("Failed to start hotkey listener:", e);
    }
}

// Stop the Python hotkey listener process
async function stopHotkeyListener() {
    const files = await Neutralino.filesystem.readDirectory("././python_files");
    const hasPid = files.some(f => f.entry === "hotkey_listener.pid");
    try {
        if (hasPid) {
            const pidContent = await Neutralino.filesystem.readFile("././python_files/hotkey_listener.pid");
            const pid = parseInt(pidContent);
            if (!isNaN(pid)) {
                await Neutralino.os.execCommand(`kill ${pid}` );
            } else {
                console.warn("Invalid PID in hotkey_listener.pid file.");
            }
        } else {
            console.warn("No hotkey_listener.pid file found. Cannot stop listener.");
        }
        console.log("Hotkey listener stopped.");
    } catch (e) {
        console.error("Failed to stop hotkey listener:", e);
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
    const files=await Neutralino.filesystem.readDirectory(".");
    const analyzerFiles = files
            .filter(f => f.type === "FILE" && f.entry.startsWith("tnc_analyzer_") && f.entry.endsWith(".json"))
            .sort((a, b) => b.modified - a.modified);
    for (const file of analyzerFiles) {
        await Neutralino.filesystem.remove(file.entry);
    }
}