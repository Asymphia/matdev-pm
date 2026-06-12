import { ReactNode } from "react"

/** Shared heading inside BlockWrapper cards (Overview, Tasks, Budget). */
const CardTitle = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <h2 className={`text-lg font-semibold ${className}`.trim()}>{children}</h2>
)

export default CardTitle
