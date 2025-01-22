"use client"
import type { FC } from "@yamada-ui/react"
import {
  Avatar,
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
import { CircleList } from "../data-display/circle-list"
import { NotificationList } from "../data-display/notification-list"
import { WeekCalendar } from "../data-display/week-calendar"
import type {
  getCirclesByInstructorId,
  getCirclesByUserId,
} from "@/actions/circle/fetch-circle"
import type { getUserById } from "@/actions/user/user"
import type { getWeeklyActivities } from "@/data/activity"

interface HomePageProps {
  user: Awaited<ReturnType<typeof getUserById>>
  circles: Awaited<ReturnType<typeof getCirclesByUserId>>
  instructorCircles: Awaited<ReturnType<typeof getCirclesByInstructorId>>
  calendarData: Awaited<ReturnType<typeof getWeeklyActivities>>
}

export const HomePage: FC<HomePageProps> = ({
  user,
  circles,
  instructorCircles,
  calendarData,
}) => {
  return (
    <VStack w="full" maxW="9xl" h="fit-content" p="md" m="auto">
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
          md: user?.instructorFlag
            ? `
          "avatar"
          "notification"
          "instructor-circles"
          "circles"
          "calendar"
        `
            : `
      "avatar"
      "notification"
      "circles"
      "calendar"
      `,
        }}
        gap={{ base: "lg", lg: "sm" }}
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
            <NotificationList userId={user?.id || ""} itemsPerPage={3} />
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
              <CircleList
                circles={instructorCircles}
                instructor={user?.instructorFlag}
              />
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
            <CircleList circles={circles} />
          </CardBody>
        </GridItem>
        <WeekCalendar calendarData={calendarData} userId={user?.id || ""} />
      </Grid>
    </VStack>
  )
}
