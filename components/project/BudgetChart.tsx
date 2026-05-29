"use client"

import { useState, useTransition, useEffect } from "react"
import BlockWrapper from "@/components/ui/BlockWrapper"
import { Pie, PieChart, ResponsiveContainer } from "recharts"
import IconButton from "@/components/ui/IconButton"
import { CreditCardIcon, XMarkIcon, PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline"
import { formatNumber } from "@/lib/projects-helpers"
import type { ProjectBudget } from "@/lib/server/matdev-budget"
import { fetchBudgetCategories, updateBudgetPlan, addExpenditure, deleteExpenditure } from "@/app/actions/budget-mutations"

const PALETTE = ["#E8C468", "#2D4654", "#629677", "#F2B880", "#7B9EC0", "#C08B5C", "#A3C4A8", "#D4A5A5"]
const FREE_COLOR = "#F2B880"

type Category = { categoryId: number; categoryName: string }

type Props = {
    budget: ProjectBudget | null
    projectId: number
}

const BudgetChart = ({ budget: initialBudget, projectId }: Props) => {
    const [budget, setBudget] = useState(initialBudget)
    useEffect(() => { setBudget(initialBudget) }, [initialBudget])
    const [detailOpen, setDetailOpen] = useState(false)
    const [editPlanOpen, setEditPlanOpen] = useState(false)
    const [addExpOpen, setAddExpOpen] = useState(false)
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])

    // plan edit form state
    const [planName, setPlanName] = useState(budget?.planName ?? "")
    const [planAmount, setPlanAmount] = useState(String(budget?.totalAmount ?? ""))

    // add expenditure form state
    const [expCategoryId, setExpCategoryId] = useState<number | "">("")
    const [expAmount, setExpAmount] = useState("")
    const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10))
    const [expDescription, setExpDescription] = useState("")
    const [expField, setExpField] = useState("")


    if (!budget) {
        return (
            <BlockWrapper className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <header className="flex flex-nowrap items-center justify-between gap-4">
                        <h2>Budget</h2>
                        <IconButton Icon={CreditCardIcon} onClick={() => {}} />
                    </header>
                    <p className="text-text-primary-100 text-sm">No budget plan found for this project.</p>
                </div>
            </BlockWrapper>
        )
    }

    const categorySlices = budget.categories.map((c, i) => ({
        name: c.categoryName,
        value: c.totalSpent,
        fill: PALETTE[i % (PALETTE.length - 1)],
    }))

    const chartData = [
        ...categorySlices,
        ...(budget.freeBudget > 0 ? [{ name: "Free budget", value: budget.freeBudget, fill: FREE_COLOR }] : []),
    ]

    const legendItems = [
        ...budget.categories.map((c, i) => ({
            name: c.categoryName,
            amount: c.totalSpent,
            fill: PALETTE[i % (PALETTE.length - 1)],
        })),
        ...(budget.freeBudget > 0 ? [{ name: "Free budget", amount: budget.freeBudget, fill: FREE_COLOR }] : []),
    ]

    return (
        <>
            <BlockWrapper className="grid grid-cols-[1fr_2fr] gap-4">
                <div className="flex flex-col gap-7">
                    <header className="flex flex-nowrap items-center justify-between">
                        <h2>Budget</h2>
                        <IconButton Icon={CreditCardIcon} onClick={() => { setError(null); setDetailOpen(true) }} />
                    </header>

                    <div className="flex flex-col gap-3">
                        {legendItems.map((item, index) => (
                            <div className="flex items-center gap-x-2" key={index}>
                                <div className="size-5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                                <p className="text-text-primary-500 text-lg">
                                    {item.name} <span className="text-text-primary-100">({formatNumber(item.amount)} PLN)</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative h-100 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart style={{ pointerEvents: "none" }}>
                            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" paddingAngle={2} cornerRadius={10} />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p>Total spend</p>
                        <h3 className="text-primary-700">{formatNumber(budget.totalSpent)} PLN</h3>
                    </div>
                </div>
            </BlockWrapper>

            {/* ── Budget detail / management modal ── */}
            {detailOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() => { setDetailOpen(false); setEditPlanOpen(false); setAddExpOpen(false) }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 gap-4">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-semibold truncate">{budget.planName}</h2>
                                <p className="text-sm text-text-primary-100 mt-0.5">
                                    Budget: <span className="font-medium text-text-primary-300">{formatNumber(budget.totalAmount)} PLN</span>
                                    &nbsp;·&nbsp;Spent: <span className="font-medium text-red-500">{formatNumber(budget.totalSpent)} PLN</span>
                                    &nbsp;·&nbsp;Free: <span className="font-medium text-green-600">{formatNumber(budget.freeBudget)} PLN</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => { setPlanName(budget.planName); setPlanAmount(String(budget.totalAmount)); setEditPlanOpen(v => !v); setAddExpOpen(false) }}
                                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                    disabled={pending}
                                >
                                    <PencilIcon className="size-4" /> Edit plan
                                </button>
                                <button
                                    onClick={() => setDetailOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <XMarkIcon className="size-5 text-text-primary-300" />
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="px-6 py-2 bg-red-50 text-red-600 text-sm border-b border-red-100">{error}</div>
                        )}

                        {/* Edit plan inline form */}
                        {editPlanOpen && (
                            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 items-end">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-text-primary-300">Plan name</label>
                                    <input
                                        value={planName}
                                        onChange={e => setPlanName(e.target.value)}
                                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                        disabled={pending}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-text-primary-300">Total amount (PLN)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={planAmount}
                                        onChange={e => setPlanAmount(e.target.value)}
                                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                        disabled={pending}
                                    />
                                </div>
                                <button
                                    disabled={pending || !planName.trim() || !planAmount}
                                    onClick={() => {
                                        startTransition(async () => {
                                            setError(null)
                                            const res = await updateBudgetPlan(projectId, planName.trim(), parseFloat(planAmount))
                                            if (!res.ok) { setError(res.error); return }
                                            setBudget(res.data)
                                            setEditPlanOpen(false)
                                        })
                                    }}
                                    className="px-4 py-1.5 bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary-800 transition-colors"
                                >
                                    {pending ? "Saving…" : "Save"}
                                </button>
                                <button
                                    onClick={() => setEditPlanOpen(false)}
                                    className="px-3 py-1.5 text-sm text-text-primary-300 hover:text-text-primary-500"
                                    disabled={pending}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Scrollable expenditure list */}
                        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-6">
                            {budget.categories.length === 0 && !addExpOpen && (
                                <p className="text-sm text-text-primary-100 text-center py-8">No expenditures recorded yet.</p>
                            )}
                            {budget.categories.map((cat, i) => (
                                <div key={cat.categoryId}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="size-3 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i % (PALETTE.length - 1)] }} />
                                        <span className="font-medium">{cat.categoryName}</span>
                                        <span className="ml-auto text-sm text-text-primary-100">{formatNumber(cat.totalSpent)} PLN total</span>
                                    </div>
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="text-text-primary-100 text-xs uppercase tracking-wide border-b border-gray-100">
                                                <th className="text-left py-1 pr-3">Date</th>
                                                <th className="text-left py-1 pr-3">Description</th>
                                                <th className="text-left py-1 pr-3">Field</th>
                                                <th className="text-right py-1 pr-3">Amount</th>
                                                <th className="py-1" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cat.expenditures.map(e => (
                                                <tr key={e.expenditureId} className="border-b border-gray-50 last:border-0 group">
                                                    <td className="py-1.5 pr-3 text-text-primary-300 whitespace-nowrap">
                                                        {new Date(e.transactionDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-1.5 pr-3">{e.description}</td>
                                                    <td className="py-1.5 pr-3 text-text-primary-100">{e.field}</td>
                                                    <td className="py-1.5 pr-3 text-right font-medium">{formatNumber(e.amount)} PLN</td>
                                                    <td className="py-1.5 text-right">
                                                        <button
                                                            disabled={pending}
                                                            onClick={() => {
                                                                if (!confirm("Delete this expenditure?")) return
                                                                startTransition(async () => {
                                                                    setError(null)
                                                                    const res = await deleteExpenditure(projectId, e.expenditureId)
                                                                    if (!res.ok) { setError(res.error); return }
                                                                    setBudget(res.data)
                                                                })
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
                                                        >
                                                            <TrashIcon className="size-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>

                        {/* Add expenditure inline form */}
                        {addExpOpen && (
                            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                                <p className="text-sm font-medium mb-3">New expenditure</p>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-text-primary-300">Category</label>
                                        <select
                                            value={expCategoryId}
                                            onChange={e => setExpCategoryId(Number(e.target.value))}
                                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            disabled={pending}
                                        >
                                            <option value="">— pick —</option>
                                            {categories.map(c => (
                                                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-text-primary-300">Amount (PLN)</label>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={expAmount}
                                            onChange={e => setExpAmount(e.target.value)}
                                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            disabled={pending}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-text-primary-300">Date</label>
                                        <input
                                            type="date"
                                            value={expDate}
                                            onChange={e => setExpDate(e.target.value)}
                                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            disabled={pending}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-text-primary-300">Description</label>
                                        <input
                                            value={expDescription}
                                            onChange={e => setExpDescription(e.target.value)}
                                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            disabled={pending}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-text-primary-300">Field</label>
                                        <input
                                            value={expField}
                                            onChange={e => setExpField(e.target.value)}
                                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary-200"
                                            disabled={pending}
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <button
                                            disabled={pending || !expCategoryId || !expAmount || !expDate}
                                            onClick={() => {
                                                startTransition(async () => {
                                                    setError(null)
                                                    const res = await addExpenditure(
                                                        projectId,
                                                        Number(expCategoryId),
                                                        parseFloat(expAmount),
                                                        expDate,
                                                        expDescription,
                                                        expField,
                                                    )
                                                    if (!res.ok) { setError(res.error); return }
                                                    setBudget(res.data)
                                                    setAddExpOpen(false)
                                                    setExpCategoryId(""); setExpAmount(""); setExpDescription(""); setExpField("")
                                                    setExpDate(new Date().toISOString().slice(0, 10))
                                                })
                                            }}
                                            className="px-4 py-1.5 bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary-800 transition-colors"
                                        >
                                            {pending ? "Adding…" : "Add"}
                                        </button>
                                        <button
                                            onClick={() => setAddExpOpen(false)}
                                            className="px-3 py-1.5 text-sm text-text-primary-300 hover:text-text-primary-500"
                                            disabled={pending}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer with Add button */}
                        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
                            <button
                                disabled={pending}
                                onClick={async () => {
                                    if (categories.length === 0) {
                                        const res = await fetchBudgetCategories(projectId)
                                        if (res.ok) setCategories(res.categories)
                                    }
                                    setAddExpOpen(v => !v)
                                    setEditPlanOpen(false)
                                }}
                                className="flex items-center gap-1.5 text-sm px-4 py-1.5 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors disabled:opacity-50"
                            >
                                <PlusIcon className="size-4" /> Add expenditure
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default BudgetChart
