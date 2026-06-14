import FilterButtons from "@/components/project/FilterButtons"
import IconButton from "@/components/ui/IconButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import SearchBar from "@/components/ui/SearchBar"
interface ProjectTopBarProps {
    statusOptions: string[]
    current: string | null
    setCurrent: (val: string | null) => void
    onOpenModal: () => void
    search: string
    onSearch: (v: string) => void
}

const ProjectTopBar = ({ statusOptions, current, setCurrent, onOpenModal, search, onSearch }: ProjectTopBarProps) => {
    return (
        <header className="grid grid-cols-3">
            <h1>Projects</h1>

            <div className="justify-self-center">
                <FilterButtons options={statusOptions} current={current} setCurrent={setCurrent} />
            </div>

            <div className="flex items-center gap-3 justify-self-end">
                <IconButton Icon={PlusIcon} onClick={onOpenModal} />
                <SearchBar value={search} onChange={onSearch} placeholder="Search projects…" />
            </div>
        </header>
    )
}

export default ProjectTopBar
