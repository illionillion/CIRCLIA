"use client"

import type { FC } from "@yamada-ui/react"
import {
  Flex,
  Heading,
  HStack,
  Tag,
  Text,
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

  return (
    <VStack w="full" h="fit-content" gap={0} p={0}>
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
            w="full"
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
