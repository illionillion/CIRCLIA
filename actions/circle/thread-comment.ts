"use server"
import { auth } from "@/auth"
import { getMemberByCircleId } from "@/data/circle"
import { postComment } from "@/data/thread-comment"
import type { CommentFormInput } from "@/schema/topic"
import { CommentFormSchema } from "@/schema/topic"

export const PostCommentAction = async (
  threadId: string,
  circleId: string,
  data: CommentFormInput,
) => {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return { success: false, error: "認証されていません。" }
    }

    // サークルメンバーかどうかを確認
    const members = await getMemberByCircleId(circleId)
    const isMember = members?.some((member) => member.id === session.user?.id)
    if (!isMember) {
      return { success: false, error: "このサークルのメンバーではありません。" }
    }

    // Zodによる入力データのバリデーション
    const parsedData = CommentFormSchema.safeParse(data)
    if (!parsedData.success) {
      // バリデーションエラー時の処理
      return {
        success: false,
        error: parsedData.error.errors.map((e) => e.message).join(", "),
      }
    }

    const result = await postComment(
      session.user.id || "",
      parsedData.data,
      threadId,
    )
    return { success: true, data: result }
  } catch (error) {
    console.error("コメントの作成に失敗しました:", error)
    return { success: false, error: "予期しないエラーが発生しました。" }
  }
}
