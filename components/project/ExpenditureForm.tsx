"use client"

import { useState, useTransition } from "react"
import Button from "@/components/ui/Button"
import { addExpenditure, updateExpenditure } from "@/app/actions/budget-mutations"
import type { BudgetExpenditure, ProjectBudget } from "@/lib/server/matdev-budget"

type Category = { categoryId: number; categoryName: string }

type TaskOption = { taskId: number; taskName: string }

type Props = {
    projectId: number
    categories: Category[]
    mode: "create" | "edit"
    expenditure?: BudgetExpenditure
    defaultCategoryId?: number
    defaultTaskId?: number
    tasks?: TaskOption[]
    onSuccess: (budget: ProjectBudget) => void
    onCancel: () => void
}

const ExpenditureForm = ({
    projectId,
    categories,
    mode,
    expenditure,
    defaultCategoryId,
    defaultTaskId,
    tasks = [],
    onSuccess,
    onCancel,
}: Props) => {
    const [categoryId, setCategoryId] = useState<number | "">(
        expenditure?.categoryId ?? defaultCategoryId ?? "",
    )
    const [taskId, setTaskId] = useState<number | "">(
        expenditure?.taskId ?? defaultTaskId ?? "",
    )
    const [amount, setAmount] = useState(expenditure ? String(expenditure.amount) : "")
    const [date, setDate] = useState(
        expenditure ? expenditure.transactionDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    )
    const [description, setDescription] = useState(expenditure?.description ?? "")
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const submit = () => {
        const parsed = parseFloat(amount)
        if (!categoryId || !Number.isFinite(parsed) || parsed <= 0 || !date.trim()) {
            setError("Category, amount (> 0), and date are required.")
            return
        }
        startTransition(async () => {
            setError(null)
            const linkedTask = taskId === "" ? null : Number(taskId)
            const legacyField = expenditure?.field ?? ""
            const res =
                mode === "create"
                    ? await addExpenditure(projectId, Number(categoryId), parsed, date, description, legacyField, linkedTask)
                    : await updateExpenditure(
                          projectId,
                          expenditure!.expenditureId,
                          Number(categoryId),
                          parsed,
                          date,
                          description,
                          legacyField,
                          linkedTask,
                      )
            if (!res.ok) {
                setError(res.error)
                return
            }
            onSuccess(res.data)
        })
    }

    return (
        <div className="bg-foreground border-border flex flex-col gap-3 rounded-xl border p-4">
            <p className="text-sm font-medium">{mode === "create" ? "New expenditure" : "Edit expenditure"}</p>
            {error && <p className="text-error text-sm">{error}</p>}
            <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-primary-300">Category</label>
                    <select
                        value={categoryId}
                        onChange={e => setCategoryId(Number(e.target.value))}
                        className="border-border rounded-md border px-3 py-1.5 text-sm"
                        disabled={pending}
                    >
                        <option value="">— pick —</option>
                        {categories.map(c => (
                            <option key={c.categoryId} value={c.categoryId}>
                                {c.categoryName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-primary-300">Amount (PLN)</label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="border-border w-28 rounded-md border px-3 py-1.5 text-sm"
                        disabled={pending}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-primary-300">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="border-border rounded-md border px-3 py-1.5 text-sm"
                        disabled={pending}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-primary-300">Description</label>
                    <input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="border-border min-w-48 rounded-md border px-3 py-1.5 text-sm"
                        disabled={pending}
                    />
                </div>
                {(tasks.length > 0 || defaultTaskId != null) && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-text-primary-300">Task (optional)</label>
                        <select
                            value={taskId}
                            onChange={e => setTaskId(e.target.value === "" ? "" : Number(e.target.value))}
                            className="border-border min-w-40 rounded-md border px-3 py-1.5 text-sm"
                            disabled={pending || (defaultTaskId != null && mode === "create")}
                        >
                            <option value="">— none —</option>
                            {tasks.map(t => (
                                <option key={t.taskId} value={t.taskId}>
                                    {t.taskName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <Button onClick={submit} disabled={pending}>
                    {pending ? "Saving…" : mode === "create" ? "Add" : "Save"}
                </Button>
                <button type="button" onClick={onCancel} disabled={pending} className="text-text-primary-300 px-3 text-sm">
                    Cancel
                </button>
            </div>
        </div>
    )
}

export default ExpenditureForm
