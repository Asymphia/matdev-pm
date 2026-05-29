"use client"

import FormModalShell from "@/components/forms/FormModalShell"
import { CalendarIcon } from "@heroicons/react/24/outline"
import { formFieldClasses } from "@/components/forms/FormField"
import { useState } from "react"

interface DeadlinePickerModalProps {
    isOpen: boolean
    currentDate: string
    onClose: () => void
    onConfirm: (date: string) => void
    pending?: boolean
    title?: string
}

const DeadlinePickerModal = ({ isOpen, currentDate, onClose, onConfirm, pending, title = "Change deadline" }: DeadlinePickerModalProps) => {
    const [value, setValue] = useState(currentDate)

    return (
        <FormModalShell isOpen={isOpen} title={title} onClose={onClose}>
            <form
                className="flex flex-col gap-4"
                onSubmit={e => {
                    e.preventDefault()
                    if (value) onConfirm(value)
                }}
            >
                <div className="relative flex w-full items-center">
                    <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="date"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        required
                        disabled={pending}
                        className={formFieldClasses}
                    />
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="border-border cursor-pointer rounded-md border px-4 py-2 text-sm" disabled={pending}>
                        Cancel
                    </button>
                    <button type="submit" className="cursor-pointer rounded-md bg-[#2D3748] px-6 py-2 text-sm text-white disabled:opacity-50" disabled={pending}>
                        {pending ? "Saving..." : "Confirm"}
                    </button>
                </div>
            </form>
        </FormModalShell>
    )
}

export default DeadlinePickerModal
