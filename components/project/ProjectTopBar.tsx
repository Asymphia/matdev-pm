import FilterButtons from "@/components/project/FilterButtons"
import { ProjectStatus } from "@/lib/data"
import IconButton from "@/components/ui/IconButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import SearchBar from "@/components/ui/SearchBar"
interface ProjectTopBarProps {
    current: ProjectStatus | null
    setCurrent: (val: ProjectStatus | null) => void
    onOpenModal: () => void
}

const ProjectTopBar = ({ current, setCurrent, onOpenModal }: ProjectTopBarProps) => {
    return (
        <header className="grid grid-cols-3">
            <h1>Projects</h1>

            <div className="justify-self-center">
                <FilterButtons current={current} setCurrent={setCurrent} />
            </div>

            <div className="flex items-center gap-3 justify-self-end">
                <IconButton Icon={PlusIcon} onClick={onOpenModal} />
                <SearchBar />
            </div>
        </header>
    )
}

export default ProjectTopBar
