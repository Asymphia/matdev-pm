"use client"

import { useEffect, useRef, useState } from "react"
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"

export type ContextMenuItem = {
    label: string
    onClick: () => void
    danger?: boolean
}

interface ContextMenuProps {
    items: ContextMenuItem[]
    disabled?: boolean
}

const ContextMenu = ({ items, disabled = false }: ContextMenuProps) => {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [open])

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                type="button"
                disabled={disabled}
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen(v => !v)}
                className={`text-text-primary-300 hover:text-primary-700 hover:bg-foreground flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors disabled:opacity-40 ${open ? "bg-foreground text-primary-700" : ""}`}
            >
                <EllipsisVerticalIcon className="size-4" />
            </button>

            {open && (
                <div
                    role="menu"
                    className="bg-background border-border absolute right-0 top-full z-30 mt-1 min-w-max overflow-hidden rounded-md border py-1 shadow-md"
                >
                    {items.map((item, i) => {
                        const showDivider = item.danger && i > 0 && !items[i - 1]?.danger
                        return (
                            <div key={`${item.label}-${i}`}>
                                {showDivider ? <div className="border-border my-1 border-t" /> : null}
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setOpen(false)
                                        item.onClick()
                                    }}
                                    className={`hover:bg-foreground block w-full cursor-pointer whitespace-nowrap px-3 py-2 text-left text-sm transition-colors ${item.danger ? "text-error" : "text-text-primary-500"}`}
                                >
                                    {item.label}
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ContextMenu
