import { Client, Room, RoomAvailable } from "colyseus.js"
import firebase from "firebase/compat/app"
import React, { useState } from "react"
import { useNavigate } from "react-router"
import PreparationState from "../../../../../rooms/states/preparation-state"
import {
  ICustomLobbyState,
  IPreparationMetadata,
  Role
} from "../../../../../types"
import { MAX_PLAYERS_PER_GAME } from "../../../../../types/Config"
import { GameMode } from "../../../../../types/enum/Game"
import { throttle } from "../../../../../utils/function"
import { logger } from "../../../../../utils/logger"
import { useAppDispatch, useAppSelector } from "../../../hooks"
import { leaveLobby } from "../../../stores/LobbyStore"
import { LocalStoreKeys, localStore } from "../../utils/store"
import RoomItem from "./room-item"
import "./room-menu.css"

export default function RoomMenu() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const preparationRooms: RoomAvailable[] = useAppSelector(
    (state) => state.lobby.preparationRooms
  )

  const client: Client = useAppSelector((state) => state.network.client)
  const lobby: Room<ICustomLobbyState> | undefined = useAppSelector(
    (state) => state.network.lobby
  )
  const uid: string = useAppSelector((state) => state.network.uid)
  const [isJoining, setJoining] = useState<boolean>(false)

  const joinPrepRoom = throttle(async function join(
    selectedRoom: RoomAvailable<IPreparationMetadata>
  ) {
    const { whitelist, blacklist, gameStarted, password } =
      selectedRoom.metadata ?? {}
    if (
      selectedRoom.clients >= MAX_PLAYERS_PER_GAME ||
      gameStarted === true ||
      (whitelist &&
        whitelist.length > 0 &&
        whitelist.includes(uid) === false) ||
      (blacklist && blacklist.length > 0 && blacklist.includes(uid) === true)
    ) {
      return
    }

    if (lobby && !isJoining) {
      if (password) {
        const lobbyUser = { role: Role.BASIC } // TODO: get lobby user
        if (lobbyUser && lobbyUser.role === Role.BASIC) {
          const password = prompt(`This room is private. Enter password`)
          if (selectedRoom.metadata?.password != password)
            return alert(`Wrong password !`)
        }
      }
      setJoining(true)
      const token = await firebase.auth().currentUser?.getIdToken()
      if (token) {
        try {
          const room: Room<PreparationState> = await client.joinById(
            selectedRoom.roomId,
            {
              idToken: token
            }
          )
          localStore.set(
            LocalStoreKeys.RECONNECTION_TOKEN,
            room.reconnectionToken,
            30
          )
          await lobby.leave()
          room.connection.close()
          dispatch(leaveLobby())
          navigate("/preparation")
        } catch (error) {
          logger.error(error)
        }
      }
    }
  }, 1000)

  return (
    <table>
      <thead>
        <tr>
          <th>Mode</th>
          <th>Room name</th>
          <th>Visibility</th>
          <th>Rank Restriction</th>
          <th>Average Elo</th>
          <th>Players</th>
          <th>Join</th>
        </tr>
      </thead>
      <tbody className="hidden-scrollable">
        {preparationRooms.map((r) => (
          <RoomItem key={r.roomId} room={r} click={joinPrepRoom} />
        ))}
      </tbody>
    </table>
  )
}
