import { Room } from "colyseus.js"
import firebase from "firebase/compat/app"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ConnectionStatus } from "../../../types/enum/ConnectionStatus"
import { localStore, LocalStoreKeys } from "../pages/utils/store"
import { joinGame, logIn, setConnectionStatus } from "../stores/NetworkStore"
import { useAppDispatch } from "../hooks"
import { logger } from "../../../utils/logger"
import { leaveGame } from "../stores/GameStore"
import { FIREBASE_CONFIG } from "../pages/utils/utils"

export function useGameConnection(client) {
  const MAX_ATTEMPS_RECONNECT = 3

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const connecting = useRef<boolean>(false)
  const connected = useRef<boolean>(false)
  const [connectError, setConnectError] = useState<string>("")

  const connectToGame = useCallback(
    async (attempts = 1) => {
      logger.debug(
        `connectToGame attempt ${attempts} / ${MAX_ATTEMPS_RECONNECT}`
      )
      const cachedReconnectionToken = localStore.get(
        LocalStoreKeys.RECONNECTION_GAME
      )?.reconnectionToken
      if (cachedReconnectionToken) {
        connecting.current = true
        const statusMessage = document.querySelector("#status-message")
        if (statusMessage) {
          statusMessage.textContent = `Connecting to game...`
        }

        client
          .reconnect(cachedReconnectionToken)
          .then((room: Room) => {
            // store game token for 1 hour
            localStore.set(
              LocalStoreKeys.RECONNECTION_GAME,
              {
                reconnectionToken: room.reconnectionToken,
                roomId: room.roomId
              },
              60 * 60
            )
            dispatch(joinGame(room))
            connected.current = true
            connecting.current = false
            dispatch(setConnectionStatus(ConnectionStatus.CONNECTED))
          })
          .catch((error) => {
            if (attempts < MAX_ATTEMPS_RECONNECT) {
              setTimeout(async () => await connectToGame(attempts + 1), 1000)
            } else {
              let connectError = error.message
              if (error.code === 4212) {
                // room disposed
                connectError = "This game does no longer exist"
              }
              //TODO: handle more known error codes with informative messages
              setConnectError(connectError)
              dispatch(setConnectionStatus(ConnectionStatus.CONNECTION_FAILED))
              logger.error("reconnect error", error)
            }
          })
      } else {
        navigate("/") // no reconnection token, login again
      }
    },
    [client, dispatch]
  )

  const leave = useCallback(
    async (onLeave: () => void) => {
      /*if (gameContainer && gameContainer.game) {
        gameContainer.game.destroy(true)
    }*/
      dispatch(leaveGame())
      onLeave()
      /*if (room?.connection.isOpen) {
        room.leave()
      }*/
    },
    [client, dispatch /*, room*/]
  )

  useEffect(() => {
    const connect = () => {
      logger.debug("connecting to game")
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG)
      }

      firebase.auth().onAuthStateChanged(async (user) => {
        if (user && !connecting.current) {
          connecting.current = true
          dispatch(logIn(user))
          await connectToGame()
        }
      })
    }

    if (!connected.current) {
      connect()
    }
  }, [connected, connectToGame, dispatch])

  return {
    connectToGame,
    connecting,
    connected,
    connectError,
    leaveGame: leave
  }
}
