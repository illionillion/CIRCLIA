"use client"
import { ChevronUpIcon, SearchIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import {
  Box,
  Button,
  Center,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Loading,
  NumberInput,
  Tab,
  TabList,
  Tabs,
  Tooltip,
  useBoolean,
  VStack,
} from "@yamada-ui/react"
import { matchSorter } from "match-sorter"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import type { getCircles } from "@/actions/circle/fetch-circle"
import { getSuggestions } from "@/actions/suggestion"
import { CircleCard } from "@/components/data-display/circle-card"

interface CirclesPageProps {
  circles: Awaited<ReturnType<typeof getCircles>>
}

const CustomGraph = dynamic(
  () =>
    import("@/components/data-display/custom-graph").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <Center w="full" h="full">
        <Loading fontSize="xl" />
      </Center>
    ),
  },
)

export const CirclesPage: FC<CirclesPageProps> = ({ circles }) => {
  const [query, setQuery] = useState("")
  const [currentQuery, setCurrentQuery] = useState("")
  const [threshold, setThreshold] = useState("0.9")
  const cacheRef = useRef(
    new Map<string, Awaited<ReturnType<typeof getSuggestions>>>(),
  )
  const [data, setData] = useState<Awaited<ReturnType<typeof getSuggestions>>>({
    nodes: [],
    links: [],
  })
  const [loading, { on: start, off: end }] = useBoolean(false)

  const searchParams = useSearchParams()
  const mode = (() => {
    const modeIndex = parseInt(searchParams.get("mode") || "")
    if (isNaN(modeIndex)) {
      return 0
    } else if ([0, 1].includes(modeIndex)) {
      return modeIndex
    }
    return 0
  })()

  const onChangeThreshold = (valueAsString: string) => {
    setThreshold(valueAsString)
  }

  const filteredCircles = useMemo(
    () =>
      currentQuery
        ? matchSorter(circles || [], currentQuery, {
            keys: [
              "name", // サークル名
              "description", // 説明
              "tags", // タグ名
            ],
          })
        : circles,
    [currentQuery, circles],
  )

  const handleSearch = async () => {
    if (mode === 0) {
      setCurrentQuery(query)
      setData({ links: [], nodes: [] })
      return
    }

    const cache = cacheRef.current
    if (!query || isNaN(parseFloat(threshold))) {
      setCurrentQuery(query)
      setData({ links: [], nodes: [] })
      return
    }
    start()
    const key = `${query}-${threshold}`
    const result = cache.has(key)
      ? cache.get(key)
      : await getSuggestions(query, parseFloat(threshold))
    if (result) {
      cache.set(key, result)
      setCurrentQuery(query)
      setData(result)
    }
    end()
  }

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
        h={mode === 0 ? "fit-content" : "full"}
        gap={0}
        m="auto"
      >
        <VStack
          position="sticky"
          p="md"
          pb={0}
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
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
              <InputRightElement w="5xs" pr="xs" clickable>
                <Button
                  size="md"
                  w="5xs"
                  h="7xs"
                  colorScheme="riverBlue"
                  loading={loading}
                  onClick={handleSearch}
                >
                  検索
                </Button>
              </InputRightElement>
            </InputGroup>
            {mode !== 0 && (
              <Tooltip label="サークル間の類似度の基準を設定できます（おすすめは0.7～0.9）">
                <NumberInput
                  w="5xs"
                  placeholder="類似度のしきい値"
                  precision={2}
                  step={0.01}
                  min={0.5}
                  max={1}
                  value={threshold}
                  onChange={onChangeThreshold}
                />
              </Tooltip>
            )}
          </HStack>
          <Box position="relative">
            <Tabs index={mode}>
              <TabList>
                <Tab as={Link} href="/circles?mode=0">
                  サークル検索
                </Tab>
                <Tab as={Link} href="/circles?mode=1">
                  AI検索
                </Tab>
              </TabList>
            </Tabs>

            <Button
              as={Link}
              href="/circles/create"
              colorScheme="riverBlue"
              transition="0.5s"
              _hover={{ transform: "scale(1.1)", transition: "0.5s" }}
              position="absolute"
              right={0}
              top="-1"
            >
              サークル作成
            </Button>
          </Box>
        </VStack>
        {mode === 0 ? (
          <Grid
            p="md"
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
        ) : (
          <CustomGraph data={data} query={currentQuery} loading={loading} />
        )}
      </VStack>
      <IconButton
        position="fixed"
        colorScheme="riverBlue"
        bottom={{ base: "8", sm: "2xl" }}
        right="8"
        icon={<ChevronUpIcon />}
        onClick={handleScroll}
        _hover={{ transform: "scale(1.1)" }}
      />
    </>
  )
}
