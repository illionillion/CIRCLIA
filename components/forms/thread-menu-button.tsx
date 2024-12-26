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

interface ThreadMenuButtonProps {
  editLink: string
  handleDelete: () => void
}

export const ThreadMenuButton: FC<ThreadMenuButtonProps> = ({
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
        <MenuItem icon={<PenIcon fontSize="2xl" />} as={Link} href={editLink}>
          編集
        </MenuItem>
        <MenuItem
          icon={<TrashIcon fontSize="2xl" color="red" />}
          color="red"
          onClick={handleDelete}
        >
          削除
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
