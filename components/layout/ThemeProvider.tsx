"use client"

import { ReactNode, useEffect, useSyncExternalStore } from "react"

function getThemeSnapshot(): "light" | "dark" {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null
    if (saved === "light" || saved === "dark") return saved
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function subscribeTheme(onStoreChange: () => void) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", onStoreChange)
    window.addEventListener("storage", onStoreChange)
    return () => {
        mq.removeEventListener("change", onStoreChange)
        window.removeEventListener("storage", onStoreChange)
    }
}

const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "light")

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    return children
}

export default ThemeProvider
