import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Grid,
  GridItem,
  Heading,
  Separator,
  Text,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import {
  getCirclesByInstructorId,
  getCirclesByUserId,
} from "@/actions/circle/fetch-circle"
import { getUserById } from "@/actions/user/user"
import { auth } from "@/auth"
import { CircleCard } from "@/components/data-display/circle-card"
import { NotificationList } from "@/components/data-display/notification-list"
import { WeekCalendar } from "@/components/data-display/week-calendar"
import { getWeeklyActivities } from "@/data/activity"
import { getAnnouncementsByUserId } from "@/data/announcement"

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
  const announcements = await getAnnouncementsByUserId(user?.id || "")
  const calendarData = await getWeeklyActivities(user?.id || "")

  return (
    <VStack w="full" h="fit-content" p="md">
      <VStack>
        <Heading as="h2" size="lg">
          ようこそ！
          <Text display={{ base: "inline", md: "none" }}>
            {` `}
            {user?.studentNumber}
            {` `}
            {user?.name}
          </Text>
        </Heading>
        <Separator
          w="full"
          borderWidth="2px"
          orientation="horizontal"
          variant="solid"
        />
      </VStack>
      <Grid
        w="full"
        flexGrow={1}
        templateAreas={{
          base: user?.instructorFlag
            ? `
        "avatar instructor-circles instructor-circles instructor-circles" 
        "avatar circles circles circles" 
        "notification calendar calendar calendar" 
        "notification calendar calendar calendar" 
        `
            : `
        "avatar circles circles circles" 
        "avatar circles circles circles" 
        "notification calendar calendar calendar" 
        "notification calendar calendar calendar" 
        `,
          md: `
        "avatar"
        "notification"
        "circles"
        "calendar"
        `,
        }}
        gap="lg"
      >
        <GridItem
          area="avatar"
          as={Center}
          w="full"
          justifyContent="space-evenly"
        >
          <Avatar
            as={Link}
            href={`/user/${user?.id}`}
            src={user?.profileImageUrl || ""}
            boxSize={{ base: "xs", md: "24" }}
            title="プロフィールへ移動"
          />
          <Heading display={{ base: "none", md: "block" }} fontSize="lg">
            <Text>{user?.studentNumber}</Text>
            <Text>{user?.name}</Text>
          </Heading>
        </GridItem>
        <GridItem
          as={Card}
          variant="unstyled"
          area="notification"
          minW={{ base: "md", sm: "full" }}
        >
          <CardHeader>
            <Heading as="h3" size="sm">
              お知らせ
            </Heading>
          </CardHeader>
          <CardBody>
            <NotificationList announcements={announcements} />
          </CardBody>
        </GridItem>
        {user?.instructorFlag && (
          <GridItem as={Card} variant="unstyled" area="instructor-circles">
            <CardHeader>
              <Heading as="h3" size="sm">
                講師担当サークル
              </Heading>
            </CardHeader>
            <CardBody>
              <Grid
                gridTemplateColumns={
                  instructorCircles?.length
                    ? {
                        base: "repeat(3, 1fr)",
                        xl: "repeat(2, 1fr)",
                        lg: "repeat(1, 1fr)",
                        md: "repeat(2, 1fr)",
                        sm: "repeat(1, 1fr)",
                      }
                    : undefined
                }
                gap="md"
                w="full"
                h="full"
              >
                {instructorCircles?.length ? (
                  instructorCircles.map((data) => (
                    <CircleCard key={data.id} data={data} />
                  ))
                ) : (
                  <Center w="full" h="full" as={VStack}>
                    <Text>講師を担当していません</Text>
                  </Center>
                )}
              </Grid>
            </CardBody>
          </GridItem>
        )}
        <GridItem as={Card} variant="unstyled" area="circles">
          <CardHeader>
            <Heading as="h3" size="sm">
              所属サークル
            </Heading>
          </CardHeader>
          <CardBody>
            <Grid
              gridTemplateColumns={
                circles?.length
                  ? {
                      base: "repeat(3, 1fr)",
                      xl: "repeat(2, 1fr)",
                      lg: "repeat(1, 1fr)",
                      md: "repeat(2, 1fr)",
                      sm: "repeat(1, 1fr)",
                    }
                  : undefined
              }
              gap="md"
              w="full"
              h="full"
            >
              {circles?.length ? (
                circles.map((data) => <CircleCard key={data.id} data={data} />)
              ) : (
                <Center w="full" h="full" as={VStack}>
                  <Text>サークルに入っていません</Text>
                  <Button as={Link} href="/circles">
                    サークルを探す
                  </Button>
                </Center>
              )}
            </Grid>
          </CardBody>
        </GridItem>
        <WeekCalendar calendarData={calendarData} userId={user?.id || ""} />
      </Grid>
    </VStack>
  )
}
