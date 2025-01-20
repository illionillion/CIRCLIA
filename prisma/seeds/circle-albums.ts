import { db } from "@/utils/db"

export const circleAlbums = () => {
  return db.album.createMany({
    data: [
      {
        id: "album00-uuid",
        circleId: "circle00-uuid",
        title: "アルバム1",
        description: "アルバム1の説明",
        createdBy: "user1-uuid",
      },
    ],
  })
}

export const circleAlbumImages = () => {
  return db.albumImage.createMany({
    data: [
      {
        albumId: "album00-uuid",
        imageUrl:
          "https://user0514.cdnw.net/shared/img/thumb/aig-ai23717041-xl_TP_V.jpg",
      },
      {
        albumId: "album00-uuid",
        imageUrl:
          "https://user0514.cdnw.net/shared/img/thumb/21830aIMGL99841974_TP_V.jpg",
      },
    ],
  })
}
