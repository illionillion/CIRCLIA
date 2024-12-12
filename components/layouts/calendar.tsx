//calendar/page.tsxからuse clientの分離

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
      <Heading mb={4}>カレンダー</Heading>
      <Calendar
        month={currentMonth}
        onChangeMonth={onChangeMonth}
        dateFormat="YYYY年 M月"
        locale="ja"
        size="full"
        type="date"
        headerProps={{ mb: 2 }}
        labelProps={{ pointerEvents: "none", icon: { display: "none" } }}
        tableProps={{
          tableLayout: "fixed",
          width: "100%",
          border: "1px solid",
          borderColor: "border",
          th: { border: "1px solid", borderColor: "border" },
          td: {
            border: "1px solid",
            borderColor: "border",
            height: "135px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textAlign: "center",
            verticalAlign: "top",
          },
        }}
        dayProps={{
          h: "full",
          rounded: "none",
          p: 0,
          _active: {},
          component: ({ date, isSelected }) => {
            const isSaturday = date.getDay() === 6 //土曜日かどうかの判定
            const dayEvents = currentEvents.filter(
              (event) =>
                event.activityDay.getFullYear() === date.getFullYear() &&
                event.activityDay.getMonth() === date.getMonth() &&
                event.activityDay.getDate() === date.getDate(),
            )

            // 表示するイベントのリストと、省略されるイベント数
            const displayedEvents = dayEvents.slice(0, 2)
            const hiddenEventCount = dayEvents.length - displayedEvents.length

            return (
              <VStack alignItems="center" w="100%" h="100%" overflow="hidden">
                <Center w="100%" py={1}>
                  <Text
                    as="span"
                    color={
                      isSelected ? "white" : isSaturday ? "blue.500" : undefined
                    }
                  >
                    {date.getDate()}
                  </Text>
                </Center>
                <List w="full" px={2} overflow="hidden">
                  {displayedEvents.map((event) => (
                    <ListItem
                      key={event.id}
                      width="95%"
                      minWidth="80px"
                      py="0.1"
                      px="2"
                      bg="gray.200"
                      color="black"
                      fontSize="xs"
                      lineHeight="taller"
                      rounded="md"
                      overflow="hidden"
                      whiteSpace="nowrap"
                      textOverflow="ellipsis"
                      textAlign="center"
                      mx="auto"
                      as={Link}
                      href={`/circles/${event.circle.id}/activities/${event.id}`}
                    >
                      {event.title}
                    </ListItem>
                  ))}
                  {hiddenEventCount > 0 && (
                    <Text
                      fontSize="xs"
                      color={isSelected ? "white" : "gray.500"}
                      textAlign="right"
                      mt={1}
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
