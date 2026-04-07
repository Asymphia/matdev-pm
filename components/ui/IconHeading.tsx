import { ComponentType, SVGProps } from "react"

interface IconHeadingProps {
    text: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const IconHeading = ({ text, Icon }: IconHeadingProps) => {
    return (
        <h3 className="flex flex-nowrap align-center gap-4">
            <div className="size-11 flex items-center justify-center rounded-full border border-solid border-border bg-foreground">
                <Icon className="size-6 text-text-primary-500" />
            </div>


            <p>{ text }</p>
        </h3>
    )
}

export default IconHeading