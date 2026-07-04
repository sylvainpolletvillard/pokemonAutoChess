import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Tooltip } from "react-tooltip"
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import { AtlasTree } from "../../../../../core/atlas"
import type { Emera, TreeNode } from "../../../../../types/atlas"
import { PkmIndex } from "../../../../../types/enum/Pokemon"
import { getPortraitSrc } from "../../../../../utils/avatar"
import { ItemDetailTooltipContent } from "../../../game/components/item-detail"
import { playSound, SOUNDS } from "../../utils/audio"
import { addIconsToDescription } from "../../utils/descriptions"
import { cc } from "../../utils/jsx"
import PokemonPortrait from "../pokemon-portrait"
import "./atlas.css"

export function Atlas() {
  const [allocatedNodes, setAllocatedNodes] = useState<Set<string>>(
    new Set(["root"])
  )

  const handleNodeClick = (node: TreeNode) => {
    if (allocatedNodes.has(node.id)) return // Already allocated
    if (isConnectedAndAllocatable(node.id, allocatedNodes)) {
      playSound(
        node.type === "keystone" || node.type === "item"
          ? SOUNDS.EMERA_KEYSTONE
          : SOUNDS.EMERA
      )
      setAllocatedNodes((prev) => new Set([...prev, node.id]))
    }
  }

  const COLOR_GLOW = "#ffffff"

  return (
    <div
      style={{
        width: "800px",
        height: "800px",
        margin: "auto",
        aspectRatio: "1/1",
        overflow: "hidden",
        position: "relative",
        border: "var(--border-thick)"
      }}
    >
      <TransformWrapper
        initialScale={3.4}
        minScale={2.5}
        maxScale={8}
        smooth={true}
        centerOnInit={true}
        centerZoomedOut={true}
        wheel={{ step: 0.005 }}
      >
        <video
          autoPlay
          loop
          muted
          src="/assets/atlas/atlasbg.webm"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1
          }}
        ></video>
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
          <svg
            width="100%"
            height="100%"
            viewBox="-750 -750 1500 1500" // Centers the (0,0) coordinate
          >
            {/* DEFINE ASSETS (Background patterns, borders) */}
            <defs>
              <radialGradient id="allocatedGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={COLOR_GLOW} stopOpacity="0.4" />
                <stop offset="100%" stopColor={COLOR_GLOW} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* 1. RENDER CONNECTIONS */}
            <g id="connections">
              {AtlasTree.connections.map((conn, index) => {
                const fromNode = AtlasTree.nodes.find((n) => n.id === conn.from)
                const toNode = AtlasTree.nodes.find((n) => n.id === conn.to)
                const isAllocated =
                  allocatedNodes.has(conn.from) && allocatedNodes.has(conn.to)
                if (!fromNode || !toNode) {
                  console.error(
                    `Connection references non-existent node: ${conn.from} or ${conn.to}`
                  )
                  return null // Safety check
                }

                return (
                  <line
                    key={index}
                    x1={fromNode.position[0]}
                    y1={fromNode.position[1]}
                    x2={toNode.position[0]}
                    y2={toNode.position[1]}
                    stroke={COLOR_GLOW}
                    strokeWidth={isAllocated ? 6 : 2}
                  />
                )
              })}
            </g>

            {/* 2. RENDER NODES */}
            <g id="nodes">
              {AtlasTree.nodes.map((node) => {
                const isAllocated = allocatedNodes.has(node.id)
                const isAllocatable = isConnectedAndAllocatable(
                  node.id,
                  allocatedNodes
                )

                return (
                  <AtlasNode
                    key={node.id}
                    node={node}
                    isAllocated={isAllocated}
                    isAllocatable={isAllocatable}
                    onClick={handleNodeClick}
                  />
                )
              })}
            </g>
          </svg>
        </TransformComponent>
      </TransformWrapper>
      <Tooltip
        id="atlas-node-detail"
        className="custom-theme-tooltip"
        float
        render={({ content }) => <AtlasNodeDetail nodeId={content as string} />}
      />
    </div>
  )
}

function AtlasNode({
  node,
  isAllocated,
  isAllocatable,
  onClick
}: {
  node: TreeNode
  isAllocated: boolean
  isAllocatable: boolean
  onClick: (node: TreeNode) => any
}) {
  const size = NodeSizes[node.type] || 12
  const shouldShowTooltip = node.type !== "step"

  return (
    <g
      className={cc("atlas-node", node.type, {
        allocatable: isAllocatable,
        allocated: isAllocated
      })}
      transform={`translate(${node.position[0]}, ${node.position[1]})`}
      onClick={() => onClick(node)}
      data-tooltip-id={shouldShowTooltip ? "atlas-node-detail" : null}
      data-tooltip-content={node.id}
    >
      {/* Glow Effect if Active */}
      {isAllocated && (
        <circle r={size * 2} fill="url(#allocatedGlow)" pointerEvents="none" />
      )}

      {/* Node background & inactive border */}
      <circle className="atlas-node-border" r={size} strokeWidth={2} />
      <circle className="atlas-node-bg" r={size - 4} />

      {/* Encounter Icon */}
      {node.type === "encounter" && (
        <image
          href={getPortraitSrc(PkmIndex[node.encounter])}
          height="40"
          width="40"
          transform="translate(-20 -20)"
          style={{ clipPath: "circle(20px)" }}
        />
      )}

      {/* Start Icon */}
      {node.type === "start" && (
        <image
          href={"/assets/atlas/CONNECTION_ORB.png"}
          height="100"
          width="100"
          transform="translate(-50 -50)"
        />
      )}

      {/* Node Emera Icon */}
      {node.type === "keystone" && (
        <image
          href={EmeraIcons[node.emera]}
          height="60"
          width="60"
          transform="translate(-30 -30)"
          opacity={isAllocated ? 1 : 0.5}
        />
      )}

      {/* Node Item Icon */}
      {node.type === "item" && (
        <image
          href={`assets/item/${node.item}.png`}
          height="60"
          width="60"
          transform="translate(-30 -30)"
          opacity={isAllocated ? 1 : 0.5}
        />
      )}

      {/* Node Step Icon */}
      {node.type === "step" && isAllocated && (
        <image
          href={EmeraIcons["blank"]}
          height="30"
          width="30"
          transform="translate(-15 -15)"
        />
      )}

      {/* Node active border frame */}
      {isAllocated && (
        <image
          href={"/assets/atlas/unlocked.png"}
          height={size * 2}
          width={size * 2}
          transform={`translate(-${size} -${size})`}
        />
      )}

      {/* Locked Icon */}
      {node.type === "condition" && (
        <image
          href="/assets/atlas/locked.png"
          height="32"
          width="32"
          transform="translate(-16 -16)"
        />
      )}
    </g>
  )
}

function AtlasNodeDetail({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const node = AtlasTree.nodes.find((n) => n.id === nodeId)
  if (!node) return null
  if (node.type === "item") {
    return <ItemDetailTooltipContent item={node.item} />
  }

  let portrait,
    title,
    description: string = node.type
  if (node.type === "encounter") {
    portrait = { index: PkmIndex[node.encounter] }
    title = t(`pkm.${node.encounter}`)
    description = t(`atlas.encounter.${node.encounter}`)
  } else if (node.type === "start") {
    title = t(`atlas.connection_orb`)
    description = t(`atlas.connection_orb_description`)
  } else if (node.type === "keystone") {
    title = t(`atlas.keystone.${node.emera}`)
    description = t(`atlas.keystone_description.${node.emera}`)
  } else if (node.type === "condition") {
    description = t(`atlas.condition.${node.condition}`)
  }
  return (
    <div className="atlas-node-detail">
      {portrait && (
        <div className="atlas-node-detail-portrait">
          <PokemonPortrait portrait={portrait} />
        </div>
      )}
      {title && (
        <div className="atlas-node-detail-title">
          <p>{title}</p>
        </div>
      )}
      <div className="atlas-node-detail-description">
        {addIconsToDescription(description)}
      </div>
    </div>
  )
}

const NodeSizes: Record<TreeNode["type"], number> = {
  start: 50,
  keystone: 45,
  item: 45,
  encounter: 24,
  condition: 20,
  step: 20
}

const EmeraIcons: Record<Emera & "blank", string> = {
  blank: "/assets/atlas/BLANK_EMERA.png",
  fusion: "/assets/atlas/FUSION_EMERA.png",
  //primal: "/assets/atlas/PRIMAL_EMERA.png",
  mega: "/assets/atlas/MEGA_EMERA.png",
  gigantamax: "/assets/atlas/MAX_EMERA.png",
  stellar: "/assets/atlas/TERA_EMERA.png",
  legendary: "/assets/atlas/LEGENDARY_EMERA.png",
  zmove: "/assets/atlas/Z_EMERA.png"
}

function isConnectedAndAllocatable(
  nodeId: string,
  allocatedNodes: Set<string>
) {
  // Logic to check if adjacent node is allocated
  return (
    allocatedNodes.has(nodeId) === false &&
    AtlasTree.connections.some(
      (conn) =>
        (conn.from === nodeId && allocatedNodes.has(conn.to)) ||
        (conn.to === nodeId && allocatedNodes.has(conn.from))
    )
  )
}
