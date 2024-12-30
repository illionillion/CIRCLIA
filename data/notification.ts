import type { NotificationType } from "@prisma/client"
import type webpush from "web-push"
import { db } from "@/utils/db"
import { sendWebPushNotification } from "@/utils/web-push"

/**
 * 全ての通知を既読にする
 * @param userId string - ユーザーID
 * @returns Promise<boolean> - 更新成功時に`true`、失敗時に`false`
 */
export const markAllNotificationAsRead = async (userId: string) => {
  try {
    const result = await db.notificationState.updateMany({
      where: {
        userId,
        readAt: null, // 既読でない場合に限定
      },
      data: {
        readAt: new Date(),
      },
    })

    // 更新されたレコードが1件以上で成功
    return result.count > 0
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

/**
 * 通知を既読にする
 * @param userId string - ユーザーID
 * @param notificationId string - 通知ID
 * @returns Promise<boolean> - 更新成功時に`true`、失敗時に`false`
 */
export const markNotificationAsRead = async (
  userId: string,
  notificationId: string,
) => {
  try {
    const result = await db.notificationState.updateMany({
      where: {
        userId,
        notificationId,
        readAt: null, // 既読でない場合に限定
      },
      data: {
        readAt: new Date(),
      },
    })

    // 更新されたレコードが1件以上で成功
    return result.count > 0
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

/**
 * ユーザーIDから全ての通知を取得
 * @param userId string - 対象のユーザーID
 * @returns Promise<Array<object>> - 通知とその状態を含む配列
 */
export async function getNotificationsByUserId(userId: string) {
  const notifications = await db.notificationState.findMany({
    where: { userId },
    include: {
      notification: true, // 通知情報を結合
    },
    orderBy: {
      notification: { createdAt: "desc" }, // 通知の作成日でソート（新しい順）
    },
  })

  // 必要な形式に整形
  return notifications.map((state) => ({
    id: state.notification.id,
    title: state.notification.title,
    content: state.notification.content,
    type: state.notification.type,
    circleId: state.notification.circleId,
    relatedEntityId: state.notification.relatedEntityId,
    readAt: state.readAt,
    createdAt: state.notification.createdAt,
  }))
}

/**
 * 汎用的な通知作成関数
 * @param type NotificationType - 通知の種類
 * @param title string - 通知のタイトル
 * @param content string | null - 通知の内容
 * @param userIds string[] - 通知を送信するユーザーIDの配列
 * @param circleId string | null - 関連するサークルのID (任意)
 * @param relatedEntityId string | null - 関連するエンティティのID (任意)
 * @returns Promise<void>
 */
export async function createNotification(
  type: NotificationType,
  title: string,
  content: string | null,
  userIds: string[],
  circleId: string | null = null,
  relatedEntityId: string | null = null,
) {
  await db.$transaction(async (tx) => {
    const notification = await tx.notification.create({
      data: {
        type,
        title,
        content,
        circleId,
        relatedEntityId,
      },
    })

    const notificationStates = userIds.map((userId) => ({
      userId,
      notificationId: notification.id,
    }))

    await tx.notificationState.createMany({
      data: notificationStates,
    })

    // サブスクリプションを取得
    const subscriptions = await tx.subscriptions.findMany({
      where: { userId: { in: userIds } },
    })

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const payload = {
            title,
            body: content || "新しい通知があります",
            url: `/notifications`,
          }

          await sendWebPushNotification(
            sub.subscription as unknown as webpush.PushSubscription,
            payload,
          )
          console.log(`プッシュ通知を送信しました: ユーザーID ${sub.userId}`)
        } catch (err) {
          console.error(
            `ユーザーID ${sub.userId} へのプッシュ通知の送信中にエラーが発生しました`,
            err,
          )
        }
      }),
    )
  })
}
