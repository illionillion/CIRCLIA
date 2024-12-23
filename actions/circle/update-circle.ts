"use server"
import { getUserById } from "../user/user"
import { auth } from "@/auth"
import {
  getMemberByCircleId,
  updateInstructors,
  updateTags,
  updateCircle,
} from "@/data/circle"
import type { BackCircleForm } from "@/schema/circle"
import { BackCircleSchema } from "@/schema/circle"

export const UpdateCircle = async (
  values: BackCircleForm,
  circleId: string,
  userId: string,
) => {
  // 認証情報を取得
  const session = await auth()

  // 認証されたユーザーIDとリクエストのuserIdが一致しているか確認
  if (!session?.user || session.user.id !== userId) {
    return {
      success: false,
      error: "権限がありません。",
    }
  }

  // バリデーションの実行
  const { success, error } = BackCircleSchema.safeParse(values)
  if (!success && error) {
    return {
      success: false,
      error:
        "バリデーションエラー: " +
        error.errors.map((e) => e.message).join(", "),
    }
  }

  // メンバー情報を取得
  const members = await getMemberByCircleId(circleId)

  // 管理者権限の確認
  const isAdmin = members?.some(
    (member) => member.id === userId && [0, 1].includes(member.role.id),
  )

  if (!isAdmin) {
    return {
      success: false,
      error: "管理者権限が必要です。",
    }
  }

  // ユーザー情報の取得
  const user = await getUserById(userId)
  if (!user) {
    return {
      success: false,
      error: "ユーザーが存在しません。",
    }
  }

  // サークルの更新処理
  const updatedCircle = await updateCircle(circleId, values)
  if (!updatedCircle) {
    return {
      success: false,
      error: "サークルの更新に失敗しました。",
    }
  }

  // 講師の更新処理
  const updatedInstructors = await updateInstructors(
    circleId,
    values.instructors,
  )
  if (updatedInstructors === null) {
    return {
      success: false,
      error: "講師の更新に失敗しました。",
    }
  }

  // タグの更新処理
  const updatedTags = await updateTags(circleId, values.tags)
  if (updatedTags === null) {
    return {
      success: false,
      error: "タグの更新に失敗しました。",
    }
  }

  // 成功時に更新されたサークル情報を返す
  return {
    success: true,
    result: {
      circleId: updatedCircle.id,
      name: updatedCircle.name,
      description: updatedCircle.description,
      location: updatedCircle.location,
      imagePath: updatedCircle.imagePath,
      activityDay: updatedCircle.activityDay,
    },
  }
}
