import DeleteIconButton from "@/components/ui/DeleteIconButton"

export type Tag = {
    tagId: number
    tagName: string
    onEdit?: (id: number, name: string) => void
    onDelete?: (id: number) => void
    disabled?: boolean
}

const TagItem = ({ tagId, tagName, onEdit, onDelete, disabled }: Tag) => {
    return (
        <div className="border-border bg-background flex items-center justify-between gap-3 rounded-md border px-3 py-2">
            <span className="text-text-primary-500 min-w-0 flex-1 truncate text-sm">{tagName}</span>
            <div className="flex shrink-0 items-center gap-1">
                {onEdit ? (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onEdit(tagId, tagName)}
                        className="text-text-primary-300 hover:text-primary-700 rounded px-2 py-1 text-xs transition-colors disabled:opacity-40"
                    >
                        Edit
                    </button>
                ) : null}
                {onDelete ? (
                    <DeleteIconButton disabled={disabled} onClick={() => onDelete(tagId)} title="Delete tag" />
                ) : null}
            </div>
        </div>
    )
}

export default TagItem
