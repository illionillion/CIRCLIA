import type { UIStyle } from "@yamada-ui/react"

export const globalStyle: UIStyle = {
  body: {
    backgroundImage: "/images/white_marble.png",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
    backgroundPosition: "center center",
  },
  ".ui-input": {
    bg: "rgba(0, 0, 0, 0.04) !important",
  },
  ".ui-textarea": {
    bg: "rgba(0, 0, 0, 0.04) !important",
  },
  ".ui-date-picker__field": {
    bg: "rgba(0, 0, 0, 0.04) !important",
  },
}
