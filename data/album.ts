import { db } from "@/utils/db"

export async function deleteAlbum(albumId: string) {
  return db.$transaction(async (tx) => {
    // アルバム情報を更新
    const album = await tx.album.update({
      where: { id: albumId },
      data: {
        deletedAt: new Date(),
      },
    })

    // 既存の画像を論理削除（deletedAtを設定）
    await tx.albumImage.updateMany({
      where: { albumId },
      data: { deletedAt: new Date() }, // 論理削除
    })
    return album
  })
}

export async function updateAlbum(
  albumId: string,
  title: string,
  description: string,
  images: string[],
) {
  return db.$transaction(async (tx) => {
    // アルバム情報を更新
    const album = await tx.album.update({
      where: { id: albumId },
      data: {
        title,
        description,
      },
    })

    // 既存の画像を論理削除（deletedAtを設定）
    await tx.albumImage.updateMany({
      where: { albumId },
      data: { deletedAt: new Date() }, // 論理削除
    })

    // 新しい画像を追加
    if (images.length > 0) {
      await tx.albumImage.createMany({
        data: images.map((imageUrl) => ({
          albumId,
          imageUrl,
        })),
      })
    }

    return album
  })
}

/**
 * アルバムを作成する
 * @param title アルバムのタイトル
 * @param description アルバムの説明
 * @param circleId サークルID
 * @param createdBy 作成者のユーザーID
 * @param images 画像URLのリスト
 */
export async function createAlbum(
  title: string,
  description: string,
  circleId: string,
  createdBy: string,
  images: string[],
) {
  return db.$transaction(async (tx) => {
    // アルバムを作成
    const album = await tx.album.create({
      data: {
        title,
        description,
        circleId,
        createdBy,
      },
    })

    // 画像を登録
    if (images.length > 0) {
      await tx.albumImage.createMany({
        data: images.map((imageUrl) => ({
          albumId: album.id,
          imageUrl,
        })),
      })
    }

    return album
  })
}

export const getAlbumById = async (albumId: string) =>
  await db.album.findUnique({
    where: {
      id: albumId,
    },
    include: {
      images: {
        where: {
          deletedAt: null,
        },
      },
    },
  })

export const getAlbumsByCircleId = async (circleId: string) =>
  await db.album.findMany({
    where: {
      circleId,
      deletedAt: null,
    },
    include: {
      images: {
        where: {
          deletedAt: null,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  })

export const getAlbums = async () =>
  db.album.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      images: {
        where: {
          deletedAt: null,
        },
      },
    },
  })
