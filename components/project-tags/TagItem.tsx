import ContextMenu from "@/components/ui/ContextMenu"

export type Tag = {
    tagId: number
    tagName: string
    onClick: () => void
    onEdit?: (id: number, name: string) => void
    onDelete?: (id: number) => void
    disabled?: boolean
}

const TagItem = ({ tagId, tagName, onClick, onEdit, onDelete, disabled }: Tag) => {
    const menuItems = [
        ...(onEdit ? [{ label: "Edit", onClick: () => onEdit(tagId, tagName) }] : []),
        ...(onDelete ? [{ label: "Delete", onClick: () => onDelete(tagId), danger: true }] : []),
    ]

    return (
        <div className="flex flex-row items-center justify-between py-1">
            <button onClick={onClick} className="text-left hover:text-primary-700 transition-colors">
                {tagName}
            </button>
            {menuItems.length > 0 && <ContextMenu items={menuItems} disabled={disabled} />}
        </div>
    )
}

export default TagItem
