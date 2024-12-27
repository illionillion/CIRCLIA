"use client"
import type { FC } from "@yamada-ui/react"
import { Heading, VStack } from "@yamada-ui/react"
import { NotificationList } from "../data-display/notification-list"

interface NotificationPageProps {
  userId: string
}

export const NotificationPage: FC<NotificationPageProps> = ({ userId }) => {
  return (
    <VStack w="full" h="full" gap="md" maxW="9xl" m="auto">
      <Heading as="h2" size="lg" p={4}>
        通知
      </Heading>
      <NotificationList userId={userId} itemsPerPage={5} preview />
    </VStack>
  )
}
