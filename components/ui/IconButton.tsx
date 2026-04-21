import { ComponentType, SVGProps } from "react"

interface IconButtonProps {
    onClick: () => void
    Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const IconButton = ({ onClick, Icon }: IconButtonProps) => {
    return (
        <button onClick={onClick} className="border-border bg-background hover:bg-foreground group flex size-11 items-center justify-center rounded-full border border-solid">
            <Icon className="text-text-primary-500 group-hover:text-primary-500 size-6" />
        </button>
    )
}

export default IconButton
