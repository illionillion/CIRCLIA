"use client"
import type { FC } from "@yamada-ui/react"
import {
  Heading,
  Text,
  VStack,
} from "@yamada-ui/react"
import { NotificationListItem } from "../data-display/notification-list-item"
import { PaginationList } from "../navigation/pagination-list"
import type { getNotificationsByUserId } from "@/data/notification"

interface NotificationPageProps {
  notifications: Awaited<ReturnType<typeof getNotificationsByUserId>>
}

export const NotificationPage: FC<NotificationPageProps> = ({
  notifications,
}) => {
  return (
    <PaginationList data={notifications}>
      {(currentNotification) => (
        <VStack w="full" h="full" gap="md" maxW="9xl" m="auto">
          <VStack>
            <Heading as="h2" size="lg">
              通知
            </Heading>
          </VStack>
          {currentNotification.length ? (
            currentNotification.map((notification) => (
              <NotificationListItem
                notification={notification}
                key={notification.id}
                preview
              />
            ))
          ) : (
            <Text>通知はありません</Text>
          )}
        </VStack>
      )}
    </PaginationList>
  )
}
