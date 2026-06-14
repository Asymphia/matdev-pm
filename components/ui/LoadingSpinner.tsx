type Props = {
    size?: "sm" | "md" | "lg"
    label?: string
    className?: string
}

const sizeClasses = {
    sm: "size-4 border-2",
    md: "size-8 border-[3px]",
    lg: "size-12 border-4",
}

const LoadingSpinner = ({ size = "md", label, className = "" }: Props) => (
    <div className={`flex flex-col items-center gap-3 ${className}`} role="status" aria-live="polite">
        <div
            className={`border-primary-500/25 border-t-primary-500 animate-spin rounded-full ${sizeClasses[size]}`}
            aria-hidden
        />
        {label ? <p className="text-text-primary-300 text-sm">{label}</p> : null}
        <span className="sr-only">{label ?? "Ładowanie…"}</span>
    </div>
)

export default LoadingSpinner
