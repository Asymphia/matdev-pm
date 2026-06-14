import { ReactNode } from "react"

const BlockWrapper = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
    return <section className={`bg-background border-border flex flex-col rounded-md border border-solid p-9 shadow-sm transition-all hover:shadow-md ${className}`}>{children}</section>
}

export default BlockWrapper
