"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { CameraIcon, FilePenLineIcon, TrashIcon } from "@yamada-ui/lucide"
import {
  Avatar,
  Button,
  Center,
  ErrorMessage,
  FileButton,
  FormControl,
  Heading,
  HStack,
  Label,
  Loading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Snacks,
  Text,
  useBoolean,
  useOS,
  useSafeLayoutEffect,
  useSnacks,
  VStack,
  type FC,
} from "@yamada-ui/react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { updateUserAction, type getUserById } from "@/actions/user/user"
import {
  BackUserProfileSchema,
  FrontUserProfileSchema,
  UserIconSchema,
} from "@/schema/user"
import type { FrontUserProfileForm } from "@/schema/user"
// import MDEditor from '@uiw/react-md-editor';

interface ProfileForm {
  user: Awaited<ReturnType<typeof getUserById>>
}

export const ProfileForm: FC<ProfileForm> = ({ user }) => {
  const [imagePreview, setImagePreview] = useState<string>(
    user?.profileImageUrl || "",
  )
  const [isLoading, { on: start, off: end }] = useBoolean()
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FrontUserProfileForm>({
    resolver: zodResolver(FrontUserProfileSchema),
    defaultValues: {
      profileText: user?.profileText || "",
      profileImageUrl: user?.profileImageUrl || "",
    },
  })
  const { snack, snacks } = useSnacks()
  const router = useRouter()
  const os = useOS()
  const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
    ssr: false,
    loading: () => (
      <Center w="full" h="full">
        <Loading />
      </Center>
    ),
  })
  const onSubmit = async (data: FrontUserProfileForm) => {
    start()
    if (watch("profileImageUrl") && !data.profileImageUrl) {
      data.profileImageUrl = watch("profileImageUrl")
    }
    const {
      success,
      error,
      data: parseData,
    } = BackUserProfileSchema.safeParse(data)

    if (!success) {
      // エラーメッセージを表示
      console.error("Validation failed:", error)
      end()
      return
    }

    const result = await updateUserAction(parseData)
    if (result.success) {
      snack({ title: "プロフィールの更新に成功しました", status: "success" })
      router.push(`/user/${user?.id}`)
    } else {
      snack({
        title: result.error || "プロフィールの更新に失敗しました",
        status: "error",
      })
      end()
    }
  }

  // watchでimagePathを監視
  const image = watch("profileImageUrl") as unknown as FileList | null

  const updateImage = async () => {
    const { success, data } = await UserIconSchema.safeParseAsync(image)
    if (success && data) {
      setImagePreview(data)
    }
  }

  const onResetImage = () => {
    setValue("profileImageUrl", null)
    setImagePreview("")
  }

  // 画像選択時にプレビューを更新
  useSafeLayoutEffect(() => {
    updateImage()
  }, [image])

  return (
    <VStack
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      gap="md"
      w="full"
      maxW="3xl"
      h="fit-content"
      m="auto"
      p="md"
    >
      <HStack w="full" m="auto" flexDir={{ base: "row", sm: "column" }}>
        <FormControl
          isInvalid={!!errors.profileImageUrl}
          errorMessage={
            errors.profileImageUrl ? errors.profileImageUrl.message : undefined
          }
          w="full"
          boxSize={{ base: "2xs", md: "24" }}
          position="relative"
          as={Center}
        >
          <Controller
            name="profileImageUrl"
            control={control}
            render={({ field: { ref, name, onChange, onBlur } }) => (
              <>
                <Avatar
                  src={imagePreview}
                  boxSize={{ base: "2xs", md: "24" }}
                />
                <Menu>
                  <MenuButton
                    as={Button}
                    startIcon={<FilePenLineIcon fontSize="2xl" />}
                    colorScheme="riverBlue"
                    fullRounded
                    position="absolute"
                    bottom={0}
                    right={0}
                    size="sm"
                  >
                    編集
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      as={FileButton}
                      variant="unstyled"
                      {...{ ref, name, onChange, onBlur }}
                      accept="image/*"
                      onChange={onChange}
                      startIcon={<CameraIcon fontSize="xl" color="gray" />}
                      justifyContent="start"
                      size="sm"
                    >
                      ファイルを選択
                    </MenuItem>
                    <MenuItem
                      color="red"
                      as={Button}
                      variant="unstyled"
                      justifyContent="start"
                      size="sm"
                      startIcon={<TrashIcon fontSize="xl" color="danger" />}
                      onClick={onResetImage}
                    >
                      削除
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            )}
          />
        </FormControl>
        <VStack maxW="xl">
          <Heading fontSize="2xl">{user?.name}</Heading>
          <HStack justifyContent="space-between" flexWrap="wrap">
            <Text>{user?.studentNumber}</Text>
          </HStack>
        </VStack>
      </HStack>
      <FormControl
        gap={{ base: "2xl", md: "md" }}
        isInvalid={!!errors.profileText}
        m="auto"
      >
        <Label flexGrow={1}>自己紹介</Label>
        <VStack w="auto">
          <Controller
            name="profileText"
            control={control}
            render={({ field: { value, onChange } }) => (
              <MDEditor
                value={value}
                onChange={onChange}
                height={300}
                data-color-mode="light"
                preview={os === "ios" || os === "android" ? "edit" : "live"}
                previewOptions={{
                  wrapperElement: {
                    "data-color-mode": "light",
                  },
                }}
              />
            )}
          />
          {errors.profileText ? (
            <ErrorMessage mt={0}>{errors.profileText.message}</ErrorMessage>
          ) : undefined}
        </VStack>
      </FormControl>
      <Snacks snacks={snacks} />
      <Center gap="md" justifyContent="end">
        <Button
          as={Link}
          href={`/user/${user?.id || ""}`}
          colorScheme="riverBlue"
        >
          キャンセル
        </Button>
        <Button type="submit" loading={isLoading} colorScheme="riverBlue">
          更新
        </Button>
      </Center>
    </VStack>
  )
}
