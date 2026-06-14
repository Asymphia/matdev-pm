"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowRightIcon,
    BeakerIcon,
    ChartBarSquareIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    SignalIcon,
} from "@heroicons/react/24/outline"
import Button from "@/components/ui/Button"
import AlertBanner from "@/components/ui/AlertBanner"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { resetDemoData, seedDemoData } from "@/app/actions/demo-data"
import { checkWelcomeStatus, type WelcomeStatus } from "@/app/actions/welcome-status"
import { toUserFacingError } from "@/lib/user-facing-errors"
import type { UserType } from "@/lib/data"

const SESSION_KEY = "matdev-demo-user-id"

function resolveUserId(users: UserType[], override: number | null): number | null {
    if (override != null) return override
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem(SESSION_KEY)
        if (saved) {
            const id = Number(saved)
            if (users.some(u => u.id === id)) return id
        }
    }
    return users[0]?.id ?? null
}

function userInitials(u: UserType) {
    return `${u.firstName.charAt(0)}${u.secondName.charAt(0)}`.toUpperCase()
}

type Props = {
    initialStatus: WelcomeStatus
}

const StatusPill = ({
    ok,
    label,
    detail,
}: {
    ok: boolean
    label: string
    detail?: string | null
}) => (
    <div
        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
            ok
                ? "border-primary-500/30 bg-primary-500/10 text-primary-700"
                : "border-error/30 bg-error/5 text-error"
        }`}
    >
        {ok ? <CheckCircleIcon className="size-3.5 shrink-0" /> : <ExclamationCircleIcon className="size-3.5 shrink-0" />}
        <span className="font-medium">{label}</span>
        {detail ? <span className="text-text-primary-300 hidden sm:inline">· {detail}</span> : null}
    </div>
)

const WelcomePageClient = ({ initialStatus }: Props) => {
    const router = useRouter()
    const [status, setStatus] = useState(initialStatus)
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [demoMessage, setDemoMessage] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const [checking, startCheck] = useTransition()
    const [actionPending, startAction] = useTransition()

    const pending = checking || actionPending
    const activeUserId = resolveUserId(status.users, selectedUserId)
    const needsDemo = status.projectCount === 0
    const canEnter = status.apiOnline && status.users.length > 0 && activeUserId != null

    const refreshStatus = () => {
        startCheck(async () => {
            setActionError(null)
            try {
                const next = await checkWelcomeStatus()
                setStatus(next)
            } catch (e) {
                setActionError(toUserFacingError(e, "network"))
            }
        })
    }

    const enterApp = () => {
        if (activeUserId != null) {
            localStorage.setItem(SESSION_KEY, String(activeUserId))
        }
        router.push("/projects")
    }

    const loadDemo = (reset: boolean) => {
        startAction(async () => {
            setDemoMessage(null)
            setActionError(null)
            const res = reset ? await resetDemoData() : await seedDemoData()
            if (!res.ok) {
                setActionError(toUserFacingError(res.error, "api"))
                return
            }
            setDemoMessage(
                reset
                    ? `Załadowano dane demo (${res.projectCount} projektów).`
                    : `Projektów w bazie: ${res.projectCount}.`,
            )
            try {
                const next = await checkWelcomeStatus()
                setStatus(next)
            } catch (e) {
                setActionError(toUserFacingError(e, "network"))
            }
            router.refresh()
        })
    }

    return (
        <div className="flex min-h-screen">
            {/* Brand panel */}
            <aside className="bg-primary-700 text-background relative hidden w-[42%] flex-col justify-between overflow-hidden p-10 lg:flex">
                <div className="from-primary-500/20 absolute inset-0 bg-gradient-to-br to-transparent" />
                <div className="relative">
                    <div className="bg-background/10 mb-8 flex size-16 items-center justify-center rounded-2xl backdrop-blur-sm">
                        <span className="text-2xl font-bold">M</span>
                    </div>
                    <p className="mb-2 text-sm font-semibold tracking-widest uppercase opacity-80">
                        Borg Warner · Materials Lab
                    </p>
                    <h1 className="text-background mb-4 text-4xl leading-tight font-bold">MatDev PM</h1>
                    <p className="max-w-sm text-base leading-relaxed opacity-90">
                        Zarządzanie projektami walidacji materiałów, budżetem i zleceniami laboratoryjnymi.
                    </p>
                </div>
                <ul className="relative space-y-4 text-sm opacity-90">
                    <li className="flex items-center gap-3">
                        <BeakerIcon className="size-5 shrink-0 opacity-80" />
                        Zlecenia lab i raporty PDF
                    </li>
                    <li className="flex items-center gap-3">
                        <ChartBarSquareIcon className="size-5 shrink-0 opacity-80" />
                        Budżet, Gantt i ryzyka projektu
                    </li>
                    <li className="flex items-center gap-3">
                        <SignalIcon className="size-5 shrink-0 opacity-80" />
                        Tryb demo — bez logowania hasłem
                    </li>
                </ul>
            </aside>

            {/* Login panel */}
            <main className="animate-fade-in-up flex flex-1 flex-col items-center justify-center px-6 py-10">
                <div className="relative w-full max-w-md">
                    {pending ? (
                        <div className="bg-background/90 absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                            <LoadingSpinner
                                size="md"
                                label={actionPending ? "Przygotowuję dane demo…" : "Sprawdzam połączenie…"}
                            />
                        </div>
                    ) : null}

                    <div className="mb-8 lg:hidden">
                        <p className="text-primary-500 mb-1 text-xs font-semibold tracking-widest uppercase">
                            MatDev PM
                        </p>
                        <h2 className="text-2xl font-bold">Witaj</h2>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                        <StatusPill
                            ok={status.apiOnline}
                            label={status.apiOnline ? "API online" : "API offline"}
                            detail={status.apiLatencyMs != null ? `${status.apiLatencyMs} ms` : null}
                        />
                        <StatusPill
                            ok={status.users.length > 0 && !status.usersError}
                            label={
                                status.users.length > 0
                                    ? `${status.users.length} użytkowników`
                                    : "Brak użytkowników"
                            }
                        />
                        <StatusPill
                            ok={status.projectCount > 0}
                            label={
                                status.projectCount > 0
                                    ? `${status.projectCount} projektów`
                                    : "Pusta baza"
                            }
                        />
                    </div>

                    {!status.apiOnline ? (
                        <AlertBanner
                            variant="error"
                            title="Backend niedostępny"
                            message={
                                status.apiError ??
                                "Uruchom API (Docker: port 5196) i kliknij „Sprawdź ponownie”."
                            }
                            onRetry={refreshStatus}
                            retryPending={checking}
                        />
                    ) : null}

                    {status.apiOnline && status.usersError ? (
                        <div className="mt-4">
                            <AlertBanner
                                variant="warning"
                                title="Nie udało się pobrać użytkowników"
                                message={status.usersError}
                                onRetry={refreshStatus}
                                retryPending={checking}
                            />
                        </div>
                    ) : null}

                    {actionError ? (
                        <div className="mt-4">
                            <AlertBanner variant="error" message={actionError} onDismiss={() => setActionError(null)} />
                        </div>
                    ) : null}

                    {demoMessage ? (
                        <div className="mt-4">
                            <AlertBanner variant="success" message={demoMessage} onDismiss={() => setDemoMessage(null)} />
                        </div>
                    ) : null}

                    <div className="mt-6">
                        <p className="text-text-primary-500 mb-3 text-sm font-medium">Zaloguj się jako</p>
                        {status.users.length === 0 ? (
                            <p className="text-text-primary-300 border-border rounded-lg border border-dashed px-4 py-6 text-center text-sm">
                                Brak kont użytkowników. Załaduj dane demonstracyjne poniżej.
                            </p>
                        ) : (
                            <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
                                {status.users.map(u => {
                                    const selected = activeUserId === u.id
                                    return (
                                        <li key={u.id}>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedUserId(u.id)}
                                                className={`border-border flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                                                    selected
                                                        ? "border-primary-500 bg-primary-500/10 ring-1 ring-primary-500/30"
                                                        : "hover:bg-foreground/60 bg-background"
                                                }`}
                                            >
                                                <span
                                                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                                        selected
                                                            ? "bg-primary-500 text-white"
                                                            : "bg-foreground text-text-primary-500"
                                                    }`}
                                                >
                                                    {userInitials(u)}
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="text-text-primary-500 block truncate text-sm font-medium">
                                                        {u.firstName} {u.secondName}
                                                    </span>
                                                    <span className="text-text-primary-300 block truncate text-xs">
                                                        {u.email}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <Button
                            type="button"
                            onClick={enterApp}
                            disabled={!canEnter || pending}
                            className="!border-none !bg-primary-500 hover:!bg-primary-700 flex w-full items-center justify-center gap-2 !text-white"
                        >
                            Wejdź do aplikacji
                            <ArrowRightIcon className="size-4" />
                        </Button>

                        {status.apiOnline && needsDemo ? (
                            <Button type="button" onClick={() => loadDemo(true)} disabled={pending} className="w-full">
                                Załaduj dane demonstracyjne
                            </Button>
                        ) : null}

                        {status.apiOnline && !needsDemo ? (
                            <button
                                type="button"
                                onClick={() => loadDemo(false)}
                                disabled={pending}
                                className="text-text-primary-300 hover:text-primary-500 text-xs underline disabled:opacity-50"
                            >
                                Uzupełnij brakujące projekty demo
                            </button>
                        ) : null}

                        {!status.apiOnline ? (
                            <button
                                type="button"
                                onClick={refreshStatus}
                                disabled={pending}
                                className="text-text-primary-300 hover:text-primary-500 text-sm underline disabled:opacity-50"
                            >
                                Sprawdź połączenie ponownie
                            </button>
                        ) : null}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default WelcomePageClient
