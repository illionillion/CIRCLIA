"use client"
import type { UsageTheme } from "@yamada-ui/react"
import { extendComponent, extendTheme } from "@yamada-ui/react"

import * as styles from "./styles"
// import components from './components'
import * as tokens from "./tokens/index"

const customTheme: UsageTheme = {
  styles,
  // components,
  components: {
    Input: {
      baseStyle: {
        bg: "white",
      },
    },
    Flip: extendComponent("Flip", {
      baseStyle: {
        from: {
          w: "full",
          h: "full",
        },
        to: {
          w: "full",
          h: "full",
        },
      },
    }),
  },
  ...tokens,
}

export default extendTheme(customTheme)()
