import type { BackCircleForm } from "@/schema/circle"
import { db } from "@/utils/db"

export const getCircleOwner = async (circleId: string) => {
  return await db.circleMember.findFirst({
    where: {
      circleId,
      leaveDate: null,
      roleId: 0,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

// メンバーを退会（論理削除）させる関数
export const markMemberAsInactive = async (memberId: number) => {
  return await db.circleMember.update({
    where: { id: memberId },
    data: { leaveDate: new Date() }, // leaveDateに現在の日付を設定
  })
}

// 共通化されたメンバーの検索関数
export const findActiveMember = async (userId: string, circleId: string) => {
  return db.circleMember.findFirst({
    where: {
      userId,
      circleId,
      leaveDate: null, // leaveDateがnullなら退会していないメンバー
    },
    include: {
      user: {
        select: {
          id: true,
          name: true, // ユーザー名を取得
        },
      },
    },
  })
}

export const findCircleByName = async (
  name: string,
  excludeCircleId?: string,
) => {
  return await db.circle.findFirst({
    where: {
      name,
      deletedAt: null,
      ...(excludeCircleId && { id: { not: excludeCircleId } }),
    },
  })
}

// メンバーの入会処理
export const addMemberToCircle = async (
  userId: string,
  circleId: string,
  roleId: number,
) => {
  return await db.circleMember.create({
    data: {
      userId,
      circleId,
      roleId,
      // joinDate: new Date(), // 入会日を現在の日付に設定
    },
  })
}

// メンバーの退会処理（論理削除）
export const removeMemberFromCircle = async (
  userId: string,
  circleId: string,
) => {
  return await db.circleMember.updateMany({
    where: {
      userId,
      circleId,
      leaveDate: null, // 現在退会していないメンバーのみが対象
    },
    data: {
      leaveDate: new Date(), // 退会日を現在の日付に設定
    },
  })
}

export const isUserAdmin = async (userId: string, circleId: string) => {
  const admin = await db.circleMember.findFirst({
    where: {
      circleId,
      userId,
      leaveDate: null,
      roleId: {
        in: [0, 1], // 代表または副代表であれば管理者とみなす
      },
    },
  })

  return admin // 管理者であれば true を返す
}

// サークルを論理削除する関数
export const deleteCircle = async (circleId: string) => {
  try {
    // サークルの削除（論理削除）
    return await db.circle.update({
      where: { id: circleId },
      data: { deletedAt: new Date() }, // 現在の日時を設定
    })
  } catch (error) {
    console.error("サークル削除エラー:", error)
    return null
  }
}

export const addCircle = async (values: BackCircleForm) => {
  try {
    const circle = await db.circle.create({
      data: {
        name: values.name,
        description: values.description,
        location: values.location,
        imagePath: values.imagePath,
        activityDay: values.activityDay,
      },
    })
    return circle // 成功した場合は作成したサークルを返す
  } catch (error) {
    console.error("Failed to add circle: ", error)
    return null // エラーが発生した場合はnullを返す
  }
}

export const updateCircle = async (
  circleId: string,
  values: BackCircleForm,
) => {
  try {
    return await db.circle.update({
      where: {
        id: circleId,
        deletedAt: null,
      },
      data: {
        name: values.name,
        description: values.description,
        location: values.location,
        imagePath: values.imagePath,
        activityDay: values.activityDay,
      },
    })
  } catch (error) {
    console.error("Failed to update circle: ", error)
    return null
  }
}

export const updateInstructors = async (
  circleId: string,
  newInstructors: string[],
) => {
  try {
    const existingInstructors = await db.circleInstructor.findMany({
      where: { circleId },
    })

    const newInstructorsSet = new Set(newInstructors)

    // トランザクションで削除と追加を行う
    const deletePromises = existingInstructors
      .filter((instructor) => !newInstructorsSet.has(instructor.userId))
      .map((instructor) =>
        db.circleInstructor.delete({
          where: { id: instructor.id },
        }),
      )

    const createPromises = newInstructors
      .filter(
        (instructorId) =>
          !existingInstructors.some(
            (instructor) => instructor.userId === instructorId,
          ),
      )
      .map((instructorId) =>
        db.circleInstructor.create({
          data: {
            circleId,
            userId: instructorId,
          },
        }),
      )

    await db.$transaction([...deletePromises, ...createPromises])

    return true
  } catch (error) {
    console.error("Failed to update instructors: ", error)
    return null
  }
}

export const updateTags = async (circleId: string, newTags: string[]) => {
  try {
    const existingTags = await db.circleTag.findMany({
      where: { circleId },
    })

    const newTagsSet = new Set(newTags)

    // トランザクションで削除と追加を行う
    const deletePromises = existingTags
      .filter((tag) => !newTagsSet.has(tag.tagName))
      .map((tag) =>
        db.circleTag.delete({
          where: { id: tag.id },
        }),
      )

    const createPromises = newTags
      .filter((newTag) => !existingTags.some((tag) => tag.tagName === newTag))
      .map((newTag) =>
        db.circleTag.create({
          data: {
            circleId,
            tagName: newTag,
          },
        }),
      )

    await db.$transaction([...deletePromises, ...createPromises])

    return true
  } catch (error) {
    console.error("Failed to update tags: ", error)
    return null
  }
}

export const addInitialMember = async (circleId: string, userId: string) => {
  try {
    const member = await db.circleMember.create({
      data: {
        circleId,
        userId,
        roleId: 0, // 代表の役割IDを適切に設定
      },
    })
    return member // 成功した場合は追加したメンバーを返す
  } catch (error) {
    console.error("Failed to add initial member: ", error)
    return null // エラーが発生した場合はnullを返す
  }
}

export const addInstructors = async (
  circleId: string,
  instructorIds: string[],
) => {
  try {
    const instructorsData = instructorIds.map((instructorId) => ({
      circleId,
      userId: instructorId,
    }))

    const result = await db.circleInstructor.createMany({
      data: instructorsData,
    })
    return result // 成功した場合は結果を返す
  } catch (error) {
    console.error("Failed to add instructors: ", error)
    return null // エラーが発生した場合はnullを返す
  }
}

export const addTags = async (circleId: string, tags: string[]) => {
  try {
    const tagsData = tags.map((tagName) => ({
      circleId,
      tagName,
    }))

    const result = await db.circleTag.createMany({
      data: tagsData,
    })
    return result // 成功した場合は結果を返す
  } catch (error) {
    console.error("Failed to add tags: ", error)
    return null // エラーが発生した場合はnullを返す
  }
}

export const getInstructors = async () =>
  db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      profileText: true,
      studentNumber: true,
      updatedAt: true,
      createdAt: true,
      profileImageUrl: true,
      accounts: true,
    },
    where: {
      instructorFlag: true,
    },
  })

export const getMemberByCircleId = async (circleId: string) => {
  try {
    const members = await db.circleMember.findMany({
      where: {
        circleId: circleId, // 特定のサークルIDに関連するメンバーをフィルタリング
        leaveDate: null, // 退会日が設定されていない（退会していない）メンバーのみ取得
      },
      include: {
        user: true, // 関連するユーザー情報を含める
        role: true,
      },
    })

    return members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      profileImageUrl: member.user.profileImageUrl,
      studentNumber: member.user.studentNumber,
      profileText: member.user.profileText,
      joinDate: member.joinDate,
      role: member.role, // ロール名を含める
    }))
  } catch (error) {
    console.error("getMemberByCircleId: ", error)
    return null
  }
}
