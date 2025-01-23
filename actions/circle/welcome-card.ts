"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { getMemberByCircleId } from "@/data/circle"
import type { FrontWelcomeCard } from "@/schema/welcome"
import { db } from "@/utils/db"

export const getWelcomeCard = async (circleId: string) => {
  const cards = await db.welcomeCard.findMany({
    where: {
      circleId,
    },
  })
  return cards
}

export const updateWelcomeCard = async (
  circleId: string,
  userId: string,
  cards: FrontWelcomeCard[],
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

    // 既存のカードを削除
    await db.welcomeCard.deleteMany({
      where: {
        circleId,
      },
    })

    // 新しいカードを作成
    await db.welcomeCard.createMany({
      data: cards.map((card) => ({
        circleId,
        frontTitle: card.frontTitle,
        frontImage: card.frontImage,
        backTitle: card.backTitle,
        backDescription: card.backDescription,
      })),
    })

    revalidatePath(`/circles/${circleId}`)

    return {
      success: true,
      message: "ウェルカムカードを更新しました",
    }
  } catch (error) {
    console.error("Failed to update welcome cards:", error)
    return {
      success: false,
      message: "ウェルカムカードの更新に失敗しました",
    }
  }
}
