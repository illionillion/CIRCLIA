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
  Button,
  useToken,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  HStack,
  Link as UILink,
  Box,
  useMediaQuery,
  Flex,
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

const formatEventTime = (
  startTime?: string | Date,
  endTime?: string | Date,
) => {
  if (!startTime) return "未定"

  const formatTime = (time: string | Date) =>
    new Date(time).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    })

  return `${formatTime(startTime)} ～ ${endTime ? formatTime(endTime) : ""}`
}

export const CalendarPage: FC<CalendarPageProps> = ({ userId, events }) => {
  const [currentMonth, onChangeMonth] = useState<Date>(new Date())
  const [currentEvents, setCurrentEvents] =
    useState<Awaited<ReturnType<typeof getMonthlyEvents>>>(events)

  const fetchData = async () => {
    const data = await getMonthlyEventsActions(userId, currentMonth)
    if (data) setCurrentEvents(data)
  }

  const mt = useToken("spaces", "xs")
  const { open, onOpen, onClose } = useDisclosure()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<
    Awaited<ReturnType<typeof getMonthlyEvents>>
  >([])

  // スマホかどうかを判定してDrawerの表示位置を動的に変更
  const [isMobile] = useMediaQuery(["(max-width: 768px)"])
  const placement = isMobile ? "bottom" : "right"

  useSafeLayoutEffect(() => {
    fetchData()
  }, [currentMonth])

  return (
    <>
      <Center height="10vh">
        <Container maxW="9xl" m="auto" p={4}>
          <HStack alignItems="start" gap="lg">
            <Heading fontSize="2xl">カレンダー</Heading>
            <Button
              onClick={() => onChangeMonth(new Date())}
              colorScheme="riverBlue"
            >
              今日
            </Button>
          </HStack>
          <Calendar
            month={currentMonth}
            onChangeMonth={onChangeMonth}
            dateFormat="YYYY年 M月"
            locale="ja"
            size="full"
            type="date"
            headerProps={{ mb: 2, fontSize: "xl", fontWeight: "bold" }}
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
              fontSize: "lg",
              bg: "white",
              th: {
                border: "1px solid",
                borderColor: "border",
                fontWeight: "bold",
                fontSize: "lg",
              },
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
                border: "1px solid",
                borderColor: "black",
              },
              _hover: {
                bg: "transparent",
              },
              component: ({ date, selected }) => {
                const isToday =
                  date.getFullYear() === new Date().getFullYear() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getDate() === new Date().getDate()
                const isSaturday = date.getDay() === 6
                const dayEvents = currentEvents
                  .filter((event) => {
                    const eventDate = new Date(event.activityDay)
                    return (
                      eventDate.getFullYear() === date.getFullYear() &&
                      eventDate.getMonth() === date.getMonth() &&
                      eventDate.getDate() === date.getDate()
                    )
                  })
                  .sort(
                    (a, b) =>
                      new Date(a.startTime).getTime() -
                      new Date(b.startTime).getTime(),
                  )

                const displayedEvents = dayEvents.slice(0, 2)
                const hiddenEventCount =
                  dayEvents.length - displayedEvents.length

                return (
                  <VStack
                    alignItems="center"
                    w="100%"
                    h="100%"
                    overflow="hidden"
                    onClick={() => {
                      setSelectedDate(date)
                      setSelectedEvents(dayEvents)
                      onOpen()
                    }}
                  >
                    <Center w="100%">
                      {isToday ? (
                        <Center
                          rounded="full"
                          w="10"
                          mt={selected ? `calc(${mt} - 1px)` : "xs"}
                          bg="black"
                          color="white"
                        >
                          {date.getDate()}
                        </Center>
                      ) : (
                        <Text
                          fontSize="l"
                          fontWeight="bold"
                          mt="xs"
                          color={isSaturday ? "blue.500" : "inherit"}
                        >
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
                          fontSize="sm"
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
                          color="gray.500"
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
      </Center>
      <Drawer open={open} onClose={onClose} placement={placement}>
        <DrawerOverlay />
        <DrawerCloseButton />
        <DrawerHeader>
          {selectedDate ? (
            <Text fontSize="xl" fontWeight="bold">
              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
              {selectedDate.getDate()}日
            </Text>
          ) : (
            <Text fontSize="xl" fontWeight="bold">
              詳細
            </Text>
          )}
        </DrawerHeader>

        <DrawerBody>
          {selectedEvents.length > 0 ? (
            <List>
              {selectedEvents.map((event, index) => (
                <Box key={event.id} w="full">
                  <Flex alignItems="center">
                    <Box
                      textAlign="center"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      <Text fontSize="lg">
                        {new Date(event.startTime).toLocaleTimeString("ja-JP", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      <Text fontSize="lg">～</Text>
                      <Text fontSize="lg">
                        {event.endTime
                          ? new Date(event.endTime).toLocaleTimeString(
                              "ja-JP",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : ""}
                      </Text>
                    </Box>

                    <Box ml={4} flex="1">
                      <UILink
                        as={Link}
                        href={`/circles/${event.circle.id}/activities/${event.id}`}
                        colorScheme="riverBlue"
                        fontWeight="bold"
                        fontSize="md"
                        whiteSpace="pre-wrap"
                        _hover={{ textDecoration: "underline" }}
                      >
                        {event.title}
                      </UILink>
                    </Box>
                  </Flex>

                  {/* イベント間の区切り線 */}
                  {index < selectedEvents.length - 1 && (
                    <Box
                      borderBottom="1px solid"
                      borderColor="gray.300"
                      my={3}
                      w="full"
                    />
                  )}
                </Box>
              ))}
            </List>
          ) : (
            <Text fontSize="lg" fontWeight="bold">
              この日にはイベントがありません。
            </Text>
          )}
        </DrawerBody>
      </Drawer>
    </>
  )
}
