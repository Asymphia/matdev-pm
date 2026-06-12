import IconButton from "../ui/IconButton"
import TagItem, { Tag } from "./TagItem"
import { PlusIcon } from "@heroicons/react/24/outline"
import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"

export type TagsCardProps = {
    title: string
    tags: Tag[]
    onAdd: () => void
    addDisabled?: boolean
    emptyMessage?: string
}

const TagsCard = ({ title, tags, onAdd, addDisabled, emptyMessage = "No tags yet — click + to add one." }: TagsCardProps) => {
    return (
        <BlockWrapper className="flex h-full min-h-[280px] w-full flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <CardTitle>{title}</CardTitle>
                    <p className="text-text-primary-100 text-xs">
                        {tags.length} {tags.length === 1 ? "tag" : "tags"}
                    </p>
                </div>
                <IconButton Icon={PlusIcon} onClick={onAdd} disabled={addDisabled} />
            </div>

            {tags.length === 0 ? (
                <div className="border-border bg-foreground text-text-primary-300 flex flex-1 items-center justify-center rounded-md border border-dashed px-4 py-10 text-center text-sm">
                    {emptyMessage}
                </div>
            ) : (
                <div className="flex flex-1 flex-col gap-2 overflow-visible">
                    {tags.map(tag => (
                        <TagItem
                            tagId={tag.tagId}
                            tagName={tag.tagName}
                            onEdit={tag.onEdit}
                            onDelete={tag.onDelete}
                            disabled={tag.disabled}
                            key={tag.tagId}
                        />
                    ))}
                </div>
            )}
        </BlockWrapper>
    )
}

export default TagsCard
