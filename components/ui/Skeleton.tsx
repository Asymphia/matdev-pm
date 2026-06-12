type Props = {
    className?: string
}

const Skeleton = ({ className = "" }: Props) => (
    <div className={`bg-foreground skeleton-shimmer rounded-md ${className}`} aria-hidden />
)

export default Skeleton
