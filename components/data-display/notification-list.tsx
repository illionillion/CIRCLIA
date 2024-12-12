"use client"
import type { FC } from "@yamada-ui/react"
import { Center, Text, VStack } from "@yamada-ui/react"
import { PaginationList } from "../navigation/pagination-list"
import { NotificationListItem } from "./notification-list-item"
import type { getAnnouncementsByUserId } from "@/data/announcement"

interface NotificationList {
  announcements: Awaited<ReturnType<typeof getAnnouncementsByUserId>>
}

export const NotificationList: FC<NotificationList> = ({ announcements }) => (
  <PaginationList data={announcements} itemsPerPage={3}>
    {(announcements) => (
      <VStack w="full" h="full" overflowY="auto" gap="md">
        {announcements.length ? (
          announcements.map((announcement) => (
            <NotificationListItem
              announcement={announcement}
              key={announcement.id}
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
