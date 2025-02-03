"use client"
import { SquarePenIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Button,
  CardBody,
  CardHeader,
  Grid,
  Heading,
  Image,
  Text,
  useDisclosure,
  VStack,
} from "@yamada-ui/react"
import { useState } from "react"
import { WelcomeCardForm } from "../forms/welcome-card-form"
import { WelcomeCard } from "./welcome-card"
import type { getWelcomeCard } from "@/actions/circle/welcome-card"
import type { FrontWelcomeCard } from "@/schema/welcome"

interface CircleWelcomeProps {
  isMember?: boolean
  circleId: string
  userId: string
  welcomeCards: Awaited<ReturnType<typeof getWelcomeCard>>
  isWelcomeCardValid: boolean
}

export const CircleWelcome: FC<CircleWelcomeProps> = ({
  isMember,
  circleId,
  userId,
  welcomeCards,
  isWelcomeCardValid,
}) => {
  const { open, onOpen, onClose } = useDisclosure()
  // データが正しければプロパティのwelcomeCardsを使用、正しくなければデフォルトのカードを表示
  const defaultCards = isWelcomeCardValid
    ? welcomeCards
    : Array(3)
        .fill(null)
        .map((_, index) => ({
          frontTitle: welcomeCards[index]?.frontTitle ?? "",
          frontImage: welcomeCards[index]?.frontImage ?? "",
          backTitle: welcomeCards[index]?.backTitle ?? "",
          backDescription: welcomeCards[index]?.backDescription ?? "",
        }))
  const [cards, setCards] = useState<FrontWelcomeCard[]>(defaultCards)

  const renderCardContent = (index: number) => {
    const card = cards[index]

    // fromコンテンツの生成
    const fromContent = (() => {
      // カードデータが完全に空の場合はデフォルト表示を返す
      if (
        !card.frontTitle &&
        !card.frontImage &&
        !card.backTitle &&
        !card.backDescription
      ) {
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
              objectFit="contain"
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
                objectFit="contain"
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
      if (
        !card.frontTitle &&
        !card.frontImage &&
        !card.backTitle &&
        !card.backDescription
      ) {
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
            <CardBody overflowY="auto">
              <Text as="pre">{card.backDescription}</Text>
            </CardBody>
          )}
        </>
      )
    })()

    return { from: fromContent, to: toContent }
  }

  return (
    <VStack w="full" h="full">
      <WelcomeCardForm
        open={open}
        onClose={onClose}
        cards={cards}
        onUpdateCards={setCards}
        circleId={circleId}
        userId={userId}
      />
      {isMember && (
        <Button
          py="4"
          startIcon={<SquarePenIcon fontSize="2xl" />}
          ml="auto"
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
        minH="sm"
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
                <CardBody overflowY="auto">
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
