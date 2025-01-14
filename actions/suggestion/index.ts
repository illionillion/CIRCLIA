"use server"

import { db } from "@/utils/db"
import { generateEmbedding } from "@/utils/embedding"

// コサイン類似度計算関数
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0)
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0))
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitude1 * magnitude2)
}

const getCirclesEmbeddings = async () =>
  db.circle.findMany({
    where: {
      deletedAt: null,
    },
  })

function generateTree(
  query: string,
  queryEmbedding: number[],
  suggestionsData: Awaited<ReturnType<typeof getCirclesEmbeddings>>,
) {
  const nodes: {
    id: string
    label: string
    name: string
    imagePath?: string
  }[] = [{ id: "query", label: query, name: query }]
  const links: { source: string; target: string; value: number }[] = []

  // クエリと各サジェストの類似度を計算
  const similarities = suggestionsData.map((suggestion) => ({
    ...suggestion,
    similarity: cosineSimilarity(queryEmbedding, suggestion.embedding),
  }))

  // 類似度でソート
  similarities.sort((a, b) => b.similarity - a.similarity)

  // 上位3つをルートノードとして追加
  const topSuggestions = similarities.slice(0, 3)
  topSuggestions.forEach((suggestion) => {
    nodes.push({
      id: suggestion.id,
      label: `${suggestion.name}: (value: ${suggestion.similarity.toFixed(2)})`,
      name: suggestion.name,
    })
    links.push({
      source: "query",
      target: suggestion.id,
      value: Number(suggestion.similarity.toFixed(2)),
    })
  })

  // 追加するサークルを保持するためのSet
  const addedNodes = new Set(topSuggestions.map((suggestion) => suggestion.id))

  // 残りのサジェストを子ノードとして追加
  similarities.slice(3).forEach((suggestion) => {
    // 既に存在するサークルかをチェック
    if (addedNodes.has(suggestion.id)) return

    nodes.push({
      id: suggestion.id,
      label: `${suggestion.name}: (value: ${suggestion.similarity.toFixed(2)})`,
      name: suggestion.name,
      imagePath: suggestion.imagePath || undefined,
    })

    // 最も類似度の高い親ノードを選択
    const closestRoot = topSuggestions.reduce((prev, current) =>
      cosineSimilarity(suggestion.embedding, current.embedding) >
      cosineSimilarity(suggestion.embedding, prev.embedding)
        ? current
        : prev,
    )

    // 最も類似度の高い親ノードと新しいサークルを繋げる
    links.push({
      source: closestRoot.id,
      target: suggestion.id,
      value: Number(
        cosineSimilarity(suggestion.embedding, closestRoot.embedding).toFixed(
          2,
        ),
      ),
    })

    // 新しく追加したサークルをaddedNodesに追加
    addedNodes.add(suggestion.id)

    // 追加のサークルをさらに評価して追加する
    const additionalSuggestions = similarities.filter(
      (s) =>
        !addedNodes.has(s.id) &&
        cosineSimilarity(suggestion.embedding, s.embedding) > 0.8, // 閾値を設定（例: 0.8）
    )

    additionalSuggestions.slice(0, 3).forEach((additional) => {
      nodes.push({
        id: additional.id,
        label: `${additional.name}: (value: ${additional.similarity.toFixed(2)})`,
        name: additional.name,
        imagePath: additional.imagePath || undefined,
      })
      links.push({
        source: suggestion.id,
        target: additional.id,
        value: Number(
          cosineSimilarity(additional.embedding, suggestion.embedding).toFixed(
            2,
          ),
        ),
      })
      addedNodes.add(additional.id)
    })
  })

  return { nodes, links }
}

export async function getSuggestions(query: string) {
  try {
    // KeywordEmbeddingテーブルに同じキーワードがあるならそれのembeddingを使い、ないなら生成しテーブルにキャッシュ
    const isExist = await db.keywordEmbedding.findUnique({
      where: { keyword: query },
    })

    let queryEmbedding: number[] = []
    if (isExist) {
      queryEmbedding = isExist.embedding
    } else {
      queryEmbedding = (await generateEmbedding(query)) ?? []

      // 新しいキーワードとその埋め込みをテーブルに保存
      await db.keywordEmbedding.create({
        data: {
          keyword: query,
          embedding: queryEmbedding,
        },
      })
    }

    const circlesEmbeddings = await getCirclesEmbeddings()

    // 最初の親ノードはダミー値で呼び出す
    const network = generateTree(query, queryEmbedding, circlesEmbeddings)

    return network
  } catch (error) {
    console.error("Error in getSuggestions:", error)
    return { nodes: [], links: [] }
  }
}
