import { notFound } from "next/navigation"
import LabOrdersPageClient from "@/components/project/LabOrdersPageClient"
import { fetchProjectLabOrdersData } from "@/lib/server/matdev-lab-orders"

const ProjectLabPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const id = Number(projectSlug)
    if (!Number.isFinite(id)) {
        notFound()
    }

    const { orders, statuses, apiError } = await fetchProjectLabOrdersData(id)

    return (
        <LabOrdersPageClient
            key={`${id}-${orders.map(o => o.labOrderId).join("-")}-${apiError ?? "ok"}`}
            projectId={id}
            initialOrders={orders}
            statuses={statuses}
            initialApiError={apiError}
        />
    )
}

export default ProjectLabPage
