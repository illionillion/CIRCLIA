import type { ThreadFormInput } from "@/schema/topic"
import { db } from "@/utils/db"

export const createThread = async (
  data: ThreadFormInput,
  userId: string,
  circleId: string,
) => {
  return await db.topic.create({
    data: {
      title: data.title,
      content: data.content,
      userId,
      circleId,
      type: "thread", // スレッドの種類を指定
    },
  })
}

export const getTopics = async () =>
  db.topic.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })
