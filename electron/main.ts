import { app, BrowserWindow } from "electron"
import path from "path"

const isDev = !app.isPackaged

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    })

    win.maximize()

    if(isDev) {
        win.loadURL("http://localhost:3000")
    } else {
        win.loadFile(path.join(__dirname, "../out/index.html"))
    }
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})