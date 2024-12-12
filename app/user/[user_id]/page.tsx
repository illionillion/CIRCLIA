import {
  Avatar,
  Button,
  Card,
  CardBody,
  Center,
  Grid,
  Heading,
  HStack,
  Text,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getCirclesByInstructorId,
  getCirclesByUserId,
} from "@/actions/circle/fetch-circle"
import { getUserById } from "@/actions/user/user"
import { auth } from "@/auth"
import { CircleCard } from "@/components/data-display/circle-card"
import { getUsers } from "@/data/user"

interface Props {
  params: { user_id?: string }
}

export const generateMetadata = async ({ params }: Props) => {
  const user = await getUserById(params.user_id || "")
  if (!user) {
    return {
      title: "ユーザーがいません",
    }
  }
  return {
    title: `${user.name}さんのプロフィール`,
  }
}

export const dynamicParams = false
export const dynamic = "force-dynamic"

export const generateStaticParams = async () => {
  const users = await getUsers()

  if (!users) {
    return []
  }

  return users.map((user) => ({ user_id: user.id }))
}

const Page = async ({ params }: Props) => {
  const { user_id: userId } = params
  const session = await auth()
  const user = await getUserById(userId || "")
  const isMicrosoft = user?.accounts.some(
    (account) => account.provider === "microsoft-entra-id",
  )
  const circles = await getCirclesByUserId(userId || "")
  const instructorCircles = user?.instructorFlag
    ? await getCirclesByInstructorId(userId || "")
    : []
  if (!user) {
    notFound()
  }

  return (
    <VStack w="full" maxW="6xl" h="fit-content" p="md" m="auto">
      <HStack
        w="full"
        maxW="3xl"
        m="auto"
        flexDir={{ base: "row", sm: "column" }}
      >
        <Avatar
          src={user.profileImageUrl || ""}
          boxSize={{ base: "2xs", md: "28", sm: "24" }}
        />
        <VStack maxW="xl">
          <Heading fontSize="2xl">{user.name}</Heading>
          <HStack justifyContent="space-between" flexWrap="wrap">
            <Text>{user.studentNumber}</Text>
            {userId === session?.user?.id ? (
              <Button
                as={Link}
                href={`/user/${userId}/edit`}
                colorScheme="riverBlue"
              >
                プロフィール編集
              </Button>
            ) : isMicrosoft ? (
              <Button
                as={Link}
                href={`https://teams.microsoft.com/l/chat/0/0?users=${user.email}`}
                colorScheme="riverBlue"
                target="_blank"
              >
                Teamsでメッセージを送る
              </Button>
            ) : undefined}
          </HStack>
        </VStack>
      </HStack>
      {user.profileText ? (
        <Card bg="white">
          <CardBody>
            <Text as="pre" textWrap="wrap">
              {user.profileText}
            </Text>
          </CardBody>
        </Card>
      ) : undefined}
      <Heading as="h3" size="sm">
        所属サークル
      </Heading>
      <Grid
        gridTemplateColumns={
          circles?.length
            ? {
                base: "repeat(4, 1fr)",
                lg: "repeat(3, 1fr)",
                md: "repeat(2, 1fr)",
                sm: "repeat(1, 1fr)",
              }
            : undefined
        }
        gap="md"
        w="full"
        h="full"
      >
        {circles?.length ? (
          circles.map((data) => <CircleCard key={data.id} data={data} />)
        ) : (
          <Center w="full" h="full" as={VStack}>
            <Text>サークルに入っていません</Text>
            {userId === session?.user?.id ? (
              <Button as={Link} href="/circles">
                サークルを探す
              </Button>
            ) : undefined}
          </Center>
        )}
      </Grid>
      {user.instructorFlag && (
        <>
          <Heading as="h3" size="sm">
            講師担当サークル
          </Heading>
          <Grid
            gridTemplateColumns={
              instructorCircles?.length
                ? {
                    base: "repeat(4, 1fr)",
                    lg: "repeat(3, 1fr)",
                    md: "repeat(2, 1fr)",
                    sm: "repeat(1, 1fr)",
                  }
                : undefined
            }
            gap="md"
            w="full"
            h="full"
          >
            {instructorCircles?.length ? (
              instructorCircles.map((data) => (
                <CircleCard key={data.id} data={data} />
              ))
            ) : (
              <Center w="full" h="full">
                <Text>講師にに入っていません</Text>
              </Center>
            )}
          </Grid>
        </>
      )}
    </VStack>
  )
}

export default Page
