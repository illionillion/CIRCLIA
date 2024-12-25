"use client"

import type { TopicType } from "@prisma/client"
import type { FC } from "@yamada-ui/react"
import {
  Avatar,
  Badge,
  Card,
  CardBody,
  HStack,
  Text,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThreadMenuButton } from "../forms/thread-menu-button"
import type { getAnnouncementById } from "@/data/announcement"
import { parseFullDate } from "@/utils/format"

interface AnnouncementCardProps {
  userId: string
  circleId: string
  isAdmin: boolean
  isMember: boolean
  currentAnnouncement: NonNullable<
    Awaited<ReturnType<typeof getAnnouncementById>>
  >
  handleDelete: (topicId: string, type: TopicType) => Promise<void>
}

export const AnnouncementCard: FC<AnnouncementCardProps> = ({
  isAdmin,
  isMember,
  userId,
  circleId,
  currentAnnouncement,
  handleDelete,
}) => {
  const router = useRouter()
  return (
    <Card w="full" h="full" bg="white">
      <CardBody>
        <HStack w="full" alignItems="start">
          <Avatar
            src={currentAnnouncement.user.profileImageUrl || ""}
            as={Link}
            href={`/user/${currentAnnouncement.user.id}`}
            display={{ base: "block", md: "none" }}
          />
          <VStack w="full">
            <HStack justifyContent="space-between">
              <HStack>
                <Avatar
                  src={currentAnnouncement.user.profileImageUrl || ""}
                  as={Link}
                  href={`/user/${currentAnnouncement.user.id}`}
                  display={{ base: "none", md: "block" }}
                />
                {currentAnnouncement.isImportant && (
                  <Badge textAlign="center" colorScheme="red">
                    重要
                  </Badge>
                )}
                <Text>{currentAnnouncement.title}</Text>
              </HStack>
              {isAdmin ||
              (currentAnnouncement.userId === userId && isMember) ? (
                <ThreadMenuButton
                  editLink={`/circles/${circleId}/${currentAnnouncement.type}/${currentAnnouncement.id}/edit`}
                  handleDelete={() => {
                    handleDelete(
                      currentAnnouncement.id,
                      currentAnnouncement.type,
                    )
                    router.push(`/circles/${circleId}/notifications/`)
                  }}
                />
              ) : undefined}
            </HStack>
            <Text as="pre" textWrap="wrap">
              {currentAnnouncement.content}
            </Text>
            <VStack alignItems="end" gap={0}>
              <Text color="gray" fontSize="sm">
                {parseFullDate(currentAnnouncement.updatedAt)} 更新
              </Text>
              <Text color="gray" fontSize="sm">
                {parseFullDate(currentAnnouncement.createdAt)} 作成
              </Text>
              <Text>作成者：{currentAnnouncement.user.name}</Text>
            </VStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )
}
