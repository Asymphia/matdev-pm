import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"

export type Tag = {
    tagId: number
    tagName: string
    onClick: () => void
}

const TagItem = (tag: Tag) => {
    return (
        <div className="flex flex-row justify-between">
            <button onClick={tag.onClick}>{tag.tagName}</button>
            <button type="button" className="cursor-pointer">
                <EllipsisVerticalIcon className="text-text-primary-500 size-6" />
            </button>
        </div>
    )
}

export default TagItem
