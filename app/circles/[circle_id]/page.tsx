import { notFound } from "next/navigation"
import { getCircleById, getCircles } from "@/actions/circle/fetch-circle"
import { getMembershipRequests } from "@/actions/circle/membership-request"
import { getWelcomeCard } from "@/actions/circle/welcome-card"
import { auth } from "@/auth"
import { CircleDetailPage } from "@/components/layouts/circle-detail-page"
import { MetadataSet } from "@/utils/metadata"

interface Props {
  params: { circle_id?: string }
}

export const generateMetadata = ({ params }: Props) =>
  MetadataSet(params.circle_id || "", "activities")

export const dynamicParams = false
export const dynamic = "force-dynamic"

export const generateStaticParams = async () => {
  const circles = await getCircles()

  if (!circles) {
    return []
  }

  return circles.map((circle) => ({ circle_id: circle.id }))
}

const Page = async ({ params }: Props) => {
  const { circle_id } = params
  const session = await auth()
  const userId = session?.user?.id || ""
  const circle = await getCircleById(circle_id || "")
  if (!circle) {
    notFound()
  }
  const membershipRequests = await getMembershipRequests(
    userId,
    circle_id || "",
  )
  const welcomeCards = await getWelcomeCard(circle_id || "")

  return (
    <CircleDetailPage
      circle={circle}
      userId={userId}
      membershipRequests={membershipRequests}
      welcomeCards={welcomeCards}
    />
  )
}

export default Page
