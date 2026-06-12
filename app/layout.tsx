import type { Metadata } from "next"
import "./globals.css"
import { ReactNode, Suspense } from "react"
import { IBM_Plex_Sans, Source_Sans_3 } from "next/font/google"
import RootShell from "@/components/layout/RootShell"
import PageLoader from "@/components/ui/PageLoader"

export const metadata: Metadata = {
    title: "MatDev PM",
    description: "Zarządzanie projektami materiałowymi i laboratoryjnymi",
}

const IBMPlexSans = IBM_Plex_Sans({
    variable: "--font-ibm",
    subsets: ["latin"],
})

const SourceSans3 = Source_Sans_3({
    variable: "--font-source-sans",
    subsets: ["latin"],
})

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <html lang="pl">
            <body className={`${IBMPlexSans.variable} ${SourceSans3.variable}`}>
                {/*<ThemeProvider>*/}
                <Suspense fallback={<PageLoader fullScreen />}>
                    <RootShell>{children}</RootShell>
                </Suspense>
                {/*</ThemeProvider>*/}
            </body>
        </html>
    )
}

export default RootLayout
