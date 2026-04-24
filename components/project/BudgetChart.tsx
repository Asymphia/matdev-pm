"use client"

import BlockWrapper from "@/components/ui/BlockWrapper"
import { Pie, PieChart, ResponsiveContainer } from "recharts"
import IconButton from "@/components/ui/IconButton"
import { CreditCardIcon } from "@heroicons/react/24/outline"
import { formatNumber } from "@/lib/projects-helpers"

const data = [
    { name: "Category 1", value: 1300, fill: "#E8C468" },
    { name: "Category 2", value: 5000, fill: "#2D4654" },
    { name: "Category 3", value: 2070, fill: "#629677" },
    { name: "Free budget", value: 3630, fill: "#F2B880" },
]

const BudgetChart = () => {
    const total = formatNumber(data.reduce((sum, item) => sum + item.value, 0))

    return (
        <BlockWrapper className="grid grid-cols-[1fr_2fr] gap-4">
            <div className="flex flex-col gap-7">
                <header className="flex flex-nowrap items-center gap-4">
                    <IconButton Icon={CreditCardIcon} onClick={() => {}} />

                    <h2>Budget</h2>
                </header>

                <div className="flex flex-col gap-3">
                    {data.map((item, index) => (
                        <div className="flex items-center gap-x-2" key={index}>
                            <div className="size-5 rounded-full" style={{ backgroundColor: item.fill }} />

                            <p className="text-text-primary-500 text-lg">
                                {item.name} <span className="text-text-primary-100">({formatNumber(item.value)} PLN)</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative h-100 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ pointerEvents: "none" }}>
                        <Pie data={data} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" paddingAngle={2} cornerRadius={10} />
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p>Total spend</p>
                    <h3 className="text-primary-700">{total} PLN</h3>
                </div>
            </div>
        </BlockWrapper>
    )
}

export default BudgetChart
