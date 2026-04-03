import { app, BrowserWindow } from "electron"
import { spawn, ChildProcess } from "child_process"
import path from "path"

const isDev = !app.isPackaged
let nextServer: ChildProcess | null = null

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

    if (isDev) {
        win.loadURL("http://localhost:3000")
    } else {
        const serverPath = path.join(process.resourcesPath, ".next/standalone/server.js")

        nextServer = spawn("node", [serverPath], {
            env: { ...process.env, PORT: "3000", HOSTNAME: "127.0.0.1" },
        })

        setTimeout(() => {
            win.loadURL("http://localhost:3000")
        }, 1500)
    }
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
    nextServer?.kill()
    if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})