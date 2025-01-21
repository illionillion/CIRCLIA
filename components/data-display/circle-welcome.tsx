import { zodResolver } from "@hookform/resolvers/zod"
import {
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  SquarePenIcon,
} from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Center,
  Grid,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
  useNotice,
  useSafeLayoutEffect,
  VStack,
  FileButton,
} from "@yamada-ui/react"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { WelcomeCard } from "./welcome-card"
import { getBase64Image } from "@/utils/file"

interface CircleWelcomeProps {
  isAdmin?: boolean
}

// カードのスキーマを定義
const WelcomeCardSchema = z.object({
  frontTitle: z.string(),
  backTitle: z.string(),
  backDescription: z.string(),
}) //.brand("welcomeCard")

const FrontWelcomeCardSchema = WelcomeCardSchema.extend({
  frontImage: z
    .custom<FileList>()
    .optional() // 画像ファイルはオプション
    .refine(
      (file) =>
        typeof file === "string" ||
        !file ||
        file.length === 0 ||
        (file.length > 0 && file[0].type.startsWith("image/")),
      {
        message: "画像ファイルを選択してください",
      },
    )
    .transform(async (file) => {
      if (typeof file === "string" || !file || file.length === 0) {
        return null // 画像がない場合はnullを返す
      }
      const selectedFile = file[0]
      return await getBase64Image(selectedFile)
    }),
})

type WelcomeCard = z.infer<typeof WelcomeCardSchema>

type FrontWelcomeCard = z.infer<typeof FrontWelcomeCardSchema>

export const CircleWelcome: FC<CircleWelcomeProps> = ({ isAdmin }) => {
  const { open, onOpen, onClose } = useDisclosure()
  const [currentCard, setCurrentCard] = useState<number>(0)

  const notice = useNotice()

  const [cards, setCards] = useState<FrontWelcomeCard[]>([
    {
      frontTitle: "",
      frontImage: "",
      backTitle: "",
      backDescription: "",
    },
    {
      frontTitle: "",
      frontImage: "",
      backTitle: "",
      backDescription: "",
    },
    {
      frontTitle: "",
      frontImage: "",
      backTitle: "",
      backDescription: "",
    },
  ])
  const [draftCards, setDraftCards] = useState<FrontWelcomeCard[]>(cards)

  const { register, handleSubmit, reset, watch, control } =
    useForm<FrontWelcomeCard>({
      resolver: zodResolver(FrontWelcomeCardSchema),
      defaultValues: cards[currentCard],
    })

  const watchCards = watch()

  // onSubmitを簡略化（状態の更新は不要）
  const onSubmit = (data: FrontWelcomeCard) => {
    setCards((prev) => {
      const newCards = [...prev]
      newCards[currentCard] = data
      return newCards
    })
    // 送信の処理のみを行う
    notice({
      title: `カード${currentCard + 1}を更新しました`,
      status: "success",
      placement: "bottom",
    })
  }

  const [imagePreview, setImagePreview] = useState<string>("")

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

  const renderCardContent = (index: number) => {
    const card = cards[index]

    // fromコンテンツの生成
    const fromContent = (() => {
      // カードデータが完全に空の場合はデフォルト表示を返す
      if (!card.frontTitle && !card.frontImage) {
        return null
      }

      // 画像のみがある場合
      if (!card.frontTitle && card.frontImage) {
        return (
          <CardBody display="flex" h="full">
            <Image
              userSelect="none"
              pointerEvents="none"
              src={card.frontImage}
              w="full"
              h="full"
              objectFit="cover"
              alt={`card ${index + 1} image`}
            />
          </CardBody>
        )
      }

      // タイトルと画像がある場合
      return (
        <VStack h="full" gap={0}>
          <CardHeader>
            <Heading as="h3" fontSize="lg">
              {card.frontTitle}
            </Heading>
          </CardHeader>
          {card.frontImage && (
            <CardBody display="flex" flex={1} minH={0}>
              <Image
                userSelect="none"
                pointerEvents="none"
                src={card.frontImage}
                w="full"
                h="full"
                objectFit="cover"
                alt={`card ${index + 1} image`}
              />
            </CardBody>
          )}
        </VStack>
      )
    })()

    // toコンテンツの生成
    const toContent = (() => {
      // カードデータが完全に空の場合はデフォルト表示を返す
      if (!card.backTitle && !card.backDescription) {
        return null
      }

      return (
        <>
          {card.backTitle && (
            <CardHeader>
              <Heading as="h3" fontSize="lg">
                {card.backTitle}
              </Heading>
            </CardHeader>
          )}
          {card.backDescription && (
            <CardBody>
              <Text>{card.backDescription}</Text>
            </CardBody>
          )}
        </>
      )
    })()

    return { from: fromContent, to: toContent }
  }

  return (
    <VStack w="full" h="full">
      <Modal
        open={open}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
        withCloseButton={false}
      >
        <ModalHeader justifyContent="space-between">
          <Text>カード{currentCard + 1}/3</Text>
          <HStack>
            <Tooltip
              label="カードを3つ全て入力するとウェルカムページで反映されます。"
              placement="bottom"
            >
              <Center>
                <CircleHelpIcon />
              </Center>
            </Tooltip>
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
          </HStack>
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
                    placeholder="何をするサークル？"
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
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {
                          backgroundColor: "gray.100",
                        })}
                  >
                    <Controller
                      name="frontImage"
                      control={control}
                      render={({ field: { ref, name, onBlur, onChange } }) => (
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
                    placeholder="サークルのメンバーは？"
                    {...register("backTitle")}
                  />
                </CardHeader>
                <CardBody>
                  <Textarea
                    w="full"
                    h="full"
                    flexGrow={1}
                    placeholder="サークルの詳しい説明"
                    {...register("backDescription")}
                  />
                </CardBody>
              </Card>
            </VStack>
          </HStack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup attached>
            <Button colorScheme="riverBlue" onClick={onClose}>
              キャンセル
            </Button>
            <Button colorScheme="riverBlue" onClick={handleSubmit(onSubmit)}>
              更新
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
      {isAdmin && (
        <Button
          startIcon={<SquarePenIcon />}
          ml="auto"
          mt={{ base: "-16", md: "0" }}
          colorScheme="riverBlue"
          onClick={onOpen}
        >
          編集
        </Button>
      )}
      <Grid
        m="auto"
        maxW="7xl"
        w="full"
        h="full"
        gridTemplateAreas={{
          base: `
            "one one one two two"
            "one one one two two"
            "one one one three three"
          `,
          md: `
            "one"
            "two"
            "three"
          `,
        }}
        gap="md"
      >
        <WelcomeCard
          area="one"
          from={
            renderCardContent(0).from || (
              <>
                <CardHeader>
                  <Heading as="h3" fontSize="lg">
                    ウェルカムカードを設定しよう！
                  </Heading>
                </CardHeader>
                <CardBody display="flex" flex={1} minH={0}>
                  <Image
                    userSelect="none"
                    pointerEvents="none"
                    src="https://user0514.cdnw.net/shared/img/thumb/21830aIMGL99841974_TP_V.jpg"
                    w="full"
                    h="full"
                    objectFit="cover"
                    alt="card 1 image"
                  />
                </CardBody>
              </>
            )
          }
          to={
            renderCardContent(0).to || (
              <>
                <CardHeader>
                  <Heading as="h3" fontSize="lg">
                    ウェルカムカードとは・・・？
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Text>
                    サークルページを初めて見た人や初めて入会した人向けに表示するウェルカムページをカスタマイズできます。
                  </Text>
                </CardBody>
              </>
            )
          }
        />
        <WelcomeCard
          area="two"
          from={
            renderCardContent(1).from || (
              <Image
                userSelect="none"
                pointerEvents="none"
                src="/images/welcome-recruiting.png"
                w="full"
                h="full"
                objectFit="contain"
                alt="card 2 image"
              />
            )
          }
          to={
            renderCardContent(1).to || (
              <>
                <CardHeader>
                  <Heading as="h3" fontSize="lg">
                    メンバー募集！！
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Text>👌かけもちOK！</Text>
                  <Text>👌文系の方でも大歓迎</Text>
                  <Text>👌活動は週一回程度</Text>
                </CardBody>
              </>
            )
          }
        />
        <WelcomeCard
          area="three"
          from={
            renderCardContent(2).from || (
              <Image
                userSelect="none"
                pointerEvents="none"
                src="/images/one-day-activities.png"
                w="full"
                h="full"
                objectFit="cover"
                alt="card 3 image"
              />
            )
          }
          to={
            renderCardContent(2).to || (
              <CardBody>
                <Text>活動費 月1000円</Text>
                <Text>男女比 9:1</Text>
              </CardBody>
            )
          }
        />
      </Grid>
    </VStack>
  )
}
