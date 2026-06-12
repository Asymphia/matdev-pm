"use client"

import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import { buildMonthlyTrendRows, type BudgetExpenditureRow } from "@/lib/budget-stats"
import { formatNumber } from "@/lib/projects-helpers"
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

const TOOLTIP_STYLE = {
    fontSize: 12,
    borderRadius: 8,
    border: "1px solid var(--border)",
    backgroundColor: "var(--background)",
}

type Props = {
    expenditures: BudgetExpenditureRow[]
    planTotal: number
    compact?: boolean
    className?: string
}

const BudgetMonthlyTrendChart = ({ expenditures, planTotal, compact = false, className = "" }: Props) => {
    const rows = buildMonthlyTrendRows(expenditures)

    if (rows.length === 0) {
        return (
            <BlockWrapper className={`gap-3 ${className}`}>
                <CardTitle>Monthly budget trend</CardTitle>
                <p className="text-text-primary-100 text-sm">
                    Add expenditures with dates to see monthly spend and cumulative totals in PLN.
                </p>
            </BlockWrapper>
        )
    }

    const height = compact ? 200 : 300

    return (
        <BlockWrapper className={`gap-3 ${className}`}>
            <div>
                <CardTitle>Monthly budget trend</CardTitle>
                {!compact && (
                    <p className="text-text-primary-100 mt-1 text-sm">
                        Bars = spend per month · Line = cumulative spend vs plan ({formatNumber(planTotal)} PLN)
                    </p>
                )}
            </div>
            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-primary-500)" }} />
                    <YAxis
                        yAxisId="monthly"
                        tick={{ fontSize: 11, fill: "var(--text-primary-300)" }}
                        tickFormatter={v => formatNumber(Number(v))}
                    />
                    <YAxis
                        yAxisId="cumulative"
                        orientation="right"
                        tick={{ fontSize: 11, fill: "var(--text-primary-300)" }}
                        tickFormatter={v => formatNumber(Number(v))}
                    />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value, name) => {
                            const isMonthly = name === "monthly" || name === "Monthly spend"
                            return [`${formatNumber(Number(value ?? 0))} PLN`, isMonthly ? "This month" : "Cumulative"]
                        }}
                    />
                    {!compact && <Legend wrapperStyle={{ fontSize: 12 }} />}
                    <Bar
                        yAxisId="monthly"
                        dataKey="monthly"
                        name="Monthly spend"
                        fill="#2D4654"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                    />
                    <Line
                        yAxisId="cumulative"
                        type="monotone"
                        dataKey="cumulative"
                        name="Cumulative spend"
                        stroke="#629677"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#629677" }}
                    />
                    {planTotal > 0 && (
                        <ReferenceLine
                            yAxisId="cumulative"
                            y={planTotal}
                            stroke="#b21c1c"
                            strokeDasharray="6 4"
                            label={{
                                value: `Plan ${formatNumber(planTotal)}`,
                                position: "insideTopRight",
                                fontSize: 10,
                                fill: "var(--text-primary-300)",
                            }}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </BlockWrapper>
    )
}

export default BudgetMonthlyTrendChart
