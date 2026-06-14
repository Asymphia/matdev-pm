export const calculateBudgetDiff = (budget: number, amountSpent: number) => {
    if (!budget || budget <= 0) return amountSpent > 0 ? 100 : 0
    return (amountSpent / budget) * 100
}

export const calculateTimeProgress = (startDate: Date, endDate: Date) => {
    const now = new Date().getTime()
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()

    if (isNaN(start) || isNaN(end) || end <= start) return 0
    if (now <= start) return 0
    if (now >= end) return 100

    const total = end - start
    const elapsed = now - start

    return Math.round((elapsed / total) * 100)
}

export const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-GB").format(value)
}
