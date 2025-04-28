import { t } from "i18next"
import React, { useCallback, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import GameContainer from "../game/game-container"
import GameDpsMeter from "./component/game/game-dps-meter"
import GameLoadingScreen from "./component/game/game-loading-screen"
import GameSynergies from "./component/game/game-synergies"
import { MainSidebar } from "./component/main-sidebar/main-sidebar"
import { ConnectionStatusNotification } from "./component/system/connection-status-notification"
import { useGameConnection } from "../game/game-logic"
import { useAppSelector } from "../hooks"
import { Client } from "colyseus.js"

let gameContainer: GameContainer

export function Dojo() {
    const client: Client = useAppSelector((state) => state.network.client)
    const container = useRef<HTMLDivElement>(null)
    const [loaded, setLoaded] = useState<boolean>(false)
    const navigate = useNavigate()

    const { connecting, connected, connectError, leaveGame } = useGameConnection(client)

    const leave = useCallback(() => leaveGame(() => {
        console.log("Leaving game")
        navigate("/")
    }), [leaveGame])

    return (
        <main id="game-wrapper" onContextMenu={(e) => e.preventDefault()}>
            <div id="game" ref={container}></div>
            {loaded ? (
                <>
                    <MainSidebar page="game" leave={leave} leaveLabel={t("leave_dojo")} />
                    {/*<DojoControls />*/}
                    <GameSynergies />
                    {/*<GameSynergies opponent={true} />*/}
                    {/*<DojoPicker />*/}
                    <GameDpsMeter />
                </>
            ) : (
                <GameLoadingScreen connectError={connectError} />
            )}
            <ConnectionStatusNotification />
        </main>
    )
}