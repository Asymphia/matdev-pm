"use client"

import Link from "next/link"
import BlockWrapper from "@/components/ui/BlockWrapper"
import StatusItem from "@/components/ui/StatusItem"
import { BoltIcon } from "@heroicons/react/24/outline"
import { isBudgetRelatedRisk } from "@/lib/budget-utils"
import type { ProjectRisk } from "@/lib/server/matdev-risks"

type Props = {
    projectId: number
    risks: ProjectRisk[]
}

const BudgetAlertsPanel = ({ projectId, risks }: Props) => {
    const active = risks
        .filter(r => !r.isResolved && r.isAutomatic && isBudgetRelatedRisk(r.description))
        .slice(0, 3)

    return (
        <BlockWrapper className="gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Active budget alerts</h3>
                <Link href={`/projects/${projectId}`} className="text-primary-700 text-sm hover:underline">
                    See all warnings
                </Link>
            </div>
            {active.length === 0 ? (
                <p className="text-text-primary-100 text-sm">No automatic budget alerts right now.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {active.map(risk => (
                        <li key={risk.riskId} className="flex items-start gap-3 text-sm">
                            <StatusItem status={risk.severity as "Low" | "Medium" | "High"} />
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                <BoltIcon className="size-2.5" /> Auto
                            </span>
                            <span className="text-text-primary-500 flex-1">{risk.description}</span>
                        </li>
                    ))}
                </ul>
            )}
        </BlockWrapper>
    )
}

export default BudgetAlertsPanel
