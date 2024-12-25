"use client"
import type { TopicType } from "@prisma/client"
import {
  BellPlusIcon,
  MessageCircleMoreIcon,
  PlusIcon,
} from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Button,
  Center,
  HStack,
  Loading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MultiSelect,
  Option,
  Snacks,
  Tag,
  Text,
  useBoolean,
  useSafeLayoutEffect,
  useSnacks,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useState } from "react"
import { AnnouncementCard } from "./announcement-card"
import { ThreadCard } from "./thread-card"
import { ThreadItem } from "./thread-item"
import {
  getAnnouncementByIdAction,
  submitAnnouncementDelete,
} from "@/actions/circle/announcement"
import type { getCircleById } from "@/actions/circle/fetch-circle"
import {
  fetchTopics,
  getThreadByIdAction,
  submitThreadDelete,
} from "@/actions/circle/thread"
import type { getAnnouncementById } from "@/data/announcement"
import type { getThreadById } from "@/data/thread"

interface CircleThreadsProps {
  userId: string
  isAdmin?: boolean
  isMember?: boolean
  circle: Awaited<ReturnType<typeof getCircleById>>
  currentThread?: Awaited<ReturnType<typeof getThreadById>>
  currentAnnouncement?: Awaited<ReturnType<typeof getAnnouncementById>>
}

export const CircleThreads: FC<CircleThreadsProps> = ({
  userId,
  isAdmin,
  isMember,
  circle,
  currentThread: thread,
  currentAnnouncement: announcement,
}) => {
  const [currentThread, setCurrentThread] = useState(thread)
  const [currentAnnouncement, setCurrentAnnouncement] = useState(announcement)
  const [loading, { off: loadingOff, on: loadingOn }] = useBoolean(true)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [topics, setTopics] = useState<Awaited<ReturnType<typeof fetchTopics>>>(
    [],
  )
  const { snack, snacks } = useSnacks()

  const fetchData = async () => {
    loadingOn()
    const data = await fetchTopics(circle?.id || "")
    const filterTopics = data.filter((item) => {
      if (selectedOptions.length === 0) {
        return true
      }
      // "重要"のみ
      if (
        selectedOptions.includes("isImportant") &&
        selectedOptions.length === 1
      ) {
        return item.isImportant
      }
      // "重要"と"スレッド"
      if (
        selectedOptions.includes("isImportant") &&
        selectedOptions.includes("thread")
      ) {
        return item.type === "thread" && item.isImportant
      }
      // "重要"と"お知らせ"
      if (
        selectedOptions.includes("thread") &&
        selectedOptions.includes("announcement")
      ) {
        return item.type === "announcement" && item.isImportant
      }
      // "スレッド"or"お知らせ"
      return selectedOptions.includes(item.type)
    })
    const newCurrentThread = await getThreadByIdAction(thread?.id || "")
    setCurrentThread(newCurrentThread)
    const newCurrentAnnouncement = await getAnnouncementByIdAction(
      announcement?.id || "",
    )
    setCurrentAnnouncement(newCurrentAnnouncement)
    setTopics(filterTopics)
    loadingOff()
  }

  const handleDelete = async (topicId: string, type: TopicType) => {
    const { success, error } =
      type === "thread"
        ? await submitThreadDelete(topicId, circle?.id || "")
        : await submitAnnouncementDelete(topicId, circle?.id || "")
    snack.closeAll()
    if (success) {
      snack({
        title: `${type === "thread" ? "スレッド" : "お知らせ"}を削除しました。`,
        status: "success",
      })
      await fetchData()
    } else {
      snack({ title: error || "エラー", status: "error" })
    }
  }

  useSafeLayoutEffect(() => {
    fetchData()
  }, [selectedOptions])
  return (
    <VStack gap="md" w="full" h="full">
      <Snacks snacks={snacks} />
      {currentThread ? (
        <ThreadCard
          userId={userId}
          circleId={circle?.id || ""}
          currentThread={currentThread}
          isAdmin={!!isAdmin}
          isMember={!!isMember}
          fetchData={fetchData}
          handleDelete={handleDelete}
        />
      ) : currentAnnouncement ? (
        <AnnouncementCard
          userId={userId}
          circleId={circle?.id || ""}
          currentAnnouncement={currentAnnouncement}
          isAdmin={!!isAdmin}
          isMember={!!isMember}
          handleDelete={handleDelete}
        />
      ) : (
        <>
          <HStack justifyContent="space-between">
            <MultiSelect
              w="sm"
              containerProps={{
                bg: "blackAlpha.50",
              }}
              placeholder="項目を選択"
              component={({ label, onRemove }) => (
                <Tag onClose={onRemove}>{label}</Tag>
              )}
              onChange={setSelectedOptions}
              value={selectedOptions}
            >
              <Option value="thread">スレッド</Option>
              <Option value="announcement">お知らせ</Option>
              <Option value="isImportant">重要</Option>
            </MultiSelect>
            <Menu>
              <MenuButton
                as={Button}
                startIcon={<PlusIcon fontSize="2xl" />}
                colorScheme="riverBlue"
              >
                作成
              </MenuButton>
              <MenuList>
                <MenuItem
                  icon={<BellPlusIcon fontSize="2xl" />}
                  as={Link}
                  href={`/circles/${circle?.id}/announcement/create`}
                >
                  お知らせ
                </MenuItem>
                <MenuItem
                  icon={<MessageCircleMoreIcon fontSize="2xl" />}
                  as={Link}
                  href={`/circles/${circle?.id}/thread/create`}
                >
                  スレッド
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
          {loading ? (
            <Center w="full" h="full">
              <Loading fontSize="xl" />
            </Center>
          ) : topics && topics.length > 0 ? (
            <VStack w="full" gap="md">
              {topics.map((topic) => (
                <ThreadItem
                  key={topic.id}
                  userId={userId}
                  isAdmin={!!isAdmin}
                  isMember={!!isMember}
                  circle={circle}
                  handleDelete={handleDelete}
                  topic={topic}
                />
              ))}
            </VStack>
          ) : (
            <Center w="full" h="full">
              <Text>投稿がありません</Text>
            </Center>
          )}
        </>
      )}
    </VStack>
  )
}
