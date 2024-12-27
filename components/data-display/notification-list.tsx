"use client"
import type { FC } from "@yamada-ui/react"
import { Center, Text, VStack } from "@yamada-ui/react"
import { PaginationList } from "../navigation/pagination-list"
import { NotificationListItem } from "./notification-list-item"
import type { getNotificationsByUserId } from "@/data/notification"

interface NotificationList {
  notifications: Awaited<ReturnType<typeof getNotificationsByUserId>>
}

export const NotificationList: FC<NotificationList> = ({ notifications }) => (
  <PaginationList data={notifications} itemsPerPage={3}>
    {(notifications) => (
      <VStack w="full" h="full" overflowY="auto" gap="md">
        {notifications.length ? (
          notifications.map((notification) => (
            <NotificationListItem
              notification={notification}
              key={notification.id}
            />
          ))
        ) : (
          <Center w="full" h="full">
            <Text>お知らせはありません</Text>
          </Center>
        )}
      </VStack>
    )}
  </PaginationList>
)
