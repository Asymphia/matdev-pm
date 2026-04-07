export const calculateBudgetDiff = (budget:number, amountSpent:number) => {
    return (amountSpent / budget) * 100
}

export const calculateTimeProgress = (startDate: Date, endDate: Date) => {
    const now = new Date().getTime()
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()

    if (now <= start) return 0
    if (now >= end) return 100

    const total = end - start
    const elapsed = now - start

    return Math.round((elapsed / total) * 100)
}