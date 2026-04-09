import IconButton from "../ui/IconButton";
import TagItem, { Tag } from "./TagItem";
import { PlusIcon } from "@heroicons/react/24/outline";

export type TagsCardProps = {
  title: string;
  tags: Tag[];
};

const TagsCard = (tagsData: TagsCardProps) => {
  return (
    <div className="flex flex-col h-full w-1/3 bg-background rounded-md border border-solid border-border p-9">
      <div className="flex flex-row justify-between">
        <h1 className="font-normal text-4xl mb-5">{tagsData.title}</h1>
        <IconButton Icon={PlusIcon} onClick={() => {}} />
      </div>
      <div className="flex flex-col gap-2 mr-2.5">
        {tagsData.tags.map((tag, index) => (
          <TagItem
            tagId={tag.tagId}
            tagName={tag.tagName}
            onClick={tag.onClick}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};

export default TagsCard;
