import { getMonthlyEvents } from "@/data/activity";
import { Drawer, DrawerOverlay, DrawerHeader, DrawerBody, DrawerCloseButton, Box, Flex, Text, Link as UILink, List } from "@yamada-ui/react";
import Link from "next/link";
import type { FC } from "react";

interface EventDrawerProps {
  open: boolean;
  onClose: () => void;
  placement: "bottom" | "right";
  selectedDate: Date | null;
  selectedEvents: Awaited<ReturnType<typeof getMonthlyEvents>>
}

export const EventDrawer: FC<EventDrawerProps> = ({ open, onClose, placement, selectedDate, selectedEvents }) => {
  return (
    <Drawer open={open} onClose={onClose} placement={placement}>
      <DrawerOverlay />
      <DrawerCloseButton />
      <DrawerHeader>
        {selectedDate ? (
          <Text fontSize="xl" fontWeight="bold">
            {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
          </Text>
        ) : (
          <Text fontSize="xl" fontWeight="bold">
            詳細
          </Text>
        )}
      </DrawerHeader>

      <DrawerBody>
        {selectedEvents.length > 0 ? (
          <List>
            {selectedEvents.map((event, index) => (
              <Box key={event.id} w="full">
                <Flex alignItems="center">
                  <Box textAlign="center" fontFamily="monospace" fontWeight="bold">
                    <Text fontSize="lg">
                      {new Date(event.startTime).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text fontSize="lg">～</Text>
                    <Text fontSize="lg">
                      {event.endTime
                        ? new Date(event.endTime).toLocaleTimeString("ja-JP", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </Text>
                  </Box>

                  <Box ml={4} flex="1">
                    <UILink
                      as={Link}
                      href={`/circles/${event.circle.id}/activities/${event.id}`}
                      colorScheme="riverBlue"
                      fontWeight="bold"
                      fontSize="md"
                      whiteSpace="pre-wrap"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {event.title}
                    </UILink>
                  </Box>
                </Flex>

                {/* イベント間の区切り線 */}
                {index < selectedEvents.length - 1 && (
                  <Box borderBottom="1px solid" borderColor="gray.300" my={3} w="full" />
                )}
              </Box>
            ))}
          </List>
        ) : (
          <Text fontSize="lg" fontWeight="bold">
            この日にはイベントがありません。
          </Text>
        )}
      </DrawerBody>
    </Drawer>
  );
};
