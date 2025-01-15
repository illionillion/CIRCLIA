"use client"
import { CircleAlertIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Button,
  Card,
  CardBody,
  Center,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import type { getNotificationsByUserId } from "@/data/notification"
import { useMarkNotificationAsRead } from "@/utils/notification"

interface NotificationListItemProps {
  userId: string
  notification: Awaited<ReturnType<typeof getNotificationsByUserId>>[number]
  preview?: boolean
  refreshNotifications: (userId: string) => Promise<void>
}

export const NotificationListItem: FC<NotificationListItemProps> = ({
  userId,
  notification,
  preview,
  refreshNotifications,
}) => {
  const { isPending, markAsRead } = useMarkNotificationAsRead()

  const handleMarkAsRead = () => {
    markAsRead(userId, notification.id)
    refreshNotifications(userId)
  }
  const generateLink = (
    notification: Awaited<ReturnType<typeof getNotificationsByUserId>>[number],
  ) => {
    switch (notification.type) {
      case "CIRCLE_INVITE":
        return `/circles/${notification.circleId}/members`
      case "CIRCLE_ANNOUNCEMENT":
        return `/circles/${notification.circleId}/announcement/${notification.relatedEntityId}`
      case "CIRCLE_THREAD":
        return `/circles/${notification.circleId}/thread/${notification.relatedEntityId}`
      default:
        return `/circles/${notification.circleId}/`
    }
  }
  const link = generateLink(notification)
  return (
    <Card bg="white" as={LinkBox}>
      <CardBody flexDir="row">
        {notification.readAt ? undefined : (
          <Center m="auto">
            <CircleAlertIcon color="danger" fontSize="2xl" />
          </Center>
        )}
        <LinkOverlay as={Link} href={link} w="full">
          <VStack>
            <Text fontSize="lg">{notification.title}</Text>
            {preview ? <Text>{notification.content}</Text> : undefined}
          </VStack>
        </LinkOverlay>
        {notification.readAt || !preview ? undefined : (
          <Button
            colorScheme="riverBlue"
            m="auto"
            onClick={handleMarkAsRead}
            loading={isPending}
          >
            既読
          </Button>
        )}
      </CardBody>
    </Card>
  )
}
