"use client"
import type { AlertStatusValue, FC } from "@yamada-ui/react"
import { SimpleGrid, Snacks, useSnacks } from "@yamada-ui/react"
import { MemberCard } from "./member-card"
import { MemberRequestCard } from "./member-request-card"
import type { getCircleById } from "@/actions/circle/fetch-circle"
import type { getMembershipRequests } from "@/actions/circle/membership-request"
import { removeMember } from "@/actions/circle/membership-request"
import { changeMemberRole } from "@/actions/circle/update-role"

interface CircleMembersProps {
  userId: string
  isAdmin: boolean
  userRole:
    | {
        id: number
        roleName: string
      }
    | undefined
  circle: Awaited<ReturnType<typeof getCircleById>>
  membershipRequests: Awaited<ReturnType<typeof getMembershipRequests>>
  fetchData: () => Promise<void>
}

export const CircleMembers: FC<CircleMembersProps> = ({
  userId,
  userRole,
  isAdmin,
  circle,
  membershipRequests,
  fetchData,
}) => {
  const { data } = membershipRequests
  const { snack, snacks } = useSnacks()
  const handleSnack = (title: string, status: AlertStatusValue) => {
    snack.closeAll()
    snack({ title, status })
  }
  const handleRoleChange = async (
    targetMemberId: string,
    newRoleId: number,
  ) => {
    try {
      const { message, success } = await changeMemberRole({
        userId, // 現在のユーザーID
        circleId: circle?.id || "", // サークルID
        targetMemberId, // 変更対象のメンバーID
        newRoleId, // 新しい役職ID
      })
      if (success) {
        handleSnack(message, "success")
        await fetchData() // データを再フェッチ
      } else {
        handleSnack(message, "error")
      }
    } catch (error) {
      handleSnack(
        error instanceof Error ? error.message : "エラーが発生しました。",
        "error",
      )
    }
  }

  const handleRemoveMember = async (targetMemberId: string) => {
    try {
      const { message, success } = await removeMember({
        circleId: circle?.id || "",
        targetMemberId,
        userId,
      })
      if (success) {
        handleSnack(message, "success")
        await fetchData() // データを再フェッチ
      } else {
        handleSnack(message, "error")
      }
    } catch (error) {
      handleSnack(
        error instanceof Error ? error.message : "エラーが発生しました。",
        "error",
      )
    }
  }
  return (
    <>
      <Snacks snacks={snacks} />
      <SimpleGrid w="full" columns={{ base: 2, md: 1 }} gap="md">
        {data?.map((member) => (
          <MemberRequestCard
            key={member.id}
            member={member}
            userId={userId}
            circleId={circle?.id || ""}
            fetchData={fetchData}
            handleSnack={handleSnack}
          />
        ))}
        {circle?.members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isAdmin={isAdmin}
            userId={userId}
            userRole={userRole}
            handleRoleChange={handleRoleChange}
            handleRemoveMember={handleRemoveMember}
          />
        ))}
      </SimpleGrid>
    </>
  )
}
