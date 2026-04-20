import { ReactNode } from "react"

interface ButtonProps {
    onClick: () => void
    children: ReactNode
    className?: string
}

const Button = ({ onClick, children, className = "" }: ButtonProps) => {
    return (
        <button onClick={onClick} className={`bg-background border-border hover:bg-foreground hover:text-primary-500 cursor-pointer rounded-md border border-solid px-6 py-2.5 ${className}`}>
            {children}
        </button>
    )
}

export default Button
