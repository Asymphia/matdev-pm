const ProjectDeadline = ({ deadline }: { deadline: string }) => {
    const label = deadline?.slice(0, 10) ?? "—"
    return (
        <div className="border-border bg-background inline-flex min-w-[12.5rem] shrink-0 items-center justify-center rounded-full border px-5 py-2 text-sm whitespace-nowrap">
            <span className="text-text-primary-300">Deadline:</span>{" "}
            <strong className="tabular-nums">{label}</strong>
        </div>
    )
}

export default ProjectDeadline
