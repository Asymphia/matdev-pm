"use client"

import { createTaskCategory, updateTaskCategory, deleteTaskCategory } from "@/app/actions/task-category-mutations"
import FormField, { formFieldClasses } from "@/components/forms/FormField"
import FormModalShell from "@/components/forms/FormModalShell"
import BlockWrapper from "@/components/ui/BlockWrapper"
import ContextMenu from "@/components/ui/ContextMenu"
import IconButton from "@/components/ui/IconButton"
import { PlusIcon, TagIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

type Category = { id: number; name: string }

type Props = {
    initialCategories: Category[]
    loadError: string | null
}

type ModalMode = "create" | "edit"
type ModalState = { mode: ModalMode; id?: number; currentName?: string } | null

const TaskCategoriesPageClient = ({ initialCategories, loadError }: Props) => {
    const router = useRouter()
    const [error, setError] = useState<string | null>(loadError)
    const [modal, setModal] = useState<ModalState>(null)
    const [name, setName] = useState("")
    const [modalError, setModalError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const openCreate = () => {
        setModal({ mode: "create" })
        setName("")
        setModalError(null)
    }

    const openEdit = (id: number, currentName: string) => {
        setModal({ mode: "edit", id, currentName })
        setName(currentName)
        setModalError(null)
    }

    const closeModal = () => {
        if (pending) return
        setModal(null)
        setName("")
        setModalError(null)
    }

    const handleDelete = (id: number, catName: string) => {
        if (!confirm(`Delete category "${catName}"?`)) return
        startTransition(async () => {
            setError(null)
            const res = await deleteTaskCategory(id)
            if (!res.ok) {
                setError(res.error)
                return
            }
            router.refresh()
        })
    }

    const submitForm = () => {
        const cleanName = name.trim()
        if (!cleanName) {
            setModalError("Name is required.")
            return
        }

        startTransition(async () => {
            setError(null)
            setModalError(null)
            const res =
                modal?.mode === "edit" && modal.id !== undefined
                    ? await updateTaskCategory(modal.id, cleanName)
                    : await createTaskCategory(cleanName)

            if (!res.ok) {
                setModalError(res.error)
                return
            }
            closeModal()
            router.refresh()
        })
    }

    return (
        <div className="flex flex-1 flex-col gap-11">
            <h1>Task Categories</h1>
            {error ? <p className="text-error border-error rounded-md border px-4 py-3 text-sm">{error}</p> : null}

            <BlockWrapper className="w-full max-w-lg">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-4xl font-normal">Categories</h2>
                    <IconButton Icon={PlusIcon} onClick={openCreate} disabled={pending} />
                </div>

                {initialCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No task categories yet. Add one with the + button.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {initialCategories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between py-1">
                                <span>{cat.name}</span>
                                <ContextMenu
                                    items={[
                                        { label: "Edit", onClick: () => openEdit(cat.id, cat.name) },
                                        { label: "Delete", onClick: () => handleDelete(cat.id, cat.name), danger: true },
                                    ]}
                                    disabled={pending}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </BlockWrapper>

            <FormModalShell isOpen={modal !== null} title={modal?.mode === "edit" ? "Edit category" : "New category"} onClose={closeModal}>
                {modalError ? <p className="text-error mb-4 text-sm">{modalError}</p> : null}
                <form
                    className="flex flex-col gap-4"
                    onSubmit={e => {
                        e.preventDefault()
                        submitForm()
                    }}
                >
                    <FormField icon={TagIcon}>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Category name"
                            className={formFieldClasses}
                            disabled={pending}
                            required
                        />
                    </FormField>

                    <div className="mt-4 flex justify-end gap-3">
                        <button type="button" onClick={closeModal} className="border-border cursor-pointer rounded-md border px-4 py-2 text-sm" disabled={pending}>
                            Cancel
                        </button>
                        <button type="submit" className="cursor-pointer rounded-md bg-[#2D3748] px-6 py-2 text-sm text-white disabled:opacity-50" disabled={pending}>
                            {pending ? "Saving..." : modal?.mode === "edit" ? "Save changes" : "Add category"}
                        </button>
                    </div>
                </form>
            </FormModalShell>
        </div>
    )
}

export default TaskCategoriesPageClient
