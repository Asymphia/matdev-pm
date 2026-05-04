"use client"

import { createMatdevUser } from "@/app/actions/user-mutations"
import FormField, { formFieldClasses } from "@/components/forms/FormField"
import FormModalShell from "@/components/forms/FormModalShell"
import { AtSymbolIcon, UserIcon } from "@heroicons/react/24/outline"
import { useState, useTransition } from "react"

interface UserFormModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: () => void
}

const UserFormModal = ({ isOpen, onClose, onCreated }: UserFormModalProps) => {
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const submitWithFormData = (formData: FormData) => {
        setSubmitError(null)

        const firstName = String(formData.get("firstName") ?? "").trim()
        const lastName = String(formData.get("lastName") ?? "").trim()

        if (!firstName || !lastName) {
            setSubmitError("Imię i nazwisko są wymagane.")
            return
        }

        const emailRaw = String(formData.get("email") ?? "").trim()
        const phoneRaw = String(formData.get("phoneNumber") ?? "").trim()

        startTransition(async () => {
            const result = await createMatdevUser({
                firstName,
                lastName,
                email: emailRaw === "" ? null : emailRaw,
                phoneNumber: phoneRaw === "" ? null : phoneRaw,
            })

            if (result.ok) {
                onCreated()
            } else {
                setSubmitError(result.error)
            }
        })
    }

    return (
        <FormModalShell isOpen={isOpen} title="User form" onClose={onClose}>
            {submitError ? <p className="text-error mb-4 text-sm">{submitError}</p> : null}
            <form
                className="flex flex-col gap-4"
                onSubmit={e => {
                    e.preventDefault()
                    submitWithFormData(new FormData(e.currentTarget))
                }}
            >

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={UserIcon}>
                        <input name="firstName" required placeholder="First name" className={formFieldClasses} disabled={pending} />
                    </FormField>
                    <FormField icon={UserIcon}>
                        <input name="lastName" required placeholder="Last name" className={formFieldClasses} disabled={pending} />
                    </FormField>
                </div>

                <FormField icon={AtSymbolIcon}>
                    <input name="email" type="email" placeholder="E-mail" className={formFieldClasses} disabled={pending} />
                </FormField>
                <FormField icon={AtSymbolIcon}>
                    <input name="phoneNumber" placeholder="Phone number" className={formFieldClasses} disabled={pending} />
                </FormField>

                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="border-border cursor-pointer rounded-md border px-4 py-2 text-sm" disabled={pending}>
                        Cancel
                    </button>
                    <button type="submit" className="flex items-center gap-2 rounded-md bg-[#2D3748] px-6 py-2 text-white transition-colors hover:bg-[#1a202c] disabled:opacity-50" disabled={pending}>
                        {pending ? "Saving..." : "Add new user"} <span>+</span>
                    </button>
                </div>
            </form>
        </FormModalShell>
    )
}

export default UserFormModal
