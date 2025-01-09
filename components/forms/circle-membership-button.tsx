"use client"

import type { FC } from "@yamada-ui/react"
import { Button, useBoolean, useSafeLayoutEffect } from "@yamada-ui/react"
import Link from "next/link"
import { useState } from "react"
import {
  checkPendingRequest,
  handleMembershipRequest,
} from "@/actions/circle/membership-request"

interface CircleMembershipButtonProps {
  isAdmin: boolean
  isMember: boolean
  circleId: string
  userId: string
}

export const CircleMembershipButton: FC<CircleMembershipButtonProps> = ({
  isAdmin,
  isMember,
  circleId,
  userId,
}) => {
  const [pendingJoinRequest, setPendingJoinRequest] = useState(false)
  const [pendingWithdrawalRequest, setPendingWithdrawalRequest] =
    useState(false)
  const [isLoading, { on, off }] = useBoolean()

  const handleMemberButtonClick = async () => {
    on()
    const type = isMember ? "withdrawal" : "join"
    const result = await handleMembershipRequest(userId, circleId, type)
    if (result) {
      await fetchPendingRequests()
    }
    off()
  }

  const fetchPendingRequests = async () => {
    const joinRequest = await checkPendingRequest(userId, circleId, "join")
    const withdrawalRequest = await checkPendingRequest(
      userId,
      circleId,
      "withdrawal",
    )

    setPendingJoinRequest(joinRequest)
    setPendingWithdrawalRequest(withdrawalRequest)
  }

  // ペンディングの申請があるか確認
  useSafeLayoutEffect(() => {
    fetchPendingRequests()
  }, [userId, circleId])

  if (isAdmin) {
    return (
      <Button
        colorScheme="riverBlue"
        as={Link}
        href={`/circles/${circleId}/edit`}
      >
        サークル編集
      </Button>
    )
  }

  if (isMember) {
    // 退会申請中の状態を確認
    return pendingWithdrawalRequest ? (
      <Button colorScheme="riverBlue" disabled>
        退会申請中
      </Button>
    ) : (
      <Button
        colorScheme="riverBlue"
        onClick={handleMemberButtonClick}
        loading={isLoading}
      >
        退会申請
      </Button>
    )
  } else {
    // 入会申請中の状態を確認
    return pendingJoinRequest ? (
      <Button colorScheme="riverBlue" disabled>
        入会申請中
      </Button>
    ) : (
      <Button
        colorScheme="riverBlue"
        onClick={handleMemberButtonClick}
        loading={isLoading}
      >
        入会申請
      </Button>
    )
  }
}
