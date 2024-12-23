"use server"
import { auth } from "@/auth"
import {
  addMemberToCircle,
  findActiveMember,
  getCircleOwner,
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

// メンバーシップリクエスト処理関数
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

    // 代表が退会申請を送れないようにチェック
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

    // 同じリクエストが既に存在するか確認
    const existingRequest = await checkExistingMembershipRequest(
      userId,
      circleId,
      requestType,
    )

    if (existingRequest) {
      return { success: false, message: "すでに保留中の申請があります。" }
    }

    // リクエストを作成
    await createMembershipRequest(userId, circleId, requestType)

    // サークル情報とオーナー情報を取得
    const ownerUser = await getCircleOwner(circleId)
    // const circle = await getCircleById(circleId)

    if (!ownerUser?.user.email) {
      return {
        success: false,
        message: "サークルオーナーのメールアドレスが見つかりません。",
      }
    }

    if (!session.user.accessToken) {
      return {
        success: false,
        message: "アクセストークンが取得できませんでした。",
      }
    }

    /* if (session.user.accessToken) {
      // メール送信
      const mailContent = `
<p>${ownerUser?.user.name}さん。こんにちは。</p>
<p>${circle?.name}に${session.user.name}さんからの${requestType === "join" ? "入会" : "退会"}申請が届いています。</p>
<br/>
<p><a href="https://circlia.vercel.app/circles/${circle?.id}/members">申請を許可する</a></p>
`
      await sendMail(
        session.user.accessToken,
        ownerUser.user.email,
        `サークルメンバー${requestType === "join" ? "入会" : "退会"}申請が届いています。`,
        mailContent,
      )
    } */

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
    // const circle = await getCircleById(circleId)
    // 承認または拒否処理
    if (action === "approve") {
      // 承認と共に対象となるユーザーID（申請者のID）を取得
      const { userId: targetUserId } = await approveMembershipRequest(
        requestId,
        adminUserId,
      )
      // const targetUser = await getUserById(targetUserId)

      // リクエストタイプに応じて入会/退会処理を行う
      if (requestType === "join") {
        await addMemberToCircle(targetUserId, circleId, 2) // 対象ユーザーをメンバーに追加
        /*
      if (session.user.accessToken) {
          // メール送信
          const mailContent = `
<p>${targetUser?.name}さん。こんにちは。</p>
<p>${circle?.name}への入会が完了しました。</p>
<br/>
<p><a href="https://circlia.vercel.app/circles/${circle?.id}/members">サークルを見る</a></p>
    `
          await sendMail(
            session.user.accessToken,
            targetUser?.email || "",
            `${circle?.name}への入会が完了しました。`,
            mailContent,
          )
        } */
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
      message: `メンバー ${targetMember.user.name} が正常に退会しました。`,
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
