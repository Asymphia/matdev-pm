"use server"

import { matdevFetch } from "@/lib/matdev-http"
import { isMatdevApiUnavailable, LAB_API_UNAVAILABLE, parseMatdevApiError } from "@/lib/matdev-api-error"
import type { LabOrder, LabOrderStatus } from "@/lib/server/matdev-lab-orders"

type OrderResult = { ok: true; data: LabOrder } | { ok: false; error: string }
type ListResult = { ok: true; data: LabOrder[] } | { ok: false; error: string }
type StatusListResult = { ok: true; data: LabOrderStatus[] } | { ok: false; error: string }
type DeleteResult = { ok: true } | { ok: false; error: string }

async function parseError(res: Response): Promise<string> {
    if (isMatdevApiUnavailable(res.status)) return LAB_API_UNAVAILABLE
    return parseMatdevApiError(res)
}

export async function fetchLabOrders(projectId: number): Promise<ListResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/lab-orders`, { cache: "no-store" })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, data: (json.data ?? []) as LabOrder[] }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function fetchLabOrderStatusesAction(projectId: number): Promise<StatusListResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/lab-orders/statuses`, { cache: "no-store" })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, data: (json.data ?? []) as LabOrderStatus[] }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export type CreateLabOrderInput = {
    description: string
    sampleId?: string
    statusId?: number
    plannedCompletionDate?: string
    predictedCompletionDate?: string
}

export type UpdateLabOrderInput = {
    description?: string
    sampleId?: string
    statusId?: number
    plannedCompletionDate?: string
    predictedCompletionDate?: string
    completionDate?: string
    testReportFileName?: string
    testReportLink?: string
    finalReportFileName?: string
    finalReportLink?: string
}

export async function createLabOrder(projectId: number, input: CreateLabOrderInput): Promise<OrderResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/lab-orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, data: json.data }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function updateLabOrder(
    projectId: number,
    labOrderId: number,
    input: UpdateLabOrderInput
): Promise<OrderResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/lab-orders/${labOrderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, data: json.data }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function deleteLabOrder(projectId: number, labOrderId: number): Promise<DeleteResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/lab-orders/${labOrderId}`, { method: "DELETE" })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        return { ok: true }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

async function deleteReport(
    projectId: number,
    labOrderId: number,
    kind: "test" | "final"
): Promise<OrderResult> {
    const res = await matdevFetch(
        `/api/project/${projectId}/lab-orders/${labOrderId}/reports/${kind}`,
        { method: "DELETE" }
    )
    if (!res.ok) return { ok: false, error: await parseError(res) }
    const json = await res.json()
    return { ok: true, data: json.data }
}

export async function deleteLabOrderTestReport(projectId: number, labOrderId: number): Promise<OrderResult> {
    try {
        return await deleteReport(projectId, labOrderId, "test")
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function deleteLabOrderFinalReport(projectId: number, labOrderId: number): Promise<OrderResult> {
    try {
        return await deleteReport(projectId, labOrderId, "final")
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export type LabOrderFileActions = {
    testReportFile?: File | null
    finalReportFile?: File | null
    removeTestReport?: boolean
    removeFinalReport?: boolean
    externalTestReportLink?: string
    externalFinalReportLink?: string
}
