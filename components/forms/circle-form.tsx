"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Player } from "@lottiefiles/react-lottie-player"
import { CameraIcon, TrashIcon } from "@yamada-ui/lucide"
import type { AutocompleteItem, FC } from "@yamada-ui/react"
import {
  Button,
  Center,
  ErrorMessage,
  FileButton,
  FormControl,
  Heading,
  HStack,
  IconButton,
  Input,
  Label,
  MultiAutocomplete,
  Spacer,
  Textarea,
  Tooltip,
  useBoolean,
  useDisclosure,
  useSafeLayoutEffect,
  VStack,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
} from "@yamada-ui/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { CreateCircle } from "@/actions/circle/create-circle"
import { removeCircle } from "@/actions/circle/delete-circle"
import type { getCircleById } from "@/actions/circle/fetch-circle"
import { UpdateCircle } from "@/actions/circle/update-circle"
import RocketAnimation from "@/public/lottie/rocket.json"
import { BackCircleSchema, FrontCircleSchema } from "@/schema/circle"
import type { FrontCircleForm } from "@/schema/circle"

interface CircleFormProps {
  circle?: Awaited<ReturnType<typeof getCircleById>>
  userId: string
  mode: "create" | "edit"
  instructors: AutocompleteItem[]
}

const DeleteCircleButton: FC<{ circleId: string; userId: string }> = ({
  circleId,
  userId,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isDone, { on: doneOn, off: doneOff }] = useBoolean()
  const router = useRouter()
  const handleDelete = async () => {
    try {
      doneOff()
      // 実際の削除処理
      const { message, success } = await removeCircle(circleId, userId)
      if (success) {
        doneOn()
      } else {
        console.error(message)
      }
      // 必要であれば、削除後のリダイレクトや他のアクションを追加
    } catch (error) {
      console.error("削除中にエラーが発生しました:", error)
    }
  }

  return (
    <>
      <Center>
        <Button colorScheme="red" onClick={onOpen}>
          サークルを削除する
        </Button>
      </Center>

      {/* 削除確認モーダル  */}
      <Modal
        isOpen={isOpen}
        onClose={isDone ? () => router.push("/circles") : onClose}
      >
        <ModalOverlay />
        {isDone ? (
          <>
            <ModalHeader>削除しました</ModalHeader>
            <ModalBody>
              <Center w="full">
                <Player
                  autoplay
                  loop
                  src={RocketAnimation}
                  style={{
                    height: "250px",
                    width: "250px",
                    pointerEvents: "none",
                  }}
                />
              </Center>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => router.push("/circles")}>閉じる</Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader>サークルの削除確認</ModalHeader>
            <ModalBody>
              <Text>
                本当にこのサークルを削除しますか？この操作は元に戻せません。
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>
                いいえ
              </Button>
              <Button colorScheme="red" onClick={handleDelete}>
                削除
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  )
}

export const CircleForm: FC<CircleFormProps> = ({
  circle,
  userId,
  mode,
  instructors,
}) => {
  const user = circle?.members?.find((member) => member.id === userId)
  const [isLoading, { on: start, off: end }] = useBoolean()
  const [imagePreview, setImagePreview] = useState<string>(
    circle?.imagePath || "",
  )
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FrontCircleForm>({
    resolver: zodResolver(FrontCircleSchema),
    defaultValues: {
      name: circle?.name,
      description: circle?.description,
      location: circle?.location,
      activityDay: circle?.activityDay || "",
      imagePath: circle?.imagePath,
      tags: circle?.tags?.map((tag) => tag.tagName),
      instructors:
        circle?.instructors?.map((instructor) => instructor.id) || [],
    },
  })

  const onSubmit = async (values: FrontCircleForm) => {
    start()
    if (watch("imagePath") && !values.imagePath) {
      values.imagePath = watch("imagePath")
    }
    const {
      success,
      error,
      data: parseData,
    } = BackCircleSchema.safeParse(values)

    if (!success) {
      // エラーメッセージを表示
      console.error("Validation failed:", error)
      return
    }
    if (!userId) {
      console.error("ユーザーが存在しません。")
      return
    }
    try {
      if (mode === "create") {
        // サークル作成処理
        const { success, error, result } = await CreateCircle(parseData, userId)

        // サークル作成が成功した場合
        if (success) {
          router.push(`/circles/${result?.circleId}`)
        } else {
          // サークル作成に失敗した場合の処理
          console.error("サークルの作成に失敗しました。", error)
        }
      } else if (mode === "edit") {
        // 編集
        const { success, error, result } = await UpdateCircle(
          parseData,
          circle?.id || "",
          userId,
        )

        // サークル更新が成功した場合
        if (success) {
          router.push(`/circles/${result?.circleId}`)
        } else {
          // サークル更新に失敗した場合の処理
          console.error("サークルの更新に失敗しました。", error)
        }
      }
    } catch (error) {
      console.error("Error during circle creation:", error)
    } finally {
      end()
    }
  }

  const onResetImage = () => {
    setValue("imagePath", null)
    setImagePreview("")
  }

  // watchでimagePathを監視
  const imagePath = watch("imagePath") as unknown as FileList | null

  // 画像選択時にプレビューを更新
  useSafeLayoutEffect(() => {
    if (typeof imagePath === "string") return
    if (imagePath && imagePath.length > 0) {
      const file = imagePath[0]
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview("")
    }
    // クリーンアップ関数でURLを解放
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePath])

  return (
    <VStack
      gap={0}
      w="full"
      h="full"
      as="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Center
        w="full"
        h="40"
        minH="40"
        {...(imagePreview
          ? {
              backgroundImage: imagePreview,
              backgroundSize: "cover",
            }
          : {
              backgroundColor: "gray.100",
            })}
      >
        <FormControl
          isInvalid={!!errors.imagePath}
          errorMessage={errors.imagePath ? errors.imagePath.message : undefined}
        >
          <Controller
            name="imagePath"
            control={control}
            render={({ field: { ref, name, onChange, onBlur } }) => (
              <HStack w="full" justifyContent="center">
                <Tooltip label="画像を選択" placement="bottom">
                  <FileButton
                    {...{ ref, name, onChange, onBlur }}
                    w="16"
                    h="16"
                    as={IconButton}
                    accept="image/*"
                    bg="gray.100"
                    onChange={onChange}
                    icon={<CameraIcon fontSize="5xl" color="gray" />}
                    isRounded
                  />
                </Tooltip>
                <Tooltip label="画像を削除" placement="bottom">
                  <IconButton
                    w="16"
                    h="16"
                    colorScheme="danger"
                    variant="outline"
                    onClick={onResetImage}
                    icon={<TrashIcon fontSize="5xl" />}
                    isRounded
                  />
                </Tooltip>
              </HStack>
            )}
          />
        </FormControl>
      </Center>
      <VStack p="md" maxW="5xl" m="auto" gap="lg" flexGrow={1}>
        <Heading as="h1" size="lg">
          サークル{mode === "create" ? "作成" : "編集"}
        </Heading>
        <VStack px="md">
          <FormControl
            display="flex"
            flexDirection={{ base: "row", md: "column" }}
            gap={{ base: "2xl", md: "md" }}
            maxW="2xl"
            isInvalid={!!errors.name}
          >
            <Label flexGrow={1} isRequired>
              サークル名
            </Label>
            <VStack w="auto">
              <Input
                type="text"
                w={{ base: "md", md: "full" }}
                placeholder="サークル名を入力"
                {...register("name")}
              />
              {errors.name ? (
                <ErrorMessage mt={0}>{errors.name.message}</ErrorMessage>
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
            isInvalid={!!errors.description}
          >
            <Label flexGrow={1} isRequired>
              説明
            </Label>
            <VStack w="auto">
              <Textarea
                w={{ base: "md", md: "full" }}
                placeholder="説明を入力"
                autosize
                {...register("description")}
              />
              {errors.description ? (
                <ErrorMessage mt={0}>{errors.description.message}</ErrorMessage>
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
            isInvalid={!!errors.instructors}
          >
            <Controller
              name="instructors"
              control={control}
              render={({ field }) => (
                <>
                  <Label flexGrow={1} isRequired>
                    講師
                  </Label>
                  <VStack w="auto">
                    <MultiAutocomplete
                      w={{ base: "md", md: "full" }}
                      placeholder="講師を選択"
                      {...field}
                      items={instructors}
                    />
                    {errors.instructors ? (
                      <ErrorMessage mt={0}>
                        {errors.instructors.message}
                      </ErrorMessage>
                    ) : (
                      <>
                        <Spacer />
                        <Spacer />
                      </>
                    )}
                  </VStack>
                </>
              )}
            />
          </FormControl>
          <FormControl
            display="flex"
            flexDirection={{ base: "row", md: "column" }}
            gap={{ base: "2xl", md: "md" }}
            maxW="2xl"
          >
            <Label flexGrow={1}>タグ</Label>
            <VStack w="auto">
              <Input
                type="text"
                w={{ base: "md", md: "full" }}
                placeholder="タグを入力（カンマ区切り）"
                {...register("tags")}
              />
              <Spacer />
              <Spacer />
            </VStack>
          </FormControl>
          <FormControl
            display="flex"
            flexDirection={{ base: "row", md: "column" }}
            gap={{ base: "2xl", md: "md" }}
            maxW="2xl"
            isInvalid={!!errors.location}
          >
            <Label flexGrow={1} isRequired>
              活動場所
            </Label>
            <VStack w="auto">
              <Input
                {...register("location")}
                type="text"
                w={{ base: "md", md: "full" }}
                placeholder="活動場所を入力"
              />
              {errors.location ? (
                <ErrorMessage mt={0}>{errors.location.message}</ErrorMessage>
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
            isInvalid={!!errors.activityDay}
          >
            <Label flexGrow={1} isRequired>
              活動日
            </Label>
            <VStack w="auto">
              <Input
                type="text"
                w={{ base: "md", md: "full" }}
                placeholder="活動日を入力"
                {...register("activityDay")}
              />
              {errors.activityDay ? (
                <ErrorMessage mt={0}>{errors.activityDay.message}</ErrorMessage>
              ) : (
                <>
                  <Spacer />
                  <Spacer />
                </>
              )}
            </VStack>
          </FormControl>
          <Center gap="md" justifyContent="end">
            <Button as={Link} href={`/circles/${circle?.id || ""}`} colorScheme="riverBlue">
              キャンセル
            </Button>
            <Button type="submit" isLoading={isLoading} colorScheme="riverBlue">
              {mode === "create" ? "作成" : "更新"}
            </Button>
          </Center>

          {mode === "edit" && circle?.id && user?.role.id === 0 ? (
            <DeleteCircleButton circleId={circle.id} userId={userId || ""} />
          ) : undefined}
        </VStack>
      </VStack>
    </VStack>
  )
}
