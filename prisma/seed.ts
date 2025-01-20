import { circle } from "./seeds/circle"
import { circleActivities } from "./seeds/circle-activities"
import { circleActivityParticipants } from "./seeds/circle-activity-participants"
import { circleAlbumImages, circleAlbums } from "./seeds/circle-albums"
import { updateCircleEmbeddingsFromJSON } from "./seeds/circle-embedding"
import { circleInstructors } from "./seeds/circle-instructors"
import { circleMemberRole } from "./seeds/circle-member-role"
import { circleMembers } from "./seeds/circle-members"
import { circleTags } from "./seeds/circle-tags"
import { circleTopics, threadComments } from "./seeds/circle-topics"
import { keywordEmbedding } from "./seeds/keyword-embedding"
import { user } from "./seeds/user"
import { db } from "@/utils/db"

async function main() {
  const result =
    process.env.NODE_ENV !== "production"
      ? await db.$transaction([
          user(), // PrismaPromiseをトランザクションに渡す
          circle(),
          circleMemberRole(),
          circleMembers(),
          circleInstructors(),
          circleTags(),
          circleActivities(),
          circleActivityParticipants(),
          circleAlbums(),
          circleAlbumImages(),
          circleTopics(),
          threadComments(),
          ...updateCircleEmbeddingsFromJSON(),
          keywordEmbedding(),
        ])
      : await db.$transaction([circleMemberRole()])

  console.log("Transaction result:", result) // 結果を確認
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
