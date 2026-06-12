"use client"

import { useState, useTransition } from "react"
import Button from "@/components/ui/Button"
import { createBudgetPlan, updateBudgetPlan } from "@/app/actions/budget-mutations"
import type { ProjectBudget } from "@/lib/server/matdev-budget"

type Props = {
    projectId: number
    mode: "create" | "edit"
    initialName?: string
    initialAmount?: number
    onSuccess: (budget: ProjectBudget) => void
    onCancel?: () => void
}

const BudgetPlanForm = ({ projectId, mode, initialName = "", initialAmount = 0, onSuccess, onCancel }: Props) => {
    const [name, setName] = useState(initialName)
    const [amount, setAmount] = useState(initialAmount > 0 ? String(initialAmount) : "")
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const submit = () => {
        const trimmed = name.trim()
        const parsed = parseFloat(amount)
        if (!trimmed) {
            setError("Plan name is required.")
            return
        }
        if (!Number.isFinite(parsed) || parsed <= 0) {
            setError("Amount must be greater than 0.")
            return
        }
        startTransition(async () => {
            setError(null)
            const res =
                mode === "create"
                    ? await createBudgetPlan(projectId, trimmed, parsed)
                    : await updateBudgetPlan(projectId, trimmed, parsed)
            if (!res.ok) {
                setError(res.error)
                return
            }
            onSuccess(res.data)
        })
    }

    return (
        <div className="flex flex-col gap-4">
            {error && <p className="text-error border-error rounded-md border px-4 py-3 text-sm">{error}</p>}
            <div className="flex flex-wrap gap-4">
                <div className="flex min-w-48 flex-col gap-1">
                    <label className="text-xs font-medium text-text-primary-300">Plan name</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="border-border focus:ring-primary-200 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                        disabled={pending}
                        placeholder="e.g. Main plan 2026"
                    />
                </div>
                <div className="flex min-w-36 flex-col gap-1">
                    <label className="text-xs font-medium text-text-primary-300">Total amount (PLN)</label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="border-border focus:ring-primary-200 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                        disabled={pending}
                    />
                </div>
            </div>
            <div className="flex gap-2">
                <Button onClick={submit} disabled={pending}>
                    {pending ? "Saving…" : mode === "create" ? "Create budget plan" : "Save plan"}
                </Button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={pending}
                        className="text-text-primary-300 hover:text-text-primary-500 px-3 text-sm"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    )
}

export default BudgetPlanForm
