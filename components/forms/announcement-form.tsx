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
import { submitAnnouncement } from "@/actions/circle/announcement"
import { AnnouncementFormSchema } from "@/schema/topic"
import type { AnnouncementFormInput } from "@/schema/topic"

interface AnnouncementFormProps {
  mode: "create" | "edit"
  userId: string
  circleId: string
}

export const AnnouncementForm: FC<AnnouncementFormProps> = ({
  circleId,
  mode,
  userId,
}) => {
  const [isLoading, { on: start, off: end }] = useBoolean()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AnnouncementFormInput>({
    resolver: zodResolver(AnnouncementFormSchema),
  })
  const router = useRouter()
  const { snack, snacks } = useSnacks()

  const onSubmit = async (data: AnnouncementFormInput) => {
    start()

    try {
      const result = await submitAnnouncement(data, userId, circleId)
      if (result.success) {
        // スレッド作成が成功した場合、通知ページにリダイレクト
        router.push(`/circles/${circleId}/notifications`)
      } else {
        snack({ title: `エラー: ${result.error}`, status: "error" })
      }
    } catch (error) {
      console.error("スレッド作成エラー:", error)
      snack({ title: `予期しないエラーが発生しました。`, status: "error" })
    } finally {
      end()
    }
  }

  return (
    <VStack
      w="full"
      h="full"
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
          isInvalid={!!errors.title}
        >
          <Label flexGrow={1} isRequired>
            タイトル
          </Label>
          <VStack w="auto">
            <Input
              type="text"
              w={{ base: "md", md: "full" }}
              placeholder="タイトルを入力"
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
          <Label flexGrow={1} isRequired>
            内容
          </Label>
          <VStack w="auto">
            <Textarea
              w={{ base: "md", md: "full" }}
              placeholder="詳細を入力"
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
            <Switch isChecked={value} {...rest}>
              重要なお知らせ
            </Switch>
          )}
        />

        <Snacks snacks={snacks} />
        <Center gap="md" justifyContent="end">
          <Button as={Link} href={`/circles/${circleId}/notifications`}>
            キャンセル
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {mode === "create" ? "作成" : "更新"}
          </Button>
        </Center>
      </VStack>
    </VStack>
  )
}
