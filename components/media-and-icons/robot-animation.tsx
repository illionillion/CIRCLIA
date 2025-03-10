"use client"
import { ui } from "@yamada-ui/react"
import { useEffect, useRef } from "react"
import RobotAnimationJson from "@/public/lottie/robot-animation.json"

export default function RobotAnimation() {
  const animationRef = useRef<HTMLDivElement | null>(null)

  async function getLottie() {
    const lot = await import("lottie-web")

    // ダブらないようにchildNodesが0の時だけロード
    if (animationRef.current && animationRef.current.childNodes.length === 0) {
      lot.default.loadAnimation({
        autoplay: true,
        loop: true,
        animationData: RobotAnimationJson,
        container: animationRef.current,
      })
    }
  }
  useEffect(() => {
    getLottie()
  }, [])

  return (
    <ui.div
      pointerEvents="none"
      height={{ base: "250px", sm: "150px" }}
      width={{ base: "250px", sm: "150px" }}
      ref={animationRef}
    ></ui.div>
  )
}
