import { ComponentType, SVGProps } from "react"

interface IconHeadingProps {
    text: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const IconHeading = ({ text, Icon }: IconHeadingProps) => {
    return (
        <h3 className="align-center flex flex-nowrap gap-4">
            <div className="border-border bg-foreground flex size-11 items-center justify-center rounded-full border border-solid">
                <Icon className="text-text-primary-500 size-6" />
            </div>

            <p>{text}</p>
        </h3>
    )
}

export default IconHeading
