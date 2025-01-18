import type { FC } from "@yamada-ui/react"
import {
  Box,
  CardBody,
  CardHeader,
  Grid,
  Heading,
  Image,
  Text,
  useSafeLayoutEffect,
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
    <Grid
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
              src="/images/welcome-recruiting.png"
              w="full"
              h="full"
              objectFit="cover"
              alt="card 2 image"
            />
          </>
        }
        to={<>two 裏</>}
      />
      <WelcomeCard area="three" from={<>three</>} to={<>three 裏</>} />
    </Grid>
  )
}
