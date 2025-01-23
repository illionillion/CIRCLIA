//タブのタイトル変更

import { getCircleById } from "@/actions/circle/fetch-circle"

const handlingTabTitle = (key: string) => {
  switch (key) {
    case "welcome":
      return "ウェルカムページ"
    case "activities":
      return "活動日程"
    case "album":
      return "アルバム"
    case "notifications":
      return "掲示板"
    case "members":
      return "メンバー一覧"
    default:
      return key
  }
}

export const MetadataSet = async (circle_id: string, page_key: string) => {
  if (circle_id === "") {
    if (page_key === "") {
      return {
        title: "CIRCLIA",
        description: "CIRCLIA",
      }
    }

    return {
      title: page_key + " - CIRCLIA",
      description: page_key + " - CIRCLIA",
    }
  }

  const circle = await getCircleById(circle_id || "")
  if (!circle) {
    return {
      title: "サークルが見つかりません。",
      description: "サークルが見つかりません。",
    }
  }

  const page = handlingTabTitle(page_key || "")
  return {
    title: page + " - " + circle.name,
    description: page + " - " + circle.description,
  }
}
