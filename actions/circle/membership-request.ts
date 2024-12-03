"use server"
import { auth } from "@/auth"
import {
  addMemberToCircle,
  findActiveMember,
  isUserAdmin,
  markMemberAsInactive,
  removeMemberFromCircle,
} from "@/data/circle"
import {
  approveMembershipRequest,
  checkExistingMembershipRequest,
  createMembershipRequest,
  fetchPendingMembershipRequests,
  rejectMembershipRequest,
} from "@/data/membership"

export const handleMembershipRequest = async (
  userId: string,
  circleId: string,
  requestType: "join" | "withdrawal",
) => {
  try {
    // 認証情報を取得
    const session = await auth()

    // 認証されたユーザーIDとリクエストのuserIdが一致しているか確認
    if (!session?.user || session.user.id !== userId) {
      return {
        success: false,
        message: "権限がありません。",
      }
    }
    // 代表が退会申請を送れないようにチェックを追加
    if (requestType === "withdrawal") {
      const currentUser = await findActiveMember(userId, circleId)
      if (currentUser && currentUser.roleId === 0) {
        return {
          success: false,
          message:
            "代表は退会申請を行えません。別のメンバーに代表権限を譲渡してください。",
        }
      }
    }

    const existingRequest = await checkExistingMembershipRequest(
      userId,
      circleId,
      requestType,
    )

    if (existingRequest) {
      return { success: false, message: "すでに保留中の申請があります。" }
    }

    await createMembershipRequest(userId, circleId, requestType)

    return { success: true, message: "申請が成功しました。" }
  } catch (error) {
    console.error(error)
    return { success: false, message: "申請中にエラーが発生しました。" }
  }
}

export const checkPendingRequest = async (
  userId: string,
  circleId: string,
  requestType: "join" | "withdrawal",
) => {
  try {
    // 認証情報を取得
    const session = await auth()

    // 認証されたユーザーIDとリクエストのuserIdが一致しているか確認
    if (!session?.user || session.user.id !== userId) {
      return false
    }
    // 既存の保留中のリクエストがあるか確認
    const existingRequest = await checkExistingMembershipRequest(
      userId,
      circleId,
      requestType,
    )

    // 申請が存在する場合は true を返す
    return !!existingRequest
  } catch (error) {
    console.error("リクエスト確認中にエラーが発生しました:", error)
    return false // エラー時は false を返す（申請がないとみなす）
  }
}

// サークルの申請リストを取得する関数
export const getMembershipRequests = async (
  userId: string,
  circleId: string,
) => {
  try {
    // 認証情報を取得
    const session = await auth()

    // 認証されたユーザーIDとリクエストのuserIdが一致しているか確認
    if (!session?.user || session.user.id !== userId) {
      return {
        success: false,
        message: "権限がありません。",
      }
    }
    // ユーザーがサークルの管理者かどうかを確認
    const isAdmin = await isUserAdmin(userId, circleId)

    // 管理者でなければエラーメッセージを返す
    if (!isAdmin) {
      return { success: false, message: "サークルの管理者ではありません。" }
    }

    // 保留中の申請を取得
    const requests = await fetchPendingMembershipRequests(circleId)

    // 申請データを整形して返す
    const formattedRequests = requests.map((request) => ({
      id: request.id,
      userId: request.userId,
      userName: request.user.name,
      profileImageUrl: request.user.profileImageUrl,
      studentNumber: request.user.studentNumber,
      requestType: request.requestType,
      requestDate: request.requestDate,
    }))

    return { success: true, data: formattedRequests }
  } catch (error) {
    console.error("申請リストの取得中にエラーが発生しました:", error)
    return {
      success: false,
      message: "申請リストの取得中にエラーが発生しました。",
    }
  }
}

export const handleMembershipRequestAction = async (
  adminUserId: string, // サークルの管理者（アクションを行うユーザー）
  circleId: string,
  requestId: string,
  requestType: "join" | "withdrawal",
  action: "approve" | "reject",
) => {
  try {
    // 認証情報を取得
    const session = await auth()

    // 認証されたユーザーIDとリクエストのuserIdが一致しているか確認
    if (!session?.user || session.user.id !== adminUserId) {
      return {
        success: false,
        message: "権限がありません。",
      }
    }
    // ユーザーがサークルの管理者かどうかを確認
    const isAdmin = await isUserAdmin(adminUserId, circleId)

    if (!isAdmin) {
      return { success: false, message: "サークルの管理者ではありません。" }
    }

    // 承認または拒否処理
    if (action === "approve") {
      // 承認と共に対象となるユーザーID（申請者のID）を取得
      const { userId: targetUserId } = await approveMembershipRequest(
        requestId,
        adminUserId,
      )

      // リクエストタイプに応じて入会/退会処理を行う
      if (requestType === "join") {
        await addMemberToCircle(targetUserId, circleId, 2) // 対象ユーザーをメンバーに追加
        return {
          success: true,
          message: "入会申請を承認しました。メンバーに追加しました。",
        }
      } else {
        await removeMemberFromCircle(targetUserId, circleId) // 対象ユーザーを退会
        return {
          success: true,
          message: "退会申請を承認しました。メンバーリストから削除しました。",
        }
      }
    } else if (action === "reject") {
      await rejectMembershipRequest(requestId, adminUserId)
      return { success: true, message: "申請を拒否しました。" }
    } else {
      return { success: false, message: "無効なアクションです。" }
    }
  } catch (error) {
    console.error("申請処理中にエラーが発生しました:", error)
    return { success: false, message: "申請処理中にエラーが発生しました。" }
  }
}

interface RemoveMemberParams {
  circleId: string
  targetMemberId: string
  userId: string // 操作するユーザーのID（管理者権限の確認用）
}

// サーバーアクション：メンバー削除（退会）
export const removeMember = async ({
  circleId,
  targetMemberId,
  userId,
}: RemoveMemberParams) => {
  try {
    // 認証情報を取得
    const session = await auth()

    // 認証されたユーザーIDとリクエストのuserIdが一致しているか確認
    if (!session?.user || session.user.id !== userId) {
      throw new Error("権限がありません。")
    }
    // 1. 操作するユーザーが代表または副代表かどうかを確認
    const isAdmin = await isUserAdmin(userId, circleId)

    if (!isAdmin) {
      throw new Error("メンバーを削除する権限がありません。")
    }

    // 2. 削除対象のメンバーを取得
    const targetMember = await findActiveMember(targetMemberId, circleId)

    if (!targetMember) {
      throw new Error("指定されたメンバーが見つかりません。")
    }

    // 3. 削除（退会）処理を実行 - 論理削除
    await markMemberAsInactive(targetMember.id)

    return {
      success: true,
      message: `メンバー ${targetMemberId} が正常に退会しました。`,
    }
  } catch (error) {
    console.error("メンバー削除エラー:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "不明なエラーが発生しました。",
    }
  }
}
