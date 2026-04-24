const ProjectDeadline = ({ deadline }: { deadline: string }) => {
    return (
        <div className="border-border bg-background w-fit rounded-full border px-7 py-2 text-lg">
            Deadline: <strong>{deadline}</strong>
        </div>
    )
}

export default ProjectDeadline
