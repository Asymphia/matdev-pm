import { ReactNode } from "react"

const Th = ({
    children,
    align = "left",
}: {
    children: ReactNode
    align?: "left" | "center" | "right"
}) => {
    const alignClass =
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"

    return (
        <th
            className={`text-text-primary-300 pb-2 text-xs font-semibold tracking-wide uppercase ${alignClass}`}
        >
            {children}
        </th>
    )
}

export default Th
