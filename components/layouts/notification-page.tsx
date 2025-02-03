"use client"
import type { FC } from "@yamada-ui/react"
import { Button, Heading, HStack, VStack } from "@yamada-ui/react"
import { NotificationList } from "../data-display/notification-list"
import { EnablePushNotificationButton } from "../forms/push-notification-button"
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
    <VStack
      w="full"
      h={{ base: "full", sm: "fit-content" }}
      gap="md"
      maxW="9xl"
      m="auto"
    >
      <HStack justifyContent="space-between" p={4}>
        <Heading as="h2" size="lg" textWrap="nowrap">
          通知
        </Heading>
        <HStack flexWrap="wrap" justifyContent="end">
          <EnablePushNotificationButton userId={userId} />
          <Button
            colorScheme="riverBlue"
            onClick={handleClick}
            transition="0.5s"
            _hover={{ transform: "scale(1.05)", transition: "0.5s" }}
          >
            全て既読
          </Button>
        </HStack>
      </HStack>
      <NotificationList userId={userId} itemsPerPage={5} preview />
    </VStack>
  )
}
