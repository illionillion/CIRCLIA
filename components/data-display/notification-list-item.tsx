import { InfoIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Avatar,
  Box,
  Card,
  Flex,
  Heading,
  HStack,
  LinkBox,
  LinkOverlay,
  Text,
} from "@yamada-ui/react"
import Link from "next/link"
import type { getAnnouncementsByUserId } from "@/data/announcement"
import { parseDate } from "@/utils/format"

interface NotificationListItemProps {
  announcement: Awaited<ReturnType<typeof getAnnouncementsByUserId>>[number]
  preview?: boolean
}

export const NotificationListItem: FC<NotificationListItemProps> = ({
  announcement,
  preview,
}) => {
  return (
    <HStack bg="white" as={Card}>
      <HStack as={LinkBox} w="full" p="sm">
        <Box>
          <Avatar
            src={announcement.user.profileImageUrl || ""}
            alt={`${announcement.user.name}のアイコン画像`}
          />
        </Box>
        <LinkOverlay
          w="full"
          as={Link}
          justifyContent="center"
          alignItems="start"
          display="flex"
          gap="md"
          flexDir="column"
          href={`/circles/${announcement.circleId}/announcement/${announcement.id}`}
        >
          <Text>{announcement.circle.name}</Text>
          <HStack gap="sm">
            {announcement.isImportant ? (
              <InfoIcon fontSize="lg" color="primary" />
            ) : undefined}
            <Heading size="xs" as="h4">
              {announcement.title}
            </Heading>
          </HStack>
          {preview && (
            <Text as="pre" textWrap="wrap">
              {announcement.content}
            </Text>
          )}
          <Flex w="full" justifyContent="right">
            {parseDate(announcement.updatedAt)}
          </Flex>
        </LinkOverlay>
      </HStack>
    </HStack>
  )
}
