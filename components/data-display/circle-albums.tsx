"use client"
import { Carousel, CarouselSlide } from "@yamada-ui/carousel"
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Button,
  Card,
  Center,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  LinkBox,
  LinkOverlay,
  Loading,
  Snacks,
  Text,
  useBoolean,
  useSafeLayoutEffect,
  useSnacks,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useState } from "react"
import { SimpleMenuButton } from "../forms/simple-menu-button"
import { AlbumCard } from "./album-card"
import {
  handleDeleteAlbum,
  handleGetAlbumById,
  handleGetAlbumsByCircleId,
} from "@/actions/circle/album"
import type { getAlbumById } from "@/data/album"
import { parseDate } from "@/utils/format"

interface CircleAlbums {
  userId: string
  circleId: string
  isMember: boolean
  isAdmin: boolean
  currentAlbum?: Awaited<ReturnType<typeof getAlbumById>>
}

export const CircleAlbums: FC<CircleAlbums> = ({
  userId,
  circleId,
  isMember,
  isAdmin,
  currentAlbum: album,
}) => {
  const [albums, setAlbum] = useState<
    Awaited<ReturnType<typeof handleGetAlbumsByCircleId>>
  >([])
  const [currentAlbum, setCurrentAlbum] = useState(album)

  const [loading, { off: loadingOff, on: loadingOn }] = useBoolean(true)
  const { snack, snacks } = useSnacks()

  const fetchData = async () => {
    loadingOn()
    const newAlbums = await handleGetAlbumsByCircleId(circleId)
    setAlbum(newAlbums)
    const newCurrentAlbum = await handleGetAlbumById(album?.id || "")
    setCurrentAlbum(newCurrentAlbum)
    loadingOff()
  }

  const handleDelete = async (albumId: string) => {
    const { success, error } = await handleDeleteAlbum(circleId, albumId)
    if (success) {
      snack({ title: "アルバムを削除しました", status: "success" })
      await fetchData()
    } else {
      snack({ title: error, status: "error" })
    }
  }

  useSafeLayoutEffect(() => {
    fetchData()
  }, [])
  return (
    <VStack w="full" h="full">
      {isMember && (
        <HStack justifyContent="end">
          <Button
            as={Link}
            href={`/circles/${circleId}/album/create`}
            startIcon={<PlusIcon fontSize="2xl" />}
            colorScheme="riverBlue"
            transition="0.5s"
            _hover={{ transform: "scale(1.1)", transition: "0.5s" }}
          >
            作成
          </Button>
        </HStack>
      )}
      <Snacks snacks={snacks} />
      {currentAlbum ? (
        <AlbumCard
          userId={userId}
          circleId={circleId}
          isAdmin={isAdmin}
          isMember={isMember}
          currentAlbum={currentAlbum}
          handleDelete={handleDelete}
        />
      ) : loading ? (
        <Center w="full" h="full">
          <Loading fontSize="xl" />
        </Center>
      ) : albums.length === 0 ? (
        <Center w="full" h="full">
          <Text>アルバムがありません</Text>
        </Center>
      ) : (
        <Grid
          templateColumns={{
            base: "repeat(3, 1fr)",
            lg: "repeat(2, 1fr)",
            md: "repeat(1, 1fr)",
          }}
          gap="md"
        >
          {albums.map((album) => (
            <GridItem key={album.id} as={Card} flexDir="column" bg="white">
              <LinkBox>
                <Carousel
                  h="xs"
                  controlPrevProps={{
                    icon: <ArrowLeftIcon />, // 左矢印アイコンを指定
                    bg: "blackAlpha.400", // 背景を黒の半透明に
                    _hover: { bg: "blackAlpha.600" }, // ホバー時に濃い黒に
                  }}
                  controlNextProps={{
                    icon: <ArrowRightIcon />, // 右矢印アイコンを指定
                    bg: "blackAlpha.400", // 背景を黒の半透明に
                    _hover: { bg: "blackAlpha.600" }, // ホバー時に濃い黒に
                  }}
                >
                  {album.images.map((image) => (
                    <CarouselSlide
                      key={image.id}
                      as={Center}
                      background="blackAlpha.100"
                    >
                      <Image
                        boxSize="full"
                        objectFit="cover"
                        src={image.imageUrl}
                        alt={image.albumId}
                      />
                    </CarouselSlide>
                  ))}
                </Carousel>

                <VStack p="md">
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Heading>
                      <LinkOverlay
                        as={Link}
                        href={`/circles/${circleId}/album/${album.id}`}
                      >
                        {album.title}
                      </LinkOverlay>
                    </Heading>
                    <HStack ml="auto">
                      <Text>{parseDate(album.createdAt)}</Text>
                      {isAdmin || (album.createdBy === userId && isMember) ? (
                        <SimpleMenuButton
                          editLink={`/circles/${circleId}/album/${album.id}/edit`}
                          handleDelete={() => handleDelete(album.id)}
                        />
                      ) : undefined}
                    </HStack>
                  </HStack>
                  <Text as="pre" textWrap="wrap" lineClamp={3}>
                    {album.description}
                  </Text>
                </VStack>
              </LinkBox>
            </GridItem>
          ))}
        </Grid>
      )}
    </VStack>
  )
}
