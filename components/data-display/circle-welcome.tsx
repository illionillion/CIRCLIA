import {
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  SquarePenIcon,
} from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Box,
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
  useSafeLayoutEffect,
  VStack,
} from "@yamada-ui/react"
import { useRef, useState } from "react"
import { WelcomeCard } from "./welcome-card"

interface CircleWelcomeProps {
  isAdmin?: boolean
}

export const CircleWelcome: FC<CircleWelcomeProps> = ({ isAdmin }) => {
  const { open, onOpen, onClose } = useDisclosure()
  const [currentCard, setCurrentCard] = useState<number>(0)

  const [imageH, setImageH] = useState<number | null>(null)
  const imageParentRef = useRef<HTMLDivElement>(null)

  const handlePrevCard = () => {
    if (currentCard > 0) setCurrentCard((prev) => prev - 1)
  }

  const handleNextCard = () => {
    if (currentCard < 2) setCurrentCard((prev) => prev + 1)
  }

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
                  <Input placeholder="何をするサークル？" />
                </CardHeader>
                <CardBody>
                  <Center w="full" h="full" flexGrow={1}>
                    <IconButton
                      w="16"
                      h="16"
                      bg="gray.100"
                      icon={<CameraIcon fontSize="5xl" color="gray" />}
                      fullRounded
                      variant="outline"
                    />
                  </Center>
                </CardBody>
              </Card>
            </VStack>
            <VStack w="full" h="full" gap="md">
              <Text fontSize="md">裏面</Text>
              <Card minH={{ base: "sm", md: "2xs" }}>
                <CardHeader>
                  <Input placeholder="サークルのメンバーは？" />
                </CardHeader>
                <CardBody>
                  <Textarea
                    w="full"
                    h="full"
                    flexGrow={1}
                    placeholder="サークルの詳しい説明"
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
            <Button colorScheme="riverBlue">更新</Button>
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
