import { Client, Room } from "colyseus.js";
import firebase from "firebase/compat/app";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PreparationState from "../../../../../rooms/states/preparation-state";
import { ICustomLobbyState } from "../../../../../types";
import { GameMode } from "../../../../../types/enum/Game";
import { throttle } from "../../../../../utils/function";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { leaveLobby } from "../../../stores/LobbyStore";
import { localStore, LocalStoreKeys } from "../../utils/store";
import { SpecialGameCountdown } from "./special-game-countdown";

export function LobbyMenu() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const lobby: Room<ICustomLobbyState> | undefined = useAppSelector(
        (state) => state.network.lobby
    )
    const [isJoining, setJoining] = useState<boolean>(false)
    const client: Client = useAppSelector((state) => state.network.client)
    const uid: string = useAppSelector((state) => state.network.uid)

    const createRoom = throttle(async function create(
        gameMode = GameMode.NORMAL
    ) {
        if (lobby && !isJoining) {
            setJoining(true)
            const firebaseUser = firebase.auth().currentUser
            const token = await firebaseUser?.getIdToken()
            if (token && firebaseUser) {
                const name = "To be created server side"
                const room: Room<PreparationState> = await client.create(
                    "preparation",
                    {
                        gameMode,
                        idToken: token,
                        ownerId: uid,
                        roomName:
                            gameMode === GameMode.QUICKPLAY
                                ? "Quick play"
                                : `${name}'${name.endsWith("s") ? "" : "s"} room`
                    }
                )
                await lobby.leave()
                room.connection.close()
                localStore.set(
                    LocalStoreKeys.RECONNECTION_TOKEN,
                    room.reconnectionToken,
                    30
                )
                dispatch(leaveLobby())
                navigate("/preparation")
            }
        }
    }, 1000)

    return <>
        <SpecialGameCountdown />
        <div style={{ display: "flex", gap: "1em", justifyContent: "center" }}>
            <button
                onClick={() => { }}
                className="bubbly green create-room-button"
            >
                {t("quick_play")}
            </button>
            <button
                onClick={() => createRoom()}
                className="bubbly blue create-room-button"
            >
                {t("create_custom_room")}
            </button>
        </div>
    </>
}