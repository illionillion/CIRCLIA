"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  TrashIcon,
} from "@yamada-ui/lucide"
import {
  Card,
  CardBody,
  CardHeader,
  Center,
  FileButton,
  IconButton,
  Input,
  Modal,
  ModalHeader,
  Text,
  Textarea,
  Tooltip,
  useSafeLayoutEffect,
  VStack,
  ModalBody,
  HStack,
  ButtonGroup,
  Button,
  ModalFooter,
  useNotice,
  useOS,
  useBoolean,
} from "@yamada-ui/react"
import type { FC } from "react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { updateWelcomeCard } from "@/actions/circle/welcome-card"
import type { FrontWelcomeCard } from "@/schema/welcome"
import { FrontWelcomeCardSchema } from "@/schema/welcome"

interface WelcomeCardFormProps {
  cards: FrontWelcomeCard[]
  open: boolean
  onClose: () => void
  onUpdateCards: (cards: FrontWelcomeCard[]) => void
  circleId: string
  userId: string
}

const placeholders = [
  {
    frontTitle: "何をするサークル？",
    backTitle: "楽しくプログラミングするサークル!",
    backDescription:
      "みんなで集まってプログラムをしています!\n\n★勉強するだけでなく、ハッカソンや個人開発などで実践を積み重ね切磋琢磨しています。\n\n★初心者でも一緒に成長していける環境なのでぜひ一緒に取り組みましょう。\n\nみたいな例文ほしいです!\n・カード1つに収まる文章で入力量決められるといいな\n画像ファイルもアルバム詳細みたい",
  },
  {
    frontTitle: "活動頻度は？",
    backTitle: "月１回、活動しています！",
    backDescription:
      "学内、学外・・・\n\n関係なく、集まったメンバーで\nその日のテーマを決めて、\n\nプログラムを作成しています♪",
  },
  {
    frontTitle: "どんな雰囲気？",
    backTitle: "わいわい楽しむ雰囲気！",
    backDescription:
      "「あれがいいかな」「このほうがいいんじゃない？」\n\nと、みんなで話し合いながら作業を進めています！",
  },
]

export const WelcomeCardForm: FC<WelcomeCardFormProps> = ({
  cards,
  open,
  onClose,
  onUpdateCards,
  circleId,
  userId,
}) => {
  const notice = useNotice()
  const os = useOS()
  const [draftCards, setDraftCards] = useState<FrontWelcomeCard[]>(cards)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [currentCard, setCurrentCard] = useState<number>(0)
  const { register, handleSubmit, reset, watch, control, setValue } =
    useForm<FrontWelcomeCard>({
      resolver: zodResolver(FrontWelcomeCardSchema),
      defaultValues: draftCards[currentCard],
    })

  const watchCards = watch()
  const [loading, { on: start, off: end }] = useBoolean()

  const onSubmit = async (data: FrontWelcomeCard) => {
    start()
    const updatedCards = await Promise.all(
      draftCards.map(async (card, index) => {
        if (index === currentCard) {
          return {
            ...data,
            frontImage:
              typeof card.frontImage === "string" && card.frontImage !== ""
                ? card.frontImage
                : data.frontImage || null,
          }
        }
        const result = await FrontWelcomeCardSchema.parseAsync(card)
        return {
          frontTitle: result.frontTitle || "",
          backTitle: result.backTitle || "",
          backDescription: result.backDescription || "",
          frontImage:
            typeof card.frontImage === "string" && card.frontImage !== ""
              ? card.frontImage
              : result.frontImage || null,
        }
      }),
    )

    // サーバーアクションを呼び出す
    const response = await updateWelcomeCard(circleId, userId, updatedCards)

    if (response.success) {
      onUpdateCards(updatedCards)
      onClose()
      notice({
        title: response.message,
        status: "success",
        placement: "bottom",
      })
    } else {
      notice({
        title: response.message,
        status: "error",
        placement: "bottom",
      })
    }

    end()
  }

  const handlePrevCard = () => {
    if (currentCard > 0) {
      setCurrentCard((prev) => prev - 1)
      setDraftCards((prev) => {
        const newCards = [...prev]
        newCards[currentCard] = watchCards
        return newCards
      })
    }
  }

  const handleNextCard = () => {
    if (currentCard < 2) {
      setCurrentCard((prev) => prev + 1)
      setDraftCards((prev) => {
        const newCards = [...prev]
        newCards[currentCard] = watchCards
        return newCards
      })
    }
  }

  const onResetImage = () => {
    setImagePreview("")
    setValue("frontImage", null)
    setDraftCards((prev) => {
      const newCards = [...prev]
      newCards[currentCard].frontImage = null
      return newCards
    })
  }

  // モーダルが開くときと、カード切り替え時のみ実行されるように修正
  useSafeLayoutEffect(() => {
    reset(draftCards[currentCard])
    // カードの画像が存在する場合はプレビューを設定
    if (typeof draftCards[currentCard].frontImage === "string") {
      setImagePreview(draftCards[currentCard].frontImage)
    } else {
      setImagePreview("")
    }
  }, [currentCard]) // cardsとresetを依存配列から削除

  // watchでimagePathを監視
  const imagePath = watch("frontImage") as unknown as FileList | null

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
    <Modal
      open={open}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      withCloseButton={false}
    >
      <ModalHeader justifyContent="space-between">
        <Text>カード{currentCard + 1}/3</Text>
        <ButtonGroup attached>
          <IconButton
            icon={<ChevronLeftIcon />}
            colorScheme="riverBlue"
            onClick={handlePrevCard}
          />
          <IconButton
            icon={<ChevronRightIcon />}
            colorScheme="riverBlue"
            onClick={handleNextCard}
          />
        </ButtonGroup>
      </ModalHeader>
      <ModalBody>
        <HStack
          w="full"
          h="full"
          alignItems="flex-start"
          mb="xs"
          flexDir={{ base: "row", md: "column" }}
        >
          <VStack w="full" h="full" gap="md">
            <Text fontSize="md">表面</Text>
            <Card minH={{ base: "sm", md: "2xs" }}>
              <CardHeader>
                <Input
                  placeholder={placeholders[currentCard].frontTitle}
                  {...register("frontTitle")}
                />
              </CardHeader>
              <CardBody>
                <Center
                  w="full"
                  h="full"
                  flexGrow={1}
                  {...(imagePreview
                    ? {
                        backgroundImage: imagePreview,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }
                    : {
                        backgroundColor: "gray.100",
                      })}
                >
                  <Controller
                    name="frontImage"
                    control={control}
                    render={({ field: { ref, name, onBlur, onChange } }) => (
                      <HStack w="full" justifyContent="center">
                        <Tooltip
                          label="画像を選択"
                          placement="bottom"
                          disabled={os === "ios" || os === "macos"}
                        >
                          <FileButton
                            {...{ ref, name, onBlur }}
                            w="16"
                            h="16"
                            as={IconButton}
                            accept="image/*"
                            onChange={onChange}
                            icon={<CameraIcon fontSize="5xl" color="gray" />}
                            fullRounded
                            variant="outline"
                          />
                        </Tooltip>

                        <Tooltip
                          label="画像を削除"
                          placement="bottom"
                          disabled={os === "ios" || os === "macos"}
                        >
                          <IconButton
                            w="16"
                            h="16"
                            colorScheme="danger"
                            variant="outline"
                            onClick={onResetImage}
                            icon={<TrashIcon fontSize="5xl" />}
                            fullRounded
                          />
                        </Tooltip>
                      </HStack>
                    )}
                  />
                </Center>
              </CardBody>
            </Card>
          </VStack>
          <VStack w="full" h="full" gap="md">
            <Text fontSize="md">裏面</Text>
            <Card minH={{ base: "sm", md: "2xs" }}>
              <CardHeader>
                <Input
                  placeholder={placeholders[currentCard].backTitle}
                  {...register("backTitle")}
                />
              </CardHeader>
              <CardBody>
                <Textarea
                  w="full"
                  h="full"
                  flexGrow={1}
                  placeholder={placeholders[currentCard].backDescription}
                  {...register("backDescription")}
                />
              </CardBody>
            </Card>
          </VStack>
        </HStack>
      </ModalBody>
      <ModalFooter justifyContent="space-between">
        <HStack gap="xs">
          <CircleHelpIcon />
          <Text fontSize="xs" color="danger">
            カードを3つ全て入力するとウェルカムページで反映されます。
          </Text>
        </HStack>
        <ButtonGroup attached>
          <Button colorScheme="riverBlue" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            colorScheme="riverBlue"
            onClick={handleSubmit(onSubmit)}
            loading={loading}
          >
            更新
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  )
}
