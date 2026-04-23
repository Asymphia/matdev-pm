import { ReactNode } from "react"

const Th = ({ children }: { children: ReactNode }) => {
    return <th className="text-text-primary-500 font-semibold">{children}</th>
}
export default Th
