"use client"

import Button from "@/components/ui/Button"
import { PROJECT_STATUS_OPTIONS, ProjectStatus } from "@/lib/data"

interface FilterButtonsProps {
    current: ProjectStatus | null
    setCurrent: (val: ProjectStatus | null) => void
}

const FilterButtons = ({ current, setCurrent }: FilterButtonsProps) => {
    const onClickHandler = (val: ProjectStatus | null) => (current === val ? setCurrent(null) : setCurrent(val))

    return (
        <div className="flex items-center gap-3">
            {PROJECT_STATUS_OPTIONS.map((btn, index) => (
                <Button key={`${btn}-${index}`} onClick={() => onClickHandler(btn)} className={`${current === btn && "bg-primary-700 text-background hover:bg-primary-500! hover:text-background!"}`}>
                    {btn}
                </Button>
            ))}
        </div>
    )
}

export default FilterButtons
