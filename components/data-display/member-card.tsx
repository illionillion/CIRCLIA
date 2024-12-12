"use client"
import { EllipsisIcon } from "@yamada-ui/lucide"
import {
  Avatar,
  Badge,
  Card,
  CardBody,
  Center,
  GridItem,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuSeparator,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  LinkBox,
  LinkOverlay,
} from "@yamada-ui/react"
import Link from "next/link"
import { useState, type FC } from "react"
import type { getCircleById } from "@/actions/circle/fetch-circle"

interface MemberCard {
  member: NonNullable<
    NonNullable<Awaited<ReturnType<typeof getCircleById>>>["members"]
  >[number]
  isAdmin?: boolean
  userRole:
    | {
        id: number
        roleName: string
      }
    | undefined
  userId: string
  handleRoleChange: (targetMemberId: string, newRoleId: number) => Promise<void>
  handleRemoveMember: (targetMemberId: string) => Promise<void>
}

export const MemberCard: FC<MemberCard> = ({
  member,
  isAdmin,
  userRole,
  userId,
  handleRoleChange,
  handleRemoveMember,
}) => {
  const {
    open: isRoleOpen,
    onOpen: onRoleOpen,
    onClose: onRoleClose,
  } = useDisclosure()
  const {
    open: isRemoveOpen,
    onOpen: onRemoveOpen,
    onClose: onRemoveClose,
  } = useDisclosure()
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null)

  // 権限変更モーダルを開く
  const openRoleDialog = (newRoleId: number, newRoleName: string) => {
    onRoleOpen()
    setSelectedRole(newRoleId)
    setSelectedRoleName(newRoleName)
  }

  // 権限変更を確定
  const confirmRoleChange = async () => {
    if (userId && selectedRole !== null) {
      onRoleClose()
      await handleRoleChange(member.id, selectedRole)
      setSelectedRole(null)
      setSelectedRoleName("")
    }
  }

  // 退会確認モーダルを開く
  const openRemoveDialog = () => {
    onRemoveOpen()
  }

  // 退会確認を確定
  const confirmRemoveChange = async () => {
    if (userId !== null) {
      onRemoveClose()
      await handleRemoveMember(member.id)
    }
  }

  return (
    <GridItem w="full" rounded="md" as={Card} bg="white">
      <CardBody as={LinkBox}>
        <HStack
          as={Center}
          w="full"
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <LinkOverlay
            display="flex"
            gap="md"
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
            as={Link}
            href={`/user/${member.id}`}
          >
            <Avatar src={member.profileImageUrl || ""} />
            <Badge>{member.role.roleName}</Badge>
            <Text>{member.name}</Text>
            <Text>{member.studentNumber}</Text>
          </LinkOverlay>
          {isAdmin && userId !== member.id && member.role.id !== 0 ? (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<EllipsisIcon fontSize="2xl" />}
                variant="outline"
                fullRounded
              />
              <MenuList>
                {/* 代表のメニューオプション */}
                {userRole?.id === 0 && (
                  <>
                    <MenuItem
                      onClick={() => openRoleDialog(0, "代表")}
                      isDisabled={member.role.id === 0}
                    >
                      代表
                    </MenuItem>
                    <MenuItem
                      onClick={() => openRoleDialog(1, "副代表")}
                      isDisabled={member.role.id === 1}
                    >
                      副代表
                    </MenuItem>
                    <MenuItem
                      onClick={() => openRoleDialog(2, "一般")}
                      isDisabled={member.role.id === 2}
                    >
                      一般
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem color="red" onClick={() => openRemoveDialog()}>
                      退会
                    </MenuItem>
                  </>
                )}

                {/* 副代表のメニューオプション */}
                {userRole?.id === 1 && (
                  <>
                    <MenuItem
                      onClick={() => openRoleDialog(1, "副代表")}
                      isDisabled={member.role.id === 1}
                    >
                      副代表
                    </MenuItem>
                    <MenuItem
                      onClick={() => openRoleDialog(2, "一般")}
                      isDisabled={member.role.id === 2}
                    >
                      一般
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem color="red" onClick={() => openRemoveDialog()}>
                      退会
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          ) : undefined}

          {/* 権限変更確認モーダル */}
          <Modal open={isRoleOpen} onClose={onRoleClose}>
            <ModalOverlay />
            <ModalHeader>権限変更の確認</ModalHeader>
            <ModalBody>
              {member.name} さんの権限を「{member.role.roleName}」から「
              {selectedRoleName}」に変更しますか？
            </ModalBody>
            <ModalFooter>
              <Button onClick={onRoleClose}>キャンセル</Button>
              <Button colorScheme="blue" onClick={confirmRoleChange}>
                変更
              </Button>
            </ModalFooter>
          </Modal>

          {/* 退会確認モーダル */}
          <Modal open={isRemoveOpen} onClose={onRemoveClose}>
            <ModalOverlay />
            <ModalHeader>サークルの退会確認</ModalHeader>
            <ModalBody>本当に {member.name} さんを退会させますか？</ModalBody>
            <ModalFooter>
              <Button onClick={onRemoveClose}>キャンセル</Button>
              <Button colorScheme="danger" onClick={confirmRemoveChange}>
                退会
              </Button>
            </ModalFooter>
          </Modal>
        </HStack>
      </CardBody>
    </GridItem>
  )
}
