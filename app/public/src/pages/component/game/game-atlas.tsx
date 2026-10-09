import { useEffect, useRef } from "react"
import { DEPTH } from "../../../game/depths"
import { useAppSelector } from "../../../hooks"
import { Atlas } from "../atlas/atlas"

export default function GameAtlas() {
  const atlasVisible = useAppSelector((state) => state.game.atlasVisible)
  const containerRef = useRef<HTMLDivElement>(null)
  const wasVisible = useRef(false)

  useEffect(() => {
    if (wasVisible.current === atlasVisible) return
    wasVisible.current = atlasVisible
    const mask = containerRef.current?.querySelector<HTMLElement>(".atlas-mask")
    if (!mask) return
    mask.classList.toggle("opening", atlasVisible)
    mask.classList.toggle("closing", !atlasVisible)
  }, [atlasVisible])

  return (
    <div
      id="game-atlas"
      ref={containerRef}
      style={{
        zIndex: DEPTH.ATLAS,
        pointerEvents: atlasVisible ? "auto" : "none"
      }}
    >
      <Atlas origin="game" />
    </div>
  )
}
