"use server"

import { auth } from "@/auth"
import { updateActivityParticipation } from "@/data/activity"

// アクティビティ参加・キャンセルのトグルアクション
export const toggleActivityParticipation = async (
  activityId: number,
  userId: string,
) => {
  // 認証情報を取得
  const session = await auth()

  try {
    // Prismaのロジックを呼び出して参加/キャンセルをトグル
    // 認証されたユーザーIDとリクエストのuserIdが一致しているか確認
    if (!session?.user || session.user.id !== userId) {
      throw new Error("権限がありません。")
    }

    const result = await updateActivityParticipation(activityId, userId)
    return { success: true, action: result.action }
  } catch (error) {
    console.error("アクティビティ参加/キャンセルエラー:", error)
    return { success: false, error: "参加/キャンセルの処理に失敗しました。" }
  }
}
