"use client"

import type { FC } from "@yamada-ui/react"
import { useSafeLayoutEffect, ui } from "@yamada-ui/react"
import { useRef, useState } from "react"
import { ForceGraph2D } from "react-force-graph"
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
}

const CustomGraph: FC<CustomGraphProps> = ({ query, data }) => {
  const graphRef = useRef<ForceGraphMethods | null>(null) // 型を追加
  const imageRef = useRef(new Map<string, HTMLImageElement>())
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useSafeLayoutEffect(() => {
    data.nodes.forEach((node) => {
      const image = new Image()
      image.src =
        node.imagePath ||
        "https://user0514.cdnw.net/shared/img/thumb/21830aIMGL99841974_TP_V.jpg"
      imageRef.current.set(node.id, image)
    })
  }, [])

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
  }, [data, query])

  useSafeLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    window.addEventListener("resize", updateDimensions)
    updateDimensions() // 初回にサイズを設定
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  return (
    <ui.div w="full" h="full" ref={containerRef}>
      <ForceGraph2D
        ref={graphRef as any}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeLabel={(node: Node) => node.label || ""}
        nodeAutoColorBy="id"
        linkWidth={(link: Link) => link.value * 10}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={(link: Link) =>
          link.value > 0.7 ? "red" : "blue"
        }
        nodeCanvasObject={(node: Node, ctx, globalScale) => {
          const label = node.label || ""
          const fontSize = 12 / globalScale
          ctx.font = `${fontSize}px Sans-Serif`
          // ラベルの文字幅を計算
          const textWidth = ctx.measureText(label).width
          const textHeight =
            ctx.measureText(label).actualBoundingBoxAscent +
            ctx.measureText(label).actualBoundingBoxDescent
          const cardWidth = Math.max(60, textWidth + 20) // 最小幅を60pxに設定、余白20px
          const image = imageRef.current.get(node.id)
          // カードの高さを画像のアスペクト比を保ちながら調整
          let cardHeight = 0
          if (image) {
            const imageAspectRatio = image.width / image.height // 画像のアスペクト比
            cardHeight = cardWidth / imageAspectRatio // 横幅に合わせた高さに設定
          }
          // ラベルと説明をカードに含める
          const totalCardHeight = cardHeight + textHeight + fontSize * 2 // 画像 + ラベル + 説明部分
          if (node.label === query) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)" // 影の色
            ctx.shadowBlur = 10 // 影のぼかし
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 2 // 影のY軸方向のオフセット
            // キーワードノードの描画
            const radius = Math.max(20, textWidth / 2 + 10) // 円の半径をテキストの横幅に合わせる
            ctx.beginPath()
            ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI, false)
            ctx.fillStyle = "rgba(0, 255, 0, 0.8)" // 円の色
            ctx.fill()
            ctx.fillStyle = "black"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(label, node.x || 0, node.y || 0)
            // バックグラウンドの寸法を円に合わせて設定
            node.__bckgDimensions = [radius * 2, radius * 2] // 円の直径
            // 影の設定をリセット
            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
          } else if (image) {
            // 影をカード部分にだけ適用
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)" // 影の色
            ctx.shadowBlur = 10 // 影のぼかし
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 5 // 影のY軸方向のオフセット
            // 左にも右にも影を当てたい
            // サークルノードの描画 (背景を白に設定)
            ctx.fillStyle = "white" // 背景を白に設定
            ctx.fillRect(
              (node.x || 0) - cardWidth / 2,
              (node.y || 0) - totalCardHeight / 2,
              cardWidth,
              totalCardHeight,
            )
            // 影の設定をクリア
            ctx.shadowColor = "transparent" // 影をリセット
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
            // 画像をカード内に収める（画像の上部をカードの上部に合わせる）
            ctx.drawImage(
              image,
              (node.x || 0) - cardWidth / 2,
              (node.y || 0) - totalCardHeight / 2,
              cardWidth,
              cardHeight,
            )
            // サークル名（ラベル）を画像の下に描画
            ctx.fillStyle = "black"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(label, node.x || 0, (node.y || 0) + cardHeight / 2)
            // バックグラウンドの寸法を再設定
            node.__bckgDimensions = [cardWidth, totalCardHeight] // 高さをラベルと説明まで含めて設定
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
          if (node.id === "query") {
            return
          }
          // ノードをクリックした際の遷移処理
          window.open(`/circles/${node.id}/`, "_blank")
        }}
      />
    </ui.div>
  )
}

export default CustomGraph
