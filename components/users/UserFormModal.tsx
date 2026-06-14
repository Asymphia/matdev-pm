"use client"

import { createMatdevUser, updateMatdevUser } from "@/app/actions/user-mutations"
import FormField, { formFieldClasses } from "@/components/forms/FormField"
import FormModalShell from "@/components/forms/FormModalShell"
import type { UserType } from "@/lib/data"
import { AtSymbolIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/outline"
import { useState, useTransition } from "react"

interface UserFormModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: () => void
    editUser?: UserType | null
}

const UserFormModal = ({ isOpen, onClose, onCreated, editUser = null }: UserFormModalProps) => {
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()
    const isEdit = editUser !== null

    const submitWithFormData = (formData: FormData) => {
        setSubmitError(null)

        const firstName = String(formData.get("firstName") ?? "").trim()
        const lastName = String(formData.get("lastName") ?? "").trim()

        if (!firstName || !lastName) {
            setSubmitError("First name and last name are required.")
            return
        }

        const emailRaw = String(formData.get("email") ?? "").trim()
        const phoneRaw = String(formData.get("phoneNumber") ?? "").trim()

        if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
            setSubmitError("Please enter a valid email address.")
            return
        }

        if (phoneRaw) {
            if (!/^\+?[\d\s\-()]+$/.test(phoneRaw)) {
                setSubmitError("Phone number may only contain digits, spaces, dashes, and parentheses.")
                return
            }
            const digitCount = phoneRaw.replace(/\D/g, "").length
            if (digitCount < 9 || digitCount > 15) {
                setSubmitError(`Phone number must contain between 9 and 15 digits (entered: ${digitCount}).`)
                return
            }
        }

        startTransition(async () => {
            const body = {
                firstName,
                lastName,
                email: emailRaw === "" ? null : emailRaw,
                phoneNumber: phoneRaw === "" ? null : phoneRaw,
            }

            const result = isEdit && editUser ? await updateMatdevUser(editUser.id, body) : await createMatdevUser(body)

            if (result.ok) {
                onCreated()
            } else {
                setSubmitError(result.error)
            }
        })
    }

    return (
        <FormModalShell isOpen={isOpen} title={isEdit ? "Edit user" : "New user"} onClose={onClose}>
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
                        <input
                            name="firstName"
                            required
                            placeholder="First name"
                            className={formFieldClasses}
                            disabled={pending}
                            defaultValue={editUser?.firstName ?? ""}
                        />
                    </FormField>
                    <FormField icon={UserIcon}>
                        <input
                            name="lastName"
                            required
                            placeholder="Last name"
                            className={formFieldClasses}
                            disabled={pending}
                            defaultValue={editUser?.secondName ?? ""}
                        />
                    </FormField>
                </div>

                <FormField icon={AtSymbolIcon}>
                    <input
                        name="email"
                        type="email"
                        placeholder="E-mail"
                        className={formFieldClasses}
                        disabled={pending}
                        defaultValue={editUser?.email ?? ""}
                    />
                </FormField>
                <FormField icon={PhoneIcon}>
                    <input
                        name="phoneNumber"
                        type="tel"
                        placeholder="e.g. +48 123 456 789"
                        pattern="^\+?[\d\s\-()]{9,20}$"
                        title="Enter a valid phone number (9–15 digits, optionally with +, spaces, or dashes)"
                        className={formFieldClasses}
                        disabled={pending}
                        defaultValue={editUser?.phone ?? ""}
                    />
                </FormField>

                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="border-border cursor-pointer rounded-md border px-4 py-2 text-sm" disabled={pending}>
                        Cancel
                    </button>
                    <button type="submit" className="flex items-center gap-2 rounded-md bg-[#2D3748] px-6 py-2 text-white transition-colors hover:bg-[#1a202c] disabled:opacity-50" disabled={pending}>
                        {pending ? "Saving..." : isEdit ? "Save changes" : "Add user"} {!isEdit && <span>+</span>}
                    </button>
                </div>
            </form>
        </FormModalShell>
    )
}

export default UserFormModal
