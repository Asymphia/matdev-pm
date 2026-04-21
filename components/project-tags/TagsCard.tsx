import IconButton from "../ui/IconButton"
import TagItem, { Tag } from "./TagItem"
import { PlusIcon } from "@heroicons/react/24/outline"
import BlockWrapper from "@/components/ui/BlockWrapper"

export type TagsCardProps = {
    title: string
    tags: Tag[]
}

const TagsCard = (tagsData: TagsCardProps) => {
    return (
        <BlockWrapper className="w-full">
            <div className="flex flex-row justify-between">
                <h2 className="mb-5 text-4xl font-normal">{tagsData.title}</h2>
                <IconButton Icon={PlusIcon} onClick={() => {}} />
            </div>
            <div className="mr-2.5 flex flex-col gap-2">
                {tagsData.tags.map((tag, index) => (
                    <TagItem tagId={tag.tagId} tagName={tag.tagName} onClick={tag.onClick} key={index} />
                ))}
            </div>
        </BlockWrapper>
    )
}

export default TagsCard
