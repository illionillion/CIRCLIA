import type { Circle } from "@prisma/client"
import { DateTime } from "luxon"
import type { ActivityFormType } from "@/schema/activity"
import { db } from "@/utils/db"
import { parseMonthDate } from "@/utils/format"

const timeZone = "Asia/Tokyo" // 日本時間

export const getActivityById = async (activityId: number) => {
  try {
    return await db.activity.findFirst({
      where: {
        id: activityId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImageUrl: true,
                studentNumber: true,
                email: true,
              },
            }, // `ActivityParticipant`がユーザー情報を持つ場合、参加者のユーザー情報も取得
          },
          where: {
            removedAt: null,
          },
        },
      },
    })
  } catch (error) {
    console.error("getActivityById Error: ", error)

    return null
  }
}

export const getActivities = async () => {
  try {
    return await db.activity.findMany({
      where: {
        deletedAt: null,
      },
    })
  } catch (error) {
    console.error("getActivities: ", error)
    return null
  }
}

// 指定された月のイベントを取得する関数
export const getActivitiesByMonth = async (
  year: number,
  month: number,
  circleId: string,
) => {
  // 月の開始日と終了日をLuxonで取得し、時差を調整
  const startDate = DateTime.fromObject(
    { year, month, day: 1 },
    { zone: "Asia/Tokyo" },
  )
    .toUTC()
    .toJSDate()
  const endDate = DateTime.fromObject(
    { year, month, day: DateTime.local(year, month).daysInMonth },
    { zone: "Asia/Tokyo" },
  )
    .endOf("day")
    .toUTC()
    .toJSDate()

  // イベントの取得（参加者一覧を含む）
  return await db.activity.findMany({
    where: {
      circleId,
      activityDay: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImageUrl: true,
              studentNumber: true,
            },
          }, // `ActivityParticipant`がユーザー情報を持つ場合、参加者のユーザー情報も取得
        },
        where: {
          removedAt: null,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  })
}

// 活動日を作成するための関数
export const createActivity = async (
  data: ActivityFormType,
  circleId: string,
  createdBy: string,
) => {
  // ISO文字列をLuxonで扱い、日本時間（Asia/Tokyo）に変換
  const activityDay = DateTime.fromJSDate(data.date).setZone(timeZone)

  // 開始時間と終了時間を日本時間として組み立て
  const startTime = activityDay
    .set({
      hour: parseInt(data.startTime.split(":")[0], 10),
      minute: parseInt(data.startTime.split(":")[1], 10),
    })
    .toUTC()
    .toJSDate()

  const endTime = data.endTime
    ? activityDay
        .set({
          hour: parseInt(data.endTime.split(":")[0], 10),
          minute: parseInt(data.endTime.split(":")[1], 10),
        })
        .toUTC()
        .toJSDate()
    : null
  // トランザクションでアクティビティ作成と参加者追加をまとめる
  return await db.$transaction(async (tx) => {
    // アクティビティの作成
    const newActivity = await tx.activity.create({
      data: {
        title: data.title,
        description: data.description || "", // オプションフィールドに空文字を設定
        activityDay: activityDay.toJSDate(), // 日付だけの情報
        startTime: startTime, // 日本時間をUTCに変換
        endTime: endTime, // 終了時間も同様に
        location: data.location || "",
        notes: data.notes,
        circleId: circleId,
        createdBy: createdBy,
      },
    })

    // サークルのメンバーを取得
    const members = await tx.circleMember.findMany({
      where: { circleId, leaveDate: null },
      select: { userId: true }, // ユーザーIDのみ取得
    })

    // サークルメンバーを参加者テーブルに一括登録
    const participants = members.map((member) => ({
      activityId: newActivity.id,
      userId: member.userId,
    }))

    await tx.activityParticipant.createMany({
      data: participants,
    })

    return newActivity
  })
}

export const updateActivity = async (
  data: ActivityFormType,
  activityId: number,
) => {
  // ISO文字列をLuxonで扱い、日本時間（Asia/Tokyo）に変換
  const activityDay = DateTime.fromJSDate(data.date).setZone(timeZone)

  // 開始時間と終了時間を日本時間として組み立て
  const startTime = activityDay
    .set({
      hour: parseInt(data.startTime.split(":")[0], 10),
      minute: parseInt(data.startTime.split(":")[1], 10),
    })
    .toUTC()
    .toJSDate()

  const endTime = data.endTime
    ? activityDay
        .set({
          hour: parseInt(data.endTime.split(":")[0], 10),
          minute: parseInt(data.endTime.split(":")[1], 10),
        })
        .toUTC()
        .toJSDate()
    : null

  return await db.activity.update({
    where: { id: activityId },
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      activityDay: activityDay.toJSDate(), // 日付だけの情報
      startTime: startTime, // 日本時間をUTCに変換
      endTime: endTime, // 終了時間も同様に
      notes: data.notes,
    },
  })
}

// アクティビティへの参加・キャンセルのトグル処理
export const updateActivityParticipation = async (
  activityId: number,
  userId: string,
) => {
  // 現在参加中のレコードを確認（removedAtがnullのもののみ）
  const existingParticipant = await db.activityParticipant.findFirst({
    where: {
      activityId,
      userId,
      removedAt: null,
    },
  })

  if (existingParticipant) {
    // 参加中のレコードが存在する場合、キャンセル（removedAtに日付をセット）
    await db.activityParticipant.update({
      where: { id: existingParticipant.id },
      data: { removedAt: new Date() },
    })
    return { action: "canceled" } // キャンセル完了
  } else {
    // 参加中のレコードがない場合、新しい参加レコードを作成
    await db.activityParticipant.create({
      data: {
        activityId,
        userId,
        joinedAt: new Date(),
        removedAt: null, // 新規参加時はremovedAtはnull
      },
    })
    return { action: "joined" } // 新規参加完了
  }
}

export const deleteActivity = async (activityId: number) => {
  return await db.activity.update({
    where: { id: activityId },
    data: {
      deletedAt: new Date(),
    },
  })
}

type WeeklyActivities = Record<
  string,
  {
    date: string // 日付（フォーマット済み）
    activities: {
      id: number
      title: string
      description?: string
      location: string
      startTime: string // 開始時間
      endTime?: string // 終了時間
      circle: Circle
    }[]
  }
>

export async function getWeeklyActivities(
  userId: string,
  startDate?: Date,
): Promise<WeeklyActivities> {
  const start = startDate ?? new Date()
  // 時刻部分を0にする
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 7) // 1週間後の日付
  end.setHours(23, 59, 59, 999) // 時刻を23:59:59.999に設定

  const activities = await db.activity.findMany({
    where: {
      circle: {
        CircleMember: {
          some: {
            userId: userId, // ユーザーが所属しているサークル
            leaveDate: null,
          },
        },
        deletedAt: null,
      },
      activityDay: {
        gte: start, // 開始日
        lt: end, // 終了日
      },
      deletedAt: null,
    },
    orderBy: {
      activityDay: "asc", // 日付順で並べる
    },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      activityDay: true,
      startTime: true,
      endTime: true,
      circle: true,
    },
  })

  // 日付ごとにイベントを分類
  const groupedActivities: WeeklyActivities = {}

  // 1週間の日付を初期化（空の配列を設定）
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + i)
    const dateStr = parseMonthDate(currentDate) // 日付を文字列に変換
    groupedActivities[dateStr] = {
      date: dateStr,
      activities: [], // 初期化されているか確認
    }
  }

  // データを分類
  activities.forEach((activity) => {
    const date = parseMonthDate(activity.activityDay) // 日付を文字列に変換
    if (groupedActivities[date]) {
      // 必ず存在することを確認
      groupedActivities[date].activities.push({
        id: activity.id,
        title: activity.title,
        description: activity.description || undefined,
        location: activity.location,
        startTime: parseMonthDate(activity.startTime),
        endTime: activity.endTime
          ? parseMonthDate(activity.endTime)
          : undefined,
        circle: activity.circle,
      })
    } else {
      console.error(`No group found for date: ${date}`) // デバッグ用
    }
  })

  return groupedActivities
}

export async function getMonthlyEvents(userId: string, startDate: Date) {
  // 月初と月末の日付を計算
  const startOfMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1,
  )
  const endOfMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0,
  )

  const events = await db.activity.findMany({
    where: {
      circle: {
        CircleMember: {
          some: {
            userId: userId, // ユーザーが所属しているサークル
            leaveDate: null,
          },
        },
        deletedAt: null,
      },
      activityDay: {
        gte: startOfMonth, // 月初以降
        lte: endOfMonth, // 月末まで
      },
      deletedAt: null,
    },
    orderBy: {
      activityDay: "asc", // 日付順で並べる
    },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      activityDay: true,
      startTime: true,
      endTime: true,
      circle: true,
    },
  })

  // データを整形
  return events
}
