"use client"
import { ChevronLeftIcon, ChevronRightIcon } from "@yamada-ui/lucide"
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  GridItem,
  Heading,
  HStack,
  IconButton,
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
import { parseMonthDate, getDayColor, generateWeekDates } from "@/utils/format"

interface WeekCalendarProps {
  userId: string
  calendarData: Awaited<ReturnType<typeof getWeeklyActivities>>
}

// 今週の月曜日を計算する
const getMonday = (date: Date): Date => {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day // 日曜日は-6
  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  return monday
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({
  userId,
  calendarData: initialData,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(getMonday(new Date()))
  const [calendarData, setCalendarData] =
    useState<Awaited<ReturnType<typeof getWeeklyActivities>>>(initialData)

  // 現在の日付から週の日付配列を生成
  const weekDates = generateWeekDates(currentDate)

  // 今日の週へ移動
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // データ取得
  const fetchData = async () => {
    const monday = getMonday(currentDate)
    const data = await getWeeklyActivitiesActioins(userId, monday)
    if (data) {
      setCalendarData((prevData) => {
        const mergedData = { ...prevData }
        for (const [key, value] of Object.entries(data)) {
          mergedData[key] = {
            ...(mergedData[key] || {}),
            ...value,
          }
        }
        return mergedData
      })
    }
  }

  // `currentDate`の変更に応じてデータを取得
  useSafeLayoutEffect(() => {
    fetchData()
  }, [currentDate])

  // 前の週へ移動する関数
  const previousWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 7)
      return getMonday(newDate) // 移動後の月曜日にリセット
    })
  }

  // 次の週へ移動する関数
  const nextWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 7)
      return getMonday(newDate) // 移動後の月曜日にリセット
    })
  }

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
            <ButtonGroup attached>
              <IconButton
                icon={<ChevronLeftIcon fontSize="2xl" />}
                colorScheme="riverBlue"
                onClick={previousWeek}
                _hover={{ transform: "scale(1.1)" }}
              />
              <Button
                colorScheme="riverBlue"
                onClick={goToToday}
                _hover={{ transform: "scale(1.1)" }}
              >
                今日
              </Button>
              <IconButton
                icon={<ChevronRightIcon fontSize="2xl" />}
                colorScheme="riverBlue"
                onClick={nextWeek}
                _hover={{ transform: "scale(1.1)" }}
              />
            </ButtonGroup>
          </HStack>
          {/* 現在の年を表示 */}
          <Text>{currentDate.getFullYear()}</Text>
        </HStack>
      </CardHeader>

      <CardBody>
        <ScrollArea w="full" h="full" mb="md" as={Card}>
          <HStack w="full" h="full" gap={0}>
            {weekDates.map((date, index) => {
              const dayKey = parseMonthDate(date)
              const isToday = dayKey === parseMonthDate(new Date())

              return (
                <VStack
                  key={dayKey}
                  h="full"
                  flex={1}
                  borderRightWidth={index < weekDates.length - 1 ? 1 : 0}
                  p="md"
                  minW="2xs"
                  bg="white"
                >
                  <Box
                    rounded={isToday ? "full" : undefined} // 今日の場合に丸くする
                    w="74"
                    h="auto"
                    bg={isToday ? "black" : undefined} // 今日の場合に黒背景
                    color={isToday ? "white" : getDayColor(date.getDay())}
                    fontWeight="normal"
                    fontSize="md"
                    textAlign="left"
                    p="2"
                    display="flex"
                    alignItems="center"
                  >
                    {date.toLocaleDateString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </Box>

                  <VStack h="sm" overflowY="auto">
                    {(calendarData[dayKey]?.activities || []).map(
                      (activity, i) => (
                        <Tag
                          key={i}
                          as={Link}
                          href={`/circles/${activity.circle.id}/activities/${activity.id}`}
                        >
                          {activity.title}
                        </Tag>
                      ),
                    )}
                  </VStack>
                </VStack>
              )
            })}
          </HStack>
        </ScrollArea>
      </CardBody>
    </GridItem>
  )
}
