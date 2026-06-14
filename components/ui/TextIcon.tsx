import { ComponentType, SVGProps } from "react"

interface TextIconProps {
    text: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>
    size?: "small" | "big"
    variant?: "plain" | "badge"
}

const TextIcon = ({ text, Icon, size = "small", variant = "plain" }: TextIconProps) => {
    const content = (
        <>
            <Icon className={`text-text-primary-300 shrink-0 ${size === "small" ? "size-4" : "size-5"}`} />
            <span className={`truncate ${size === "small" ? "text-sm" : "text-base"}`}>{text}</span>
        </>
    )

    if (variant === "badge") {
        return (
            <div className="border-border bg-foreground text-text-primary-500 inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border px-2.5 py-1">
                {content}
            </div>
        )
    }

    return <div className="flex min-w-0 items-center gap-2">{content}</div>
}

export default TextIcon
