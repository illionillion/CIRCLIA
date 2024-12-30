import { auth } from "@/auth"
import { NotificationPage } from "@/components/layouts/notification-page"

export const metadata = {
  title: "通知 - CIRCLIA",
}

const Page = async () => {
  const session = await auth()

  return <NotificationPage userId={session?.user?.id || ""} />
}

export default Page
