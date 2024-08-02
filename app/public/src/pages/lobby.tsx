import { Client, Room, RoomAvailable } from "colyseus.js"
import { type NonFunctionPropNames } from "@colyseus/schema/lib/types/HelperTypes"
import firebase from "firebase/compat/app"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, useNavigate } from "react-router-dom"
import LobbyUser from "../../../models/colyseus-models/lobby-user"
import {
  TournamentBracketSchema,
  TournamentPlayerSchema,
  TournamentSchema
} from "../../../models/colyseus-models/tournament"
import { IBot } from "../../../models/mongo-models/bot-v2"
import {
  ICustomLobbyState,
  ISuggestionUser,
  PkmWithConfig,
  Transfer
} from "../../../types"
import { useAppDispatch, useAppSelector } from "../hooks"
import store from "../stores"
import {
  addRoom,
  addTournament,
  addTournamentBracket,
  changeTournament,
  changeTournamentBracket,
  changeTournamentPlayer,
  leaveLobby,
  pushBotLog,
  removeRoom,
  removeTournament,
  removeTournamentBracket,
  setBoosterContent,
  setBotData,
  setBotLeaderboard,
  setBotList,
  setLeaderboard,
  setLevelLeaderboard,
  setNextSpecialGame,
  setPastebinUrl,
  setSearchedUser,
  setSuggestions,
  updateTournament
} from "../stores/LobbyStore"
import {
  joinLobby,
  logIn,
  logOut,
  requestBotLeaderboard,
  requestLeaderboard,
  requestLevelLeaderboard,
  setProfile
} from "../stores/NetworkStore"
import RoomMenu from "./component/lobby-menu/room-menu"
import { GameRoomsMenu } from "./component/lobby-menu/game-rooms-menu"
import LeaderboardMenu from "./component/lobby-menu/leaderboard-menu"
import { TournamentMenu } from "./component/lobby-menu/tournament-menu"
import { MainSidebar } from "./component/main-sidebar/main-sidebar"
import { FIREBASE_CONFIG } from "./utils/utils"
import { IUserMetadata } from "../../../models/mongo-models/user-metadata"
import { logger } from "../../../utils/logger"
import { localStore, LocalStoreKeys } from "./utils/store"
import { cc } from "./utils/jsx"
import { Modal } from "./component/modal/modal"
import { LobbyMenu } from "./component/lobby-menu/lobby-menu"
import "./lobby.css"


export default function Lobby() {
  const dispatch = useAppDispatch()
  const lobby = useAppSelector((state) => state.network.lobby)

  const lobbyJoined = useRef<boolean>(false)
  const [gameToReconnect, setGameToReconnect] = useState<string | null>(
    localStore.get(LocalStoreKeys.RECONNECTION_GAME)
  )
  const gameRooms: RoomAvailable[] = useAppSelector(
    (state) => state.lobby.gameRooms
  )
  const showGameReconnect = gameToReconnect != null && gameRooms.some((r) => r.roomId === gameToReconnect)

  const [toGame, setToGame] = useState<boolean>(false)
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    const client = store.getState().network.client
    if (!lobbyJoined.current) {
      joinLobbyRoom(dispatch, client).catch((err) => {
        logger.error(err)
        navigate("/")
      })
      lobbyJoined.current = true
    }
  }, [lobbyJoined, dispatch])

  const signOut = useCallback(async () => {
    await lobby?.leave()
    await firebase.auth().signOut()
    dispatch(leaveLobby())
    dispatch(logOut())
    navigate("/")
  }, [dispatch, lobby])

  if (toGame) {
    return <Navigate to="/game"></Navigate>
  }

  return (
    <main className="lobby">
      <MainSidebar
        page="main_lobby"
        leave={signOut}
        leaveLabel={t("sign_out")}
      />
      <div className="lobby-container">
        <MainLobby />
      </div>
      <Modal show={showGameReconnect}
        header={t("game-reconnect-modal-title")}
        body={t("game-reconnect-modal-body")}
        footer={<>
          <button className="bubbly green" onClick={() => setToGame(true)}>
            {t("yes")}
          </button>
          <button
            className="bubbly red"
            onClick={() => {
              setGameToReconnect(null)
              localStore.delete(LocalStoreKeys.RECONNECTION_GAME)
            }}
          >
            {t("no")}
          </button>
        </>}>
      </Modal>
    </main>
  )
}

function MainLobby() {
  const [activeSection, setActive] = useState<string>("rooms")
  const { t } = useTranslation()
  const tournaments: TournamentSchema[] = useAppSelector(
    (state) => state.lobby.tournaments
  )

  /*const quickPlay = throttle(async function quickPlay() {
    const existingQuickPlayRoom = preparationRooms.find(
      (room) => room.metadata?.gameMode === GameMode.QUICKPLAY
    )
    if (existingQuickPlayRoom) {
      joinPrepRoom(existingQuickPlayRoom)
    } else {
      createRoom(GameMode.QUICKPLAY)
    }
  }, 1000)*/


  return <>
    <div className="lobby-browser my-container custom-bg ">
      <header>
        <h2>{t("lobby")} browser</h2>
        <nav className="main-lobby-nav">
          <ul>
            <li>
              <button
                onClick={() => setActive("rooms")}
                className={cc("bubbly", { active: activeSection === "rooms" })}
              >
                <img width={32} height={32} src={`assets/ui/room.svg`} />
                {t("available_rooms")}
              </button>
            </li>
            <li>
              <button onClick={() => setActive("game_rooms")}
                className={cc("bubbly", { active: activeSection === "game_rooms" })}>
                <img width={32} height={32} src={`assets/ui/spectate.svg`} />
                {t("spectate_games")}
              </button>
            </li>
            <li>
              <button onClick={() => setActive("leaderboard")} className={cc("bubbly", { active: activeSection === "leaderboard" })}>
                <img width={32} height={32} src={`assets/ui/leaderboard.svg`} />
                {t("leaderboard")}
              </button>
            </li>
            {tournaments.length > 0 && <li>
              <button
                onClick={() => setActive("tournament")}
                className={cc("bubbly", { active: activeSection === "tournament" })}
              >
                <img width={32} height={32} src={`assets/ui/tournament.svg`} />
                {t("tournament")}
              </button>
            </li>}
          </ul>
        </nav>
        <p className="online-count">500 players online</p>
      </header>
      {activeSection === "rooms" && <RoomMenu />}
      {activeSection === "game_rooms" && <GameRoomsMenu />}
      {activeSection === "leaderboard" && <LeaderboardMenu />}
      {activeSection === "tournament" && <TournamentMenu />}
    </div>
    <section className="side-panel my-container custom-bg">
      <LobbyMenu />
    </section>
  </>
}

export async function joinLobbyRoom(
  dispatch,
  client: Client
): Promise<Room<ICustomLobbyState>> {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG)
  }
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        dispatch(logIn(user))
        try {
          const token = await user.getIdToken()

          const lobby = store.getState().network.lobby
          if (lobby) {
            await lobby.leave()
          }
          const room: Room<ICustomLobbyState> = await client.joinOrCreate(
            "lobby",
            { idToken: token }
          )

          room.state.tournaments.onAdd((tournament) => {
            dispatch(addTournament(tournament))
            const fields: NonFunctionPropNames<TournamentSchema>[] = [
              "id",
              "name",
              "startDate"
            ]

            fields.forEach((field) => {
              tournament.listen(field, (value) => {
                dispatch(
                  changeTournament({
                    tournamentId: tournament.id,
                    field: field,
                    value: value
                  })
                )
              })
            })

            tournament.players.onAdd((player, userId) => {
              dispatch(updateTournament()) // TOFIX: force redux reactivity
              const fields: NonFunctionPropNames<TournamentPlayerSchema>[] = [
                "eliminated"
              ]
              fields.forEach((field) => {
                player.listen(field, (value) => {
                  dispatch(
                    changeTournamentPlayer({
                      tournamentId: tournament.id,
                      playerId: userId,
                      field: field,
                      value: value
                    })
                  )
                })
              })
            })

            tournament.players.onRemove((player, userId) => {
              dispatch(updateTournament()) // TOFIX: force redux reactivity
            })

            tournament.brackets.onAdd((bracket, bracketId) => {
              dispatch(
                addTournamentBracket({
                  tournamendId: tournament.id,
                  bracketId,
                  bracket
                })
              )

              const fields: NonFunctionPropNames<TournamentBracketSchema>[] = [
                "name",
                "finished"
              ]
              fields.forEach((field) => {
                bracket.listen(field, (value) => {
                  dispatch(
                    changeTournamentBracket({
                      tournamentId: tournament.id,
                      bracketId,
                      field,
                      value
                    })
                  )
                })
              })

              bracket.playersId.onChange(() => {
                dispatch(
                  changeTournamentBracket({
                    tournamentId: tournament.id,
                    bracketId,
                    field: "playersId",
                    value: bracket.playersId
                  })
                )
              })
            })

            tournament.brackets.onRemove((bracket, bracketId) => {
              dispatch(
                removeTournamentBracket({
                  tournamendId: tournament.id,
                  bracketId
                })
              )
            })
          })

          room.state.tournaments.onRemove((tournament) => {
            dispatch(removeTournament(tournament))
          })

          room.state.listen("nextSpecialGame", (specialGame) => {
            dispatch(setNextSpecialGame(specialGame))
          })

          room.onMessage(Transfer.REQUEST_LEADERBOARD, (l) => {
            dispatch(setLeaderboard(l))
          })

          room.onMessage(Transfer.REQUEST_BOT_LEADERBOARD, (l) => {
            dispatch(setBotLeaderboard(l))
          })

          room.onMessage(Transfer.REQUEST_LEVEL_LEADERBOARD, (l) => {
            dispatch(setLevelLeaderboard(l))
          })

          room.onMessage(Transfer.BAN, () => reject("banned"))

          room.onMessage(Transfer.BANNED, (message) => {
            alert(message)
          })

          room.onMessage(Transfer.BOT_DATABASE_LOG, (message) => {
            dispatch(pushBotLog(message))
          })

          room.onMessage(Transfer.PASTEBIN_URL, (json: { url: string }) => {
            dispatch(setPastebinUrl(json.url))
          })

          room.onMessage(Transfer.ROOMS, (rooms: RoomAvailable[]) => {
            rooms.forEach((room) => dispatch(addRoom(room)))
          })

          room.onMessage(Transfer.REQUEST_BOT_LIST, (bots: IBot[]) => {
            dispatch(setBotList(bots))
          })

          room.onMessage(Transfer.ADD_ROOM, ([, room]) => {
            if (room.name === "preparation" || room.name === "game") {
              dispatch(addRoom(room))
            }
          })

          room.onMessage(Transfer.REMOVE_ROOM, (roomId: string) =>
            dispatch(removeRoom(roomId))
          )

          room.onMessage(Transfer.USER_PROFILE, (user: IUserMetadata) => {
            dispatch(setProfile(user))
          })

          room.onMessage(Transfer.USER, (user: LobbyUser) =>
            dispatch(setSearchedUser(user))
          )

          room.onMessage(Transfer.REQUEST_BOT_DATA, (data: IBot) => {
            dispatch(setBotData(data))
          })

          room.onMessage(
            Transfer.BOOSTER_CONTENT,
            (boosterContent: PkmWithConfig[]) => {
              dispatch(setBoosterContent(boosterContent))
            }
          )

          room.onMessage(
            Transfer.SUGGESTIONS,
            (suggestions: ISuggestionUser[]) => {
              dispatch(setSuggestions(suggestions))
            }
          )

          dispatch(joinLobby(room))
          dispatch(requestLeaderboard())
          dispatch(requestBotLeaderboard())
          dispatch(requestLevelLeaderboard())

          /*
          u.pokemonCollection.onAdd((p) => {
          const pokemonConfig = p as PokemonConfig
          dispatch(addPokemonConfig(pokemonConfig))
          const fields: NonFunctionPropNames<PokemonConfig>[] = [
            "dust",
            "emotions",
            "id",
            "selectedEmotion",
            "selectedShiny",
            "shinyEmotions"
          ]

          fields.forEach((field) => {
            pokemonConfig.listen(
              field,
              (value, previousValue) => {
                if (previousValue !== undefined) {
                  dispatch(
                    changePokemonConfig({
                      id: pokemonConfig.id,
                      field: field,
                      value: value
                    })
                  )
                }
              },
              false
            )
          })
        }, false)
        setSearchedUser(u)

        u.listen("language", (value) => {
          if (value) {
            dispatch(setLanguage(value))
            i18n.changeLanguage(value)
          }
        })*/



          resolve(room)
        } catch (error) {
          reject(error)
        }
      } else {
        reject("not authenticated")
      }
    })
  })
}