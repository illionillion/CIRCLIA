"use client"

import { ChevronLeftIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Collapse,
  Flex,
  Heading,
  HStack,
  IconButton,
  Tag,
  Text,
  useDisclosure,
  useDynamicAnimation,
  useSafeLayoutEffect,
  VStack,
} from "@yamada-ui/react"
import { useState } from "react"
import { CircleDetailTabs } from "../disclosure/circle-detail-tabs"
import { CircleDetailButton } from "../forms/circle-detail-button"
import { getCircleById } from "@/actions/circle/fetch-circle"
import { getMembershipRequests } from "@/actions/circle/membership-request"
import type { getActivityById } from "@/data/activity"
import type { getAlbumById } from "@/data/album"
import type { getAnnouncementById } from "@/data/announcement"
import type { getThreadById } from "@/data/thread"

export const CircleDetailPage: FC<{
  circle: Awaited<ReturnType<typeof getCircleById>>
  membershipRequests: Awaited<ReturnType<typeof getMembershipRequests>>
  tabKey?: string
  userId: string
  currentActivity?: Awaited<ReturnType<typeof getActivityById>>
  currentThread?: Awaited<ReturnType<typeof getThreadById>>
  currentAnnouncement?: Awaited<ReturnType<typeof getAnnouncementById>>
  currentAlbum?: Awaited<ReturnType<typeof getAlbumById>>
}> = ({
  userId,
  circle,
  tabKey,
  membershipRequests,
  currentActivity,
  currentThread,
  currentAnnouncement,
  currentAlbum,
}) => {
  const { open, onToggle } = useDisclosure()

  const [circleData, setCircleData] =
    useState<Awaited<ReturnType<typeof getCircleById>>>(circle)
  const [requests, setRequests] =
    useState<Awaited<ReturnType<typeof getMembershipRequests>>>(
      membershipRequests,
    )
  const fetchData = async () => {
    if (circle?.id) {
      setCircleData(await getCircleById(circle.id))
      setRequests(await getMembershipRequests(userId, circle.id))
    }
  }

  useSafeLayoutEffect(() => {
    fetchData()
  }, [])

  const isMember = circle?.members.some((member) => member.id === userId)
  // ユーザーがサークルの管理者かどうかを確認
  const isAdmin = circle?.members.some(
    (member) => member.id === userId && [0, 1].includes(member.role.id),
  )

  const [animation, setAnimation] = useDynamicAnimation({
    open: {
      keyframes: {
        "0%": {
          transform: "rotate(0deg)",
        },
        "100%": {
          transform: "rotate(-90deg)",
        },
      },
      duration: "slower",
      fillMode: "forwards",
      timingFunction: "ease-in-out",
    },
    close: {
      keyframes: {
        "0%": {
          transform: "rotate(-90deg)",
        },
        "100%": {
          transform: "rotate(0deg)",
        },
      },
      duration: "slower",
      fillMode: "forwards",
      timingFunction: "ease-in-out",
    },
  })

  const handleClick = () => {
    if (open) {
      setAnimation("close")
    } else {
      setAnimation("open")
    }
    onToggle()
  }

  return (
    <VStack w="full" h={{ base: "full", md: "fit-content" }} gap={0} p={0}>
      <VStack w="full" h="full" flexGrow={1} p={0}>
        <VStack
          {...(circle?.imagePath
            ? {
                backgroundImage: circle.imagePath,
                backgroundSize: "cover",
                backgroundColor: "whiteAlpha.700",
                backgroundBlendMode: "overlay",
              }
            : {
                backgroundColor: "gray.100",
              })}
          p="md"
        >
          <HStack
            display={{ base: "flex", sm: "none" }}
            w="full"
            maxW="9xl"
            m="auto"
            flexDirection={{
              base: `row`,
              md: `column`,
            }}
          >
            <VStack>
              <Heading>{circle?.name}</Heading>
              <Text as="pre" textWrap="wrap">
                {circle?.description}
              </Text>
              <HStack flexWrap="wrap">
                {circle?.tags.map((tag) => (
                  <Tag key={tag.id}>{tag.tagName}</Tag>
                ))}
              </HStack>
            </VStack>
            <VStack alignItems="end" justifyContent="space-around">
              <Text>
                講師：
                {circle?.instructors
                  .map((instructor) => instructor.name)
                  .join(", ")}
              </Text>
              <VStack
                flexDir={{ base: "column", md: "row" }}
                justifyContent="end"
                flexWrap="wrap"
              >
                <Text textAlign="end">
                  人数：{circleData?.members.length}人
                </Text>
                <Text textAlign="end">活動場所：{circle?.location}</Text>
              </VStack>
              <Flex w="full" justifyContent="end">
                <CircleDetailButton
                  userId={userId}
                  tabKey={tabKey || ""}
                  circle={circle}
                  isAdmin={!!isAdmin}
                  isMember={!!isMember}
                />
              </Flex>
            </VStack>
          </HStack>
          <VStack display={{ base: "none", sm: "flex" }}>
            <HStack justifyContent="space-between">
              <Heading>{circle?.name}</Heading>
              <IconButton
                rounded="full"
                variant="ghost"
                icon={<ChevronLeftIcon animation={animation} />}
                onClick={handleClick}
              />
            </HStack>
            <Collapse open={open}>
              <VStack>
                <Text as="pre" textWrap="wrap">
                  {circle?.description}
                </Text>
                <HStack flexWrap="wrap">
                  {circle?.tags.map((tag) => (
                    <Tag key={tag.id}>{tag.tagName}</Tag>
                  ))}
                </HStack>
                <VStack alignItems="end" justifyContent="space-around">
                  <Text>
                    講師：
                    {circle?.instructors
                      .map((instructor) => instructor.name)
                      .join(", ")}
                  </Text>
                  <HStack justifyContent="end" flexWrap="wrap">
                    <Text textAlign="end">
                      人数：{circleData?.members.length}人
                    </Text>
                    <Text textAlign="end">活動場所：{circle?.location}</Text>
                  </HStack>
                  <Flex w="full" justifyContent="end">
                    <CircleDetailButton
                      userId={userId}
                      tabKey={tabKey || ""}
                      circle={circle}
                      isAdmin={!!isAdmin}
                      isMember={!!isMember}
                    />
                  </Flex>
                </VStack>
              </VStack>
            </Collapse>
          </VStack>
        </VStack>
        <CircleDetailTabs
          circle={circleData}
          tabKey={tabKey}
          membershipRequests={requests}
          userId={userId}
          isAdmin={isAdmin}
          isMember={isMember}
          currentActivity={currentActivity}
          currentThread={currentThread}
          currentAnnouncement={currentAnnouncement}
          currentAlbum={currentAlbum}
          fetchData={fetchData}
        />
      </VStack>
    </VStack>
  )
}
