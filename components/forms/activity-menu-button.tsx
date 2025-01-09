import { EllipsisIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  useDisclosure,
} from "@yamada-ui/react"
import Link from "next/link"
import type { getCircleById } from "@/actions/circle/fetch-circle"
import type { getActivityById } from "@/data/activity"

interface ActivityMenuButtonProps {
  isMember: boolean
  isAdmin: boolean
  userId: string
  circle: Awaited<ReturnType<typeof getCircleById>>
  activity: NonNullable<Awaited<ReturnType<typeof getActivityById>>>
  handleDelete: (activityId: number) => Promise<void>
  handleParticipation: (activityId: number) => Promise<void>
}

export const ActivityMenuButton: FC<ActivityMenuButtonProps> = ({
  isMember,
  isAdmin,
  userId,
  circle,
  activity,
  handleDelete,
  handleParticipation,
}) => {
  const { open, onOpen, onClose } = useDisclosure()

  const onDeleteConfirm = async () => {
    await handleDelete(activity.id)
    onClose()
  }

  return isMember ? (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<EllipsisIcon fontSize="2xl" />}
          variant="ghost"
          fullRounded
        />
        <MenuList>
          <MenuItem
            as={Link}
            href={`/circles/${circle?.id}/activities/${activity.id}/edit`}
            isDisabled={!isAdmin && activity.createdBy !== userId}
          >
            編集
          </MenuItem>
          <MenuItem
            color="red"
            isDisabled={!isAdmin && activity.createdBy !== userId}
            onClick={onOpen}
          >
            削除
          </MenuItem>

          {activity.participants.some(
            (participant) => participant.userId === userId,
          ) ? (
            <MenuItem onClick={() => handleParticipation(activity.id)}>
              参加をキャンセル
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleParticipation(activity.id)}>
              参加
            </MenuItem>
          )}
        </MenuList>
      </Menu>

      <Modal open={open} onClose={onClose}>
        <ModalOverlay />
        <ModalHeader>活動の削除確認</ModalHeader>
        <ModalBody>
          <Text>本当にこの活動を削除しますか？この操作は元に戻せません。</Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            いいえ
          </Button>
          <Button colorScheme="red" onClick={onDeleteConfirm}>
            削除
          </Button>
        </ModalFooter>
      </Modal>
    </>
  ) : activity.participants.some(
      (participant) => participant.userId === userId,
    ) ? (
    <Button
      // ml={{md: "auto"}}
      colorScheme="riverBlue"
      onClick={() => handleParticipation(activity.id)}
    >
      参加をキャンセル
    </Button>
  ) : (
    <Button
      // ml={{md: "auto"}}
      colorScheme="riverBlue"
      onClick={() => handleParticipation(activity.id)}
    >
      参加
    </Button>
  )
}
