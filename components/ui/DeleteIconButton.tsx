import { TrashIcon } from "@heroicons/react/24/outline"

type DeleteIconButtonProps = {
    onClick: () => void
    disabled?: boolean
    title?: string
    "aria-label"?: string
}

const DeleteIconButton = ({
    onClick,
    disabled = false,
    title = "Delete",
    "aria-label": ariaLabel = title,
}: DeleteIconButtonProps) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        title={title}
        aria-label={ariaLabel}
        className="text-text-primary-300 hover:text-error hover:bg-foreground flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40"
    >
        <TrashIcon className="size-4" />
    </button>
)

export default DeleteIconButton
