import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { ComponentType, ReactNode, SVGProps } from "react"

interface FormFieldProps {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    children: ReactNode
    isSelect?: boolean
}

const iconClasses = "pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"

const FormField = ({ icon: Icon, children, isSelect = false }: FormFieldProps) => {
    return (
        <div className="relative flex w-full items-center">
            <Icon className={iconClasses} />
            {children}
            {isSelect && <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />}
        </div>
    )
}

export const formFieldClasses =
    "w-full appearance-none rounded-md border border-border bg-transparent py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary"

export default FormField
