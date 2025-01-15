"use client"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { FC } from "@yamada-ui/react"
import { UIProvider } from "@yamada-ui/react"
import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { NotificationProvider } from "./notification-provider"
import theme from "@/theme"

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <UIProvider theme={theme}>
      <SessionProvider>
        <NotificationProvider>
          {children}
          <SpeedInsights />
          <Analytics />
        </NotificationProvider>
      </SessionProvider>
    </UIProvider>
  )
}
