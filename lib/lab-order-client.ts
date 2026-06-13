import { isMatdevApiUnavailable, LAB_API_UNAVAILABLE, parseMatdevApiError } from "@/lib/matdev-api-error"
import { getMatdevApiBaseUrlClient, type LabReportKind } from "@/lib/lab-order-files"
import type { LabOrder } from "@/lib/server/matdev-lab-orders"
import { toUserFacingError } from "@/lib/user-facing-errors"

type OrderResult = { ok: true; data: LabOrder } | { ok: false; error: string }

/** Upload report file directly from browser to API (avoids Next.js Server Actions 1 MB limit). */
export async function uploadLabOrderReportClient(
    projectId: number,
    labOrderId: number,
    kind: LabReportKind,
    file: File,
): Promise<OrderResult> {
    const formData = new FormData()
    formData.append("file", file)

    const url = `${getMatdevApiBaseUrlClient()}/api/project/${projectId}/lab-orders/${labOrderId}/reports/${kind}`

    try {
        const res = await fetch(url, { method: "POST", body: formData })
        if (isMatdevApiUnavailable(res.status)) {
            return { ok: false, error: LAB_API_UNAVAILABLE }
        }
        if (!res.ok) {
            return { ok: false, error: await parseMatdevApiError(res) }
        }
        const json = (await res.json()) as { data?: LabOrder }
        if (!json.data) {
            return { ok: false, error: "Niepoprawna odpowiedź API po uploadzie." }
        }
        return { ok: true, data: json.data }
    } catch (e) {
        return { ok: false, error: toUserFacingError(e, "upload") }
    }
}

export async function uploadLabOrderTestReportClient(
    projectId: number,
    labOrderId: number,
    file: File,
): Promise<OrderResult> {
    return uploadLabOrderReportClient(projectId, labOrderId, "test", file)
}

export async function uploadLabOrderFinalReportClient(
    projectId: number,
    labOrderId: number,
    file: File,
): Promise<OrderResult> {
    return uploadLabOrderReportClient(projectId, labOrderId, "final", file)
}
