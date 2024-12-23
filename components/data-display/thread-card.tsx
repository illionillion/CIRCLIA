"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { TopicType } from "@prisma/client"
import { TriangleIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Avatar,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  HStack,
  IconButton,
  Snacks,
  Text,
  Textarea,
  useBoolean,
  useSnacks,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ThreadMenuButton } from "../forms/thread-menu-button"
import { PostCommentAction } from "@/actions/circle/thread-comment"
import type { getThreadById } from "@/data/thread"
import type { CommentFormInput } from "@/schema/topic"
import { CommentFormSchema } from "@/schema/topic"
import { parseFullDate } from "@/utils/format"

interface ThreadCardProps {
  userId: string
  circleId: string
  isAdmin: boolean
  isMember: boolean
  currentThread: NonNullable<Awaited<ReturnType<typeof getThreadById>>>
  fetchData: () => Promise<void>
  handleDelete: (topicId: string, type: TopicType) => Promise<void>
}

export const ThreadCard: FC<ThreadCardProps> = ({
  circleId,
  currentThread,
  isAdmin,
  isMember,
  userId,
  fetchData,
  handleDelete,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<CommentFormInput>({ resolver: zodResolver(CommentFormSchema) })
  const router = useRouter()
  const { snack, snacks } = useSnacks()
  const [isSubmitting, { on: start, off: end }] = useBoolean(false)
  const onSubmit = async (data: CommentFormInput) => {
    start()
    const { success, error } = await PostCommentAction(
      currentThread.id,
      circleId,
      data,
    )
    snack.closeAll()
    if (success) {
      snack({ title: "コメントの作成に成功しました", status: "success" })
      await fetchData()
      reset()
    } else {
      snack({ title: error || "コメントの作成に失敗しました", status: "error" })
    }
    end()
  }
  return (
    <>
      <Snacks snacks={snacks} />
      <Card w="full" h="full" bg="white">
        <CardHeader
          justifyContent="space-between"
          alignItems={{ md: "end" }}
          flexDir={{ base: "row", md: "column-reverse" }}
        >
          <HStack>
            <Avatar
              src={currentThread.user.profileImageUrl || ""}
              as={Link}
              href={`/user/${currentThread.user.id}`}
            />
            <VStack gap={0}>
              <Text>{currentThread.title}</Text>
              <Text fontSize="sm" as="pre" textWrap="wrap">
                {currentThread.content}
              </Text>
            </VStack>
          </HStack>
          <VStack w="auto">
            <HStack>
              <Text>{parseFullDate(currentThread.createdAt)}</Text>
              {isAdmin || (currentThread.userId === userId && isMember) ? (
                <ThreadMenuButton
                  editLink={`/circles/${circleId}/${currentThread.type}/${currentThread.id}/edit`}
                  handleDelete={() => {
                    handleDelete(currentThread.id, currentThread.type)
                    router.push(`/circles/${circleId}/notifications/`)
                  }}
                />
              ) : undefined}
            </HStack>
            <Text>作成者：{currentThread.user.name}</Text>
          </VStack>
        </CardHeader>
        <CardBody flexGrow={1} minH="sm">
          {currentThread.comments.map((comment) => (
            <Card key={comment.id} w="full" variant="outline">
              <CardBody flexDir="row" justifyContent="space-between">
                <HStack>
                  <Avatar
                    src={comment.user.profileImageUrl || ""}
                    as={Link}
                    href={`/user/${comment.user.id}`}
                  />
                  <VStack>
                    <Text>{comment.user.name}</Text>
                    <Text as="pre" textWrap="wrap">
                      {comment.content}
                    </Text>
                  </VStack>
                </HStack>
                <Text>{parseFullDate(comment.createdAt)}</Text>
              </CardBody>
            </Card>
          ))}
        </CardBody>
        <CardFooter
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          alignItems="start"
        >
          <FormControl
            isInvalid={!!errors.content}
            errorMessage={errors.content?.message}
          >
            <Textarea
              {...register("content")}
              autosize
              placeholder="メッセージを入力"
            />
          </FormControl>
          <IconButton
            type="submit"
            loading={isSubmitting}
            variant="ghost"
            icon={<TriangleIcon transform="rotate(90deg)" fill="black" />}
          />
        </CardFooter>
      </Card>
    </>
  )
}
