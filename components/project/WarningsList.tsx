"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import Th from "@/components/ui/Th"
import StatusItem from "@/components/ui/StatusItem"
import DeleteIconButton from "@/components/ui/DeleteIconButton"
import { CheckIcon, PlusIcon, BoltIcon } from "@heroicons/react/24/outline"
import type { ProjectRisk } from "@/lib/server/matdev-risks"
import { createRisk, resolveRisk, deleteRisk, fetchRisks } from "@/app/actions/risk-mutations"
import { useConfirm } from "@/hooks/useConfirm"

const SEVERITIES = ["Low", "Medium", "High"] as const
const POLL_INTERVAL_MS = 5_000

type Props = {
    projectId: number
    initialRisks: ProjectRisk[]
}

const WarningsList = ({ projectId, initialRisks }: Props) => {
    const [risks, setRisks] = useState<ProjectRisk[]>(initialRisks)
    useEffect(() => {
        setRisks(initialRisks)
    }, [initialRisks])
    const [addOpen, setAddOpen] = useState(false)
    const [severity, setSeverity] = useState<string>("Medium")
    const [description, setDescription] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()
    const { confirm, ConfirmModal } = useConfirm()

    const refresh = useCallback(async () => {
        const res = await fetchRisks(projectId)
        if (res.ok) setRisks(res.data)
    }, [projectId])

    useEffect(() => {
        const id = setInterval(refresh, POLL_INTERVAL_MS)
        return () => clearInterval(id)
    }, [refresh])

    const handleResolve = (riskId: number) => {
        startTransition(async () => {
            setError(null)
            const res = await resolveRisk(projectId, riskId)
            if (!res.ok) {
                setError(res.error)
                return
            }
            await refresh()
        })
    }

    const handleDelete = async (riskId: number) => {
        const ok = await confirm({
            title: "Delete warning",
            message: "Remove this warning from the project?",
            confirmLabel: "Delete",
            danger: true,
        })
        if (!ok) return
        startTransition(async () => {
            setError(null)
            const res = await deleteRisk(projectId, riskId)
            if (!res.ok) {
                setError(res.error)
                return
            }
            await refresh()
        })
    }

    const handleCreate = () => {
        if (!description.trim()) return
        startTransition(async () => {
            setError(null)
            const res = await createRisk(projectId, severity, description.trim())
            if (!res.ok) {
                setError(res.error)
                return
            }
            setDescription("")
            setSeverity("Medium")
            setAddOpen(false)
            await refresh()
        })
    }

    return (
        <BlockWrapper className="flex w-full flex-col gap-5 self-start">
            <div className="flex items-center justify-between">
                <CardTitle>Warnings</CardTitle>
                <button
                    type="button"
                    onClick={() => setAddOpen(v => !v)}
                    disabled={pending}
                    className="text-text-primary-300 hover:text-primary-700 flex items-center gap-1 text-sm transition-colors"
                >
                    <PlusIcon className="size-4" /> Add
                </button>
            </div>

            {error && <p className="text-error text-sm">{error}</p>}

            {addOpen && (
                <div className="border-border flex flex-wrap items-end gap-3 rounded-md border border-dashed p-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-text-primary-300 text-xs font-medium">Severity</label>
                        <select
                            value={severity}
                            onChange={e => setSeverity(e.target.value)}
                            className="border-border focus:ring-primary-200 rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
                            disabled={pending}
                        >
                            {SEVERITIES.map(s => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex min-w-48 flex-1 flex-col gap-1">
                        <label className="text-text-primary-300 text-xs font-medium">Description</label>
                        <input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe the warning…"
                            className="border-border focus:ring-primary-200 rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
                            disabled={pending}
                            onKeyDown={e => e.key === "Enter" && handleCreate()}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={pending || !description.trim()}
                            onClick={handleCreate}
                            className="bg-primary-700 hover:bg-primary-800 rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                        >
                            {pending ? "Adding…" : "Add"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setAddOpen(false)}
                            className="text-text-primary-300 hover:text-text-primary-500 px-3 py-1.5 text-sm"
                            disabled={pending}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {risks.length === 0 && !addOpen && (
                <p className="text-text-primary-100 py-4 text-center text-sm">No warnings recorded.</p>
            )}

            {risks.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-border border-b">
                                <Th align="center">Severity</Th>
                                <Th align="center">Source</Th>
                                <Th>Description</Th>
                                <Th align="center">Manage</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                            {risks.map(risk => (
                                <tr
                                    key={risk.riskId}
                                    className={`align-top ${risk.isResolved ? "opacity-50" : ""}`}
                                >
                                    <td className="py-3 text-center">
                                        <div className="flex justify-center">
                                            <StatusItem
                                                status={risk.severity as "Low" | "Medium" | "High"}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-3 text-center">
                                        {risk.isAutomatic ? (
                                            <span
                                                title="Automatically detected — resolves when the issue is fixed"
                                                className="inline-flex flex-col items-center gap-1"
                                            >
                                                <span className="inline-flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                                    <BoltIcon className="size-4" />
                                                </span>
                                                <span className="text-[10px] font-semibold tracking-wide text-amber-700 uppercase">
                                                    Auto
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="text-text-primary-300 text-xs">Manual</span>
                                        )}
                                    </td>
                                    <td
                                        className={`text-text-primary-500 max-w-md py-3 pr-4 ${risk.isResolved ? "text-text-primary-100 line-through" : ""}`}
                                    >
                                        {risk.description}
                                    </td>
                                    <td className="py-3 text-center">
                                        {risk.isAutomatic ? (
                                            <span className="text-text-primary-300 text-xs">—</span>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={pending || risk.isResolved}
                                                    onClick={() => handleResolve(risk.riskId)}
                                                    title={
                                                        risk.isResolved
                                                            ? "Already resolved"
                                                            : "Mark as resolved"
                                                    }
                                                    className={`transition ${risk.isResolved ? "cursor-default" : "hover:opacity-70"}`}
                                                >
                                                    <CheckIcon
                                                        className={`size-6 ${risk.isResolved ? "text-green-500" : "text-text-primary-300 hover:text-primary-700"}`}
                                                    />
                                                </button>
                                                <DeleteIconButton
                                                    disabled={pending}
                                                    onClick={() => handleDelete(risk.riskId)}
                                                    title="Delete warning"
                                                />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <ConfirmModal />
        </BlockWrapper>
    )
}

export default WarningsList
