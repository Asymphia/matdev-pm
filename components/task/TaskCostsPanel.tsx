"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import Button from "@/components/ui/Button"
import ProgressBar from "@/components/project/ProgressBar"
import ExpenditureForm from "@/components/project/ExpenditureForm"
import { editTask } from "@/app/actions/task-view-mutations"
import { formatNumber } from "@/lib/projects-helpers"
import type { TaskViewCosts } from "@/lib/server/matdev-task-view"
import type { BudgetCategoryOption } from "@/lib/server/matdev-budget"
import { useRouter } from "next/navigation"

type Props = {
    projectId: number
    taskId: number
    costs: TaskViewCosts
    categories: BudgetCategoryOption[]
    hasBudgetPlan: boolean
}

const TaskCostsPanel = ({ projectId, taskId, costs, categories, hasBudgetPlan }: Props) => {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [estimateInput, setEstimateInput] = useState(costs.estimatedCost != null ? String(costs.estimatedCost) : "")
    const [addExpOpen, setAddExpOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const estimated = costs.estimatedCost ?? 0
    const spent = costs.taskSpent
    const utilization = estimated > 0 ? Math.round((spent / estimated) * 100) : spent > 0 ? 100 : 0
    const overEstimate = estimated > 0 && spent > estimated

    const saveEstimate = () => {
        const parsed = parseFloat(estimateInput)
        if (!Number.isFinite(parsed) || parsed < 0) {
            setError("Enter a valid amount (0 to clear).")
            return
        }
        startTransition(async () => {
            setError(null)
            const res = await editTask(projectId, taskId, { estimatedCost: parsed })
            if (!res.ok) {
                setError(res.error)
                return
            }
            router.refresh()
        })
    }

    if (!hasBudgetPlan) {
        return (
            <BlockWrapper className="gap-3">
                <CardTitle>Costs</CardTitle>
                <p className="text-text-primary-100 text-sm">
                    No project budget plan yet.{" "}
                    <Link href={`/projects/${projectId}/budget`} className="text-primary-600 underline">
                        Create a budget
                    </Link>{" "}
                    to track task spending.
                </p>
            </BlockWrapper>
        )
    }

    return (
        <BlockWrapper className="gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Costs</CardTitle>
                <Link href={`/projects/${projectId}/budget`} className="text-text-primary-100 text-sm underline">
                    Open budget
                </Link>
            </div>

            {error && <p className="text-error text-sm">{error}</p>}

            <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-primary-300">Estimated cost (PLN)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={estimateInput}
                        onChange={e => setEstimateInput(e.target.value)}
                        className="border-border w-36 rounded-md border px-3 py-1.5 text-sm"
                        disabled={pending}
                    />
                </div>
                <Button onClick={saveEstimate} disabled={pending}>
                    {pending ? "Saving…" : "Save estimate"}
                </Button>
            </div>

            {estimated > 0 || spent > 0 ? (
                <ProgressBar
                    name="Task spend vs estimate"
                    progress={Math.min(utilization, 100)}
                    limit={`${formatNumber(spent)} / ${estimated > 0 ? `${formatNumber(estimated)} PLN` : "no estimate"}`}
                    variant={overEstimate ? "budget" : "default"}
                />
            ) : (
                <p className="text-text-primary-100 text-sm">Set an estimate or add expenditures linked to this task.</p>
            )}

            {overEstimate && (
                <p className="text-error text-sm">
                    Over estimate by {formatNumber(spent - estimated)} PLN
                </p>
            )}

            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={() => setAddExpOpen(v => !v)}
                    disabled={pending || categories.length === 0}
                >
                    {addExpOpen ? "Cancel" : "Add expenditure"}
                </Button>
            </div>

            {addExpOpen && categories.length > 0 && (
                <ExpenditureForm
                    projectId={projectId}
                    categories={categories}
                    mode="create"
                    defaultTaskId={taskId}
                    onSuccess={() => {
                        setAddExpOpen(false)
                        router.refresh()
                    }}
                    onCancel={() => setAddExpOpen(false)}
                />
            )}

            {costs.expenditures.length === 0 ? (
                <p className="text-text-primary-100 text-sm">No expenditures linked to this task.</p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-text-primary-100 border-border border-b text-xs uppercase">
                            <th className="py-2 text-left">Date</th>
                            <th className="py-2 text-left">Category</th>
                            <th className="py-2 text-left">Description</th>
                            <th className="py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {costs.expenditures.map(e => (
                            <tr key={e.expenditureId} className="border-border border-b last:border-0">
                                <td className="py-2 whitespace-nowrap">
                                    {new Date(e.transactionDate).toLocaleDateString()}
                                </td>
                                <td className="py-2">{e.categoryName}</td>
                                <td className="py-2">{e.description}</td>
                                <td className="py-2 text-right font-medium">{formatNumber(e.amount)} PLN</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </BlockWrapper>
    )
}

export default TaskCostsPanel
