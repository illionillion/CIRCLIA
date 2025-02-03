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
  Switch,
  Textarea,
  useBoolean,
  useSnacks,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import {
  submitAnnouncement,
  submitAnnouncementUpdate,
} from "@/actions/circle/announcement"
import type { getAnnouncementById } from "@/data/announcement"
import { AnnouncementFormSchema } from "@/schema/topic"
import type { AnnouncementFormInput } from "@/schema/topic"

interface AnnouncementFormProps {
  mode: "create" | "edit"
  userId: string
  circleId: string
  announcement?: Awaited<ReturnType<typeof getAnnouncementById>>
}

export const AnnouncementForm: FC<AnnouncementFormProps> = ({
  circleId,
  mode,
  userId,
  announcement,
}) => {
  const [isLoading, { on: start, off: end }] = useBoolean()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AnnouncementFormInput>({
    resolver: zodResolver(AnnouncementFormSchema),
    defaultValues: {
      title: announcement?.title,
      content: announcement?.content || undefined,
      isImportant: announcement?.isImportant,
    },
  })
  const router = useRouter()
  const { snack, snacks } = useSnacks()

  const onSubmit = async (data: AnnouncementFormInput) => {
    start()

    try {
      const result =
        mode === "create"
          ? await submitAnnouncement(data, userId, circleId)
          : await submitAnnouncementUpdate(
              data,
              announcement?.id || "",
              circleId,
            )
      if (result.success) {
        // スレッド作成が成功した場合、サークル詳細の掲示板タブにリダイレクト
        router.push(`/circles/${circleId}/notifications`)
      } else {
        snack({ title: `エラー: ${result.error}`, status: "error" })
        end()
      }
    } catch (error) {
      console.error("スレッドエラー:", error)
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
        <Heading>お知らせ</Heading>
        <FormControl
          display="flex"
          flexDirection={{ base: "row", md: "column" }}
          gap={{ base: "2xl", md: "md" }}
          maxW="2xl"
          invalid={!!errors.title}
        >
          <Label flexGrow={1} required>
            タイトル
          </Label>
          <VStack w="auto">
            <Input
              type="text"
              w={{ base: "md", md: "full" }}
              placeholder="例）今月からの新メンバー"
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
          invalid={!!errors.content}
        >
          <Label flexGrow={1} required>
            内容
          </Label>
          <VStack w="auto">
            <Textarea
              w={{ base: "md", md: "full" }}
              placeholder="例）新しくR○○○の○○　○○が入会しました！"
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
        <Controller
          name="isImportant"
          control={control}
          render={({ field: { value, ...rest } }) => (
            <Switch checked={value} {...rest} colorScheme="riverBlue">
              重要なお知らせ
            </Switch>
          )}
        />

        <Snacks snacks={snacks} />
        <Center gap="md" justifyContent="end">
          <Button
            colorScheme="riverBlue"
            as={Link}
            href={`/circles/${circleId}/notifications`}
            transition="0.5s"
            _hover={{ transform: "scale(1.1)", transition: "0.5s" }}
          >
            キャンセル
          </Button>
          <Button
            colorScheme="riverBlue"
            type="submit"
            loading={isLoading}
            transition="0.5s"
            _hover={{ transform: "scale(1.1)", transition: "0.5s" }}
          >
            {mode === "create" ? "作成" : "更新"}
          </Button>
        </Center>
      </VStack>
    </VStack>
  )
}
