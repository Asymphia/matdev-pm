"use client"

import FormField, { formFieldClasses } from "@/components/forms/FormField"
import FormModalShell from "@/components/forms/FormModalShell"
import { AtSymbolIcon, UserIcon } from "@heroicons/react/24/outline"

interface UserFormModalProps {
    isOpen: boolean
    onClose: () => void
}

const UserFormModal = ({ isOpen, onClose }: UserFormModalProps) => {
    const handleSubmit = async (formData: FormData) => {
        const rawData = Object.fromEntries(formData.entries())
        console.log("User form data:", rawData)
        onClose()
    }

    return (
        <FormModalShell isOpen={isOpen} title="User form" onClose={onClose}>
            <form action={handleSubmit} className="flex flex-col gap-4">
                <FormField icon={UserIcon}>
                    <input name="name" placeholder="Name" className={formFieldClasses} />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={UserIcon}>
                        <input name="firstName" placeholder="First name" className={formFieldClasses} />
                    </FormField>
                    <FormField icon={UserIcon}>
                        <input name="secondName" placeholder="Second name" className={formFieldClasses} />
                    </FormField>
                </div>

                <FormField icon={AtSymbolIcon}>
                    <input name="email" placeholder="E-mail" className={formFieldClasses} />
                </FormField>
                <FormField icon={AtSymbolIcon}>
                    <input name="phone" placeholder="Phone number" className={formFieldClasses} />
                </FormField>

                <div className="mt-4 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 rounded-full bg-[#2D3748] px-6 py-2 text-white transition-colors hover:bg-[#1a202c]">
                        Add new user <span>+</span>
                    </button>
                </div>
            </form>
        </FormModalShell>
    )
}

export default UserFormModal
