"use client"

import type { FC } from "@yamada-ui/react"
import {
  Indicator,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@yamada-ui/react"
import Link from "next/link"
import { CircleActivitydays } from "../data-display/circle-activitydays"
import { CircleAlbums } from "../data-display/circle-albums"
import { CircleMembers } from "../data-display/circle-members"
import { CircleThreads } from "../data-display/circle-threads"
import { CircleWelcome } from "../data-display/circle-welcome"
import type { getCircleById } from "@/actions/circle/fetch-circle"
import { type getMembershipRequests } from "@/actions/circle/membership-request"
import type { getWelcomeCard } from "@/actions/circle/welcome-card"
import type { getActivityById } from "@/data/activity"
import type { getAlbumById } from "@/data/album"
import type { getAnnouncementById } from "@/data/announcement"
import type { getThreadById } from "@/data/thread"
import { handlingTab } from "@/utils/format"

interface CircleDetailTabsProps {
  circle: Awaited<ReturnType<typeof getCircleById>>
  membershipRequests: Awaited<ReturnType<typeof getMembershipRequests>>
  tabKey?: string
  userId: string
  isAdmin?: boolean
  isMember?: boolean
  currentActivity?: Awaited<ReturnType<typeof getActivityById>>
  currentThread?: Awaited<ReturnType<typeof getThreadById>>
  currentAnnouncement?: Awaited<ReturnType<typeof getAnnouncementById>>
  currentAlbum?: Awaited<ReturnType<typeof getAlbumById>>
  fetchData: () => Promise<void>
  welcomeCards: Awaited<ReturnType<typeof getWelcomeCard>>
}

export const CircleDetailTabs: FC<CircleDetailTabsProps> = ({
  circle,
  tabKey,
  membershipRequests,
  userId,
  isAdmin,
  isMember,
  currentActivity,
  currentThread,
  currentAnnouncement,
  currentAlbum,
  fetchData,
  welcomeCards,
}) => {
  const userRole = circle?.members.find((member) => member.id === userId)?.role
  const tabIndex = handlingTab(tabKey || "")
  const { data } = membershipRequests
  // 正しいデータかどうかのチェック
  // カードが3つで3つともfrontImageとBackTitleとBackDescriptionがある場合はウェルカムページを表示
  const isWelcomeCardValid =
    welcomeCards?.length === 3 &&
    welcomeCards.every(
      (card) => card.frontImage && card.backTitle && card.backDescription,
    )

  return (
    <Tabs
      index={
        isMember || isWelcomeCardValid || tabIndex === 0
          ? tabIndex
          : tabIndex - 1
      }
      w="full"
      maxW="9xl"
      h="full"
      m="auto"
    >
      <TabList overflowX="auto" overflowY="hidden">
        {isMember || isWelcomeCardValid ? (
          <Tab flexShrink={0} as={Link} href={`/circles/${circle?.id}/welcome`}>
            Welcome
          </Tab>
        ) : undefined}
        <Tab
          flexShrink={0}
          as={Link}
          href={`/circles/${circle?.id}/activities`}
        >
          活動日程
        </Tab>
        <Tab flexShrink={0} as={Link} href={`/circles/${circle?.id}/album`}>
          アルバム
        </Tab>
        <Tab
          flexShrink={0}
          as={Link}
          href={`/circles/${circle?.id}/notifications`}
        >
          掲示板
        </Tab>
        <Tab flexShrink={0} as={Link} href={`/circles/${circle?.id}/members`}>
          <Indicator
            colorScheme="riverBlue"
            size="sm"
            placement="right"
            offset={-1.5}
            label={data?.length}
            disabled={!data?.length || !isAdmin}
          >
            メンバー一覧
          </Indicator>
        </Tab>
      </TabList>
      <TabPanels h="full">
        {isMember || isWelcomeCardValid ? (
          <TabPanel h="full">
            <CircleWelcome
              isMember={isMember}
              circleId={circle?.id || ""}
              userId={userId}
              welcomeCards={welcomeCards}
              isWelcomeCardValid={isWelcomeCardValid}
            />
          </TabPanel>
        ) : undefined}
        <TabPanel h="full">
          <CircleActivitydays
            userId={userId}
            userRole={userRole}
            isAdmin={isAdmin}
            isMember={isMember}
            currentActivity={currentActivity}
            circle={circle}
          />
        </TabPanel>
        <TabPanel h="full">
          <CircleAlbums
            userId={userId}
            circleId={circle?.id || ""}
            isAdmin={!!isAdmin}
            isMember={!!isMember}
            currentAlbum={currentAlbum}
          />
        </TabPanel>
        <TabPanel h="full">
          <CircleThreads
            userId={userId}
            isAdmin={isAdmin}
            isMember={isMember}
            circle={circle}
            currentThread={currentThread}
            currentAnnouncement={currentAnnouncement}
          />
        </TabPanel>
        <TabPanel h="full">
          <CircleMembers
            userId={userId}
            userRole={userRole}
            isAdmin={!!isAdmin}
            circle={circle}
            membershipRequests={membershipRequests}
            fetchData={fetchData}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
