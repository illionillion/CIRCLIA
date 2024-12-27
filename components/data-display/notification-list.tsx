"use client"
import type { FC } from "@yamada-ui/react"
import { Center, Text, VStack } from "@yamada-ui/react"
import { PaginationList } from "../navigation/pagination-list"
import { NotificationListItem } from "./notification-list-item"
import type { getNotificationsByUserId } from "@/data/notification"

interface NotificationList {
  notifications: Awaited<ReturnType<typeof getNotificationsByUserId>>
  userId: string
  preview?: boolean
  itemsPerPage?: number
}

export const NotificationList: FC<NotificationList> = ({
  userId,
  notifications,
  preview,
  itemsPerPage,
}) => {
  return (
    <PaginationList data={notifications} itemsPerPage={itemsPerPage}>
      {(notifications) => (
        <VStack w="full" h="full" overflowY="auto" gap="md">
          {notifications.length ? (
            notifications.map((notification) => (
              <NotificationListItem
                userId={userId}
                notification={notification}
                key={notification.id}
                preview={preview}
              />
            ))
          ) : (
            <Center w="full" h="full">
              <Text>通知はありません</Text>
            </Center>
          )}
        </VStack>
      )}
    </PaginationList>
  )
}
