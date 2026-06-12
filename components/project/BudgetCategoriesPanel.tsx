"use client"

import { useState, useTransition } from "react"
import Button from "@/components/ui/Button"
import CardTitle from "@/components/ui/CardTitle"
import { createBudgetCategory } from "@/app/actions/budget-mutations"
import type { BudgetCategoryOption } from "@/lib/server/matdev-budget"

type Props = {
    projectId: number
    initialCategories: BudgetCategoryOption[]
    onCategoryAdded?: () => void
}

const BudgetCategoriesPanel = ({ projectId, initialCategories, onCategoryAdded }: Props) => {
    const [categories, setCategories] = useState(initialCategories)
    const [newName, setNewName] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const add = () => {
        const trimmed = newName.trim()
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
            setCategories(prev =>
                [...prev, res.category].sort((a, b) => a.categoryName.localeCompare(b.categoryName)),
            )
            setNewName("")
            onCategoryAdded?.()
        })
    }

    return (
        <div className="flex flex-col gap-4">
            <CardTitle>Budget categories</CardTitle>
            <p className="text-text-primary-100 text-sm">
                Categories are shared across the project. Add them here, then set allocations under &quot;Manage allocations&quot;.
            </p>
            {error && <p className="text-error text-sm">{error}</p>}
            <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                    <span
                        key={c.categoryId}
                        className="border-border bg-foreground rounded-full border px-3 py-1 text-sm"
                    >
                        {c.categoryName}
                    </span>
                ))}
                {categories.length === 0 && (
                    <span className="text-text-primary-100 text-sm">No categories yet.</span>
                )}
            </div>
            <div className="flex flex-wrap items-end gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-primary-300">New category</label>
                    <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. Hardware"
                        className="border-border min-w-48 rounded-md border px-3 py-1.5 text-sm"
                        disabled={pending}
                        onKeyDown={e => e.key === "Enter" && add()}
                    />
                </div>
                <Button onClick={add} disabled={pending}>
                    {pending ? "Adding…" : "Add category"}
                </Button>
            </div>
        </div>
    )
}

export default BudgetCategoriesPanel
