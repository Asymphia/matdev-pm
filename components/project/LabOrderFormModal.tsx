"use client"

import { useState } from "react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import type { LabOrder, LabOrderStatus } from "@/lib/server/matdev-lab-orders"
import type { CreateLabOrderInput, LabOrderFileActions, UpdateLabOrderInput } from "@/app/actions/lab-order-mutations"
import {
    getLabOrderReportDownloadUrl,
    isExternalReportLink,
    LAB_REPORT_ACCEPT,
    validateLabReportFile,
} from "@/lib/lab-order-files"

type Props = {
    projectId: number
    isOpen: boolean
    onClose: () => void
    onSubmit: (
        input: CreateLabOrderInput | UpdateLabOrderInput,
        files?: LabOrderFileActions
    ) => Promise<boolean>
    statuses: LabOrderStatus[]
    initial?: LabOrder | null
    pending?: boolean
}

const toDateInput = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "")

const ReportFileSection = ({
    title,
    projectId,
    labOrderId,
    kind,
    storedFileName,
    hasStored,
    removed,
    onRemovedChange,
    selectedFile,
    onFileChange,
    externalLink,
    onExternalLinkChange,
    fileError,
}: {
    title: string
    projectId: number
    labOrderId?: number
    kind: "test" | "final"
    storedFileName: string | null
    hasStored: boolean
    removed: boolean
    onRemovedChange: (v: boolean) => void
    selectedFile: File | null
    onFileChange: (f: File | null) => void
    externalLink: string
    onExternalLinkChange: (v: string) => void
    fileError: string | null
}) => {
    const labelClass = "text-text-primary-300 mb-1 block text-sm"
    const inputClass =
        "border-border bg-background text-text-primary w-full rounded-md border border-solid px-3 py-2 text-sm outline-none focus:border-primary-500"

    const showStored = hasStored && !removed && !selectedFile
    const showExternal = !selectedFile && (!hasStored || removed)

    return (
        <div className="border-border border-t border-solid pt-2">
            <p className="mb-3 text-sm font-medium">{title}</p>

            {showStored && labOrderId != null ? (
                <div className="bg-foreground/40 mb-3 flex flex-wrap items-center gap-2 rounded-md px-3 py-2 text-sm">
                    <span className="text-text-primary-300 truncate">{storedFileName ?? "Report file"}</span>
                    <a
                        href={getLabOrderReportDownloadUrl(projectId, labOrderId, kind)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-700 hover:underline"
                    >
                        Pobierz
                    </a>
                    <button
                        type="button"
                        onClick={() => onRemovedChange(true)}
                        className="text-error hover:underline"
                    >
                        Usuń plik
                    </button>
                </div>
            ) : null}

            <label className="mb-3 block">
                <span className={labelClass}>{showStored ? "Zastąp plikiem" : "Upload pliku"}</span>
                <input
                    type="file"
                    accept={LAB_REPORT_ACCEPT}
                    className={`${inputClass} file:text-text-primary file:mr-3 file:rounded file:border-0 file:bg-primary-500 file:px-3 file:py-1 file:text-white`}
                    onChange={e => {
                        onRemovedChange(false)
                        onFileChange(e.target.files?.[0] ?? null)
                    }}
                />
                {selectedFile ? (
                    <span className="text-text-primary-300 mt-1 block text-xs">{selectedFile.name}</span>
                ) : null}
                {fileError ? <span className="text-error mt-1 block text-xs">{fileError}</span> : null}
            </label>

            {showExternal ? (
                <label className="block">
                    <span className={labelClass}>Link zewnętrzny (opcjonalnie)</span>
                    <input
                        className={inputClass}
                        value={externalLink}
                        onChange={e => onExternalLinkChange(e.target.value)}
                        placeholder="https://sharepoint…/report.pdf"
                    />
                </label>
            ) : null}
        </div>
    )
}

const LabOrderFormModal = ({ projectId, isOpen, onClose, onSubmit, statuses, initial, pending }: Props) => {
    const isEdit = Boolean(initial)
    const defaultStatusId =
        initial?.statusId ?? statuses.find(s => s.name === "Created")?.statusId ?? ""
    const [description, setDescription] = useState(initial?.description ?? "")
    const [sampleId, setSampleId] = useState(initial?.sampleId ?? "")
    const [statusId, setStatusId] = useState<number | "">(defaultStatusId)
    const [plannedDate, setPlannedDate] = useState(toDateInput(initial?.plannedCompletionDate))
    const [predictedDate, setPredictedDate] = useState(toDateInput(initial?.predictedCompletionDate))
    const [completionDate, setCompletionDate] = useState(toDateInput(initial?.completionDate))
    const [testReportLink, setTestReportLink] = useState(
        initial?.hasStoredTestReport ? "" : (initial?.testReportLink ?? "")
    )
    const [finalReportLink, setFinalReportLink] = useState(
        initial?.hasStoredFinalReport ? "" : (initial?.finalReportLink ?? "")
    )
    const [testReportFile, setTestReportFile] = useState<File | null>(null)
    const [finalReportFile, setFinalReportFile] = useState<File | null>(null)
    const [removeTestReport, setRemoveTestReport] = useState(false)
    const [removeFinalReport, setRemoveFinalReport] = useState(false)
    const [testFileError, setTestFileError] = useState<string | null>(null)
    const [finalFileError, setFinalFileError] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!description.trim()) return

        if (testReportFile) {
            const err = validateLabReportFile(testReportFile)
            if (err) {
                setTestFileError(err)
                return
            }
        }
        if (finalReportFile) {
            const err = validateLabReportFile(finalReportFile)
            if (err) {
                setFinalFileError(err)
                return
            }
        }
        setTestFileError(null)
        setFinalFileError(null)

        const base = {
            description: description.trim(),
            sampleId: sampleId.trim() || undefined,
            statusId: statusId === "" ? undefined : statusId,
            plannedCompletionDate: plannedDate || undefined,
            predictedCompletionDate: predictedDate || undefined,
        }

        const includeExternalTest =
            !testReportFile && (removeTestReport || !initial?.hasStoredTestReport) && testReportLink.trim()
        const includeExternalFinal =
            !finalReportFile && (removeFinalReport || !initial?.hasStoredFinalReport) && finalReportLink.trim()

        const input: CreateLabOrderInput | UpdateLabOrderInput = isEdit
            ? {
                  ...base,
                  completionDate: completionDate || undefined,
                  ...(includeExternalTest
                      ? {
                            testReportLink: testReportLink.trim(),
                            testReportFileName: testReportLink.split("/").pop()?.trim() || undefined,
                        }
                      : {}),
                  ...(includeExternalFinal
                      ? {
                            finalReportLink: finalReportLink.trim(),
                            finalReportFileName: finalReportLink.split("/").pop()?.trim() || undefined,
                        }
                      : {}),
              }
            : base

        const fileActions: LabOrderFileActions = {
            testReportFile,
            finalReportFile,
            removeTestReport: removeTestReport && Boolean(initial?.hasStoredTestReport),
            removeFinalReport: removeFinalReport && Boolean(initial?.hasStoredFinalReport),
            ...(includeExternalTest ? { externalTestReportLink: testReportLink.trim() } : {}),
            ...(includeExternalFinal ? { externalFinalReportLink: finalReportLink.trim() } : {}),
        }

        const ok = await onSubmit(input, fileActions)
        if (ok) onClose()
    }

    if (!isOpen) return null

    const labelClass = "text-text-primary-300 mb-1 block text-sm"
    const inputClass =
        "border-border bg-background text-text-primary w-full rounded-md border border-solid px-3 py-2 text-sm outline-none focus:border-primary-500"

    return (
        <Modal href="none" isOpen={isOpen} onClick={onClose}>
            <div className="flex max-h-[min(90vh,48rem)] w-[min(100vw-2rem,36rem)] flex-col gap-4 overflow-y-auto">
                <h2 className="text-lg font-semibold">{isEdit ? "Edit lab order" : "New lab order"}</h2>

                <label className="block">
                    <span className={labelClass}>Description</span>
                    <textarea
                        className={`${inputClass} min-h-[4.5rem] resize-y`}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Test type, material, notes…"
                    />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className={labelClass}>Sample ID</span>
                        <input
                            className={inputClass}
                            value={sampleId}
                            onChange={e => setSampleId(e.target.value)}
                            placeholder="SAMPLE-001"
                        />
                    </label>
                    <label className="block">
                        <span className={labelClass}>Status</span>
                        <select
                            className={inputClass}
                            value={statusId}
                            onChange={e => setStatusId(e.target.value ? Number(e.target.value) : "")}
                        >
                            {statuses.map(s => (
                                <option key={s.statusId} value={s.statusId}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className={labelClass}>Planned completion</span>
                        <input
                            type="date"
                            className={inputClass}
                            value={plannedDate}
                            onChange={e => setPlannedDate(e.target.value)}
                        />
                    </label>
                    <label className="block">
                        <span className={labelClass}>Predicted completion</span>
                        <input
                            type="date"
                            className={inputClass}
                            value={predictedDate}
                            onChange={e => setPredictedDate(e.target.value)}
                        />
                    </label>
                </div>

                {isEdit ? (
                    <label className="block">
                        <span className={labelClass}>Actual completion</span>
                        <input
                            type="date"
                            className={inputClass}
                            value={completionDate}
                            onChange={e => setCompletionDate(e.target.value)}
                        />
                    </label>
                ) : null}

                <ReportFileSection
                    title="Test report"
                    projectId={projectId}
                    labOrderId={initial?.labOrderId}
                    kind="test"
                    storedFileName={initial?.testReportFileName ?? null}
                    hasStored={Boolean(initial?.hasStoredTestReport)}
                    removed={removeTestReport}
                    onRemovedChange={setRemoveTestReport}
                    selectedFile={testReportFile}
                    onFileChange={setTestReportFile}
                    externalLink={testReportLink}
                    onExternalLinkChange={setTestReportLink}
                    fileError={testFileError}
                />

                <ReportFileSection
                    title="Final report"
                    projectId={projectId}
                    labOrderId={initial?.labOrderId}
                    kind="final"
                    storedFileName={initial?.finalReportFileName ?? null}
                    hasStored={Boolean(initial?.hasStoredFinalReport)}
                    removed={removeFinalReport}
                    onRemovedChange={setRemoveFinalReport}
                    selectedFile={finalReportFile}
                    onFileChange={setFinalReportFile}
                    externalLink={finalReportLink}
                    onExternalLinkChange={setFinalReportLink}
                    fileError={finalFileError}
                />

                {initial && isExternalReportLink(initial.testReportLink) && !initial.hasStoredTestReport ? (
                    <p className="text-text-primary-100 text-xs">
                        Obecny link test report: {initial.testReportLink}
                    </p>
                ) : null}

                <div className="border-border mt-2 flex shrink-0 justify-end gap-2 border-t border-solid pt-4">
                    <Button onClick={onClose} disabled={pending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={pending || !description.trim()}
                        className="!bg-primary-700 !text-white hover:!bg-primary-500"
                    >
                        {pending ? "Saving…" : isEdit ? "Save changes" : "Create order"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default LabOrderFormModal
