"use client"

import Button from "@/components/ui/Button"
import { ProjectStatus } from "@/app/projects/page"

const FilterButtons = ({ current, setCurrent }: { current: ProjectStatus | null, setCurrent: (val: ProjectStatus | null) => void }) => {
    const onClickHandler = (val: ProjectStatus | null) => current === val ? setCurrent(null) : setCurrent(val)

    const buttons = ["To do", "In progress", "Completed"] as ProjectStatus[]

    return (
        <div className="flex items-center gap-3">
            {
                buttons.map((btn, index) => (
                    <Button
                        key={`${btn}-${index}`}
                        onClick={() => onClickHandler(btn)}
                        className={`${current === btn && "bg-primary-700 text-background hover:bg-primary-500! hover:text-background!"}`}
                    >
                        { btn }
                    </Button>
                ))
            }
        </div>
    )
}

export default FilterButtons