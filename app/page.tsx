import { Suspense } from "react"
import WelcomeSkeleton from "@/components/welcome/WelcomeSkeleton"
import WelcomePageContent from "@/components/welcome/WelcomePageContent"

const WelcomePage = () => (
    <Suspense fallback={<WelcomeSkeleton />}>
        <WelcomePageContent />
    </Suspense>
)

export default WelcomePage
