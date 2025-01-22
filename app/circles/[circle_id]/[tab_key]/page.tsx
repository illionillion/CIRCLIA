import { notFound } from "next/navigation"
import { getCircleById, getCircles } from "@/actions/circle/fetch-circle"
import { getMembershipRequests } from "@/actions/circle/membership-request"
import { getWelcomeCard } from "@/actions/circle/welcome-card"
import { auth } from "@/auth"
import { CircleDetailPage } from "@/components/layouts/circle-detail-page"
import { MetadataSet } from "@/utils/metadata"

interface Props {
  params: {
    circle_id?: string
    tab_key?: string
  }
}

export const generateMetadata = ({ params }: Props) =>
  MetadataSet(params.circle_id || "", params.tab_key || "")

// 固定されたタブキーのリスト
const list = ["welcome", "activities", "album", "notifications", "members"]

export const dynamicParams = false
export const dynamic = "force-dynamic"

// generateStaticParams 関数
export const generateStaticParams = async () => {
  const circles = await getCircles()

  if (!circles) return []

  // 各サークルのIDとタブキーの組み合わせを生成
  return circles.flatMap((circle) =>
    list.map((tab_key) => ({
      circle_id: circle.id,
      tab_key: tab_key,
    })),
  )
}

// ダイナミックルートのページコンポーネント
const Page = async ({ params }: Props) => {
  const { circle_id, tab_key } = params
  const session = await auth()
  const userId = session?.user?.id || ""
  const [circle, membershipRequests, welcomeCards] = await Promise.all([
    getCircleById(circle_id || ""),
    getMembershipRequests(userId, circle_id || ""),
    getWelcomeCard(circle_id || ""),
  ])

  if (!circle) {
    notFound()
  }

  return (
    <CircleDetailPage
      circle={circle}
      userId={userId}
      membershipRequests={membershipRequests}
      tabKey={tab_key}
      welcomeCards={welcomeCards}
    />
  )
}

export default Page
