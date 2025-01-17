"use server"
import { auth } from "@/auth"
import { findActiveMember, isUserAdmin } from "@/data/circle"
import { checkExistingMembershipRequest } from "@/data/membership"
import { demoteCurrentAdmin, updateMemberRole } from "@/data/role"

interface ChangeRoleParams {
  userId: string // 権限を変更するユーザーのID
  circleId: string // サークルのID
  targetMemberId: string // 変更対象のメンバーID
  newRoleId: number // 新しい役職ID (0: 代表, 1: 副代表, 2: 一般)
}

// サーバーアクション：権限変更
export const changeMemberRole = async ({
  userId,
  circleId,
  targetMemberId,
  newRoleId,
}: ChangeRoleParams) => {
  try {
    // 認証情報を取得
    const session = await auth()

    // 認証されたユーザーIDとリクエストのuserIdが一致しているか確認
    if (!session?.user || session.user.id !== userId) {
      throw new Error("権限がありません。")
    }
    // 1. 現在のユーザーの権限を確認
    const currentUser = await isUserAdmin(userId, circleId)

    // 権限確認: 現在のユーザーが存在しない、もしくは役職が未設定の場合エラー
    if (!currentUser) {
      throw new Error(
        "操作に必要な権限がありません。サークルのメンバーであること、および役職が設定されていることが必要です。",
      )
    }

    // 2. 自分自身の権限は変更できない
    if (userId === targetMemberId) {
      throw new Error("自分自身の権限を変更することはできません。")
    }

    // 3. 対象メンバーの情報を取得
    const targetMember = await findActiveMember(targetMemberId, circleId)

    // 対象メンバーが見つからない場合エラー
    if (!targetMember) {
      throw new Error(
        "対象メンバーが見つかりません。対象メンバーがサークルに存在することを確認してください。",
      )
    }

    // 4. 役職確認: 新しい役職に応じて権限を確認
    if (newRoleId === 0 && currentUser.roleId !== 0) {
      throw new Error(
        "代表のみが他のメンバーを代表に昇格させることができます。",
      )
    } else if (newRoleId === 2 && currentUser.roleId === 2) {
      throw new Error("一般メンバーの役職に昇格させることはできません。")
    }

    // 5. 対象メンバーが退会申請中か確認
    const withdrawalRequest = await checkExistingMembershipRequest(
      targetMemberId,
      circleId,
      "withdrawal",
    )

    if (withdrawalRequest) {
      return {
        success: false,
        message: "このメンバーは退会申請中のため、役職を変更できません。",
      }
    }

    // 6. 他人を代表に昇格させる場合、現在の代表は副代表に降格
    if (newRoleId === 0) {
      await demoteCurrentAdmin(currentUser.id)
    }

    // 7. 権限変更の実行
    await updateMemberRole(targetMember.id, newRoleId)

    return {
      success: true,
      message: `メンバー ${targetMember.user.name} さんの権限を正常に更新しました。`,
    }
  } catch (error) {
    console.error("権限変更エラー:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "不明なエラーが発生しました。",
    }
  }
}
