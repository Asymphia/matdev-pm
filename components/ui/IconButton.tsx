import { ComponentType, SVGProps } from "react"

interface IconButtonProps {
    onClick: () => void
    Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const IconButton = ({ onClick, Icon }: IconButtonProps) => {
    return (
        <button
            onClick={ onClick }
            className="size-11 flex items-center justify-center rounded-full border border-solid border-border bg-background hover:bg-foreground group"
        >
            <Icon className="size-6 text-text-primary-500 group-hover:text-primary-500" />
        </button>
    )
}

export default IconButton