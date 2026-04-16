import { ComponentType, SVGProps } from "react"

interface TextIconProps {
    text: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const TextIcon = ({ text, Icon }: TextIconProps) => {
    return (
        <div className="flex items-center gap-2">
            <Icon className="size-4 text-text-primary-300" />

            <p className="text-sm">
                { text }
            </p>
        </div>
    )
}

export default TextIcon