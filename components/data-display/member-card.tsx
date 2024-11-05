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
  MenuDivider,
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
} from "@yamada-ui/react"
import { useState, type FC } from "react"
import type { getCircleById } from "@/data/circle"

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
  const roleDialogDisclosure = useDisclosure();
  const removeDialogDisclosure = useDisclosure();
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null)

  // 権限変更モーダルを開く
  const openRoleDialog = (newRoleId: number, newRoleName: string) => {
    roleDialogDisclosure.onOpen()
    setSelectedRole(newRoleId)
    setSelectedRoleName(newRoleName)
  }

  // 権限変更を確定
  const confirmRoleChange = async () => {
    if (userId && selectedRole !== null) {
      roleDialogDisclosure.onClose()
      await handleRoleChange(member.id, selectedRole)
      setSelectedRole(null)
      setSelectedRoleName("")
    }
  }

  // 退会確認モーダルを開く
  const openRemoveDialog = () => {
    removeDialogDisclosure.onOpen();
  };

  return (
    <GridItem w="full" rounded="md" as={Card}>
      <CardBody>
        <HStack
          as={Center}
          w="full"
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <HStack flexWrap="wrap">
            <Avatar src={member.iconImagePath || ""} />
            <Badge>{member.role.roleName}</Badge>
            <Text>{member.name}</Text>
            <Text>{member.studentNumber}</Text>
          </HStack>
          {isAdmin && userId !== member.id && member?.role?.id !== 0 ? (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<EllipsisIcon fontSize="2xl" />}
                variant="outline"
                isRounded
              />
              <MenuList>
                {/* 代表のメニューオプション */}
                {userRole?.id === 0 && (
                  <>
                    <MenuItem
                      onClick={() => openRoleDialog(0, "代表")}
                      isDisabled={member.role?.id === 0}
                    >
                      代表
                    </MenuItem>
                    <MenuItem
                      onClick={() => openRoleDialog(1, "副代表")}
                      isDisabled={member.role?.id === 1}
                    >
                      副代表
                    </MenuItem>
                    <MenuItem
                      onClick={() => openRoleDialog(2, "一般")}
                      isDisabled={member.role?.id === 2}
                    >
                      一般
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem
                      color="red"
                      onClick={() => openRemoveDialog()}
                    >
                      退会
                    </MenuItem>
                  </>
                )}

                {/* 副代表のメニューオプション */}
                {userRole?.id === 1 && (
                  <>
                    <MenuItem
                      onClick={() => openRoleDialog(1, "副代表")}
                      isDisabled={member.role?.id === 1}
                    >
                      副代表
                    </MenuItem>
                    <MenuItem
                      onClick={() => openRoleDialog(2, "一般")}
                      isDisabled={member.role?.id === 2}
                    >
                      一般
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem
                      color="red"
                      onClick={() => openRemoveDialog()}
                    >
                      退会
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          ) : undefined}

          {/* 権限変更確認モーダル */}
          <Modal isOpen={roleDialogDisclosure.isOpen} onClose={roleDialogDisclosure.onClose}>
            <ModalOverlay />
            <ModalHeader>権限変更の確認</ModalHeader>
            <ModalBody>
              {member.name} さんの権限を「{member.role.roleName}」から「
              {selectedRoleName}」に変更しますか？
            </ModalBody>
            <ModalFooter>
              <Button onClick={roleDialogDisclosure.onClose}>キャンセル</Button>
              <Button colorScheme="blue" onClick={confirmRoleChange}>
                変更
              </Button>
            </ModalFooter>
          </Modal>

          {/* 退会確認モーダル */}
          <Modal isOpen={removeDialogDisclosure.isOpen} onClose={removeDialogDisclosure.onClose}>
            <ModalOverlay />
            <ModalHeader>退会の確認</ModalHeader>
            <ModalBody>
              {member.name} さんを本当に退会させますか？
            </ModalBody>
            <ModalFooter>
              <Button onClick={removeDialogDisclosure.onClose}>キャンセル</Button>
              <Button colorScheme="blue" onClick={() => handleRemoveMember(member.id)}>
                退会
              </Button>
            </ModalFooter>
          </Modal>
        </HStack>
      </CardBody>
    </GridItem>
  )
}
