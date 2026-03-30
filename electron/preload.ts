import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
    sendMessage: (msg: string) => ipcRenderer.send("message", msg),
    onReply: (callback: (data: string) => void) =>
        ipcRenderer.on("reply", (_event, data) => callback(data)),
})