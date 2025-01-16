"use client"
import { CalendarPlusIcon } from "@yamada-ui/lucide"
import type { FC } from "@yamada-ui/react"
import { Button } from "@yamada-ui/react"
import Link from "next/link"
import type { getActivityById } from "@/data/activity"

interface GoogleCalendarButtonProps {
  activity: NonNullable<Awaited<ReturnType<typeof getActivityById>>>
}

export const GoogleCalendarButton: FC<GoogleCalendarButtonProps> = ({
  activity,
}) => {
  const startDate = activity.startTime
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(".000Z", "Z")
  const endDate = activity.endTime
    ? activity.endTime.toISOString().replace(/[-:]/g, "").replace(".000Z", "Z")
    : startDate
  const title = encodeURIComponent(activity.title)
  const details = encodeURIComponent(activity.description || "")
  const location = encodeURIComponent(activity.location)

  const calendarLink = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`
  return (
    <Button
      as={Link}
      target="_blank"
      startIcon={<CalendarPlusIcon />}
      href={calendarLink}
      variant="solid"
      colorScheme="riverBlue"
    >
      Googleカレンダー
    </Button>
  )
}
