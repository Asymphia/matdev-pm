import { ComponentType, SVGProps } from "react"

interface TextIconProps {
    text: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>
    size?: "small" | "big"
}

const TextIcon = ({ text, Icon, size = "small" }: TextIconProps) => {
    return (
        <div className="flex items-center gap-2">
            <Icon className={`text-text-primary-300 ${size === "small" ? "size-4" : "size-5"}`} />

            <p className={size === "small" ? "text-sm" : "text-base"}>{text}</p>
        </div>
    )
}

export default TextIcon
