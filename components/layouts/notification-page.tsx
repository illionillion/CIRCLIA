"use client"
import type { FC } from "@yamada-ui/react"
import { Button, Heading, HStack, VStack } from "@yamada-ui/react"
import { NotificationList } from "../data-display/notification-list"
import { markAllNotificationAsReadAction } from "@/actions/notification"
import { useNotifications } from "@/provider/notification-provider"

interface NotificationPageProps {
  userId: string
}

export const NotificationPage: FC<NotificationPageProps> = ({ userId }) => {
  const { refreshNotifications } = useNotifications()
  const handleClick = async () => {
    await markAllNotificationAsReadAction(userId)

    refreshNotifications(userId)
  }
  return (
    <VStack w="full" h="full" gap="md" maxW="9xl" m="auto">
      <HStack justifyContent="space-between" p={4}>
        <Heading as="h2" size="lg">
          通知
        </Heading>
        <Button colorScheme="riverBlue" onClick={handleClick}>
          全て既読
        </Button>
      </HStack>
      <NotificationList userId={userId} itemsPerPage={5} preview />
    </VStack>
  )
}
