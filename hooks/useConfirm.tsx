"use client"

import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { useCallback, useRef, useState } from "react"

export type ConfirmOptions = {
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
}

export function useConfirm() {
    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<ConfirmOptions | null>(null)
    const resolveRef = useRef<((value: boolean) => void) | null>(null)

    const confirm = useCallback((opts: ConfirmOptions) => {
        return new Promise<boolean>(resolve => {
            resolveRef.current = resolve
            setOptions(opts)
            setOpen(true)
        })
    }, [])

    const close = (result: boolean) => {
        setOpen(false)
        resolveRef.current?.(result)
        resolveRef.current = null
        setOptions(null)
    }

    const ConfirmModal = () =>
        options ? (
            <ConfirmDialog
                isOpen={open}
                title={options.title ?? "Confirm"}
                message={options.message}
                confirmLabel={options.confirmLabel ?? "Confirm"}
                cancelLabel={options.cancelLabel ?? "Cancel"}
                danger={options.danger}
                onConfirm={() => close(true)}
                onCancel={() => close(false)}
            />
        ) : null

    return { confirm, ConfirmModal }
}
