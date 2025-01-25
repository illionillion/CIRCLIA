import { db } from "@/utils/db"

export const circleTopics = () => {
  return db.topic.createMany({
    data: [
      {
        circleId: "circle00-uuid",
        type: "thread",
        title: "スレッド1",
        content: "スレッド1の内容",
        userId: "user1-uuid",
        isImportant: false,
        id: "topic00-uuid",
      },
      {
        circleId: "circle00-uuid",
        type: "announcement",
        title: "お知らせ1",
        content: "お知らせ1の内容",
        userId: "user1-uuid",
        isImportant: false,
        id: "topic01-uuid",
      },
      {
        circleId: "circle00-uuid",
        type: "announcement",
        title: "お知らせ2",
        content: "お知らせ2の内容",
        userId: "user1-uuid",
        isImportant: true,
        id: "topic02-uuid",
      },
    ],
  })
}

export const threadComments = () => {
  return db.comment.createMany({
    data: [
      {
        topicId: "topic00-uuid",
        userId: "user1-uuid",
        content: "コメント1",
      },
    ],
  })
}
