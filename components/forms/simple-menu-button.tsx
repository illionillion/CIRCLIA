"use client"
import { EllipsisIcon, PenIcon, TrashIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@yamada-ui/react"
import Link from "next/link"

interface SimpleMenuButtonProps {
  editLink: string
  handleDelete: () => void
}

export const SimpleMenuButton: FC<SimpleMenuButtonProps> = ({
  editLink,
  handleDelete,
}) => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<EllipsisIcon fontSize="2xl" />}
        variant="ghost"
        fullRounded
      />
      <MenuList>
        <MenuItem
          icon={<PenIcon fontSize="2xl" />}
          as={Link}
          href={editLink}
          transition="0.5s"
          _hover={{ transform: "scale(1.02)", transition: "0.5s", zIndex: 2 }}
          zIndex={2}
        >
          編集
        </MenuItem>
        <MenuItem
          icon={<TrashIcon fontSize="2xl" color="red" />}
          color="red"
          onClick={handleDelete}
          transition="0.5s"
          _hover={{ transform: "scale(1.02)", transition: "0.5s", zIndex: 2 }}
          zIndex={2}
        >
          削除
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
