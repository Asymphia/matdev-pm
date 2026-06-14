import WelcomePageClient from "@/components/welcome/WelcomePageClient"
import { checkWelcomeStatus } from "@/app/actions/welcome-status"

const WelcomePageContent = async () => {
    const status = await checkWelcomeStatus()
    return <WelcomePageClient initialStatus={status} />
}

export default WelcomePageContent
