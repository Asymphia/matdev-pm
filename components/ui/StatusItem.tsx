export type StatusItemType = "To do" | "Low" | "Completed" | "Medium" | "In progress" | "High" | "Cancelled"

const StatusItem = ({ status, size = "small" }: { status: StatusItemType; size?: "big" | "small" }) => {
    let style

    if (status === "Low" || status === "Completed") {
        style = "bg-primary-300/20 text-primary-500"
    } else if (status === "Medium" || status === "In progress") {
        style = "bg-warning/20 text-warning"
    } else if (status === "High" || status === "Cancelled") {
        style = "bg-error/20 text-error"
    } else {
        style = "bg-text-primary-500/20 text-text-primary-500"
    }

    return <div className={`w-fit rounded-full ${size === "big" ? "px-7 py-2 text-lg" : "px-5 py-1"} ${style}`}>{status}</div>
}

export default StatusItem
