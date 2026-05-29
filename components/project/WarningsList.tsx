"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import BlockWrapper from "@/components/ui/BlockWrapper"
import Th from "@/components/ui/Th"
import StatusItem from "@/components/ui/StatusItem"
import ContextMenu from "@/components/ui/ContextMenu"
import { CheckIcon, PlusIcon, BoltIcon } from "@heroicons/react/24/outline"
import type { ProjectRisk } from "@/lib/server/matdev-risks"
import { createRisk, resolveRisk, deleteRisk, fetchRisks } from "@/app/actions/risk-mutations"

const SEVERITIES = ["Low", "Medium", "High"] as const
const POLL_INTERVAL_MS = 5_000

type Props = {
    projectId: number
    initialRisks: ProjectRisk[]
}

const WarningsList = ({ projectId, initialRisks }: Props) => {
    const [risks, setRisks] = useState<ProjectRisk[]>(initialRisks)
    // Sync when server re-renders with new risks (e.g. after router.refresh())
    useEffect(() => { setRisks(initialRisks) }, [initialRisks])
    const [addOpen, setAddOpen] = useState(false)
    const [severity, setSeverity] = useState<string>("Medium")
    const [description, setDescription] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const refresh = useCallback(async () => {
        const res = await fetchRisks(projectId)
        if (res.ok) setRisks(res.data)
    }, [projectId])

    // Poll for updated automatic warnings
    useEffect(() => {
        const id = setInterval(refresh, POLL_INTERVAL_MS)
        return () => clearInterval(id)
    }, [refresh])

    const handleResolve = (riskId: number) => {
        startTransition(async () => {
            setError(null)
            const res = await resolveRisk(projectId, riskId)
            if (!res.ok) { setError(res.error); return }
            // Re-fetch full list so auto warnings also update
            await refresh()
        })
    }

    const handleDelete = (riskId: number) => {
        if (!confirm("Delete this warning?")) return
        startTransition(async () => {
            setError(null)
            const res = await deleteRisk(projectId, riskId)
            if (!res.ok) { setError(res.error); return }
            await refresh()
        })
    }

    const handleCreate = () => {
        if (!description.trim()) return
        startTransition(async () => {
            setError(null)
            const res = await createRisk(projectId, severity, description.trim())
            if (!res.ok) { setError(res.error); return }
            setDescription("")
            setSeverity("Medium")
            setAddOpen(false)
            await refresh()
        })
    }

    return (
        <BlockWrapper className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <h2>Warnings</h2>
                <button
                    onClick={() => setAddOpen(v => !v)}
                    disabled={pending}
                    className="flex items-center gap-1 text-sm text-text-primary-300 hover:text-primary-700 transition-colors"
                >
                    <PlusIcon className="size-4" /> Add
                </button>
            </div>

            {error && <p className="text-error text-sm">{error}</p>}

            {addOpen && (
                <div className="flex flex-wrap gap-3 items-end bg-gray-50 rounded-xl p-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-text-primary-300">Severity</label>
                        <select
                            value={severity}
                            onChange={e => setSeverity(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                            disabled={pending}
                        >
                            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-48">
                        <label className="text-xs font-medium text-text-primary-300">Description</label>
                        <input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe the warning…"
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                            disabled={pending}
                            onKeyDown={e => e.key === "Enter" && handleCreate()}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={pending || !description.trim()}
                            onClick={handleCreate}
                            className="px-4 py-1.5 bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary-800 transition-colors"
                        >
                            {pending ? "Adding…" : "Add"}
                        </button>
                        <button
                            onClick={() => setAddOpen(false)}
                            className="px-3 py-1.5 text-sm text-text-primary-300 hover:text-text-primary-500"
                            disabled={pending}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {risks.length === 0 && !addOpen && (
                <p className="text-sm text-text-primary-100 text-center py-4">No warnings recorded.</p>
            )}

            {risks.length > 0 && (
                <table className="w-full border-separate border-spacing-y-4">
                    <thead>
                        <tr>
                            <Th>Severity</Th>
                            <Th>Description</Th>
                            <Th>Manage</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {risks.map(risk => (
                            <tr key={risk.riskId} className={risk.isResolved ? "opacity-50" : ""}>
                                <td>
                                    <div className="flex justify-center">
                                        <StatusItem status={risk.severity as "Low" | "Medium" | "High"} />
                                    </div>
                                </td>
                                <td className={risk.isResolved ? "line-through text-text-primary-100" : ""}>
                                    <div className="flex items-center gap-2">
                                        {risk.isAutomatic && (
                                            <span
                                                title="Automatically detected — resolves when the issue is fixed"
                                                className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 shrink-0"
                                            >
                                                <BoltIcon className="size-2.5" /> Auto
                                            </span>
                                        )}
                                        {risk.description}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex justify-center items-center gap-2">
                                        {risk.isAutomatic ? (
                                            <span className="text-xs text-text-primary-100 italic">auto</span>
                                        ) : (
                                            <>
                                                <button
                                                    disabled={pending || risk.isResolved}
                                                    onClick={() => handleResolve(risk.riskId)}
                                                    title={risk.isResolved ? "Already resolved" : "Mark as resolved"}
                                                    className={`group transition ${risk.isResolved ? "cursor-default" : "hover:opacity-70"}`}
                                                >
                                                    <CheckIcon className={`size-6 transition ${risk.isResolved ? "text-green-500" : "text-text-primary-300 group-hover:text-primary-700"}`} />
                                                </button>
                                                <ContextMenu
                                                    items={[{ label: "Delete", onClick: () => handleDelete(risk.riskId), danger: true }]}
                                                    disabled={pending}
                                                />
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </BlockWrapper>
    )
}

export default WarningsList
