import { notFound } from "next/navigation"
import {
  getCirclesByInstructorId,
  getCirclesByUserId,
} from "@/actions/circle/fetch-circle"
import { getUserById } from "@/actions/user/user"
import { UserProfile } from "@/components/layouts/user-profile"
import { getUsers } from "@/data/user"

interface Props {
  params: { user_id?: string }
}

export const generateMetadata = async ({ params }: Props) => {
  const user = await getUserById(params.user_id || "")
  if (!user) {
    return {
      title: "ユーザーがいません",
    }
  }
  return {
    title: `${user.name}さんのプロフィール`,
  }
}

export const dynamicParams = false
export const dynamic = "force-dynamic"

export const generateStaticParams = async () => {
  const users = await getUsers()

  if (!users) {
    return []
  }

  return users.map((user) => ({ user_id: user.id }))
}

const Page = async ({ params }: Props) => {
  const { user_id: userId } = params
  const user = await getUserById(userId || "")
  const isMicrosoft = user?.accounts.some(
    (account) => account.provider === "microsoft-entra-id",
  )
  const circles = await getCirclesByUserId(userId || "")
  const instructorCircles = user?.instructorFlag
    ? await getCirclesByInstructorId(userId || "")
    : []
  if (!user) {
    notFound()
  }

  return (
    <UserProfile
      userId={userId || ""}
      user={user}
      isMicrosoft={isMicrosoft}
      circles={circles}
      instructorCircles={instructorCircles}
    />
  )
}

export default Page
