"use client"
import { VStack, Pagination } from "@yamada-ui/react"
import type { ReactNode } from "react"
import { useState } from "react"

interface PaginationListProps<T> {
  data: T[]
  itemsPerPage?: number // 1ページあたりのアイテム数（デフォルト値設定可能）
  children: (currentPageData: T[]) => ReactNode // 現在のページのデータを受け取る関数
}

export const PaginationList = <T,>({
  data,
  itemsPerPage = 5, // デフォルトで1ページ5件
  children,
}: PaginationListProps<T>) => {
  const [page, setPage] = useState<number>(1) // 現在のページ番号を管理
  const totalPages = Math.ceil(data.length / itemsPerPage) // 総ページ数を計算

  // 現在のページに対応するデータを抽出
  const currentPageData = data.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  )

  return (
    <VStack w="full" h="fit-content" p="md">
      {/* 子コンポーネントに現在のページのデータを渡す */}
      {children(currentPageData)}

      {/* ページネーションを有効にする条件 */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          total={totalPages}
          onChange={setPage}
          justifyContent="center"
          colorScheme="riverBlue"
        />
      )}
    </VStack>
  )
}
