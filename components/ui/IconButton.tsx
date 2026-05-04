import { ComponentType, SVGProps } from "react"

interface IconButtonProps {
    onClick: () => void
    Icon: ComponentType<SVGProps<SVGSVGElement>>
    disabled?: boolean
}

const IconButton = ({ onClick, Icon, disabled = false }: IconButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="border-border bg-background hover:bg-foreground group flex size-11 items-center justify-center rounded-full border border-solid disabled:cursor-not-allowed disabled:opacity-50"
        >
            <Icon className="text-text-primary-500 group-hover:text-primary-500 size-6" />
        </button>
    )
}

export default IconButton
