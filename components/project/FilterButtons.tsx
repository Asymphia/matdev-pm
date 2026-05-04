"use client"

import Button from "@/components/ui/Button"

interface FilterButtonsProps {
    options: string[]
    current: string | null
    setCurrent: (val: string | null) => void
}

const FilterButtons = ({ options, current, setCurrent }: FilterButtonsProps) => {
    const onClickHandler = (val: string | null) => (current === val ? setCurrent(null) : setCurrent(val))

    return (
        <div className="flex items-center gap-3">
            {options.map((btn, index) => (
                <Button key={`${btn}-${index}`} onClick={() => onClickHandler(btn)} className={`${current === btn && "bg-primary-700 text-background hover:bg-primary-500! hover:text-background!"}`}>
                    {btn}
                </Button>
            ))}
        </div>
    )
}

export default FilterButtons
