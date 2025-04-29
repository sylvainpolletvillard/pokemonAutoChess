import { t } from "i18next"
import React, { useCallback, useEffect, useRef, useState } from "react"
import firebase from "firebase/compat/app"
import { useNavigate } from "react-router-dom"
import GameDpsMeter from "./component/game/game-dps-meter"
import GameLoadingScreen from "./component/game/game-loading-screen"
import GameSynergies from "./component/game/game-synergies"
import { MainSidebar } from "./component/main-sidebar/main-sidebar"
import { ConnectionStatusNotification } from "./component/system/connection-status-notification"
import { useAppSelector } from "../hooks"
import { Client, Room } from "colyseus.js"
import DojoState from "../../../rooms/states/dojo-state"
import { logger } from "../../../utils/logger"
import { FIREBASE_CONFIG } from "./utils/utils"

let room: Room<DojoState>

export function Dojo() {
    const client: Client = useAppSelector((state) => state.network.client)
    const uid: string = useAppSelector((state) => state.network.uid)
    const container = useRef<HTMLDivElement>(null)
    const connecting = useRef<boolean>(false)
    const [loaded, setLoaded] = useState<boolean>(false)
    const navigate = useNavigate()
    const [connectError, setConnectError] = useState<string>("")
    const initialized = useRef<boolean>(false)

    useEffect(() => {
        async function connect() {
            const token = await firebase.auth().currentUser?.getIdToken()
            room = await client.create<DojoState>("dojo", { idToken: token })
        }
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG)
        }

        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && !connecting.current) {
                connecting.current = true
                connect()
            }
        })
    }, [])

    const leave = useCallback(() => {
        navigate("/lobby")
    }, [navigate])

    useEffect(() => {
        if (
            !initialized.current &&
            room != undefined &&
            container?.current
        ) {
            logger.debug("initializing game")
            initialized.current = true
        }
    }, [
        initialized,
        room,
    ])

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