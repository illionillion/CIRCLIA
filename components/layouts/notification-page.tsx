"use client"
import type { FC } from "@yamada-ui/react"
import { Heading, VStack } from "@yamada-ui/react"
import { NotificationList } from "../data-display/notification-list"
import type { getNotificationsByUserId } from "@/data/notification"

interface NotificationPageProps {
  userId: string
  notifications: Awaited<ReturnType<typeof getNotificationsByUserId>>
}

export const NotificationPage: FC<NotificationPageProps> = ({
  userId,
  notifications,
}) => {
  return (
    <VStack w="full" h="full" gap="md" maxW="9xl" m="auto">
      <Heading as="h2" size="lg" p={4}>
        通知
      </Heading>
      <NotificationList
        userId={userId}
        notifications={notifications}
        itemsPerPage={5}
        preview
      />
    </VStack>
  )
}
