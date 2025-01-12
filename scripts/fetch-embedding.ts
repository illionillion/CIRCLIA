import { writeFileSync } from "fs"
import path from "path"
import { db } from "@/utils/db"
import { generateEmbedding } from "@/utils/embedding"

const getCircles = async () =>
  await db.circle.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      CircleTag: true,
    },
  })

const addEmbeddingIfMissing = async (
  circle: Awaited<ReturnType<typeof getCircles>>[number],
) => {
  // すでにembeddingが存在する場合はスキップ
  if (circle.embedding.length > 0) {
    console.log(`circle ${circle.name} is skiped`)
    return circle
  }

  const inputText = `${circle.name} ${circle.CircleTag.map((tag) => tag.tagName).join(" ")} ${
    circle.description
  }`
  const embedding = await generateEmbedding(inputText)

  console.log(`circle ${circle.name} is generated`)

  return { ...circle, embedding }
}

async function fetchEmbeddings(batchSize: number = 5) {
  const circles = await getCircles()

  if (circles.length === 0) {
    return
  }

  let updatedCircles: Awaited<ReturnType<typeof addEmbeddingIfMissing>>[] = []
  for (let i = 0; i < circles.length; i += batchSize) {
    console.log(i)

    const batch = circles.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(addEmbeddingIfMissing))
    updatedCircles = [...updatedCircles, ...batchResults]
  }

  // Circleの更新
  // updatedCirclesをループ回す
  await db.$transaction(
    updatedCircles.map((circle) =>
      db.circle.update({
        where: { id: circle.id },
        data: { embedding: circle.embedding },
      }),
    ),
  )

  // KeywordEmbeddingからデータを取得
  const embeddings = await db.keywordEmbedding.findMany()

  // JSONファイルへの書き出し
  writeFileSync(
    path.join(process.cwd(), "prisma", "seeds", "cache-circle-embeddings.json"),
    // { circleId: "circle00-uuid", embedding: [0.1, 0.2, ...] }[] の形式でJSONに書き出したい
    JSON.stringify(
      updatedCircles.map((circle) => ({
        circleId: circle.id,
        embedding: circle.embedding,
      })),
      null,
      2,
    ),
  )
  // JSONファイルへの書き出し
  writeFileSync(
    path.join(
      process.cwd(),
      "prisma",
      "seeds",
      "cache-keyword-embeddings.json",
    ),
    JSON.stringify(
      embeddings.map((item) => ({
        keyword: item.keyword,
        embedding: item.embedding,
      })),
      null,
      2,
    ),
  )

  return updatedCircles
}

fetchEmbeddings()
