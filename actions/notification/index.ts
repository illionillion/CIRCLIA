"use server"

import {
  getNotificationsByUserId,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from "@/data/notification"

/**
 * 通知を既読にするサーバーアクション
 * @param userId string - ユーザーID
 * @param notificationId string - 通知ID
 * @returns Promise<Response> - 処理結果を含むレスポンス
 */
export async function markNotificationAsReadAction(
  userId: string,
  notificationId: string,
) {
  const success = await markNotificationAsRead(userId, notificationId)

  if (success) {
    return { success: true }
  } else {
    return { success: false, error: "Failed to mark notification as read" }
  }
}

/**
 * 全ての通知を既読にするサーバーアクション
 * @param userId string - ユーザーID
 * @returns Promise<Response> - 処理結果を含むレスポンス
 */
export async function markAllNotificationAsReadAction(userId: string) {
  const success = await markAllNotificationAsRead(userId)

  if (success) {
    return { success: true }
  } else {
    return { success: false, error: "Failed to mark all notification as read" }
  }
}

export const getNotificationsByUserIdAction = async (userId: string) => {
  return await getNotificationsByUserId(userId)
}
