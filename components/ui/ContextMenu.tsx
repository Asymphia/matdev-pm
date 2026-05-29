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
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(v => !v)}
                className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded transition-colors hover:bg-secondary disabled:opacity-40"
            >
                <EllipsisVerticalIcon className="text-text-primary-300 group-hover:text-primary-700 size-5 transition-colors" />
            </button>

            {open && (
                <div className="bg-background border-border absolute right-0 z-30 mt-1 min-w-[140px] rounded-md border shadow-md">
                    {items.map((item, i) => (
                        <button
                            key={`${item.label}-${i}`}
                            type="button"
                            onClick={() => {
                                setOpen(false)
                                item.onClick()
                            }}
                            className={`block w-full cursor-pointer px-4 py-2 text-left text-sm transition-colors hover:bg-secondary ${item.danger ? "text-error hover:text-error" : ""}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ContextMenu
