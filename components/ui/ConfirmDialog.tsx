"use client"

import Modal from "@/components/ui/Modal"

type Props = {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
    pending?: boolean
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmDialog = ({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
    pending = false,
    onConfirm,
    onCancel,
}: Props) => {
    if (!isOpen) return null

    return (
        <Modal href="none" onClick={pending ? undefined : onCancel}>
            <div className="w-[min(100vw-2rem,22rem)]">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-text-primary-300 mt-2 text-sm leading-relaxed">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={pending}
                        className="border-border cursor-pointer rounded-md border px-4 py-2 text-sm disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={pending}
                        className={`cursor-pointer rounded-md px-4 py-2 text-sm text-white disabled:opacity-50 ${danger ? "bg-error hover:bg-error/90" : "bg-[#2D3748] hover:bg-[#1a202c]"}`}
                    >
                        {pending ? "…" : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmDialog
