import { ReactNode } from "react"

interface ButtonProps {
    onClick: () => void
    children: ReactNode
    className?: string
    type?: "button" | "submit" | "reset"
    disabled?: boolean
}

const Button = ({ onClick, children, className = "", type = "button", disabled = false }: ButtonProps) => {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`bg-background border-border hover:bg-foreground hover:text-primary-500 cursor-pointer rounded-md border border-solid px-6 py-2.5 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    )
}

export default Button
