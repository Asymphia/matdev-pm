import { matdevFetch } from "@/lib/matdev-http"
import { isMatdevApiUnavailable, LAB_API_UNAVAILABLE } from "@/lib/matdev-api-error"

export type LabOrderStatus = {
    statusId: number
    name: string
}

export type LabOrder = {
    labOrderId: number
    description: string
    sampleId: string | null
    statusId: number | null
    statusName: string | null
    createdAt: string
    plannedCompletionDate: string | null
    predictedCompletionDate: string | null
    completionDate: string | null
    testReportFileName: string | null
    testReportLink: string | null
    finalReportFileName: string | null
    finalReportLink: string | null
    hasStoredTestReport: boolean
    hasStoredFinalReport: boolean
}

export type LabOrdersLoadResult = {
    orders: LabOrder[]
    statuses: LabOrderStatus[]
    apiError: string | null
}

export async function fetchProjectLabOrdersData(projectId: number): Promise<LabOrdersLoadResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/lab-orders/statuses`, { cache: "no-store" })
        if (isMatdevApiUnavailable(res.status)) {
            return { orders: [], statuses: [], apiError: LAB_API_UNAVAILABLE }
        }
        if (!res.ok) {
            return { orders: [], statuses: [], apiError: null }
        }
        const statusJson = await res.json()
        const statuses = (statusJson.data ?? []) as LabOrderStatus[]

        const ordersRes = await matdevFetch(`/api/project/${projectId}/lab-orders`, { cache: "no-store" })
        if (!ordersRes.ok) {
            return { orders: [], statuses, apiError: null }
        }
        const ordersJson = await ordersRes.json()
        return {
            orders: (ordersJson.data ?? []) as LabOrder[],
            statuses,
            apiError: null,
        }
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error"
        return { orders: [], statuses: [], apiError: msg }
    }
}

export async function fetchProjectLabOrders(projectId: number): Promise<LabOrder[]> {
    const data = await fetchProjectLabOrdersData(projectId)
    return data.orders
}

export async function fetchLabOrderStatuses(projectId: number): Promise<LabOrderStatus[]> {
    const data = await fetchProjectLabOrdersData(projectId)
    return data.statuses
}
