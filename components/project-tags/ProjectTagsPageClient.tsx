"use client"

import { createTag, updateTag, deleteTag, type TagKind } from "@/app/actions/tag-mutations"
import FormField, { formFieldClasses } from "@/components/forms/FormField"
import FormModalShell from "@/components/forms/FormModalShell"
import { type Tag } from "@/components/project-tags/TagItem"
import TagsCard from "@/components/project-tags/TagsCard"
import { LinkIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

type NamedItem = { id: number; name: string }

type Props = {
    issues: NamedItem[]
    topics: NamedItem[]
    workpackages: NamedItem[]
    loadError: string | null
}

type ModalMode = "create" | "edit"
type ActiveModal = { kind: TagKind; mode: ModalMode; id?: number; currentName?: string } | null

function toTags(items: NamedItem[], kind: TagKind, onEdit: (kind: TagKind, id: number, name: string) => void, onDelete: (kind: TagKind, id: number) => void, disabled: boolean): Tag[] {
    return items.map(item => ({
        tagId: item.id,
        tagName: item.name,
        onClick: () => {},
        onEdit: (id, name) => onEdit(kind, id, name),
        onDelete: id => onDelete(kind, id),
        disabled,
    }))
}

const ProjectTagsPageClient = ({ issues, topics, workpackages, loadError }: Props) => {
    const router = useRouter()
    const [error, setError] = useState<string | null>(loadError)
    const [activeModal, setActiveModal] = useState<ActiveModal>(null)
    const [name, setName] = useState("")
    const [modalError, setModalError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const labelByKind: Record<TagKind, string> = {
        issue: "Issue type",
        topic: "Topic",
        workpackage: "Workpackage",
    }

    const openCreate = (kind: TagKind) => {
        setActiveModal({ kind, mode: "create" })
        setName("")
        setModalError(null)
    }

    const openEdit = (kind: TagKind, id: number, currentName: string) => {
        setActiveModal({ kind, mode: "edit", id, currentName })
        setName(currentName)
        setModalError(null)
    }

    const handleDelete = (kind: TagKind, id: number) => {
        startTransition(async () => {
            setError(null)
            const res = await deleteTag(kind, id)
            if (!res.ok) {
                setError(res.error)
                return
            }
            router.refresh()
        })
    }

    const closeModal = () => {
        if (pending) return
        setActiveModal(null)
        setName("")
        setModalError(null)
    }

    const submitTag = () => {
        const cleanName = name.trim()
        if (!activeModal) return
        if (!cleanName) {
            setModalError("Name is required.")
            return
        }

        startTransition(async () => {
            setError(null)
            setModalError(null)

            const res =
                activeModal.mode === "edit" && activeModal.id !== undefined
                    ? await updateTag(activeModal.kind, activeModal.id, cleanName)
                    : await createTag(activeModal.kind, cleanName)

            if (!res.ok) {
                setModalError(res.error)
                return
            }
            closeModal()
            router.refresh()
        })
    }

    const modalTitle =
        activeModal?.mode === "edit"
            ? `Edit ${labelByKind[activeModal.kind]}`
            : activeModal
              ? `New ${labelByKind[activeModal.kind]}`
              : "Tag"

    return (
        <div className="flex flex-1 flex-col gap-11">
            <h1>Project Tags</h1>
            {error ? <p className="text-error border-error rounded-md border px-4 py-3 text-sm">{error}</p> : null}

            <div className="grid flex-1 grid-cols-3 items-stretch gap-10">
                <TagsCard
                    title="Issue Types"
                    tags={toTags(issues, "issue", openEdit, handleDelete, pending)}
                    onAdd={() => openCreate("issue")}
                    addDisabled={pending}
                />
                <TagsCard
                    title="Topics"
                    tags={toTags(topics, "topic", openEdit, handleDelete, pending)}
                    onAdd={() => openCreate("topic")}
                    addDisabled={pending}
                />
                <TagsCard
                    title="Workpackages"
                    tags={toTags(workpackages, "workpackage", openEdit, handleDelete, pending)}
                    onAdd={() => openCreate("workpackage")}
                    addDisabled={pending}
                />
            </div>

            <FormModalShell isOpen={activeModal !== null} title={modalTitle} onClose={closeModal}>
                {modalError ? <p className="text-error mb-4 text-sm">{modalError}</p> : null}
                <form
                    className="flex flex-col gap-4"
                    onSubmit={e => {
                        e.preventDefault()
                        submitTag()
                    }}
                >
                    <FormField icon={LinkIcon}>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Name"
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
                            {pending ? "Saving..." : activeModal?.mode === "edit" ? "Save changes" : "Add tag"}
                        </button>
                    </div>
                </form>
            </FormModalShell>
        </div>
    )
}

export default ProjectTagsPageClient
