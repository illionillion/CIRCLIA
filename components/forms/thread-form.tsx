"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { FC } from "@yamada-ui/react"
import {
  Button,
  Center,
  ErrorMessage,
  FormControl,
  Heading,
  Input,
  Label,
  Snacks,
  Spacer,
  Textarea,
  useBoolean,
  useSnacks,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { submitThread, submitThreadUpdate } from "@/actions/circle/thread"
import type { getThreadById } from "@/data/thread"
import { ThreadFormSchema } from "@/schema/topic"
import type { ThreadFormInput } from "@/schema/topic"

interface ThreadFormProps {
  mode: "create" | "edit"
  userId: string
  circleId: string
  thread?: Awaited<ReturnType<typeof getThreadById>>
}

export const ThreadForm: FC<ThreadFormProps> = ({
  circleId,
  mode,
  userId,
  thread,
}) => {
  const [isLoading, { on: start, off: end }] = useBoolean()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ThreadFormInput>({
    resolver: zodResolver(ThreadFormSchema),
    defaultValues: {
      title: thread?.title,
      content: thread?.content || undefined,
    },
  })
  const router = useRouter()
  const { snack, snacks } = useSnacks()

  const onSubmit = async (data: ThreadFormInput) => {
    start()
    try {
      const result =
        mode === "create"
          ? await submitThread(data, userId, circleId)
          : await submitThreadUpdate(data, thread?.id || "", circleId)
      if (result.success) {
        // スレッド作成が成功した場合、サークル詳細の掲示板タブにリダイレクト
        router.push(`/circles/${circleId}/notifications`)
      } else {
        snack({ title: `エラー: ${result.error}`, status: "error" })
        end()
      }
    } catch (error) {
      console.error("スレッド作成エラー:", error)
      snack({ title: `予期しないエラーが発生しました。`, status: "error" })
      end()
    }
  }

  return (
    <VStack
      w="full"
      h={{ base: "full", sm: "fit-content" }}
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      p="md"
    >
      <VStack p="md" maxW="5xl" m="auto" gap="lg" flexGrow={1}>
        <Heading>スレッド</Heading>
        <FormControl
          display="flex"
          flexDirection={{ base: "row", md: "column" }}
          gap={{ base: "2xl", md: "md" }}
          maxW="2xl"
          isInvalid={!!errors.title}
        >
          <Label flexGrow={1} isRequired>
            タイトル
          </Label>
          <VStack w="auto">
            <Input
              type="text"
              w={{ base: "md", md: "full" }}
              placeholder="例）やってみたいこと募集"
              {...register("title")}
            />
            {errors.title ? (
              <ErrorMessage mt={0}>{errors.title.message}</ErrorMessage>
            ) : (
              <>
                <Spacer />
                <Spacer />
              </>
            )}
          </VStack>
        </FormControl>
        <FormControl
          display="flex"
          flexDirection={{ base: "row", md: "column" }}
          gap={{ base: "2xl", md: "md" }}
          maxW="2xl"
          isInvalid={!!errors.content}
        >
          <Label flexGrow={1}>説明</Label>
          <VStack w="auto">
            <Textarea
              w={{ base: "md", md: "full" }}
              placeholder="例）今後の活動でやってみたいことを募集します"
              autosize
              {...register("content")}
            />
            {errors.content ? (
              <ErrorMessage mt={0}>{errors.content.message}</ErrorMessage>
            ) : (
              <>
                <Spacer />
                <Spacer />
              </>
            )}
          </VStack>
        </FormControl>
        <Snacks snacks={snacks} />
        <Center gap="md" justifyContent="end">
          <Button
            colorScheme="riverBlue"
            as={Link}
            href={`/circles/${circleId}/notifications`}
          >
            キャンセル
          </Button>
          <Button colorScheme="riverBlue" type="submit" loading={isLoading}>
            {mode === "create" ? "作成" : "更新"}
          </Button>
        </Center>
      </VStack>
    </VStack>
  )
}
