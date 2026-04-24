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
            <div className="w-[600px] max-w-full">
                <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="group flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all hover:bg-secondary"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                    </button>
                </div>
                {children}
            </div>
        </Modal>
    )
}

export default FormModalShell
