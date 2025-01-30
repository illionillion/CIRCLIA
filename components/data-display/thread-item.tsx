"use client"
import type { TopicType } from "@prisma/client"
import type { FC } from "@yamada-ui/react"
import {
  Avatar,
  Badge,
  Card,
  CardBody,
  HStack,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { SimpleMenuButton } from "../forms/simple-menu-button"
import type { getCircleById } from "@/actions/circle/fetch-circle"
import type { fetchTopics } from "@/actions/circle/thread"
import { parseFullDate } from "@/utils/format"

interface ThreadItemProps {
  userId: string
  isAdmin: boolean
  isMember: boolean
  circle: Awaited<ReturnType<typeof getCircleById>>
  topic: Awaited<ReturnType<typeof fetchTopics>>[number]
  handleDelete: (topicId: string, type: TopicType) => Promise<void>
}

export const ThreadItem: FC<ThreadItemProps> = ({
  userId,
  isAdmin,
  isMember,
  circle,
  topic,
  handleDelete,
}) => {
  return (
    <Card
      w="full"
      rounded="md"
      bg="white"
      transition="0.5s"
      _hover={{ transform: "scale(1.02)", transition: "0.5s", zIndex: 1 }}
    >
      <CardBody as={LinkBox}>
        <HStack
          w="full"
          gap="4"
          justifyContent="space-around"
          flexDir={{ base: "row", md: "column" }}
        >
          <HStack w="full">
            <Avatar src={topic.user.profileImageUrl || ""} />
            <VStack gap="sm" w="auto" alignItems="center">
              {topic.isImportant && (
                <Badge w="full" textAlign="center" colorScheme="red">
                  重要
                </Badge>
              )}
              <Badge
                w="full"
                textAlign="center"
                colorScheme={
                  topic.type === "announcement" ? "secondary" : "primary"
                }
              >
                {topic.type === "announcement" ? "お知らせ" : "スレッド"}
              </Badge>
            </VStack>
            <LinkOverlay
              as={Link}
              href={`/circles/${circle?.id}/${topic.type}/${topic.id}`}
              fontWeight="bold"
            >
              {topic.title}
            </LinkOverlay>
          </HStack>
          <HStack w="full" justifyContent="end">
            <Text fontSize="sm" color="gray.500">
              {parseFullDate(topic.updatedAt)}
            </Text>
            {isAdmin || (topic.userId === userId && isMember) ? (
              <SimpleMenuButton
                editLink={`/circles/${circle?.id}/${topic.type}/${topic.id}/edit`}
                handleDelete={() => handleDelete(topic.id, topic.type)}
              />
            ) : undefined}
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  )
}
