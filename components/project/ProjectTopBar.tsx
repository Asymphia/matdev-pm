import FilterButtons from "@/components/project/FilterButtons"
import { ProjectStatus } from "@/app/projects/page"
import IconButton from "@/components/ui/IconButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import SearchBar from "@/components/ui/SearchBar"

const ProjectTopBar = ({ current, setCurrent }: { current: ProjectStatus | null, setCurrent: (val: ProjectStatus | null) => void }) => {
    return (
        <header className="flex flex-nowrap min-w-0 items-center justify-between">
            <h1>
                Projects
            </h1>

            <FilterButtons current={current} setCurrent={setCurrent} />

            <div className="flex items-center gap-3">
                <IconButton Icon={ PlusIcon } onClick={() => {}} />
                <SearchBar />
            </div>
        </header>
    )
}

export default ProjectTopBar