import embeddings from "./cache-circle-embeddings.json"
import { db } from "@/utils/db"

export const updateCircleEmbeddingsFromJSON = () => {
  return embeddings.map(({ circleId, embedding }) =>
    db.circle.update({
      where: { id: circleId },
      data: { embedding },
    }),
  )
}
