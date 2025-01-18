import { SquarePenIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Box,
  Button,
  CardBody,
  CardHeader,
  Grid,
  Heading,
  Image,
  Text,
  useSafeLayoutEffect,
  VStack,
} from "@yamada-ui/react"
import { useRef, useState } from "react"
import { WelcomeCard } from "./welcome-card"

export const CircleWelcome: FC = () => {
  const [imageH, setImageH] = useState<number | null>(null)
  const imageParentRef = useRef<HTMLDivElement>(null)

  useSafeLayoutEffect(() => {
    const onResize = () => {
      const parent = imageParentRef.current
      if (parent) {
        setImageH(parent.offsetHeight)
      }
    }

    window.addEventListener("resize", onResize)
    onResize()

    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <VStack w="full" h="full">
      <Button
        startIcon={<SquarePenIcon />}
        ml="auto"
        mt={{ base: "-16", md: "0" }}
        colorScheme="riverBlue"
      >
        編集
      </Button>
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
            <>
              <CardHeader>
                <Heading as="h3" fontSize="lg">
                  ウェルカムカードを設定しよう！
                </Heading>
              </CardHeader>
              <CardBody>
                <Box w="full" h="full" ref={imageParentRef}>
                  <Image
                    userSelect="none"
                    pointerEvents="none"
                    src="https://user0514.cdnw.net/shared/img/thumb/21830aIMGL99841974_TP_V.jpg"
                    w="full"
                    h={imageH || "xs"}
                    objectFit="cover"
                    alt="card 1 image"
                  />
                </Box>
              </CardBody>
            </>
          }
          to={
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
          }
        />
        <WelcomeCard
          area="two"
          from={
            <>
              <Image
                userSelect="none"
                pointerEvents="none"
                src="/images/welcome-recruiting.png"
                w="full"
                h="full"
                objectFit="contain"
                alt="card 2 image"
              />
            </>
          }
          to={
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
          }
        />
        <WelcomeCard
          area="three"
          from={
            <>
              <Image
                userSelect="none"
                pointerEvents="none"
                src="/images/one-day-activities.png"
                w="full"
                h="full"
                objectFit="cover"
                alt="card 3 image"
              />
            </>
          }
          to={
            <>
              <CardBody>
                <Text>活動費 月1000円</Text>
                <Text>男女比 9:1</Text>
              </CardBody>
            </>
          }
        />
      </Grid>
    </VStack>
  )
}
