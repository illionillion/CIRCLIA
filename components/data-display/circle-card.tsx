"use client"
import {
  Box,
  Card,
  forwardRef,
  GridItem,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  Text,
} from "@yamada-ui/react"
import Link from "next/link"
import { memo } from "react"
import type { getCirclesByUserId } from "@/actions/circle/fetch-circle"

export interface CircleCardProps {
  data: NonNullable<Awaited<ReturnType<typeof getCirclesByUserId>>>[number]
}

export const CircleCard = memo(
  forwardRef<CircleCardProps, "div">(({ data }, ref) => {
    return (
      <GridItem
        ref={ref}
        w="full"
        h="fit-content"
        as={Card}
        background="white"
        transition="0.5s"
        _hover={{ transform: "scale(1.1)", transition: "0.5s" }}
      >
        <LinkBox>
          {data.imagePath ? (
            <Image
              w="full"
              h="40"
              objectFit="cover"
              src={data.imagePath}
              alt="preview image"
            />
          ) : (
            <Box w="full" h="40" {...{ backgroundColor: "gray.100" }} />
          )}
          <Box p="sm">
            <Heading as="h4" size="xs">
              <LinkOverlay as={Link} href={`/circles/${data.id}`}>
                {data.name}
              </LinkOverlay>
            </Heading>
            <Text>人数：{data.memberCount}人</Text>
            <Text>活動日：{data.activityDay}</Text>
          </Box>
        </LinkBox>
      </GridItem>
    )
  }),
)

CircleCard.displayName = "CircleCard"
