import { ReactNode } from "react"

interface ButtonProps {
    onClick: () => void
    children: ReactNode
    className?: string
}

const Button = ({ onClick, children, className="" }: ButtonProps) => {
    return (
        <button
            onClick={ onClick }
            className={`bg-background border border-solid border-border px-6 py-2.5 rounded-md cursor-pointer hover:bg-foreground hover:text-primary-500 ${className}`}
        >
            { children }
        </button>
    )
}

export default Button