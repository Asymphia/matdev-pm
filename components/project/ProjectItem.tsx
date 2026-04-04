import { Bars3Icon } from "@heroicons/react/24/outline";

const ProjectItem = ({
  id,
  name,
  description,
}: {
  id: string;
  name: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col justify-between m-8 p-6 pb-4 w-100 h-50 shadow-lg rounded-3xl border border-border">
      <div>
        <div className="w-full flex justify-between">
          <div className="line-clamp-1 mb-2">
            <h3>{name}</h3>
          </div>
          <div className="flex justify-end">
            btn
            <Bars3Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="line-clamp-2">{description}</div>
      </div>
      <div>
        <div className="mb-0">
          budget bar
          {/* budget bar */}
        </div>
        <div>
          date bar
          {/* date bar */}
        </div>
      </div>
    </div>
  );
};

export default ProjectItem;
