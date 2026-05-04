import BackendConnectionCard from "@/components/layout/BackendConnectionCard"
import { pingMatdevBackend, probeMatdevProjects } from "@/app/actions/matdev-backend"

const Dashboard = async () => {
    const [initialPing, initialProjects] = await Promise.all([pingMatdevBackend(), probeMatdevProjects()])

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-text-primary-500 text-2xl font-semibold">Dashboard</h1>
            <BackendConnectionCard initialPing={initialPing} initialProjects={initialProjects} />
        </div>
    )
}

export default Dashboard
