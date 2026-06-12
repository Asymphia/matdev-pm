"use client"

import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import { BUDGET_CATEGORY_COLORS } from "@/components/project/budget-chart-data"
import BudgetMonthlyTrendChart from "@/components/project/BudgetMonthlyTrendChart"
import {
    buildBudgetStatsSummary,
    buildCategoryBarRows,
    buildTaskBarRows,
    buildTaskLinkRows,
    type BudgetExpenditureRow,
    type TaskSpendRow,
} from "@/lib/budget-stats"
import { formatNumber } from "@/lib/projects-helpers"
import type { ProjectBudget } from "@/lib/server/matdev-budget"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

type Props = {
    budget: ProjectBudget
    expenditures: BudgetExpenditureRow[]
    spendByTask: TaskSpendRow[]
}

const TOOLTIP_STYLE = {
    fontSize: 12,
    borderRadius: 8,
    border: "1px solid var(--border)",
    backgroundColor: "var(--background)",
}

function StatCard({
    label,
    value,
    hint,
    tone = "default",
}: {
    label: string
    value: string
    hint?: string
    tone?: "default" | "warn" | "error"
}) {
    const valueClass =
        tone === "error" ? "text-error" : tone === "warn" ? "text-warning" : "text-text-primary-500"

    return (
        <div className="border-border bg-foreground/40 flex flex-col gap-1 rounded-lg border px-4 py-3">
            <span className="text-text-primary-100 text-xs uppercase tracking-wide">{label}</span>
            <span className={`text-xl font-semibold tabular-nums ${valueClass}`}>{value}</span>
            {hint ? <span className="text-text-primary-300 text-xs">{hint}</span> : null}
        </div>
    )
}

function EmptyChart({ message }: { message: string }) {
    return (
        <p className="text-text-primary-100 flex min-h-[220px] items-center justify-center text-sm">
            {message}
        </p>
    )
}

const BudgetStatsPanel = ({ budget, expenditures, spendByTask }: Props) => {
    const summary = buildBudgetStatsSummary(budget, expenditures)
    const categoryRows = buildCategoryBarRows(budget)
    const taskRows = buildTaskBarRows(spendByTask)
    const linkRows = buildTaskLinkRows(summary)

    const categoryChartHeight = Math.max(220, categoryRows.length * 44)
    const taskChartHeight = Math.max(220, taskRows.length * 44)

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <StatCard label="Plan" value={`${formatNumber(summary.planTotal)} PLN`} />
                <StatCard label="Spent" value={`${formatNumber(summary.totalSpent)} PLN`} />
                <StatCard
                    label={summary.isOverBudget ? "Over plan" : "Remaining"}
                    value={`${formatNumber(summary.isOverBudget ? summary.overAmount : summary.remaining)} PLN`}
                    tone={summary.isOverBudget ? "error" : "default"}
                />
                <StatCard
                    label="Utilization"
                    value={`${Math.round(summary.utilizationPercent)}%`}
                    tone={summary.utilizationPercent >= 100 ? "error" : summary.utilizationPercent >= 80 ? "warn" : "default"}
                />
                <StatCard
                    label="Expenditures"
                    value={String(summary.expenditureCount)}
                    hint={summary.expenditureCount > 0 ? `avg ${formatNumber(summary.avgExpenditure)} PLN` : undefined}
                />
                <StatCard
                    label="Categories"
                    value={String(summary.categoriesWithSpend)}
                    hint={`of ${budget.categories.length} total`}
                />
            </div>

            <BudgetMonthlyTrendChart expenditures={expenditures} planTotal={budget.totalAmount} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <BlockWrapper className="gap-4">
                    <CardTitle>Spending by category</CardTitle>
                    {categoryRows.length === 0 ? (
                        <EmptyChart message="No category spending yet." />
                    ) : (
                        <div style={{ height: categoryChartHeight }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryRows} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-primary-300)" }} tickFormatter={v => formatNumber(Number(v))} />
                                    <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 11, fill: "var(--text-primary-500)" }} />
                                    <Tooltip
                                        contentStyle={TOOLTIP_STYLE}
                                        formatter={value => [`${formatNumber(Number(value ?? 0))} PLN`, "Spent"]}
                                    />
                                    <Bar dataKey="spent" radius={[0, 4, 4, 0]}>
                                        {categoryRows.map((row, i) => (
                                            <Cell key={row.name} fill={row.fill || BUDGET_CATEGORY_COLORS[i % BUDGET_CATEGORY_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </BlockWrapper>

                <BlockWrapper className="gap-4">
                    <CardTitle>Allocated vs spent</CardTitle>
                    {categoryRows.every(r => r.allocated <= 0) ? (
                        <EmptyChart message="Set allocations under Manage allocations to compare limits with spend." />
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={categoryRows.filter(r => r.allocated > 0 || r.spent > 0)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-primary-500)" }} />
                                <YAxis tick={{ fontSize: 11, fill: "var(--text-primary-300)" }} tickFormatter={v => formatNumber(Number(v))} />
                                <Tooltip
                                    contentStyle={TOOLTIP_STYLE}
                                    formatter={(value, name) => [
                                        `${formatNumber(Number(value ?? 0))} PLN`,
                                        name === "allocated" ? "Allocated" : "Spent",
                                    ]}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="allocated" name="Allocated" fill="#C4C4C4" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="spent" name="Spent" fill="#2D4654" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </BlockWrapper>

                <BlockWrapper className="gap-4">
                    <CardTitle>Top tasks by spend</CardTitle>
                    {taskRows.length === 0 ? (
                        <EmptyChart message="Link expenditures to tasks to see this chart." />
                    ) : (
                        <div style={{ height: taskChartHeight }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={taskRows} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-primary-300)" }} tickFormatter={v => formatNumber(Number(v))} />
                                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "var(--text-primary-500)" }} />
                                    <Tooltip
                                        contentStyle={TOOLTIP_STYLE}
                                        formatter={value => [`${formatNumber(Number(value ?? 0))} PLN`, "Spent"]}
                                    />
                                    <Bar dataKey="total" fill="#629677" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </BlockWrapper>

            </div>

            {linkRows.length > 0 && (
                <BlockWrapper className="gap-4">
                    <CardTitle>Task linkage</CardTitle>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={linkRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-primary-500)" }} />
                            <YAxis tick={{ fontSize: 11, fill: "var(--text-primary-300)" }} tickFormatter={v => formatNumber(Number(v))} />
                            <Tooltip
                                contentStyle={TOOLTIP_STYLE}
                                formatter={value => [`${formatNumber(Number(value ?? 0))} PLN`, "Amount"]}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {linkRows.map((row, i) => (
                                    <Cell key={row.name} fill={i === 0 ? "#7B9EC0" : "#E8C468"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </BlockWrapper>
            )}
        </div>
    )
}

export default BudgetStatsPanel
