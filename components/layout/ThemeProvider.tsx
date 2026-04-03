"use client"

import {ReactNode, useEffect, useState} from "react"

const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<"light" | "dark">("light")

    useEffect(() => {
        const saved = localStorage.getItem("theme") as "light" | "dark" | null
        const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        setTheme(saved ?? preferred)
    }, [])

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    return children
}

export default ThemeProvider