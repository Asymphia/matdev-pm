import { ReactNode } from "react"

const BlockWrapper = ({ children, className="" }: { children: ReactNode, className?: string }) => {
    return (
        <section className={`bg-background rounded-md border border-solid border-border p-9 shadow-sm transition-all hover:shadow-md flex flex-col ${ className }`}>
            { children }
        </section>
    )
}

export default BlockWrapper
