import { Center } from "@yamada-ui/react"
import { notFound } from "next/navigation"
import { getCircleById, getCircles } from "@/actions/circle/fetch-circle"
import { auth } from "@/auth"
import { ThreadForm } from "@/components/forms/thread-form"
import { isUserAdmin } from "@/data/circle"
import { getThreadById, getThreads } from "@/data/thread"
import { MetadataSet } from "@/utils/metadata"

interface Props {
  params: {
    circle_id?: string
    topic_id?: string
  }
}

export const generateMetadata = ({ params }: Props) =>
  MetadataSet(params.circle_id || "", "スレッド編集")

export const generateStaticParams = async () => {
  const circles = await getCircles()
  const threads = await getThreads()
  if (!circles || !threads) {
    return []
  }
  return circles.flatMap((circle) =>
    threads.map((thread) => ({
      circle_id: circle.id,
      topic_id: thread.id,
    })),
  )
}

export const dynamicParams = false
export const dynamic = "force-dynamic"

const Page = async ({ params }: Props) => {
  const { circle_id: circleId, topic_id: topicId } = params
  const session = await auth()
  const circle = await getCircleById(circleId || "")
  const isAdmin = await isUserAdmin(session?.user?.id || "", circleId || "")
  const thread = await getThreadById(topicId || "")
  if (!circle || !thread) {
    notFound()
  }
  return (isAdmin || thread.userId === session?.user?.id) &&
    thread.circleId === circleId ? (
    <ThreadForm
      circleId={circleId || ""}
      userId={session?.user?.id || ""}
      mode="edit"
      thread={thread}
    />
  ) : (
    <Center w="full" h="full">
      権限がありません
    </Center>
  )
}

export default Page
