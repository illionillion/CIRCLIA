import embeddings from "./cache-keyword-embeddings.json"
import { db } from "@/utils/db"

export const keywordEmbedding = () =>
  db.keywordEmbedding.createMany({
    data: embeddings,
  })
