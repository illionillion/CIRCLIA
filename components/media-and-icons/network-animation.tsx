"use client"
import { ui } from "@yamada-ui/react"
import { useEffect, useRef } from "react"
import NetWorkAnimationJson from "@/public/lottie/network.json"

export default function NetWorkAnimation() {
  const animationRef = useRef<HTMLDivElement | null>(null)

  async function getLottie() {
    const lot = await import("lottie-web")

    // ダブらないようにchildNodesが0の時だけロード
    if (animationRef.current && animationRef.current.childNodes.length === 0) {
      console.log(
        "load animation",
        animationRef.current.childNodes.length === 0,
      )
      lot.default.loadAnimation({
        autoplay: true,
        loop: true,
        animationData: NetWorkAnimationJson,
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
      height={{ base: "150px", sm: "100px" }}
      width={{ base: "150px", sm: "100px" }}
      ref={animationRef}
    ></ui.div>
  )
}
