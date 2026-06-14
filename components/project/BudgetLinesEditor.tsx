"use client"

import { useMemo, useState, useTransition } from "react"
import Button from "@/components/ui/Button"
import CardTitle from "@/components/ui/CardTitle"
import { createBudgetCategory, updateBudgetLines } from "@/app/actions/budget-mutations"
import { formatNumber } from "@/lib/projects-helpers"
import type { BudgetCategoryOption, BudgetPlanLine, ProjectBudget } from "@/lib/server/matdev-budget"

type Row = {
    categoryId: number
    categoryName: string
    allocatedAmount: string
    alertThresholdPercent: string
    totalSpent: number
}

type Props = {
    projectId: number
    budget: ProjectBudget
    categories: BudgetCategoryOption[]
    initialLines: BudgetPlanLine[]
    onUpdated: () => void
}

const BudgetLinesEditor = ({ projectId, budget, categories: initialCategories, initialLines, onUpdated }: Props) => {
    const [categories, setCategories] = useState(initialCategories)
    const spentByCategory = useMemo(() => {
        const m = new Map<number, number>()
        for (const c of budget.categories) {
            m.set(c.categoryId, c.totalSpent)
        }
        return m
    }, [budget.categories])

    const buildRows = (cats: BudgetCategoryOption[]): Row[] => {
        const lineMap = new Map(initialLines.map(l => [l.categoryId, l]))
        return cats.map(cat => {
            const line = lineMap.get(cat.categoryId)
            const fromBudget = budget.categories.find(c => c.categoryId === cat.categoryId)
            const defaultAlert =
                cat.defaultAlertThreshold != null && cat.defaultAlertThreshold <= 100
                    ? cat.defaultAlertThreshold
                    : 80
            return {
                categoryId: cat.categoryId,
                categoryName: cat.categoryName,
                allocatedAmount: String(line?.allocatedAmount ?? fromBudget?.allocatedAmount ?? 0),
                alertThresholdPercent: String(line?.alertThresholdPercent ?? defaultAlert),
                totalSpent: spentByCategory.get(cat.categoryId) ?? fromBudget?.totalSpent ?? 0,
            }
        })
    }

    const [rows, setRows] = useState<Row[]>(() => buildRows(categories))
    const [newCategoryName, setNewCategoryName] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const totalAllocated = rows.reduce((s, r) => s + (parseFloat(r.allocatedAmount) || 0), 0)

    const addCategory = () => {
        const trimmed = newCategoryName.trim()
        if (!trimmed) {
            setError("Category name is required.")
            return
        }
        startTransition(async () => {
            setError(null)
            const res = await createBudgetCategory(projectId, trimmed)
            if (!res.ok) {
                setError(res.error)
                return
            }
            const nextCats = [...categories, res.category].sort((a, b) =>
                a.categoryName.localeCompare(b.categoryName),
            )
            setCategories(nextCats)
            setRows(prev => [
                ...prev,
                {
                    categoryId: res.category.categoryId,
                    categoryName: res.category.categoryName,
                    allocatedAmount: "0",
                    alertThresholdPercent: String(res.category.defaultAlertThreshold ?? 80),
                    totalSpent: 0,
                },
            ].sort((a, b) => a.categoryName.localeCompare(b.categoryName)))
            setNewCategoryName("")
        })
    }

    const save = () => {
        const lines = rows
            .map(r => ({
                categoryId: r.categoryId,
                allocatedAmount: parseFloat(r.allocatedAmount) || 0,
                alertThresholdPercent: parseInt(r.alertThresholdPercent, 10) || null,
            }))
            .filter(l => l.allocatedAmount > 0 || l.alertThresholdPercent != null)

        if (rows.some(r => (parseFloat(r.allocatedAmount) || 0) < 0)) {
            setError("Allocated amounts cannot be negative.")
            return
        }
        if (totalAllocated > budget.totalAmount) {
            setError(
                `Sum of allocations (${formatNumber(totalAllocated)} PLN) exceeds plan total (${formatNumber(budget.totalAmount)} PLN).`,
            )
            return
        }
        startTransition(async () => {
            setError(null)
            const res = await updateBudgetLines(projectId, lines)
            if (!res.ok) {
                setError(res.error)
                return
            }
            onUpdated()
        })
    }

    return (
        <div className="border-border flex flex-col gap-4 rounded-md border border-dashed p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle>Category allocations</CardTitle>
                <p className="text-text-primary-300 text-sm">
                    Allocated: {formatNumber(totalAllocated)} / {formatNumber(budget.totalAmount)} PLN
                </p>
            </div>
            <p className="text-text-primary-100 text-sm">
                Set how much of the plan goes to each category. Add your own categories below (e.g. Travel, Marketing).
            </p>
            {error && <p className="text-error text-sm">{error}</p>}

            <div className="flex flex-wrap items-end gap-3">
                <div className="flex min-w-48 flex-col gap-1">
                    <label className="text-text-primary-300 text-xs font-medium">New category</label>
                    <input
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Travel"
                        className="border-border rounded-md border px-3 py-2 text-sm"
                        disabled={pending}
                        onKeyDown={e => e.key === "Enter" && addCategory()}
                    />
                </div>
                <Button onClick={addCategory} disabled={pending}>
                    Add category
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-text-primary-100 border-border border-b text-left text-xs uppercase">
                            <th className="py-2 pr-4">Category</th>
                            <th className="py-2 pr-4">Allocated (PLN)</th>
                            <th className="py-2 pr-4">Spent</th>
                            <th className="py-2 pr-4">Alert %</th>
                            <th className="py-2">Utilization</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-text-primary-100 py-4 text-sm">
                                    No categories yet. Add one above or use seeded Hardware / Software after API restart.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, i) => {
                                const alloc = parseFloat(row.allocatedAmount) || 0
                                const pct =
                                    alloc > 0
                                        ? Math.round((row.totalSpent / alloc) * 100)
                                        : row.totalSpent > 0
                                          ? 100
                                          : 0
                                return (
                                    <tr key={row.categoryId} className="border-border border-b last:border-0">
                                        <td className="py-2 pr-4 font-medium">{row.categoryName}</td>
                                        <td className="py-2 pr-4">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={row.allocatedAmount}
                                                onChange={e => {
                                                    const next = [...rows]
                                                    next[i] = { ...row, allocatedAmount: e.target.value }
                                                    setRows(next)
                                                }}
                                                className="border-border w-28 rounded-md border px-2 py-1"
                                                disabled={pending}
                                            />
                                        </td>
                                        <td className="text-text-primary-300 py-2 pr-4">
                                            {formatNumber(row.totalSpent)} PLN
                                        </td>
                                        <td className="py-2 pr-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={row.alertThresholdPercent}
                                                onChange={e => {
                                                    const next = [...rows]
                                                    next[i] = { ...row, alertThresholdPercent: e.target.value }
                                                    setRows(next)
                                                }}
                                                className="border-border w-16 rounded-md border px-2 py-1"
                                                disabled={pending}
                                            />
                                        </td>
                                        <td
                                            className={`py-2 ${pct >= 100 ? "text-error" : pct >= 70 ? "text-warning" : "text-text-primary-300"}`}
                                        >
                                            {alloc > 0 || row.totalSpent > 0 ? `${pct}%` : "—"}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <Button onClick={save} disabled={pending || rows.length === 0}>
                {pending ? "Saving…" : "Save allocations"}
            </Button>
        </div>
    )
}

export default BudgetLinesEditor
