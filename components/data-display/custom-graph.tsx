"use client"

import type { FC } from "@yamada-ui/react"
import {
  useSafeLayoutEffect,
  useBoolean,
  Center,
  Text,
  Card,
  useBreakpointEffect,
} from "@yamada-ui/react"
import { useRef, useState } from "react"
import { ForceGraph2D } from "react-force-graph"
import NetWorkAnimation from "../media-and-icons/network-animation"
import RobotAnimation from "../media-and-icons/robot-animation"
import type { getSuggestions } from "@/actions/suggestion"

interface ForceGraphMethods {
  d3Force: (force: string) =>
    | {
        strength: (value: number) => void
        distance?: (value: (link: Link) => number) => void
      }
    | undefined
}

interface Node {
  id: string
  label?: string
  name?: string
  x?: number
  y?: number
  __bckgDimensions?: [number, number]
}

interface Link {
  source: string
  target: string
  value: number
}

interface CustomGraphProps {
  query: string
  data: Awaited<ReturnType<typeof getSuggestions>>
  loading?: boolean
}

const CustomGraph: FC<CustomGraphProps> = ({ query, data, loading }) => {
  const graphRef = useRef<ForceGraphMethods | null>(null) // 型を追加
  const imageRef = useRef(new Map<string, HTMLImageElement>())
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useBoolean(false)
  const zoomLevelRef = useRef(1)
  const breakPointRef = useRef(0)

  // onZoomハンドラ内ではuseRefの値を更新する
  const handleZoom = (event: { k: number }) => {
    zoomLevelRef.current = event.k
  }

  useBreakpointEffect((breakpoint) => {
    if (breakpoint === "sm") {
      breakPointRef.current = 60
    } else {
      breakPointRef.current = 0
    }
  }, [])

  useSafeLayoutEffect(() => {
    data.nodes.forEach((node) => {
      if (node.imagePath) {
        const image = new Image()
        image.src = node.imagePath
        imageRef.current.set(node.id, image)
      }
    })
  }, [data])

  useSafeLayoutEffect(() => {
    if (graphRef.current) {
      graphRef.current?.d3Force("charge")?.strength(-100) // ノード間の距離を広げる

      graphRef.current?.d3Force("link")?.distance?.((link) => {
        const isKeywordLink =
          (link.source as unknown as { name: string }).name === query ||
          (link.target as unknown as { name: string }).name === query
        if (isKeywordLink) {
          // キーワードノードとのリンクは距離を縮める
          return 100 // キーワードノードとの距離を近づける
        }

        // // その他のリンクは元の距離を維持
        // return (1 - link.value) * 700 // 類似度に応じて距離を調整
        return 200
      })
    }
  }, [data, query, zoomLevelRef.current])

  useSafeLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const height =
          window.innerHeight -
          containerRef.current.offsetTop -
          breakPointRef.current
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: height,
        })
      }
    }

    window.addEventListener("resize", updateDimensions)
    updateDimensions() // 初回にサイズを設定

    let isMouseDown = false
    const handleMouseDown = () => {
      isMouseDown = true
    }
    const handleMouseUp = () => {
      isMouseDown = false
      setIsDragging.off()
    }
    const handleMouseMove = () => {
      if (isMouseDown) {
        setIsDragging.on()
      }
    }

    const canvas = containerRef.current?.querySelector("canvas")

    if (canvas) {
      // 動かない
      canvas.addEventListener("mousedown", handleMouseDown)
      canvas.addEventListener("mouseup", handleMouseUp)
      canvas.addEventListener("pointerdown", handleMouseDown)
      canvas.addEventListener("pointerup", handleMouseUp)
      // これだけ動く
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("pointermove", handleMouseMove)
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousedown", handleMouseDown)
        canvas.removeEventListener("mouseup", handleMouseUp)
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("pointerdown", handleMouseDown)
        canvas.removeEventListener("pointerup", handleMouseUp)
        canvas.removeEventListener("pointermove", handleMouseMove)
      }
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  return (
    <Center w="full" h="full" ref={containerRef} position="relative">
      {loading && (
        <Center
          position="absolute"
          zIndex="beerus"
          rounded="full"
          boxSize={{ base: "md", sm: "xs" }}
          bg="blackAlpha.100"
          flexDir="column"
          pointerEvents="none"
          as={Card}
        >
          <RobotAnimation />
          <Text mt="-lg">生成中です・・・</Text>
        </Center>
      )}
      {data.nodes.length === 0 && !loading && (
        <Center
          position="absolute"
          zIndex="beerus"
          rounded="full"
          boxSize={{ base: "md", sm: "xs" }}
          bg="blackAlpha.100"
          flexDir="column"
          pointerEvents="none"
          as={Card}
        >
          <NetWorkAnimation />
          <Text>AIを使って類似度で検索しよう</Text>
          <Text color="danger">PC推奨</Text>
        </Center>
      )}
      <ForceGraph2D
        ref={graphRef as any}
        onZoom={handleZoom}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeLabel={(node: Node) => node.label || ""}
        nodeAutoColorBy="id"
        linkWidth={(link: Link) => link.value * 10}
        nodeCanvasObject={(node: Node, ctx) => {
          const scale = zoomLevelRef.current
          const label = node.label || ""
          const fontSize = 12 / scale
          ctx.font = `${fontSize}px Sans-Serif`
          const textWidth = ctx.measureText(label).width
          const textHeight =
            ctx.measureText(label).actualBoundingBoxAscent +
            ctx.measureText(label).actualBoundingBoxDescent
          const cardWidth = Math.max(60 / scale, textWidth + 20 / scale)
          const image = imageRef.current.get(node.id)
          let cardHeight = 0

          if (image) {
            const imageAspectRatio = image.width / image.height
            cardHeight = cardWidth / imageAspectRatio
          } else {
            cardHeight = cardWidth * (2 / 3)
          }

          const totalCardHeight = cardHeight + textHeight + fontSize * 2

          if (node.id === "query") {
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
            ctx.shadowBlur = 10
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 2
            const radius = Math.max(20 / scale, textWidth / 2 + 10 / scale)
            ctx.beginPath()
            ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI, false)
            ctx.fillStyle = "#5cc0db"
            ctx.fill()
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(label, node.x || 0, node.y || 0)
            node.__bckgDimensions = [radius * 2, radius * 2]
            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
          } else {
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
            ctx.shadowBlur = 10
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 5

            ctx.fillStyle = image ? "white" : "lightgray" // 画像がない場合に薄いグレーを使用
            ctx.fillRect(
              (node.x || 0) - cardWidth / 2,
              (node.y || 0) - totalCardHeight / 2,
              cardWidth,
              totalCardHeight,
            )

            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0

            if (image) {
              ctx.drawImage(
                image,
                (node.x || 0) - cardWidth / 2,
                (node.y || 0) - totalCardHeight / 2,
                cardWidth,
                cardHeight,
              )
            } else {
              const labelBackgroundY =
                (node.y || 0) + cardHeight / 2 - textHeight / 2 - fontSize
              ctx.fillStyle = "white"
              ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
              ctx.shadowBlur = 6
              ctx.shadowOffsetY = 5
              ctx.fillRect(
                (node.x || 0) - cardWidth / 2,
                labelBackgroundY,
                cardWidth,
                textHeight + fontSize * 2,
              )
              ctx.shadowColor = "transparent"
              ctx.shadowBlur = 0
              ctx.shadowOffsetX = 0
              ctx.shadowOffsetY = 0
              ctx.shadowOffsetY = 0
            }

            ctx.fillStyle = "black"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(label, node.x || 0, (node.y || 0) + cardHeight / 2)
            node.__bckgDimensions = [cardWidth, totalCardHeight]
          }
        }}
        nodePointerAreaPaint={(node: Node, color, ctx) => {
          const bckgDimensions = node.__bckgDimensions
          if (bckgDimensions) {
            ctx.fillStyle = color
            ctx.fillRect(
              (node.x || 0) - bckgDimensions[0] / 2,
              (node.y || 0) - bckgDimensions[1] / 2,
              ...bckgDimensions,
            )
          }
        }}
        onNodeClick={(node) => {
          if (node.id === "query" || isDragging) {
            return
          }
          // ノードをクリックした際の遷移処理
          window.open(`/circles/${node.id}/`, "_blank")
        }}
      />
    </Center>
  )
}

export default CustomGraph
