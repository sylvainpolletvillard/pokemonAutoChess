import { useState } from "react"
import { AtlasTree, rotToXY } from "../../../../../core/atlas"
import type { Emera, TreeNode } from "../../../../../types/atlas"
import { PkmIndex } from "../../../../../types/enum/Pokemon"
import { getPortraitSrc } from "../../../../../utils/avatar"
import { playSound, SOUNDS } from "../../utils/audio"
import { cc } from "../../utils/jsx"
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

  return (
    <div
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        height: "1100px",
        margin: "auto",
        aspectRatio: "1/1",
        overflow: "hidden",
        position: "relative",
        border: "var(--border-thick)"
      }}
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
      <svg
        width="100%"
        height="100%"
        viewBox="-550 -500 1100 1100" // Centers the (0,0) coordinate
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
    </div>
  )
}

function AtlasNode({ node, isAllocated, isAllocatable, onClick }: any) {
  const size = NodeSizes[node.type] || 12

  return (
    <g
      className={cc("atlas-node", node.type, {
        allocatable: isAllocatable,
        allocated: isAllocated
      })}
      transform={`translate(${node.position[0]}, ${node.position[1]})`}
      onClick={() => onClick(node)}
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

      {/* Types Icons */}
      {node.type === "keystone" && node.types?.length && (
        <g transform="translate(-20 -20)">
          {node.types.map((type, index) => (
            <image
              key={index}
              href={`/assets/types/${type}.svg`}
              height="40"
              width="40"
              transform={`translate(${rotToXY(Math.sign(node.position[1]) * (40 + (100 * index) / (node.types.length - 1)), NodeSizes[node.type]).join(", ")})`}
            />
          ))}
        </g>
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

const NodeSizes: Record<TreeNode["type"], number> = {
  start: 50,
  keystone: 45,
  item: 45,
  encounter: 24,
  condition: 20,
  step: 20
}

const EmeraIcons: Record<Emera, string> = {
  blank: "/assets/atlas/BLANK_EMERA.png",
  fusion: "/assets/atlas/FUSION_EMERA.png",
  primal: "/assets/atlas/PRIMAL_EMERA.png",
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

const COLOR_GLOW = "#ffffff"
