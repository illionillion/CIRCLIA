"use client"

import { useTransition } from "react"
import { markNotificationAsReadAction } from "@/actions/notification"

export function useMarkNotificationAsRead() {
  const [isPending, startTransition] = useTransition()

  const markAsRead = (userId: string, notificationId: string) => {
    startTransition(async () => {
      const { success, error } = await markNotificationAsReadAction(
        userId,
        notificationId,
      )
      if (!success) {
        console.error(error)
      }
    })
  }

  return { isPending, markAsRead }
}
