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

interface NotificationListItemProps {
  notification: Awaited<ReturnType<typeof getNotificationsByUserId>>[number]
  preview?: boolean
}

export const NotificationListItem: FC<NotificationListItemProps> = ({
  notification,
  preview,
}) => {
  const generateLink = (
    notification: Awaited<ReturnType<typeof getNotificationsByUserId>>[number],
  ) => {
    switch (notification.type) {
      case "CIRCLE_INVITE":
        return `/circles/${notification.circleId}/members`
      default:
        return `/circles/${notification.circleId}/notifications`
    }
  }
  const link = generateLink(notification)
  return (
    <Card bg="white" as={LinkBox}>
      <CardBody flexDir="row">
        <Center m="auto">
          <CircleAlertIcon
            color="danger"
            fontSize="2xl"
            visibility={notification.readAt ? "hidden" : "visible"}
          />
        </Center>
        <LinkOverlay as={Link} href={link} w="full">
          <VStack>
            <Text fontSize="lg">{notification.title}</Text>
            {preview ? <Text>{notification.content}</Text> : undefined}
          </VStack>
        </LinkOverlay>
        {notification.readAt || !preview ? undefined : (
          <Button colorScheme="riverBlue" m="auto">
            既読
          </Button>
        )}
      </CardBody>
    </Card>
  )
}
