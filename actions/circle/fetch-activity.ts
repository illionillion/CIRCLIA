"use server"

import { DateTime } from "luxon"
import { auth } from "@/auth"
import {
  getActivities,
  getActivitiesByMonth,
  getActivityById,
  getMonthlyEvents,
  getWeeklyActivities,
} from "@/data/activity"

// サーバーアクション：指定月のイベントを取得
export const fetchActivitiesByMonth = async (date: Date, circleId: string) => {
  try {
    // 認証情報を取得
    const session = await auth()

    // 認証されたユーザーIDとリクエストのuserIdが一致しているか確認
    if (!session?.user) {
      return {
        success: false,
        message: "権限がありません。",
      }
    }

    // 日本時間に変換
    const jpDate = DateTime.fromJSDate(date).setZone("Asia/Tokyo")
    const year = jpDate.year
    const month = jpDate.month // Luxonでは1から始まるため+1不要

    const events = await getActivitiesByMonth(year, month, circleId)

    return {
      success: true,
      events,
    }
  } catch (error) {
    console.error("イベント取得エラー:", error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "不明なエラーが発生しました。",
    }
  }
}

export const getWeeklyActivitiesActioins = async (
  userId: string,
  date: Date,
) => {
  const session = await auth()
  if (!session?.user) {
    return
  }

  return await getWeeklyActivities(userId, date)
}

export const getMonthlyEventsActions = async (
  userId: string,
  startDate: Date,
) => {
  const session = await auth()
  if (!session?.user) {
    return
  }

  return await getMonthlyEvents(userId, startDate)
}

export const getActivityByIdActions = getActivityById
export const getActivitiesActions = getActivities
