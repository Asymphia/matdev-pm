"use client"

import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline"
import type { ReactNode } from "react"

type Variant = "error" | "warning" | "info" | "success"

type Props = {
    variant?: Variant
    title?: string
    message: string
    onRetry?: () => void
    retryLabel?: string
    retryPending?: boolean
    onDismiss?: () => void
    children?: ReactNode
}

const variantStyles: Record<Variant, string> = {
    error: "border-error/40 bg-error/5 text-error",
    warning: "border-warning/40 bg-warning/10 text-warning",
    info: "border-primary-500/30 bg-primary-500/5 text-text-primary-500",
    success: "border-primary-500/40 bg-primary-500/10 text-primary-700",
}

const AlertBanner = ({
    variant = "error",
    title,
    message,
    onRetry,
    retryLabel = "Spróbuj ponownie",
    retryPending = false,
    onDismiss,
    children,
}: Props) => (
    <div className={`rounded-lg border px-4 py-3 text-sm ${variantStyles[variant]}`} role="alert">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
                {title ? <p className="mb-1 font-semibold">{title}</p> : null}
                <p className="leading-relaxed">{message}</p>
                {children}
            </div>
            {onDismiss ? (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="shrink-0 opacity-70 hover:opacity-100"
                    aria-label="Zamknij"
                >
                    <XMarkIcon className="size-4" />
                </button>
            ) : null}
        </div>
        {onRetry ? (
            <button
                type="button"
                onClick={onRetry}
                disabled={retryPending}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-current/30 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
            >
                <ArrowPathIcon className={`size-3.5 ${retryPending ? "animate-spin" : ""}`} />
                {retryPending ? "Sprawdzam…" : retryLabel}
            </button>
        ) : null}
    </div>
)

export default AlertBanner
