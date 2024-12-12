import { Center } from "@yamada-ui/react"
import { getCircleById, getCircles } from "@/actions/circle/fetch-circle"
import { auth } from "@/auth"
import { AnnouncementForm } from "@/components/forms/announcement-form"
import { MetadataSet } from "@/utils/metadata"
interface Props {
  params: { circle_id?: string }
}

export const generateMetadata = ({ params }: Props) =>
  MetadataSet(params.circle_id || "", "新規お知らせ作成")

export const generateStaticParams = async () => {
  const circles = await getCircles()

  if (!circles) {
    return []
  }

  return circles.map((circle) => ({ circle_id: circle.id }))
}

export const dynamicParams = false
export const dynamic = "force-dynamic"

const Page = async ({ params }: Props) => {
  const { circle_id: circleId } = params
  const session = await auth()
  const circle = await getCircleById(circleId || "")
  const isMember = circle?.members.some(
    (member) => member.id === session?.user?.id,
  )
  return isMember ? (
    <AnnouncementForm
      circleId={circleId || ""}
      userId={session?.user?.id || ""}
      mode="create"
    />
  ) : (
    <Center w="full" h="full">
      権限がありません
    </Center>
  )
}

export default Page
