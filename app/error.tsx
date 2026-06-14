"use client"

import { useEffect } from "react"
import AlertBanner from "@/components/ui/AlertBanner"
import Button from "@/components/ui/Button"
import { toUserFacingError } from "@/lib/user-facing-errors"

type Props = {
    error: Error & { digest?: string }
    reset: () => void
}

const GlobalError = ({ error, reset }: Props) => {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-lg space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Coś poszło nie tak</h1>
                    <p className="text-text-primary-300 mt-2 text-sm">
                        Wystąpił nieoczekiwany błąd. Możesz spróbować ponownie lub wrócić na stronę startową.
                    </p>
                </div>
                <AlertBanner
                    variant="error"
                    title="Szczegóły"
                    message={toUserFacingError(error.message, "generic")}
                />
                <div className="flex flex-wrap justify-center gap-3">
                    <Button onClick={reset} className="!bg-primary-700 !text-white hover:!bg-primary-500">
                        Spróbuj ponownie
                    </Button>
                    <Button onClick={() => (window.location.href = "/")}>Strona startowa</Button>
                </div>
            </div>
        </div>
    )
}

export default GlobalError
