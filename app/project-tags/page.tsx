"use client"

import { Tag } from "@/components/project-tags/TagItem"
import TagsCard, { TagsCardProps } from "@/components/project-tags/TagsCard"

const TagsPage = () => {
    return (
        <div className="flex flex-col gap-11 flex-1">
            <h1>Project Tags</h1>

            <div className="grid grid-cols-3 gap-10 flex-1 items-stretch">
                <TagsCard title={DUMMY_TAGCARDS_DATA.title} tags={DUMMY_TAGCARDS_DATA.tags}/>
                <TagsCard title={DUMMY_TAGCARDS_DATA.title} tags={DUMMY_TAGCARDS_DATA.tags}/>
                <TagsCard title={DUMMY_TAGCARDS_DATA.title} tags={DUMMY_TAGCARDS_DATA.tags}/>
            </div>
        </div>
    )
}

export default TagsPage

const DUMMY_TAGS_DATA: Tag[] = [
  {
    tagId: 1,
    tagName: "lorem ipsum",
    onClick: () => {},
  },
  {
    tagId: 2,
    tagName: "lorem ipsum",
    onClick: () => {},
  },
  {
    tagId: 3,
    tagName: "lorem ipsum solor ech damet",
    onClick: () => {},
  },
  {
    tagId: 4,
    tagName: "lorem ipsum",
    onClick: () => {},
  },
];

const DUMMY_TAGCARDS_DATA: TagsCardProps = {
    title: "Workspaces",
    tags: DUMMY_TAGS_DATA
}