import type { FC } from "@yamada-ui/react"
import { Button } from "@yamada-ui/react"
import Link from "next/link"
import { CircleMembershipButton } from "./circle-membership-button"
import type { getCircleById } from "@/actions/circle/fetch-circle"
import { handlingTab } from "@/utils/format"
interface CircleDetailButtonProps {
  tabKey: string
  isAdmin: boolean
  isMember: boolean
  circle: Awaited<ReturnType<typeof getCircleById>>
  userId: string
}
export const CircleDetailButton: FC<CircleDetailButtonProps> = ({
  tabKey,
  isAdmin,
  isMember,
  circle,
  userId,
}) => {
  switch (handlingTab(tabKey)) {
    case 0: {
      return (
        <>
          {isAdmin && (
            <Button
              colorScheme="riverBlue"
              as={Link}
              href={`/circles/${circle?.id}/edit`}
            >
              サークル編集
            </Button>
          )}
          {!isMember && (
            <CircleMembershipButton
              circleId={circle?.id || ""}
              userId={userId}
              isAdmin={!!isAdmin}
              isMember={!!isMember}
            />
          )}
        </>
      )
    }
    case 1: {
      return (
        <>
          {isAdmin && (
            <Button
              colorScheme="riverBlue"
              as={Link}
              href={`/circles/${circle?.id}/edit`}
            >
              サークル編集
            </Button>
          )}
          {!isMember && (
            <CircleMembershipButton
              circleId={circle?.id || ""}
              userId={userId}
              isAdmin={!!isAdmin}
              isMember={!!isMember}
            />
          )}
        </>
      )
    }
    case 2: {
      return (
        <>
          {isAdmin && (
            <Button
              colorScheme="riverBlue"
              as={Link}
              href={`/circles/${circle?.id}/edit`}
            >
              サークル編集
            </Button>
          )}
          {!isMember && (
            <CircleMembershipButton
              circleId={circle?.id || ""}
              userId={userId}
              isAdmin={!!isAdmin}
              isMember={!!isMember}
            />
          )}
        </>
      )
    }
    default: {
      return (
        <>
          <CircleMembershipButton
            circleId={circle?.id || ""}
            userId={userId}
            isAdmin={!!isAdmin}
            isMember={!!isMember}
          />
        </>
      )
    }
  }
}
