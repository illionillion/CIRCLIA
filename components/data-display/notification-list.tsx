"use client"
import type { FC } from "@yamada-ui/react"
import { Center, Text, useSafeLayoutEffect, VStack } from "@yamada-ui/react"
import { PaginationList } from "../navigation/pagination-list"
import { NotificationListItem } from "./notification-list-item"
import { useNotifications } from "@/provider/notification-provider"

interface NotificationList {
  userId: string
  preview?: boolean
  itemsPerPage?: number
}

export const NotificationList: FC<NotificationList> = ({
  userId,
  preview,
  itemsPerPage,
}) => {
  const { notifications, refreshNotifications } = useNotifications()

  useSafeLayoutEffect(() => {
    refreshNotifications(userId)
  }, [])

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
                refreshNotifications={refreshNotifications}
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
