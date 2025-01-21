"use client"
import type { FC } from "@yamada-ui/react"
import {
  Avatar,
  Card,
  CardBody,
  Center,
  Grid,
  GridItem,
  HStack,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { ActivityMenuButton } from "../forms/activity-menu-button"
import { GoogleCalendarButton } from "../forms/google-calendar-button"
import type { getCircleById } from "@/actions/circle/fetch-circle"
import type { getActivityById } from "@/data/activity"
import { displayTime } from "@/utils/format"

interface ActivityCardProps {
  userId: string
  circle: Awaited<ReturnType<typeof getCircleById>>
  currentActivity: NonNullable<Awaited<ReturnType<typeof getActivityById>>>
  isMember: boolean
  isAdmin: boolean
  handleParticipation: (activityId: number) => Promise<void>
  handleDelete: (activityId: number) => Promise<void>
}

export const ActivityCard: FC<ActivityCardProps> = ({
  userId,
  circle,
  currentActivity,
  isMember,
  isAdmin,
  handleDelete,
  handleParticipation,
}) => {
  return (
    <Card w="full" h="full" bg="white">
      <CardBody flexDir="row">
        <HStack>
          <Card variant="outline" padding="sm" w="10" as={Center}>
            {currentActivity.activityDay.getDate()}
          </Card>
        </HStack>
        <VStack>
          <HStack justifyContent="space-between">
            <Text>{currentActivity.title}</Text>
            <ActivityMenuButton
              userId={userId}
              isMember={isMember}
              isAdmin={isAdmin}
              circle={circle}
              activity={currentActivity}
              handleParticipation={handleParticipation}
              handleDelete={handleDelete}
            />
          </HStack>
          <HStack flexWrap="wrap" alignItems={{ md: "start" }}>
            <Text whiteSpace="nowrap">内容:</Text>
            <Text text-wrap="auto" whiteSpace="pre-wrap">
              {currentActivity.description}
            </Text>
          </HStack>
          <HStack flexWrap="wrap" alignItems={{ md: "start" }}>
            <Text>活動時間:</Text>
            <Text>
              {displayTime(currentActivity.startTime)}
              {currentActivity.endTime
                ? `～${displayTime(currentActivity.endTime)}`
                : undefined}
            </Text>
          </HStack>
          <HStack flexWrap="wrap" alignItems={{ md: "start" }}>
            <Text>活動場所:</Text>
            <Text>{currentActivity.location}</Text>
          </HStack>
          <HStack flexWrap="wrap" alignItems={{ md: "start" }}>
            <Text>参加人数:</Text>
            <Text>{currentActivity.participants.length}人</Text>
          </HStack>
          <HStack flexWrap="wrap" alignItems={{ md: "start" }}>
            <Text whiteSpace="nowrap">備考:</Text>
            <Text text-wrap="auto" whiteSpace="pre-wrap">
              {currentActivity.notes}
            </Text>
          </HStack>
          <VStack>
            <Text>参加者</Text>
            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(1, 1fr)" }}
              gap="md"
            >
              {currentActivity.participants.map((participant) => (
                <GridItem
                  w="full"
                  rounded="md"
                  as={Card}
                  bg="white"
                  variant="outline"
                  key={participant.id}
                  transition="0.5s"
                  _hover={{ transform: "scale(1.02)", transition: "0.5s" }}
                >
                  <CardBody as={LinkBox}>
                    <HStack
                      as={Center}
                      w="full"
                      flexWrap="wrap"
                      justifyContent="space-between"
                    >
                      <LinkOverlay
                        justifyContent="center"
                        alignItems="center"
                        display="flex"
                        gap="md"
                        flexWrap="wrap"
                        as={Link}
                        href={`/user/${participant.user.id}`}
                      >
                        <Avatar src={participant.user.profileImageUrl || ""} />
                        <Text>{participant.user.name}</Text>
                        <Text>{participant.user.studentNumber}</Text>
                      </LinkOverlay>
                    </HStack>
                  </CardBody>
                </GridItem>
              ))}
            </Grid>
          </VStack>
          <HStack>
            <GoogleCalendarButton activity={currentActivity} />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
