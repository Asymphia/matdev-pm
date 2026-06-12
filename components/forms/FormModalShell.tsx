import Modal from "@/components/ui/Modal"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { ReactNode } from "react"

interface FormModalShellProps {
    isOpen: boolean
    title: string
    onClose: () => void
    children: ReactNode
}

const FormModalShell = ({ isOpen, title, onClose, children }: FormModalShellProps) => {
    if (!isOpen) {
        return null
    }

    return (
        <Modal href="none" onClick={onClose}>
            <div className="flex w-[600px] max-w-full min-h-0 flex-1 flex-col">
                <div className="border-border mb-4 flex shrink-0 items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border transition-all hover:bg-secondary"
                    >
                        <ArrowLeftIcon className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
                    </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
            </div>
        </Modal>
    )
}

export default FormModalShell
