"use client"
import { MonthPicker } from "@yamada-ui/calendar"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  GridItem,
  HStack,
  IconButton,
  LinkBox,
  LinkOverlay,
  Loading,
  Snacks,
  Text,
  useBoolean,
  useSafeLayoutEffect,
  useSnacks,
  VStack,
} from "@yamada-ui/react"
import "dayjs/locale/ja"
import Link from "next/link"
import { useState } from "react"
import { ActivityMenuButton } from "../forms/activity-menu-button"
import { ActivityCard } from "./activity-card"
import {
  fetchActivitiesByMonth,
  getActivityByIdActions,
} from "@/actions/circle/fetch-activity"
import type { getCircleById } from "@/actions/circle/fetch-circle"
import { removeActivityAction } from "@/actions/circle/remove-activity"
import { toggleActivityParticipation } from "@/actions/circle/toggle-activity"
import type { getActivityById } from "@/data/activity"
import { displayTime } from "@/utils/format"

interface CircleActivitydays {
  isAdmin?: boolean
  isMember?: boolean
  userRole:
    | {
        id: number
        roleName: string
      }
    | undefined
  userId: string
  circle: Awaited<ReturnType<typeof getCircleById>>
  currentActivity?: Awaited<ReturnType<typeof getActivityById>>
}

export const CircleActivitydays: FC<CircleActivitydays> = ({
  userId,
  isAdmin,
  isMember,
  circle,
  currentActivity: activity,
}) => {
  const [currentActivity, setCurrentActivity] = useState(activity)
  const [currentMonth, setCurrentMonth] = useState<Date | undefined>(new Date())
  const [loading, { off: loadingOff, on: loadingOn }] = useBoolean(true)
  const fetchActivities = async () => {
    if (!currentMonth) return
    loadingOn()
    console.log(currentMonth) // デバッグ用
    const { events } = await fetchActivitiesByMonth(
      currentMonth,
      circle?.id || "",
    )
    const newCrrrentActivity = await getActivityByIdActions(activity?.id || 0)
    loadingOff()
    setActivitys(events)
    setCurrentActivity(newCrrrentActivity)
  }
  const [activitys, setActivitys] = useState<
    Awaited<ReturnType<typeof fetchActivitiesByMonth>>["events"]
  >([])
  useSafeLayoutEffect(() => {
    fetchActivities()
  }, [currentMonth])
  const { snack, snacks } = useSnacks()

  // 現在の月を1ヶ月前後させる関数
  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (!prev) return undefined
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1) // 1ヶ月前
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (!prev) return undefined
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1) // 1ヶ月後
      return newDate
    })
  }

  const handleDelete = async (activityId: number) => {
    const { success, error } = await removeActivityAction(
      activityId,
      circle?.id || "",
      userId,
    )

    snack.closeAll()
    if (success) {
      snack({
        title: "削除しました。",
        status: "success",
      })
      fetchActivities()
    } else {
      snack({ title: error || "エラー", status: "error" })
    }
  }

  const handleParticipation = async (activityId: number) => {
    const { success, action, error } = await toggleActivityParticipation(
      activityId,
      userId,
    )

    snack.closeAll()
    if (success) {
      snack({
        title: action === "joined" ? "参加しました。" : "キャンセルしました。",
        status: "success",
      })
      fetchActivities()
    } else {
      snack({ title: error || "エラー", status: "error" })
    }
  }

  return (
    <VStack w="full" h="full">
      <Snacks snacks={snacks} />
      {currentActivity ? (
        <ActivityCard
          userId={userId}
          isAdmin={!!isAdmin}
          isMember={!!isMember}
          circle={circle}
          currentActivity={currentActivity}
          handleParticipation={handleParticipation}
          handleDelete={handleDelete}
        />
      ) : (
        <>
          <HStack
            justifyContent="space-between"
            alignItems="start"
            flexWrap="wrap"
          >
            <HStack justifyContent="start" flexWrap="wrap">
              <MonthPicker
                w={{ base: "md", md: "xs", sm: "2xs" }}
                locale="ja"
                defaultValue={currentMonth}
                value={currentMonth}
                onChange={(newMonth) => {
                  if (newMonth) {
                    const now = new Date()
                    const updatedDate = new Date(
                      newMonth.getFullYear(),
                      newMonth.getMonth(),
                      now.getDate(),
                      now.getHours(),
                      now.getMinutes(),
                      now.getSeconds(),
                      now.getMilliseconds(),
                    )
                    setCurrentMonth(updatedDate)
                  }
                }}
              />
              <HStack>
                <IconButton
                  onClick={handlePreviousMonth}
                  icon={<ChevronLeftIcon fontSize="2xl" />}
                  colorScheme="riverBlue"
                />
                <IconButton
                  onClick={handleNextMonth}
                  icon={<ChevronRightIcon fontSize="2xl" />}
                  colorScheme="riverBlue"
                />
              </HStack>
            </HStack>
            <Button
              as={Link}
              href={`/circles/${circle?.id}/activities/new`}
              startIcon={<PlusIcon fontSize="2xl" />}
              colorScheme="riverBlue"
            >
              追加
            </Button>
          </HStack>
          <VStack w="full" h="full">
            {loading ? (
              <Center w="full" h="full">
                <Loading fontSize="xl" />
              </Center>
            ) : activitys && activitys.length > 0 ? (
              activitys.map((activity) => (
                <GridItem key={activity.id}>
                  <Card variant="outline" as={LinkBox} bg="white">
                    <CardBody>
                      <HStack alignItems="start" w="full">
                        <Card
                          variant="outline"
                          padding="sm"
                          w="10"
                          as={Center}
                          display={{ base: "none", md: "flex" }}
                        >
                          {activity.activityDay.getDate()}
                        </Card>
                        <HStack
                          justifyContent="space-between"
                          w="full"
                          flexDir={{ base: "row", md: "column" }}
                        >
                          <LinkOverlay
                            justifyContent={{ base: "center", md: "start" }}
                            alignItems="center"
                            gap="md"
                            as={Link}
                            display="flex"
                            href={`/circles/${circle?.id}/activities/${activity.id}`}
                            w={{ md: "full" }}
                          >
                            <Card
                              variant="outline"
                              padding="sm"
                              w="10"
                              as={Center}
                              display={{ base: "flex", md: "none" }}
                            >
                              {activity.activityDay.getDate()}
                            </Card>
                            <Text lineClamp={1}>{activity.title}</Text>
                            <Box
                              display={{ base: "none", md: "block" }}
                              ml="auto"
                            >
                              <ActivityMenuButton
                                userId={userId}
                                isMember={!!isMember}
                                isAdmin={!!isAdmin}
                                circle={circle}
                                activity={activity}
                                handleParticipation={handleParticipation}
                                handleDelete={handleDelete}
                              />
                            </Box>
                          </LinkOverlay>
                          <HStack
                            w={{ md: "full" }}
                            flexWrap="wrap"
                            justifyContent={{ base: "center", md: "start" }}
                          >
                            <Text lineClamp={1}>{activity.location}</Text>
                            <Text>
                              {displayTime(activity.startTime)}
                              {activity.endTime
                                ? `～${displayTime(activity.endTime)}`
                                : undefined}
                            </Text>
                            <Text
                              whiteSpace="nowrap"
                              display={{ base: "inline", md: "none" }}
                            >
                              {activity.participants.length}人
                            </Text>
                            <Box display={{ base: "block", md: "none" }}>
                              <ActivityMenuButton
                                userId={userId}
                                isMember={!!isMember}
                                isAdmin={!!isAdmin}
                                circle={circle}
                                activity={activity}
                                handleParticipation={handleParticipation}
                                handleDelete={handleDelete}
                              />
                            </Box>
                          </HStack>
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                </GridItem>
              ))
            ) : (
              <Center w="full" h="full">
                <Text>活動がありません</Text>
              </Center>
            )}
          </VStack>
        </>
      )}
    </VStack>
  )
}
