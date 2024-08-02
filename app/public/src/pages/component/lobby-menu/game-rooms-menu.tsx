import { Room } from "colyseus";
import { Client, RoomAvailable } from "colyseus.js";
import firebase from "firebase/compat/app";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GameState from "../../../../../rooms/states/game-state";
import { ICustomLobbyState, IGameMetadata } from "../../../../../types";
import { throttle } from "../../../../../utils/function";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { leaveLobby } from "../../../stores/LobbyStore";
import { localStore, LocalStoreKeys } from "../../utils/store";
import GameRoomItem from "./game-room-item";

export function GameRoomsMenu() {
    const dispatch = useAppDispatch()
    const client: Client = useAppSelector((state) => state.network.client)
    const gameRooms: RoomAvailable[] = useAppSelector(
        (state) => state.lobby.gameRooms
    )
    const navigate = useNavigate()
    const [isJoining, setJoining] = useState<boolean>(false)
    const lobby: Room<ICustomLobbyState> | undefined = useAppSelector(
        (state) => state.network.lobby
    )

    const joinGame = throttle(async function joinGame(
        selectedRoom: RoomAvailable<IGameMetadata>,
        spectate: boolean
    ) {
        if (lobby && !isJoining) {
            setJoining(true)
            const idToken = await firebase.auth().currentUser?.getIdToken()
            if (idToken) {
                const game: Room<GameState> = await client.joinById(
                    selectedRoom.roomId,
                    {
                        idToken,
                        spectate
                    }
                )
                localStore.set(
                    LocalStoreKeys.RECONNECTION_TOKEN,
                    game.reconnectionToken,
                    30
                )
                await lobby.leave()
                game.connection.close()
                dispatch(leaveLobby())
                navigate("/game")
            }
        }
    }, 1000)


    return (
        <table>
            <thead>
                <tr>
                    <th>Mode</th>
                    <th>Room name</th>
                    <th>Players</th>
                    <th>Stage</th>
                    <th>Average Elo</th>
                    <th>Spectate</th>
                </tr>
            </thead>
            <tbody className="hidden-scrollable">
                {gameRooms.map((r) => (
                    <GameRoomItem
                        key={r.roomId}
                        room={r}
                        onJoin={(spectate) => joinGame(r, spectate)}
                    />
                ))}
            </tbody>
        </table>
    )
}