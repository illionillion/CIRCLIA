import { auth } from "@/auth"
import { NotificationPage } from "@/components/layouts/notification-page"
import { getNotificationsByUserId } from "@/data/notification"

export const metadata = {
  title: "通知 - CIRCLIA",
}

const Page = async () => {
  const session = await auth()
  const notifications = await getNotificationsByUserId(session?.user?.id || "")

  return <NotificationPage notifications={notifications} />
}

export default Page
