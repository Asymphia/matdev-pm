import { app, BrowserWindow, dialog } from "electron"
import { spawn, ChildProcess } from "child_process"
import path from "path"
import fs from "fs"
import http from "http"
import {
    getAppUploadsPath,
    getEmbeddedDbConnectionString,
    startEmbeddedPostgres,
    stopEmbeddedPostgres,
} from "./embedded-postgres"

const isDev = !app.isPackaged
const FRONTEND_PORT = "3000"
const API_PORT = "5196"
const API_BASE = `http://127.0.0.1:${API_PORT}`
const FRONTEND_URL = `http://127.0.0.1:${FRONTEND_PORT}`

let mainWindow: BrowserWindow | null = null
let loadingWindow: BrowserWindow | null = null
let apiProcess: ChildProcess | null = null
let nextProcess: ChildProcess | null = null
let postgresProcess: ChildProcess | null = null

const setLoadingStatus = (text: string) => {
    loadingWindow?.webContents.executeJavaScript(
        `document.getElementById('status').textContent = ${JSON.stringify(text)}`,
    )
}

const showLoadingError = (text: string) => {
    loadingWindow?.webContents.executeJavaScript(`
        document.getElementById('status').textContent = 'Nie udało się uruchomić';
        const el = document.getElementById('error');
        el.style.display = 'block';
        el.textContent = ${JSON.stringify(text)};
    `)
}

const waitForHttp = (url: string, timeoutMs = 120_000, intervalMs = 500): Promise<void> =>
    new Promise((resolve, reject) => {
        const deadline = Date.now() + timeoutMs
        const tick = () => {
            const req = http.get(url, res => {
                res.resume()
                if (res.statusCode && res.statusCode < 500) resolve()
                else if (Date.now() > deadline) reject(new Error(`Timeout: ${url}`))
                else setTimeout(tick, intervalMs)
            })
            req.on("error", () => {
                if (Date.now() > deadline) reject(new Error(`Timeout: ${url}`))
                else setTimeout(tick, intervalMs)
            })
            req.setTimeout(2000, () => req.destroy())
        }
        tick()
    })

const spawnLogged = (label: string, command: string, args: string[], options: Parameters<typeof spawn>[2]) => {
    const child = spawn(command, args, { ...options, windowsHide: true })
    child.stdout?.on("data", d => console.log(`[${label}]`, d.toString()))
    child.stderr?.on("data", d => console.error(`[${label}]`, d.toString()))
    child.on("exit", code => console.log(`[${label}] exit`, code))
    return child
}

const startApi = (): ChildProcess => {
    if (isDev) {
        setLoadingStatus("Tryb dev — API powinno działać na :5196 (Docker / dotnet run)")
        return null as unknown as ChildProcess
    }

    const apiDir = path.join(process.resourcesPath, "api")
    const apiExe = path.join(apiDir, "matdev.API.exe")
    if (!fs.existsSync(apiExe)) {
        throw new Error(`Brak matdev.API.exe w ${apiDir}`)
    }

    const uploadsDir = getAppUploadsPath()
    fs.mkdirSync(uploadsDir, { recursive: true })

    setLoadingStatus("Uruchamianie serwera API…")
    return spawnLogged("api", apiExe, [], {
        cwd: apiDir,
        env: {
            ...process.env,
            ASPNETCORE_ENVIRONMENT: "Production",
            ASPNETCORE_URLS: API_BASE,
            ConnectionStrings__Database: getEmbeddedDbConnectionString(),
            FileStorage__RootPath: uploadsDir,
        },
    })
}

const startNext = (): ChildProcess => {
    if (isDev) return null as unknown as ChildProcess

    const nextDir = path.join(process.resourcesPath, "next")
    const serverJs = path.join(nextDir, "server.js")
    if (!fs.existsSync(serverJs)) {
        throw new Error(`Brak server.js w ${nextDir}`)
    }

    setLoadingStatus("Uruchamianie interfejsu…")
    return spawnLogged("next", process.execPath, [serverJs], {
        cwd: nextDir,
        env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: "1",
            PORT: FRONTEND_PORT,
            HOSTNAME: "127.0.0.1",
            MATDEV_API_BASE_URL: API_BASE,
            NEXT_PUBLIC_MATDEV_API_BASE_URL: API_BASE,
        },
    })
}

const killAll = () => {
    for (const p of [nextProcess, apiProcess]) {
        if (p && !p.killed) {
            try {
                p.kill()
            } catch {
                /* ignore */
            }
        }
    }
    nextProcess = null
    apiProcess = null

    if (!isDev) {
        stopEmbeddedPostgres(process.resourcesPath)
    }
    postgresProcess = null
}

const createLoadingWindow = () => {
    loadingWindow = new BrowserWindow({
        width: 420,
        height: 280,
        resizable: false,
        maximizable: false,
        minimizable: false,
        frame: true,
        title: "MatDev PM",
        webPreferences: { nodeIntegration: false, contextIsolation: true },
    })
    loadingWindow.loadFile(path.join(__dirname, "loading.html"))
}

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        show: false,
        title: "MatDev PM",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    })
    mainWindow.maximize()
    mainWindow.once("ready-to-show", () => {
        loadingWindow?.close()
        loadingWindow = null
        mainWindow?.show()
    })
    mainWindow.loadURL(isDev ? "http://localhost:3000" : FRONTEND_URL)
}

const bootstrap = async () => {
    createLoadingWindow()

    try {
        if (!isDev) {
            setLoadingStatus("Uruchamianie bazy danych…")
            postgresProcess = await startEmbeddedPostgres(process.resourcesPath)

            apiProcess = startApi()
            setLoadingStatus("Czekam na API…")
            await waitForHttp(`${API_BASE}/api/health`, 120_000)

            nextProcess = startNext()
            setLoadingStatus("Czekam na interfejs…")
            await waitForHttp(FRONTEND_URL, 120_000)
        } else {
            setLoadingStatus("Łączenie z Next.js dev (localhost:3000)…")
            await waitForHttp("http://localhost:3000", 60_000)
            try {
                await waitForHttp(`${API_BASE}/api/health`, 5000)
            } catch {
                setLoadingStatus("API offline — uruchom Docker lub dotnet run w backendzie")
                await new Promise(r => setTimeout(r, 2000))
            }
        }

        createMainWindow()
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error(msg)
        showLoadingError(msg)
        dialog.showErrorBox(
            "MatDev PM — błąd uruchomienia",
            "Aplikacja nie mogła wystartować. Spróbuj uruchomić ponownie. Jeśli problem wraca, zainstaluj aplikację od nowa.",
        )
    }
}

app.whenReady().then(bootstrap)

app.on("window-all-closed", () => {
    killAll()
    if (process.platform !== "darwin") app.quit()
})

app.on("before-quit", () => killAll())

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) bootstrap()
})
