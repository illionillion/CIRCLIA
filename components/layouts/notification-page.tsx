"use client"
import type { FC } from "@yamada-ui/react"
import { Separator, Heading, Text, VStack } from "@yamada-ui/react"
import { NotificationListItem } from "../data-display/notification-list-item"
import { PaginationList } from "../navigation/pagination-list"
import type { getAnnouncementsByUserId } from "@/data/announcement"

interface NotificationPageProps {
  announcements: Awaited<ReturnType<typeof getAnnouncementsByUserId>>
}

export const NotificationPage: FC<NotificationPageProps> = ({
  announcements,
}) => {
  return (
    <PaginationList data={announcements}>
      {(currentAnnouncements) => (
        <VStack w="full" h="full" gap="md">
          <VStack>
            <Heading as="h2" size="lg">
              お知らせ
            </Heading>
            <Separator
              w="full"
              borderWidth="2px"
              orientation="horizontal"
              variant="solid"
            />
          </VStack>
          {currentAnnouncements.length ? (
            currentAnnouncements.map((announcement) => (
              <NotificationListItem
                announcement={announcement}
                key={announcement.id}
                preview
              />
            ))
          ) : (
            <Text>お知らせはありません</Text>
          )}
        </VStack>
      )}
    </PaginationList>
  )
}
