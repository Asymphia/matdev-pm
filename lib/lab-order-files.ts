import { getMatdevApiBaseUrl } from "@/lib/matdev-api-env"

export type LabReportKind = "test" | "final"

const REPORT_PATH: Record<LabReportKind, string> = {
    test: "test",
    final: "final",
}

/** API base URL usable in client components (falls back to server env or localhost). */
export function getMatdevApiBaseUrlClient(): string {
    const raw =
        process.env.NEXT_PUBLIC_MATDEV_API_BASE_URL ??
        process.env.MATDEV_API_BASE_URL ??
        "http://127.0.0.1:5196"
    return raw.replace(/\/$/, "")
}

export function getLabOrderReportDownloadUrl(
    projectId: number,
    labOrderId: number,
    kind: LabReportKind
): string {
    const base = typeof window === "undefined" ? getMatdevApiBaseUrl() : getMatdevApiBaseUrlClient()
    return `${base}/api/project/${projectId}/lab-orders/${labOrderId}/reports/${REPORT_PATH[kind]}`
}

export function isExternalReportLink(link: string | null | undefined): boolean {
    if (!link) return false
    return /^https?:\/\//i.test(link)
}

export const LAB_REPORT_ACCEPT =
    ".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"

export const LAB_REPORT_MAX_BYTES = 52_428_800

export function validateLabReportFile(file: File): string | null {
    if (file.size > LAB_REPORT_MAX_BYTES) return "Plik jest za duży (max 50 MB)."
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : ""
    const allowed = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".png", ".jpg", ".jpeg"]
    if (!allowed.includes(ext)) return "Niedozwolony typ pliku."
    return null
}
