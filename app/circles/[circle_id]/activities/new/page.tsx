import { Center } from "@yamada-ui/react"
import { getCircleById, getCircles } from "@/actions/circle/fetch-circle"
import { auth } from "@/auth"
import { ActivityForm } from "@/components/forms/activity-form"
import { MetadataSet } from "@/utils/metadata"

interface Props {
  params: { circle_id?: string }
}

export const generateMetadata = ({ params }: Props) =>
  MetadataSet(params.circle_id || "", "新規活動日程")

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
    <ActivityForm
      circleId={circleId || ""}
      userId={session?.user?.id || ""}
      circle={circle}
      mode="create"
    />
  ) : (
    <Center w="full" h="full">
      権限がありません
    </Center>
  )
}

export default Page
