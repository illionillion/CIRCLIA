"use client"
import MDEditor from "@uiw/react-md-editor"
import type { FC } from "@yamada-ui/react"
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
  useToken,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type {
  getCirclesByInstructorId,
  getCirclesByUserId,
} from "@/actions/circle/fetch-circle"
import type { getUserById } from "@/actions/user/user"
import { CircleCard } from "@/components/data-display/circle-card"

interface UserProfileProps {
  userId: string
  user: NonNullable<Awaited<ReturnType<typeof getUserById>>>
  circles: Awaited<ReturnType<typeof getCirclesByUserId>>
  instructorCircles: Awaited<ReturnType<typeof getCirclesByInstructorId>>
  isMicrosoft: boolean | undefined
}

export const UserProfile: FC<UserProfileProps> = ({
  userId,
  user,
  isMicrosoft,
  circles,
  instructorCircles,
}) => {
  const { data: session } = useSession()
  const whiteToken = useToken("colors", "white")

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
          <CardBody px="lg">
            <MDEditor.Markdown
              source={user.profileText}
              style={{ width: "100%", background: whiteToken }}
              wrapperElement={{ "data-color-mode": "light" }}
            />
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
                <Text>講師を担当していません</Text>
              </Center>
            )}
          </Grid>
        </>
      )}
    </VStack>
  )
}
