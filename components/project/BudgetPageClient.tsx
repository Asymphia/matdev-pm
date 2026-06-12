"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useConfirm } from "@/hooks/useConfirm"
import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import ProgressBar from "@/components/project/ProgressBar"
import BudgetDonutChart, { BUDGET_PALETTE } from "@/components/project/BudgetDonutChart"
import BudgetPlanForm from "@/components/project/BudgetPlanForm"
import BudgetLinesEditor from "@/components/project/BudgetLinesEditor"
import BudgetCategoryCards from "@/components/project/BudgetCategoryCards"
import BudgetCategoriesPanel from "@/components/project/BudgetCategoriesPanel"
import ExpenditureForm from "@/components/project/ExpenditureForm"
import BudgetAlertsPanel from "@/components/project/BudgetAlertsPanel"
import BudgetMonthlyTrendChart from "@/components/project/BudgetMonthlyTrendChart"
import BudgetStatsPanel from "@/components/project/BudgetStatsPanel"
import Button from "@/components/ui/Button"
import { TrashIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline"
import { deleteExpenditure } from "@/app/actions/budget-mutations"
import { formatNumber } from "@/lib/projects-helpers"
import { getBudgetSnapshot } from "@/lib/budget-utils"
import type {
    BudgetCategoryOption,
    BudgetExpenditure,
    BudgetPlanLine,
    ProjectBudget,
} from "@/lib/server/matdev-budget"
import type { ProjectRisk } from "@/lib/server/matdev-risks"

type FlatExpenditure = BudgetExpenditure & { categoryId: number }

type TaskOption = { taskId: number; taskName: string }

type BudgetView = "overview" | "by-task" | "stats"

type Props = {
    projectId: number
    initialBudget: ProjectBudget | null
    categories: BudgetCategoryOption[]
    initialLines: BudgetPlanLine[]
    initialRisks: ProjectRisk[]
    taskOptions: TaskOption[]
}

const BudgetPageClient = ({ projectId, initialBudget, categories, initialLines, initialRisks, taskOptions }: Props) => {
    const router = useRouter()
    const [budget, setBudget] = useState(initialBudget)
    const [view, setView] = useState<BudgetView>("overview")
    const [categoriesOpen, setCategoriesOpen] = useState(false)
    const [editPlanOpen, setEditPlanOpen] = useState(false)
    const [linesOpen, setLinesOpen] = useState(false)
    const [addExpOpen, setAddExpOpen] = useState(false)
    const [editExp, setEditExp] = useState<FlatExpenditure | null>(null)
    const [categoryFilter, setCategoryFilter] = useState<number | "all">("all")
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()
    const { confirm, ConfirmModal } = useConfirm()

    const flatExpenditures = useMemo((): FlatExpenditure[] => {
        if (!budget) return []
        return budget.categories.flatMap(cat =>
            cat.expenditures.map(e => ({
                ...e,
                categoryId: e.categoryId ?? cat.categoryId,
                categoryName: e.categoryName || cat.categoryName,
            })),
        )
    }, [budget])

    const sortedExpenditures = useMemo(() => {
        const list = categoryFilter === "all" ? flatExpenditures : flatExpenditures.filter(e => e.categoryId === categoryFilter)
        return [...list].sort(
            (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
        )
    }, [flatExpenditures, categoryFilter])

    const spendByTask = useMemo(() => {
        const map = new Map<number, { taskName: string; total: number; count: number }>()
        for (const e of flatExpenditures) {
            if (e.taskId == null) continue
            const name = e.taskName ?? taskOptions.find(t => t.taskId === e.taskId)?.taskName ?? `Task #${e.taskId}`
            const prev = map.get(e.taskId) ?? { taskName: name, total: 0, count: 0 }
            map.set(e.taskId, { taskName: name, total: prev.total + e.amount, count: prev.count + 1 })
        }
        return [...map.entries()]
            .map(([taskId, v]) => ({ taskId, ...v }))
            .sort((a, b) => b.total - a.total)
    }, [flatExpenditures, taskOptions])

    const onBudgetUpdated = (next: ProjectBudget) => {
        setBudget(next)
        setEditPlanOpen(false)
        setAddExpOpen(false)
        setEditExp(null)
        router.refresh()
    }

    const handleDeleteExpenditure = async (expenditureId: number) => {
        const ok = await confirm({
            title: "Delete expenditure",
            message: "Remove this expenditure from the budget?",
            confirmLabel: "Delete",
            danger: true,
        })
        if (!ok) return
        startTransition(async () => {
            setError(null)
            const res = await deleteExpenditure(projectId, expenditureId)
            if (!res.ok) {
                setError(res.error)
                return
            }
            onBudgetUpdated(res.data)
        })
    }

    if (!budget) {
        return (
            <BlockWrapper className="max-w-xl flex-col gap-6">
                <p className="text-text-primary-100 text-sm">
                    No budget plan exists for this project yet. Create one below.
                </p>
                <BudgetPlanForm projectId={projectId} mode="create" onSuccess={onBudgetUpdated} />
            </BlockWrapper>
        )
    }

    const snap = getBudgetSnapshot(budget)
    const limitLabel = snap.isOverBudget
        ? `${formatNumber(budget.totalSpent)} / ${formatNumber(budget.totalAmount)} PLN`
        : `${formatNumber(budget.totalSpent)} / ${formatNumber(budget.totalAmount)} PLN · Free ${formatNumber(snap.displayFreeBudget)} PLN`

    return (
        <div className="flex flex-col gap-6">
            {error && (
                <p className="text-error border-error rounded-md border px-4 py-3 text-sm">{error}</p>
            )}

            <BudgetAlertsPanel projectId={projectId} risks={initialRisks} />

            <BlockWrapper className="gap-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle>{budget.planName}</CardTitle>
                        <p className="text-text-primary-100 mt-1 text-sm">
                            Plan {formatNumber(budget.totalAmount)} PLN
                            {snap.isOverBudget && (
                                <span className="text-error ml-2">
                                    Over by {formatNumber(snap.overAmount)} PLN
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => {
                                setCategoriesOpen(v => !v)
                                setEditPlanOpen(false)
                                setLinesOpen(false)
                            }}
                            disabled={pending}
                        >
                            Manage categories
                        </Button>
                        <Button onClick={() => { setEditPlanOpen(v => !v); setLinesOpen(false); setCategoriesOpen(false) }} disabled={pending}>
                            Edit plan
                        </Button>
                        <Button onClick={() => { setLinesOpen(v => !v); setEditPlanOpen(false); setCategoriesOpen(false) }} disabled={pending}>
                            Manage allocations
                        </Button>
                        <Button
                            onClick={() => {
                                setAddExpOpen(true)
                                setEditExp(null)
                                setEditPlanOpen(false)
                                setLinesOpen(false)
                            }}
                            disabled={pending}
                        >
                            <span className="flex items-center gap-1">
                                <PlusIcon className="size-4" /> Add expenditure
                            </span>
                        </Button>
                    </div>
                </div>

                <ProgressBar
                    name="Budget utilization"
                    progress={Math.min(snap.utilizationPercent, 100)}
                    limit={limitLabel}
                    variant="budget"
                />

                {editPlanOpen && (
                    <BudgetPlanForm
                        projectId={projectId}
                        mode="edit"
                        initialName={budget.planName}
                        initialAmount={budget.totalAmount}
                        onSuccess={onBudgetUpdated}
                        onCancel={() => setEditPlanOpen(false)}
                    />
                )}

                {categoriesOpen && (
                    <BudgetCategoriesPanel
                        projectId={projectId}
                        initialCategories={categories}
                        onCategoryAdded={() => router.refresh()}
                    />
                )}

                {linesOpen && (
                    <BudgetLinesEditor
                        projectId={projectId}
                        budget={budget}
                        categories={categories}
                        initialLines={initialLines}
                        onUpdated={() => router.refresh()}
                    />
                )}

                {addExpOpen && !editExp && (
                    <ExpenditureForm
                        key="add-expenditure"
                        projectId={projectId}
                        categories={categories}
                        tasks={taskOptions}
                        mode="create"
                        onSuccess={onBudgetUpdated}
                        onCancel={() => setAddExpOpen(false)}
                    />
                )}
            </BlockWrapper>

            <div className="border-border flex gap-1 border-b">
                {(["overview", "by-task", "stats"] as const).map(v => (
                    <button
                        key={v}
                        type="button"
                        onClick={() => setView(v)}
                        className={`relative cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors ${
                            view === v
                                ? "text-primary-700"
                                : "text-text-primary-300 hover:text-primary-700"
                        }`}
                    >
                        {v === "overview" ? "Overview" : v === "by-task" ? "By task" : "Stats"}
                        <span
                            aria-hidden
                            className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-700 transition-opacity ${
                                view === v ? "opacity-100" : "opacity-0"
                            }`}
                        />
                    </button>
                ))}
            </div>

            {view === "overview" && (
                <>
            <BlockWrapper className="gap-4">
                <CardTitle>Categories at a glance</CardTitle>
                <BudgetCategoryCards budget={budget} />
            </BlockWrapper>

            <BudgetMonthlyTrendChart
                expenditures={flatExpenditures}
                planTotal={budget.totalAmount}
                compact
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <BlockWrapper>
                    <CardTitle className="mb-4">Spending by category</CardTitle>
                    <BudgetDonutChart budget={budget} />
                </BlockWrapper>

                <BlockWrapper className="gap-4">
                    <CardTitle>Category breakdown</CardTitle>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-text-primary-100 border-border border-b text-xs uppercase">
                                <th className="py-2 text-left">Category</th>
                                <th className="py-2 text-right">Allocated</th>
                                <th className="py-2 text-right">Spent</th>
                                <th className="py-2 text-right">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budget.categories.map((cat, i) => {
                                const alloc = cat.allocatedAmount ?? 0
                                const pct =
                                    cat.categoryUtilizationPercent ??
                                    (alloc > 0 ? Math.round((cat.totalSpent / alloc) * 100) : cat.totalSpent > 0 ? 100 : 0)
                                return (
                                    <tr key={cat.categoryId} className="border-border border-b last:border-0">
                                        <td className="py-2">
                                            <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: BUDGET_PALETTE[i % BUDGET_PALETTE.length] }} />
                                            {cat.categoryName}
                                        </td>
                                        <td className="py-2 text-right">{alloc > 0 ? `${formatNumber(alloc)}` : "—"}</td>
                                        <td className="py-2 text-right">{formatNumber(cat.totalSpent)}</td>
                                        <td className={`py-2 text-right ${pct >= 100 ? "text-error" : pct >= 70 ? "text-warning" : ""}`}>
                                            {alloc > 0 || cat.totalSpent > 0 ? `${pct}%` : "—"}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </BlockWrapper>
            </div>
                </>
            )}

            {view === "stats" && (
                <BudgetStatsPanel budget={budget} expenditures={flatExpenditures} spendByTask={spendByTask} />
            )}

            {view === "by-task" && (
                <BlockWrapper className="gap-4">
                    <CardTitle>Spending by task</CardTitle>
                    {spendByTask.length === 0 ? (
                        <p className="text-text-primary-100 text-sm">
                            No expenditures linked to tasks yet. Add one via &quot;Add expenditure&quot; and pick a task.
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-text-primary-100 border-border border-b text-xs uppercase">
                                    <th className="py-2 text-left">Task</th>
                                    <th className="py-2 text-right">Items</th>
                                    <th className="py-2 text-right">Total spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {spendByTask.map(row => (
                                    <tr key={row.taskId} className="border-border border-b last:border-0">
                                        <td className="py-2">
                                            <a
                                                href={`/projects/${projectId}/tasks/${row.taskId}`}
                                                className="text-primary-600 hover:underline"
                                            >
                                                {row.taskName}
                                            </a>
                                        </td>
                                        <td className="py-2 text-right">{row.count}</td>
                                        <td className="py-2 text-right font-medium">{formatNumber(row.total)} PLN</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </BlockWrapper>
            )}

            <BlockWrapper className="gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle>Expenditures</CardTitle>
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="border-border rounded-md border px-3 py-1.5 text-sm"
                    >
                        <option value="all">All categories</option>
                        {budget.categories.map(c => (
                            <option key={c.categoryId} value={c.categoryId}>
                                {c.categoryName}
                            </option>
                        ))}
                    </select>
                </div>

                {editExp && (
                    <ExpenditureForm
                        key={editExp.expenditureId}
                        projectId={projectId}
                        categories={categories}
                        tasks={taskOptions}
                        mode="edit"
                        expenditure={editExp}
                        onSuccess={onBudgetUpdated}
                        onCancel={() => setEditExp(null)}
                    />
                )}

                {sortedExpenditures.length === 0 ? (
                    <p className="text-text-primary-100 text-sm">No expenditures recorded.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-text-primary-100 border-border border-b text-xs uppercase">
                                <th className="py-2 text-left">Date</th>
                                <th className="py-2 text-left">Category</th>
                                <th className="py-2 text-left">Task</th>
                                <th className="py-2 text-left">Description</th>
                                <th className="py-2 text-left">Field</th>
                                <th className="py-2 text-right">Amount</th>
                                <th className="py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {sortedExpenditures.map(e => (
                                <tr key={e.expenditureId} className="border-border border-b last:border-0">
                                    <td className="py-2 whitespace-nowrap">
                                        {new Date(e.transactionDate).toLocaleDateString()}
                                    </td>
                                    <td className="py-2">{e.categoryName}</td>
                                    <td className="py-2">
                                        {e.taskId != null ? (
                                            <a
                                                href={`/projects/${projectId}/tasks/${e.taskId}`}
                                                className="text-primary-600 hover:underline"
                                            >
                                                {e.taskName ?? `#${e.taskId}`}
                                            </a>
                                        ) : (
                                            <span className="text-text-primary-100">—</span>
                                        )}
                                    </td>
                                    <td className="py-2">{e.description}</td>
                                    <td className="text-text-primary-100 py-2">{e.field}</td>
                                    <td className="py-2 text-right font-medium">{formatNumber(e.amount)} PLN</td>
                                    <td className="py-2 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                disabled={pending}
                                                onClick={() => {
                                                    setEditExp(e)
                                                    setAddExpOpen(false)
                                                }}
                                                className="hover:bg-foreground rounded p-1"
                                                aria-label="Edit expenditure"
                                            >
                                                <PencilIcon className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={pending}
                                                onClick={() => handleDeleteExpenditure(e.expenditureId)}
                                                className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                                                aria-label="Delete expenditure"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </BlockWrapper>
            <ConfirmModal />
        </div>
    )
}

export default BudgetPageClient
