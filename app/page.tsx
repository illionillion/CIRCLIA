import {
  getCirclesByInstructorId,
  getCirclesByUserId,
} from "@/actions/circle/fetch-circle"
import { getUserById } from "@/actions/user/user"
import { auth } from "@/auth"
import { HomePage } from "@/components/layouts/home-page"
import { getWeeklyActivities } from "@/data/activity"

export const metadata = {
  title: "ホーム - CIRCLIA",
}

export default async function Home() {
  const session = await auth()
  const user = await getUserById(session?.user?.id || "")
  const circles = await getCirclesByUserId(user?.id || "")
  const instructorCircles = user?.instructorFlag
    ? await getCirclesByInstructorId(user.id || "")
    : []
  const calendarData = await getWeeklyActivities(user?.id || "")

  return (
    <HomePage
      user={user}
      calendarData={calendarData}
      circles={circles}
      instructorCircles={instructorCircles}
    />
  )
}
