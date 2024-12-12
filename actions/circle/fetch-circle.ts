"use server"
import { db } from "@/utils/db"

export const getCircleById = async (id: string) => {
  try {
    const circle = await db.circle.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        CircleMember: {
          where: {
            leaveDate: null, // 退会日が設定されていないメンバーのみ取得
          },
          include: {
            user: true, // 関連するユーザー情報を含める
            role: true,
          },
          orderBy: [
            {
              roleId: "asc",
            },
            {
              user: {
                name: "asc",
              },
            },
          ],
        },
        CircleInstructor: {
          include: {
            user: true, // 関連するユーザー情報を含める
          },
        },
        CircleTag: true,
      },
    })

    // メンバー数を手動でカウント
    const memberCount = circle?.CircleMember.length || 0

    return circle
      ? {
          ...circle,
          memberCount, // 退会していないメンバーのみカウント
          members: circle.CircleMember.map((member) => ({
            id: member.user.id,
            name: member.user.name,
            email: member.user.email,
            profileImageUrl: member.user.profileImageUrl,
            studentNumber: member.user.studentNumber,
            profileText: member.user.profileText,
            joinDate: member.joinDate,
            role: member.role,
          })),
          instructors: circle.CircleInstructor.map((instructor) => ({
            id: instructor.user.id,
            name: instructor.user.name,
            email: instructor.user.email,
            profileImageUrl: instructor.user.profileImageUrl,
            studentNumber: instructor.user.studentNumber,
            profileText: instructor.user.profileText,
          })),
          tags: circle.CircleTag.map((tag) => ({
            id: tag.id,
            tagName: tag.tagName,
          })),
        }
      : null
  } catch (error) {
    console.error("getCircleById: ", error)
    return null
  }
}

export const getCircles = async () => {
  try {
    const circles = await db.circle.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        CircleMember: {
          where: {
            leaveDate: null, // 退会日が設定されていないメンバーのみを取得
          },
        },
        CircleTag: true,
      },
    })

    return circles.map((circle) => ({
      id: circle.id,
      name: circle.name,
      description: circle.description,
      location: circle.location,
      imagePath: circle.imagePath,
      activityDay: circle.activityDay,
      memberCount: circle.CircleMember.length, // 退会していないメンバーのみカウント
      tags: circle.CircleTag.map((tag) => tag.tagName),
    }))
  } catch (error) {
    console.error("getCircles: ", error)
    return null
  }
}

export const getCirclesByUserId = async (userId: string) => {
  try {
    const circles = await db.circle.findMany({
      where: {
        deletedAt: null,
        CircleMember: {
          some: {
            userId: userId, // 特定のユーザーIDに関連するサークルをフィルタリング
            leaveDate: null, // 退会していない場合のみ取得
          },
        },
      },
      include: {
        CircleMember: {
          where: {
            leaveDate: null, // 退会日が設定されていないメンバーのみ取得
          },
        },
      },
    })

    return circles.map((circle) => ({
      id: circle.id,
      name: circle.name,
      description: circle.description,
      location: circle.location,
      imagePath: circle.imagePath,
      activityDay: circle.activityDay,
      memberCount: circle.CircleMember.length, // 退会していないメンバーのみをカウント
    }))
  } catch (error) {
    console.error("getCirclesByUserId: ", error)
    return null
  }
}

export const getCirclesByInstructorId = async (userId: string) => {
  try {
    const circles = await db.circle.findMany({
      where: {
        deletedAt: null, // 削除されていないサークル
        CircleInstructor: {
          some: {
            userId: userId, // 特定のユーザーIDに関連するサークルをフィルタリング
          },
        },
      },
      include: {
        CircleMember: {
          where: {
            leaveDate: null, // 退会日が設定されていないメンバーのみ取得
          },
        },
        CircleInstructor: true, // 講師の情報を取得
      },
    })

    return circles.map((circle) => ({
      id: circle.id,
      name: circle.name,
      description: circle.description,
      location: circle.location,
      imagePath: circle.imagePath,
      activityDay: circle.activityDay,
      memberCount: circle.CircleMember.length, // 退会していないメンバーのみをカウント
      // instructorCount: circle.CircleInstructor.length, // 関連する講師の数をカウント
    }))
  } catch (error) {
    console.error("getCirclesByInstructorId: ", error)
    return null
  }
}
