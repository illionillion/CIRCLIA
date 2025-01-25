import { notFound } from "next/navigation"
import { getCircleById, getCircles } from "@/actions/circle/fetch-circle"
import { getMembershipRequests } from "@/actions/circle/membership-request"
import { getWelcomeCard } from "@/actions/circle/welcome-card"
import { auth } from "@/auth"
import { CircleDetailPage } from "@/components/layouts/circle-detail-page"
import { getAnnouncementById, getAnnouncements } from "@/data/announcement"
import { MetadataSet } from "@/utils/metadata"

interface Props {
  params: {
    circle_id?: string
    topic_id?: string
  }
}

export const generateMetadata = ({ params }: Props) =>
  MetadataSet(params.circle_id || "", "お知らせ")

export const generateStaticParams = async () => {
  const circles = await getCircles()
  const announcements = await getAnnouncements()
  if (!circles || !announcements) {
    return []
  }
  return circles.flatMap((circle) =>
    announcements.map((announcement) => ({
      circle_id: circle.id,
      topic_id: announcement.id.toString(),
    })),
  )
}

export const dynamicParams = false
export const dynamic = "force-dynamic"

// ダイナミックルートのページコンポーネント
const Page = async ({ params }: Props) => {
  const { circle_id, topic_id } = params
  const session = await auth()
  const userId = session?.user?.id || ""
  const announcementId = topic_id || ""
  const [circle, membershipRequests, currentAnnouncement, welcomeCards] =
    await Promise.all([
      getCircleById(circle_id || ""),
      getMembershipRequests(userId, circle_id || ""),
      getAnnouncementById(announcementId),
      getWelcomeCard(circle_id || ""),
    ])
  if (
    !circle ||
    !currentAnnouncement ||
    currentAnnouncement.circleId !== circle_id
  ) {
    notFound()
  }
  return (
    <CircleDetailPage
      circle={circle}
      userId={userId}
      membershipRequests={membershipRequests}
      currentAnnouncement={currentAnnouncement}
      welcomeCards={welcomeCards}
      tabKey="notifications"
    />
  )
}

export default Page
