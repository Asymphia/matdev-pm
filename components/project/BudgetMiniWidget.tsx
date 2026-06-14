"use client"

import Link from "next/link"
import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import ProgressBar from "@/components/project/ProgressBar"
import BudgetDonutChart from "@/components/project/BudgetDonutChart"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { formatNumber } from "@/lib/projects-helpers"
import { getBudgetSnapshot } from "@/lib/budget-utils"
import type { ProjectBudget } from "@/lib/server/matdev-budget"

type Props = {
    budget: ProjectBudget | null
    projectId: number
}

const BudgetMiniWidget = ({ budget, projectId }: Props) => {
    if (!budget) {
        return (
            <BlockWrapper className="flex w-full flex-col gap-3 self-start">
                <header className="flex items-center justify-between">
                    <CardTitle>Budget</CardTitle>
                    <Link
                        href={`/projects/${projectId}/budget`}
                        className="text-primary-700 flex items-center gap-1 text-sm hover:underline"
                    >
                        Create plan <ArrowTopRightOnSquareIcon className="size-4" />
                    </Link>
                </header>
                <p className="text-text-primary-100 text-sm">No budget plan for this project yet.</p>
            </BlockWrapper>
        )
    }

    const snap = getBudgetSnapshot(budget)
    const limitLabel = `${formatNumber(budget.totalSpent)} / ${formatNumber(budget.totalAmount)} PLN`

    return (
        <BlockWrapper className="flex w-full flex-col gap-4 self-start">
            <header className="flex items-start justify-between gap-2">
                <div>
                    <CardTitle>Budget</CardTitle>
                    <p className="text-text-primary-300 mt-0.5 truncate text-sm">{budget.planName}</p>
                </div>
                <Link
                    href={`/projects/${projectId}/budget`}
                    className="text-primary-700 flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
                >
                    Open budget <ArrowTopRightOnSquareIcon className="size-4" />
                </Link>
            </header>

            <ProgressBar
                name="Plan utilization"
                progress={Math.min(snap.utilizationPercent, 100)}
                limit={limitLabel}
                variant="budget"
            />

            {snap.isOverBudget && (
                <p className="text-error text-sm">Over budget by {formatNumber(snap.overAmount)} PLN</p>
            )}

            <BudgetDonutChart budget={budget} compact />
        </BlockWrapper>
    )
}

export default BudgetMiniWidget
