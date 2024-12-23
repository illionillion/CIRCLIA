"use server"
import { getUserById } from "../user/user"
import { auth } from "@/auth"
import {
  addCircle,
  addInitialMember,
  addInstructors,
  addTags,
} from "@/data/circle"
import type { BackCircleForm } from "@/schema/circle"
import { BackCircleSchema } from "@/schema/circle"

export const CreateCircle = async (values: BackCircleForm, userId: string) => {
  // 認証情報を取得
  const session = await auth()

  // 認証されたユーザーIDとリクエストのuserIdが一致しているか確認
  if (!session?.user || session.user.id !== userId) {
    return { success: false, error: "権限がありません。" }
  }

  const { success, error } = BackCircleSchema.safeParse(values)

  if (!success && error) {
    return { success: false, error }
  }

  const user = await getUserById(userId)
  if (!user) {
    return { success: false, error: "ユーザーが存在しません。" }
  }

  const circle = await addCircle(values)
  if (!circle) {
    return { success: false, error: "サークルの作成に失敗しました。" }
  }

  const initialMember = await addInitialMember(circle.id, userId)
  if (!initialMember) {
    return { success: false, error: "ユーザーの登録に失敗しました。" }
  }

  const instructors = await addInstructors(circle.id, values.instructors)
  if (!instructors) {
    return { success: false, error: "講師の登録に失敗しました。" }
  }

  const tags = await addTags(circle.id, values.tags)
  if (!tags) {
    return { success: false, error: "タグの登録に失敗しました。" }
  }

  // 成功時にサークルの情報を返す
  return {
    success: true,
    result: {
      circleId: circle.id,
      name: circle.name,
      description: circle.description,
      location: circle.location,
      imagePath: circle.imagePath,
      activityDay: circle.activityDay,
      initialMemberId: userId, // 初期メンバーのIDも返す
      instructors, // 講師のデータも返す
      tags, // タグのデータも返す
    },
  }
}
