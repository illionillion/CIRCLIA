"use client"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  GridItem,
  Heading,
  HStack,
  ScrollArea,
  Tag,
  Text,
  useSafeLayoutEffect,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useState } from "react"
import { getWeeklyActivitiesActioins } from "@/actions/circle/fetch-activity"
import type { getWeeklyActivities } from "@/data/activity"
import { parseMonthDate } from "@/utils/format"

interface WeekCalendarProps {
  userId: string
  calendarData: Awaited<ReturnType<typeof getWeeklyActivities>>
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({
  userId,
  calendarData: initialData,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [calendarData, setCalendarData] =
    useState<Awaited<ReturnType<typeof getWeeklyActivities>>>(initialData)
  const dates = Object.keys(calendarData)
  const todayKey = parseMonthDate(new Date())

  // 前の週へ移動
  const prevDate = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 7) // 1週間前
      return newDate
    })
  }

  // 次の週へ移動
  const nextDate = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 7) // 1週間後
      return newDate
    })
  }

  // 今日の週へ移動
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // データ取得
  const fetchData = async () => {
    const data = await getWeeklyActivitiesActioins(userId, currentDate)
    if (data) {
      setCalendarData(data)
    }
  }

  // `currentDate`の変更に応じてデータを取得
  useSafeLayoutEffect(() => {
    fetchData()
  }, [currentDate])

  return (
    <GridItem
      as={Card}
      variant="unstyled"
      area="calendar"
      w="full"
      overflowX="auto"
    >
      <CardHeader>
        <HStack justifyContent="space-between" py="md">
          <Heading as="h3" size="sm">
            カレンダー
          </Heading>
          <HStack>
            <Button colorScheme="riverBlue" onClick={prevDate}>
              前の週
            </Button>
            <Button colorScheme="riverBlue" onClick={nextDate}>
              次の週
            </Button>
          </HStack>
          <HStack>
            <Text>{currentDate.getFullYear()}</Text>
            <Button
              colorScheme="riverBlue"
              onClick={goToToday}
            >
              今日
            </Button>
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <ScrollArea w="full" h="full" mb="md" as={Card}>
          <HStack w="full" h="full" gap={0}>
            {dates.map((date, index) => (
              <VStack
                key={date}
                h="full"
                flex={1}
                borderRightWidth={index < dates.length - 1 ? 1 : 0}
                p="md"
                minW="2xs"
                bg="white"
              >
                <Box
                  fontWeight={date === todayKey ? "bold" : "normal"}
                  fontSize={date === todayKey ? "lg" : "md"}
                >
                  {calendarData[date].date}
                </Box>
                <VStack h="sm" overflowY="auto">
                  {calendarData[date].activities.map((activity, i) => (
                    <Tag
                      key={i}
                      as={Link}
                      href={`/circles/${activity.circle.id}/activities/${activity.id}`}
                    >
                      {activity.title}
                    </Tag>
                  ))}
                </VStack>
              </VStack>
            ))}
          </HStack>
        </ScrollArea>
      </CardBody>
    </GridItem>
  )
}
