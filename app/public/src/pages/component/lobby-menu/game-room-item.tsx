import { RoomAvailable } from "colyseus.js"
import React from "react"
import { useTranslation } from "react-i18next"
import { IGameMetadata } from "../../../../../types"
import { useAppSelector } from "../../../hooks"
import { cc } from "../../utils/jsx"
import "./room-item.css"

export default function GameRoomItem(props: {
  room: RoomAvailable<IGameMetadata>
  onJoin: (spectate: boolean) => void
}) {
  const { t } = useTranslation()
  const myUid = useAppSelector((state) => state.network.uid)
  const playerIds = props.room.metadata?.playerIds ?? []
  const spectate = playerIds.includes(myUid) === false

  const title = `${props.room.metadata?.ownerName ? "Owner: " + props.room.metadata?.ownerName : ""}\n${props.room.metadata?.playersInfo?.join("\n")}`

  return (
    <tr className="room-item">
      <td>{props.room.metadata?.gameMode}</td>
      <td className="room-name" title={title}>
        {props.room.metadata?.name}
      </td>
      <td>
        {playerIds.length} {t("player", { count: playerIds.length })}
      </td>
      <td>{t("stage")}{" "}
        {props.room.metadata?.stageLevel}
      </td>
      <td>
        0
      </td>
      <td>
        <button
          className={cc("bubbly", spectate ? "blue" : "green")}
          onClick={() => props.onJoin(spectate)}
        >
          {spectate ? t("spectate") : t("reconnect")}
        </button>
      </td>
    </tr>
  )
}
