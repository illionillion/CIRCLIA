"use client"
import { CircleAlertIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Button,
  Card,
  CardBody,
  Center,
  Heading,
  Text,
  VStack,
} from "@yamada-ui/react"
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
              <Card key={notification.id} bg="white">
                <CardBody flexDir="row">
                  <Center m="auto">
                    <CircleAlertIcon
                      color="danger"
                      fontSize="2xl"
                      visibility={notification.readAt ? "hidden" : "visible"}
                    />
                  </Center>
                  <VStack>
                    <Text fontSize="lg">{notification.title}</Text>
                    <Text>{notification.content}</Text>
                  </VStack>
                  {notification.readAt ? undefined : (
                    <Button colorScheme="riverBlue" m="auto">
                      既読
                    </Button>
                  )}
                </CardBody>
              </Card>
            ))
          ) : (
            <Text>通知はありません</Text>
          )}
        </VStack>
      )}
    </PaginationList>
  )
}
