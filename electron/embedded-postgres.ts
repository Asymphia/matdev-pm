import { app } from "electron"
import { spawn, spawnSync, ChildProcess } from "child_process"
import fs from "fs"
import net from "net"
import path from "path"

export const EMBEDDED_PG_PORT = 55432
const PG_USER = "postgres"
const PG_PASSWORD = "postgres"
const PG_DATABASE = "matdev"

export const getEmbeddedDbConnectionString = (): string =>
    `Host=127.0.0.1;Port=${EMBEDDED_PG_PORT};Database=${PG_DATABASE};Username=${PG_USER};Password=${PG_PASSWORD}`

export const getAppUploadsPath = (): string => path.join(app.getPath("userData"), "uploads")

const waitForPort = (port: number, timeoutMs = 60_000): Promise<void> =>
    new Promise((resolve, reject) => {
        const deadline = Date.now() + timeoutMs
        const tryConnect = () => {
            const socket = net.connect({ host: "127.0.0.1", port }, () => {
                socket.end()
                resolve()
            })
            socket.on("error", () => {
                if (Date.now() > deadline) {
                    reject(new Error(`PostgreSQL nie odpowiada na porcie ${port}`))
                } else {
                    setTimeout(tryConnect, 400)
                }
            })
        }
        tryConnect()
    })

const runCmd = (exe: string, args: string[], cwd?: string): void => {
    const result = spawnSync(exe, args, { cwd, windowsHide: true, encoding: "utf8" })
    if (result.status !== 0) {
        const detail = (result.stderr || result.stdout || "").trim()
        throw new Error(`${path.basename(exe)} ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`)
    }
}

const psql = (binDir: string, sql: string): void => {
    runCmd(
        path.join(binDir, "psql.exe"),
        [
            "-h",
            "127.0.0.1",
            "-p",
            String(EMBEDDED_PG_PORT),
            "-U",
            PG_USER,
            "-d",
            "postgres",
            "-v",
            "ON_ERROR_STOP=1",
            "-c",
            sql,
        ],
        binDir,
    )
}

const initializeDataDirectory = (binDir: string, dataDir: string): void => {
    fs.mkdirSync(dataDir, { recursive: true })
    runCmd(
        path.join(binDir, "initdb.exe"),
        ["-D", dataDir, "-U", PG_USER, "-A", "trust", "-E", "UTF8", "--locale=C"],
        binDir,
    )
}

const bootstrapDatabase = (binDir: string): void => {
    psql(binDir, `ALTER USER ${PG_USER} WITH PASSWORD '${PG_PASSWORD}';`)
    try {
        psql(binDir, `CREATE DATABASE ${PG_DATABASE};`)
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!msg.includes("already exists")) {
            throw e
        }
    }
}

let postgresProcess: ChildProcess | null = null

export const startEmbeddedPostgres = async (resourcesPath: string): Promise<ChildProcess> => {
    const binDir = path.join(resourcesPath, "postgres", "bin")
    const initdb = path.join(binDir, "initdb.exe")
    const postgresExe = path.join(binDir, "postgres.exe")

    if (!fs.existsSync(initdb) || !fs.existsSync(postgresExe)) {
        throw new Error("Brak wbudowanej bazy PostgreSQL w instalacji (postgres/bin).")
    }

    const dataDir = path.join(app.getPath("userData"), "pgdata")
    const initMarker = path.join(app.getPath("userData"), ".matdev-db-ready")

    if (!fs.existsSync(path.join(dataDir, "PG_VERSION"))) {
        initializeDataDirectory(binDir, dataDir)
    }

    postgresProcess = spawn(postgresExe, ["-D", dataDir, "-p", String(EMBEDDED_PG_PORT)], {
        cwd: binDir,
        env: { ...process.env, PGDATA: dataDir },
        windowsHide: true,
    })

    postgresProcess.on("exit", code => {
        if (code !== 0 && code !== null) {
            console.error("[postgres] exit", code)
        }
        postgresProcess = null
    })

    await waitForPort(EMBEDDED_PG_PORT)

    if (!fs.existsSync(initMarker)) {
        try {
            bootstrapDatabase(binDir)
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e)
            if (!msg.includes("already exists")) {
                throw e
            }
        }
        fs.writeFileSync(initMarker, new Date().toISOString(), "utf8")
    }

    return postgresProcess
}

export const stopEmbeddedPostgres = (resourcesPath: string): void => {
    const dataDir = path.join(app.getPath("userData"), "pgdata")
    const pgCtl = path.join(resourcesPath, "postgres", "bin", "pg_ctl.exe")

    if (fs.existsSync(pgCtl) && fs.existsSync(path.join(dataDir, "postmaster.pid"))) {
        try {
            spawnSync(pgCtl, ["-D", dataDir, "stop", "fast", "-m", "fast"], { windowsHide: true })
        } catch {
            /* ignore */
        }
    }

    if (postgresProcess && !postgresProcess.killed) {
        try {
            postgresProcess.kill()
        } catch {
            /* ignore */
        }
    }
    postgresProcess = null
}
