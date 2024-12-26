"use client"
import { ChevronUpIcon, SearchIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from "@yamada-ui/react"
import { matchSorter } from "match-sorter"
import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import type { getCircles } from "@/actions/circle/fetch-circle"
import { CircleCard } from "@/components/data-display/circle-card"

interface CirclesPageProps {
  circles: Awaited<ReturnType<typeof getCircles>>
}

export const CirclesPage: FC<CirclesPageProps> = ({ circles }) => {
  const [query, setQuery] = useState("")

  const filteredCircles = useMemo(
    () =>
      query
        ? matchSorter(circles || [], query, {
            keys: [
              "name", // サークル名
              "description", // 説明
              "tags", // タグ名
            ],
          })
        : circles,
    [query, circles],
  )

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const handleScroll = () => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
    window.scroll({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <>
      <VStack
        ref={scrollRef}
        w="full"
        maxW="9xl"
        h="fit-content"
        gap={0}
        m="auto"
      >
        <VStack
          position="sticky"
          p="md"
          top={0}
          backgroundImage="/images/white_marble.png"
          backgroundColor="white"
          backgroundAttachment="fixed"
          backgroundSize="cover"
          as="header"
          zIndex={1}
        >
          <HStack
            alignItems={{ base: "center", sm: "start" }}
            flexDir={{ sm: "column" }}
          >
            <Heading flex={1} as="h1" size="lg">
              サークル一覧
            </Heading>
            <InputGroup flex={1}>
              <InputLeftElement>
                <SearchIcon color="gray.500" />
              </InputLeftElement>
              <Input
                type="search"
                placeholder="サークルを検索"
                pl="lg"
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
            </InputGroup>
          </HStack>
          <Box textAlign="right">
            <Button
              as={Link}
              href="/circles/create"
              colorScheme="riverBlue"
              transition="0.5s"
              _hover={{ transform: "scale(1.1)", transition: "0.5s" }}
            >
              サークル作成
            </Button>
          </Box>
        </VStack>
        <Grid
          pb="md"
          px="md"
          gridTemplateColumns={{
            base: "repeat(4, 1fr)",
            lg: "repeat(3, 1fr)",
            md: "repeat(2, 1fr)",
            sm: "repeat(1, 1fr)",
          }}
          gap="md"
          w="full"
        >
          {filteredCircles?.map((data) => (
            <CircleCard key={data.id} data={data} />
          ))}
        </Grid>
      </VStack>
      <IconButton
        position="fixed"
        colorScheme="riverBlue"
        bottom={{ base: "8", sm: "2xl" }}
        right="8"
        icon={<ChevronUpIcon />}
        onClick={handleScroll}
      />
    </>
  )
}
