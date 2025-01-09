"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dropzone, IMAGE_ACCEPT_TYPE } from "@yamada-ui/dropzone"
import { ImageIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Button,
  Center,
  ErrorMessage,
  FileButton,
  FormControl,
  Heading,
  Input,
  Label,
  Snacks,
  Text,
  Textarea,
  useBoolean,
  useSnacks,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { AlbumPreviewGrid } from "../data-display/album-preview-grid"
import { handleCreateAlbum, handleUpdateAlbum } from "@/actions/circle/album"
import type { getAlbumById } from "@/data/album"
import { BackAlbumSchema, FrontAlbumFormSchema } from "@/schema/album"
import type { FrontAlbumForm } from "@/schema/album"
import { getBase64Image, handleImageValidation } from "@/utils/file"

interface AlbumFormProps {
  circleId: string
  userId: string
  mode: "create" | "edit"
  album?: Awaited<ReturnType<typeof getAlbumById>>
}

export const AlbumForm: FC<AlbumFormProps> = ({ circleId, mode, album }) => {
  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FrontAlbumForm>({
    resolver: zodResolver(FrontAlbumFormSchema),
    defaultValues: {
      title: album?.title,
      description: album?.description,
      images: album?.images ? album.images.map((image) => image.imageUrl) : [],
    },
    mode: "all",
  })
  const [isLoading, { on: start, off: end }] = useBoolean()
  const { snack, snacks } = useSnacks()
  const router = useRouter()

  const onSubmit = async (data: FrontAlbumForm) => {
    start()
    const { title, description, images } = data

    // 画像を Base64 に変換
    const base64Images = await Promise.all(
      images.map((image) =>
        typeof image === "string" ? image : getBase64Image(image),
      ),
    )

    const {
      success,
      error,
      data: parseData,
    } = BackAlbumSchema.safeParse({
      title,
      description,
      images: base64Images,
    })

    if (!success) {
      snack({ title: error.message, status: "error" })
      end()
      return
    }

    const result =
      mode === "create"
        ? await handleCreateAlbum(parseData, circleId)
        : await handleUpdateAlbum(parseData, circleId, album?.id || "")

    if (result.success) {
      router.push(`/circles/${circleId}/album/`)
    } else {
      snack({ title: result.error, status: "error" })
      end()
    }
  }

  return (
    <VStack
      w="full"
      h="fit-content"
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      p="md"
    >
      <Heading>アルバム作成</Heading>
      <FormControl isInvalid={!!errors.images}>
        <Controller
          name="images"
          control={control}
          render={({ field: { onChange, value = [], ref, ...rest } }) => (
            <>
              <Label isRequired>画像を選択</Label>
              <VStack display={{ base: "none", md: "flex" }}>
                <FileButton
                  {...{ ref, ...rest }}
                  startIcon={<ImageIcon />}
                  alignItems="center"
                  multiple
                  accept="image/*"
                  onChange={async (newFiles) => {
                    if (!newFiles) return
                    const { valid, error } = await handleImageValidation(
                      value,
                      newFiles,
                    )
                    if (valid) {
                      onChange(valid)
                      clearErrors("images")
                    } else {
                      setError("images", { type: "manual", message: error })
                    }
                  }}
                >
                  選択
                </FileButton>
                {value.length > 0 ? (
                  <AlbumPreviewGrid
                    images={value}
                    onRemove={(index) =>
                      onChange(value.filter((_, i) => i !== index))
                    }
                  />
                ) : undefined}
              </VStack>
              <Dropzone
                display={{ base: "flex", md: "none" }}
                multiple
                accept={IMAGE_ACCEPT_TYPE}
                size="full"
                minH="xs"
                onDrop={async (acceptedFiles, fileRejections) => {
                  const files = [
                    ...acceptedFiles,
                    ...fileRejections.map(
                      (fileRejection) => fileRejection.file,
                    ),
                  ]
                  const { valid, error } = await handleImageValidation(
                    value,
                    files,
                  )
                  if (valid) {
                    onChange(valid)
                    clearErrors("images")
                  } else {
                    setError("images", { type: "manual", message: error })
                  }
                }}
                ref={ref}
                overflow="auto"
                maxFiles={10}
                {...rest}
              >
                {value.length > 0 ? (
                  <AlbumPreviewGrid
                    images={value}
                    onRemove={(index) =>
                      onChange(value.filter((_, i) => i !== index))
                    }
                  />
                ) : (
                  <Text>画像をドラッグ&ドロップ</Text>
                )}
              </Dropzone>
              {errors.images && (
                <ErrorMessage mt={0}>{errors.images.message}</ErrorMessage>
              )}
            </>
          )}
        />
      </FormControl>
      <FormControl isInvalid={!!errors.title}>
        <Label isRequired>タイトル</Label>
        <Input
          type="text"
          placeholder="例)何でもない日の幸せ"
          {...register("title")}
        />
        {errors.title && (
          <ErrorMessage mt={0}>{errors.title.message}</ErrorMessage>
        )}
      </FormControl>
      <FormControl isInvalid={!!errors.description}>
        <Label>内容</Label>
        <Textarea
          placeholder="例)特別なことは何もないけれど、みんなで過ごす日常が一番の宝物です。&#13;&#10;ちょっとした会話、何気ない笑顔が心に残ります。"
          autosize
          minH="2xs"
          {...register("description")}
        />
        {errors.description && (
          <ErrorMessage mt={0}>{errors.description.message}</ErrorMessage>
        )}
      </FormControl>
      <Snacks snacks={snacks} />
      <Center
        gap="md"
        justifyContent="end"
        position={{ sm: "fixed" }}
        bottom={{ sm: 20 }}
        right={{ sm: 5 }}
      >
        <Button
          colorScheme="riverBlue"
          as={Link}
          href={`/circles/${circleId}/album`}
        >
          キャンセル
        </Button>
        <Button colorScheme="riverBlue" type="submit" loading={isLoading}>
          {mode === "create" ? "作成" : "更新"}
        </Button>
      </Center>
    </VStack>
  )
}
