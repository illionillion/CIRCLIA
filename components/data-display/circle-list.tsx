"use client"

import type { FC } from "@yamada-ui/react"
import {
  Button,
  Center,
  Text,
  useBreakpointEffect,
  VStack,
} from "@yamada-ui/react"
import Link from "next/link"
import { useState } from "react"
import { PaginationGrid } from "../navigation/pagination-grid"
import { CircleCard } from "./circle-card"
import type { getCirclesByUserId } from "@/actions/circle/fetch-circle"

interface CircleListProps {
  circles: Awaited<ReturnType<typeof getCirclesByUserId>>
  instructor?: boolean
}

export const CircleList: FC<CircleListProps> = ({ circles, instructor }) => {
  const [columns, setColumns] = useState(0)
  const [perPage, setPerPage] = useState(0)

  useBreakpointEffect((breakpoint) => {
    switch (breakpoint) {
      case "2xl":
        setColumns(3)
        setPerPage(3)
        break
      case "xl":
        setColumns(2)
        setPerPage(instructor ? 2 : 4)
        break
      case "lg":
        setColumns(1)
        setPerPage(2)
        break
      case "md":
        setColumns(2)
        setPerPage(2)
        break
      case "sm":
        setColumns(1)
        setPerPage(3)
        break

      default:
        break
    }
  }, [])

  return circles && circles.length > 0 && columns > 0 && perPage > 0 ? (
    <PaginationGrid data={circles} itemsPerPage={perPage} columns={columns}>
      {(currentPageData) =>
        currentPageData.map((data) => <CircleCard key={data.id} data={data} />)
      }
    </PaginationGrid>
  ) : (
    <Center w="full" h="full" as={VStack}>
      {instructor ? (
        <Text>講師を担当していません</Text>
      ) : (
        <>
          <Text>サークルに入っていません</Text>
          <Button as={Link} href="/circles">
            サークルを探す
          </Button>
        </>
      )}
    </Center>
  )
}
