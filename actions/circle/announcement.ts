"use server"
import { getCircleById } from "./fetch-circle"
import { auth } from "@/auth"
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
} from "@/data/announcement"
import { getMemberByCircleId, isUserAdmin } from "@/data/circle"
import { createNotification } from "@/data/notification"
import type { AnnouncementFormInput } from "@/schema/topic"
import { AnnouncementFormSchema } from "@/schema/topic"

export const submitAnnouncement = async (
  formData: AnnouncementFormInput,
  userId: string,
  circleId: string,
) => {
  try {
    // 認証チェック
    const session = await auth()
    if (!session || session.user?.id !== userId) {
      return { success: false, error: "ユーザー認証に失敗しました。" }
    }

    // サークルメンバーかどうかを確認
    const members = await getMemberByCircleId(circleId)
    const isMember = members?.some((member) => member.id === userId)
    if (!isMember) {
      return { success: false, error: "このサークルのメンバーではありません。" }
    }
    const circle = await getCircleById(circleId)

    // Zodによる入力データのバリデーション
    const parsedData = AnnouncementFormSchema.safeParse(formData)
    if (!parsedData.success) {
      // バリデーションエラー時の処理
      return {
        success: false,
        error: parsedData.error.errors.map((e) => e.message).join(", "),
      }
    }

    // Prismaで新規スレッド作成
    const result = await createAnnouncement(parsedData.data, userId, circleId)
    await createNotification(
      "CIRCLE_ANNOUNCEMENT",
      `${circle?.name}お知らせ`,
      `${parsedData.data.title}`,
      members
        ? members.map((member) => member.id).filter((id) => id !== userId)
        : [],
      circleId,
      result.id,
    )
    return { success: true, data: result }
  } catch (error) {
    console.error("お知らせの作成に失敗しました:", error)
    return { success: false, error: "予期しないエラーが発生しました。" }
  }
}

export const submitAnnouncementUpdate = async (
  formData: AnnouncementFormInput,
  announcementId: string,
  circleId: string,
) => {
  try {
    // 認証チェック
    const session = await auth()
    if (!session || !session.user?.id) {
      return { success: false, error: "ユーザー認証に失敗しました。" }
    }

    // 管理者もしくは作成者本人かの確認
    const isAdmin = await isUserAdmin(session.user.id, circleId)
    const announcement = await getAnnouncementById(announcementId)
    if (!isAdmin && announcement?.userId !== session.user.id) {
      return { success: false, error: "権限がありません。" }
    }

    // Zodによる入力データのバリデーション
    const parsedData = AnnouncementFormSchema.safeParse(formData)
    if (!parsedData.success) {
      // バリデーションエラー時の処理
      return {
        success: false,
        error: parsedData.error.errors.map((e) => e.message).join(", "),
      }
    }

    // Prismaでスレッド更新
    const result = await updateAnnouncement(parsedData.data, announcementId)
    return { success: true, data: result }
  } catch (error) {
    console.error("お知らせの更新に失敗しました:", error)
    return { success: false, error: "予期しないエラーが発生しました。" }
  }
}

export const submitAnnouncementDelete = async (
  announcementId: string,
  circleId: string,
) => {
  try {
    // 認証チェック
    const session = await auth()
    if (!session || !session.user?.id) {
      return { success: false, error: "ユーザー認証に失敗しました。" }
    }

    // 管理者もしくは作成者本人かの確認
    const isAdmin = await isUserAdmin(session.user.id, circleId)
    const announcement = await getAnnouncementById(announcementId)
    if (!isAdmin && announcement?.userId !== session.user.id) {
      return { success: false, error: "権限がありません。" }
    }

    const result = await deleteAnnouncement(announcementId)
    return { success: true, data: result }
  } catch (error) {
    console.error("お知らせの削除に失敗しました:", error)
    return { success: false, error: "予期しないエラーが発生しました。" }
  }
}

export const getAnnouncementByIdAction = getAnnouncementById
