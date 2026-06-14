"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { formatNumber } from "@/lib/projects-helpers"
import { getBudgetSnapshot } from "@/lib/budget-utils"
import type { ProjectBudget } from "@/lib/server/matdev-budget"
import {
    BUDGET_CATEGORY_COLORS,
    BUDGET_REMAINING_COLOR,
    buildFullBudgetLegend,
    buildSpendDonutData,
    getBudgetSpendSlices,
} from "@/components/project/budget-chart-data"

export const BUDGET_PALETTE = [...BUDGET_CATEGORY_COLORS]
export const BUDGET_FREE_COLOR = BUDGET_REMAINING_COLOR

export function buildBudgetChartData(budget: ProjectBudget) {
    const { chartData, legendItems, isEmpty } = buildSpendDonutData(budget)
    const legend = buildFullBudgetLegend(budget)
    return {
        chartData,
        legendItems: legend.map(l => ({
            name: l.name,
            amount: l.amount,
            fill: l.fill,
        })),
        isEmpty,
        spendLegend: legendItems,
    }
}

type Props = {
    budget: ProjectBudget
    compact?: boolean
}

const BudgetDonutChart = ({ budget, compact = false }: Props) => {
    const snap = getBudgetSnapshot(budget)
    const { chartData, isEmpty } = buildSpendDonutData(budget)
    const spendSlices = getBudgetSpendSlices(budget)
    const fullLegend = buildFullBudgetLegend(budget)

    if (compact) {
        return (
            <div className="flex flex-col gap-4">
                {spendSlices.length > 0 ? (
                    <>
                        <div className="bg-border flex h-2.5 w-full overflow-hidden rounded-full">
                            {spendSlices.map(s => (
                                <div
                                    key={s.categoryId}
                                    className="h-full min-w-[2px] transition-all"
                                    style={{ width: `${s.percentOfSpent}%`, backgroundColor: s.fill }}
                                    title={`${s.name}: ${formatNumber(s.amount)} PLN`}
                                />
                            ))}
                        </div>
                        <ul className="flex flex-col gap-2">
                            {fullLegend.map(item => (
                                <li key={item.name} className="flex items-center justify-between gap-2 text-sm">
                                    <span className="text-text-primary-500 flex min-w-0 items-center gap-2">
                                        <span
                                            className="size-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: item.fill }}
                                        />
                                        <span className="truncate">{item.name}</span>
                                    </span>
                                    <span className="text-text-primary-300 shrink-0 tabular-nums">
                                        {formatNumber(item.amount)} PLN
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="text-text-primary-100 text-sm">No expenditures recorded yet.</p>
                )}
                {snap.displayFreeBudget > 0 && (
                    <p className="text-text-primary-300 text-xs">
                        {formatNumber(snap.displayFreeBudget)} PLN remaining of {formatNumber(budget.totalAmount)} PLN plan
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(200px,280px)]">
            <ul className="flex flex-col gap-3">
                {fullLegend.map(item => (
                    <li key={item.name} className="flex items-center gap-3 text-sm">
                        <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-text-primary-500 flex-1">{item.name}</span>
                        <span className="text-text-primary-300 tabular-nums">{formatNumber(item.amount)} PLN</span>
                    </li>
                ))}
                {snap.displayFreeBudget > 0 && (
                    <li className="text-text-primary-300 border-border border-t pt-3 text-sm">
                        Plan total: {formatNumber(budget.totalAmount)} PLN · Remaining:{" "}
                        {formatNumber(snap.displayFreeBudget)} PLN
                    </li>
                )}
            </ul>
            <div className="relative mx-auto aspect-square w-full max-w-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius="58%"
                            outerRadius="82%"
                            paddingAngle={spendSlices.length > 1 ? 2 : 0}
                            minAngle={spendSlices.length > 1 ? 4 : 0}
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-text-primary-300 text-xs uppercase tracking-wide">Spent</p>
                    <p className="text-primary-700 text-xl font-semibold tabular-nums">
                        {formatNumber(budget.totalSpent)} PLN
                    </p>
                    {!isEmpty && (
                        <p className="text-text-primary-300 mt-0.5 text-xs">
                            of {formatNumber(budget.totalAmount)} PLN
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BudgetDonutChart
