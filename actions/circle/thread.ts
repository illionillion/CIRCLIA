"use server"

import { auth } from "@/auth"
import { getMemberByCircleId, isUserAdmin } from "@/data/circle"
import {
  createAnnouncement,
  createThread,
  deleteThread,
  getThreadById,
  getTopics,
  updateThread,
} from "@/data/thread"
import type { AnnouncementFormInput, ThreadFormInput } from "@/schema/topic"
import { AnnouncementFormSchema, ThreadFormSchema } from "@/schema/topic"

export const submitThread = async (
  formData: ThreadFormInput,
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

    // Zodによる入力データのバリデーション
    const parsedData = ThreadFormSchema.safeParse(formData)
    if (!parsedData.success) {
      // バリデーションエラー時の処理
      return {
        success: false,
        error: parsedData.error.errors.map((e) => e.message).join(", "),
      }
    }

    // Prismaで新規スレッド作成
    const result = await createThread(parsedData.data, userId, circleId)
    return { success: true, data: result }
  } catch (error) {
    console.error("スレッドの作成に失敗しました:", error)
    return { success: false, error: "予期しないエラーが発生しました。" }
  }
}

export const submitThreadUpdate = async (
  formData: ThreadFormInput,
  threadId: string,
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
    const thread = await getThreadById(threadId)
    if (!isAdmin || thread?.userId !== session.user.id) {
      return { success: false, error: "権限がありません。" }
    }

    // Zodによる入力データのバリデーション
    const parsedData = ThreadFormSchema.safeParse(formData)
    if (!parsedData.success) {
      // バリデーションエラー時の処理
      return {
        success: false,
        error: parsedData.error.errors.map((e) => e.message).join(", "),
      }
    }

    // Prismaでスレッド更新
    const result = await updateThread(parsedData.data, threadId)
    return { success: true, data: result }
  } catch (error) {
    console.error("スレッドの更新に失敗しました:", error)
    return { success: false, error: "予期しないエラーが発生しました。" }
  }
}

export const submitThreadDelete = async (
  threadId: string,
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
    const thread = await getThreadById(threadId)
    if (!isAdmin || thread?.userId !== session.user.id) {
      return { success: false, error: "権限がありません。" }
    }

    const result = await deleteThread(threadId)
    return { success: true, data: result }
  } catch (error) {
    console.error("スレッドの削除に失敗しました:", error)
    return { success: false, error: "予期しないエラーが発生しました。" }
  }
}

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
    return { success: true, data: result }
  } catch (error) {
    console.error("お知らせの作成に失敗しました:", error)
    return { success: false, error: "予期しないエラーが発生しました。" }
  }
}

export const fetchTopics = getTopics
