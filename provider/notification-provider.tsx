"use client"

import { useSafeLayoutEffect } from "@yamada-ui/react"
import { useSession } from "next-auth/react"
import type { ReactNode } from "react"
import { createContext, useContext, useState } from "react"
import { getNotificationsByUserIdAction } from "@/actions/notification"
import type { getNotificationsByUserId } from "@/data/notification"

interface NotificationContextType {
  notifications: Awaited<ReturnType<typeof getNotificationsByUserId>>
  unreadCount: number
  refreshNotifications: (userId: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
)

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const { data } = useSession()
  const [notifications, setNotifications] = useState<
    Awaited<ReturnType<typeof getNotificationsByUserId>>
  >([])
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshNotifications = async (userId: string) => {
    const notifications = await getNotificationsByUserIdAction(userId)
    setNotifications(notifications)
    setUnreadCount(
      notifications.filter((notification) => !notification.readAt).length,
    )
  }

  useSafeLayoutEffect(() => {
    refreshNotifications(data?.user?.id || "")
  }, [data?.user])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, refreshNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    )
  }
  return context
}
