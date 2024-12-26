"use client"

import { VStack, Grid, Pagination } from "@yamada-ui/react"
import type { ReactNode } from "react"
import { useState } from "react"

interface PaginationGridProps<T> {
  data: T[]
  itemsPerPage?: number // 1ページあたりのアイテム数（デフォルト値設定可能）
  columns?: number // グリッドのカラム数（デフォルト値設定可能）
  children: (currentPageData: T[]) => ReactNode // 現在のページのデータを受け取る関数
}

export const PaginationGrid = <T,>({
  data,
  itemsPerPage = 6, // デフォルトで1ページ6件
  columns = 3, // デフォルトで3カラム
  children,
}: PaginationGridProps<T>) => {
  const [page, setPage] = useState<number>(1) // 現在のページ番号を管理
  const totalPages = Math.ceil(data.length / itemsPerPage) // 総ページ数を計算

  // 現在のページに対応するデータを抽出
  const currentPageData = data.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  )

  return (
    <VStack w="full" h="fit-content" p="md">
      {/* グリッドに現在のページのデータを表示 */}
      <Grid
        templateColumns={{
          base: `repeat(${columns}, 1fr)`,
        }}
        gap={4}
        w="full"
      >
        {children(currentPageData)}
      </Grid>

      {/* ページネーションを有効にする条件 */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          total={totalPages}
          onChange={setPage}
          justifyContent="center"
        />
      )}
    </VStack>
  )
}
