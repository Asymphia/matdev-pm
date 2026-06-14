import { app } from "electron"
import fs from "fs"
import os from "os"
import path from "path"

const logPath = (): string => path.join(app.getPath("userData"), "startup.log")

export const appendStartupLog = (message: string): void => {
    const line = `[${new Date().toISOString()}] ${message}${os.EOL}`
    try {
        fs.appendFileSync(logPath(), line, "utf8")
    } catch {
        /* ignore */
    }
    console.log(message)
}

export const clearStartupLog = (): void => {
    try {
        fs.writeFileSync(logPath(), `MatDev PM startup ${new Date().toISOString()}${os.EOL}`, "utf8")
    } catch {
        /* ignore */
    }
}

export const getStartupLogPath = (): string => logPath()
