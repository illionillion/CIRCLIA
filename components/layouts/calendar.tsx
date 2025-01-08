"use client"

import { Calendar } from "@yamada-ui/calendar"
import type { FC } from "@yamada-ui/react"
import {
  VStack,
  Container,
  Center,
  Heading,
  List,
  ListItem,
  Text,
  useSafeLayoutEffect,
} from "@yamada-ui/react"
import Link from "next/link"
import { useState } from "react"
import { getMonthlyEventsActions } from "@/actions/circle/fetch-activity"
import type { getMonthlyEvents } from "@/data/activity"
import "dayjs/locale/ja"

interface CalendarPageProps {
  userId: string
  events: Awaited<ReturnType<typeof getMonthlyEvents>>
}

export const CalendarPage: FC<CalendarPageProps> = ({ userId, events }) => {
  const [currentMonth, onChangeMonth] = useState<Date>(new Date())

  const [currentEvents, setCurrentEvents] =
    useState<Awaited<ReturnType<typeof getMonthlyEvents>>>(events)

  const fetchData = async () => {
    const data = await getMonthlyEventsActions(userId, currentMonth)
    if (data) setCurrentEvents(data)
  }

  useSafeLayoutEffect(() => {
    fetchData()
  }, [currentMonth])

  return (
    <Container p={4}>
      <Heading mb={4} fontSize="2xl">カレンダー</Heading>
      <Calendar
        month={currentMonth}
        onChangeMonth={onChangeMonth}
        dateFormat="YYYY年 M月"
        locale="ja"
        size="full"
        type="date"
        headerProps={{ mb: 2, fontSize: "xl", fontWeight: "bold" }} // ヘッダー文字を大きく
        labelProps={{
          pointerEvents: "none",
          icon: { display: "none" },
          fontWeight: "bold",
          fontSize: "2xl", 
        }}
        tableProps={{
          tableLayout: "fixed",
          width: "100%",
          border: "1px solid",
          borderColor: "border",
          fontSize: "lg", // テーブル全体の文字サイズを大きく
          th: { border: "1px solid", borderColor: "border", fontWeight: "bold", fontSize: "lg" }, // ヘッダーセル
          td: {
            border: "1px solid",
            borderColor: "border",
            height: "135px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textAlign: "center",
            verticalAlign: "top",
            fontWeight: "bold",
            fontSize: "lg", 
          },
        }}
        dayProps={{
          h: "full",
          rounded: "none",
          p: 0,
          _active: {},
          _selected: {
            bg: "transparent",
            border: "3px solid",
            borderColor: "black",
          },
          _hover: {
            bg: "transparent",
          },
          component: ({ date, isSelected }) => {
            const isToday =
              date.getFullYear() === new Date().getFullYear() &&
              date.getMonth() === new Date().getMonth() &&
              date.getDate() === new Date().getDate()
            const isSaturday = date.getDay() === 6 // 土曜日かどうかを判定
            const dayEvents = currentEvents.filter(
              (event) =>
                event.activityDay.getFullYear() === date.getFullYear() &&
                event.activityDay.getMonth() === date.getMonth() &&
                event.activityDay.getDate() === date.getDate(),
            )

            const displayedEvents = dayEvents.slice(0, 2)
            const hiddenEventCount = dayEvents.length - displayedEvents.length

            return (
              <VStack alignItems="center" w="100%" h="100%" overflow="hidden">
                <Center w="100%">
                  
                  {isToday ? (
                    <Center
                    w="100%"
                    h="100%"
                    bg={isToday ? "riverBlue.200" : "transparent"}
                    fontSize="l" 
                    fontWeight="bold"
                    color={isSaturday ? "blue.500" : "inherit"} // 土曜日を青色にする
                    >
                      {date.getDate()}
                    </Center>
                  ) : (
                    <Text 
                    fontSize="l" 
                    fontWeight="bold"
                    color={isSaturday ? "blue.500" : "inherit"} // 土曜日を青色にする
                    > {/* 通常日付 */}
                      {date.getDate()}
                    </Text>
                  )}
                </Center>

                <List w="full" px={1} overflow="hidden">
                  {displayedEvents.map((event) => (
                    <ListItem
                      key={event.id}
                      width="95%"
                      height="6"
                      minWidth="80px"
                      py="0.1"
                      px="2"
                      bg="blue.100"
                      color="blue"
                      fontSize="sm" // イベント文字サイズ
                      lineHeight="taller"
                      rounded="md"
                      overflow="hidden"
                      whiteSpace="nowrap"
                      textOverflow="ellipsis"
                      textAlign="center"
                      mx="auto"
                      as={Link}
                      href={`/circles/${event.circle.id}/activities/${event.id}`}
                      fontWeight="normal"
                    >
                      {event.title}
                    </ListItem>
                  ))}
                  {hiddenEventCount > 0 && (
                    <Text
                      fontSize="sm" 
                      color= "gray.500"
                      textAlign="right"
                      mt={0.4}
                      fontWeight="bold"
                    >
                      ...他{hiddenEventCount}件
                    </Text>
                  )}
                </List>
              </VStack>
            )
          },
        }}
      />
    </Container>
  )
}
