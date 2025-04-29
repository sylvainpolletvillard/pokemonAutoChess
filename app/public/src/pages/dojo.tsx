import { t } from "i18next"
import React, { useCallback, useEffect, useRef, useState } from "react"
import firebase from "firebase/compat/app"
import { useNavigate } from "react-router-dom"
import GameDpsMeter from "./component/game/game-dps-meter"
import GameSynergies from "./component/game/game-synergies"
import { MainSidebar } from "./component/main-sidebar/main-sidebar"
import { ConnectionStatusNotification } from "./component/system/connection-status-notification"
import { useAppSelector } from "../hooks"
import { Client, Room } from "colyseus.js"
import DojoState from "../../../rooms/states/dojo-state"
import { logger } from "../../../utils/logger"
import { FIREBASE_CONFIG } from "./utils/utils"
import { DojoScene } from "../game/scenes/dojo-scene"
import { preference } from "../preferences"
import MoveToPlugin from "phaser3-rex-plugins/plugins/moveto-plugin"
import "./dojo.css"

export function Dojo() {
    const client: Client = useAppSelector((state) => state.network.client)
    const uid: string = useAppSelector((state) => state.network.uid)
    const dojoScene = useRef<DojoScene>()
    const gameRef = useRef<Phaser.Game>()
    const navigate = useNavigate()
    const width = 1950
    const height = 1000

    const connecting = useRef<boolean>(false)
    const initialized = useRef<boolean>(false)
    const [loaded, setLoaded] = useState<boolean>(false)
    const container = useRef<HTMLDivElement>(null)
    const room = useRef<Room<DojoState>>()

    const [statusMessage, setStatusMessage] = useState<string>("Loading...")
    const map = "town"

    const onProgress = () =>
        setStatusMessage(dojoScene?.current?.loadingManager?.statusMessage ?? "")

    const onComplete = useCallback(() => {
        setStatusMessage("Loading map...")
        dojoScene.current?.updateMap(map).then(() => setLoaded(true))
    }, [map])

    useEffect(() => {
        async function connect() {
            const token = await firebase.auth().currentUser?.getIdToken()
            room.current = await client.create<DojoState>("dojo", { idToken: token })
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
            room != undefined
        ) {
            logger.debug("initializing game")
            initialized.current = true
            dojoScene.current = new DojoScene(height, width, onProgress, onComplete)

            gameRef.current = new Phaser.Game({
                type: +(preference("renderer") ?? Phaser.AUTO),
                parent: "game",
                pixelArt: true,
                width,
                height,
                scene: [dojoScene.current],
                backgroundColor: "#61738a",
                plugins: {
                    global: [
                        {
                            key: "rexMoveTo",
                            plugin: MoveToPlugin,
                            start: true
                        }
                    ]
                }
            })

        }
    }, [
        initialized,
        room,
    ])

    useEffect(() => {
        if (initialized.current === true && loaded === true) {
            dojoScene.current?.updateMap(map)
        }
    }, [map, loaded, initialized])

    return (
        <main id="game-wrapper" onContextMenu={(e) => e.preventDefault()}>
            <div id="game" ref={container}></div>
            <MainSidebar page="game" leave={leave} leaveLabel={t("leave_game")} />
            {loaded ? (
                <>
                    {/*<DojoControls />*/}
                    <GameSynergies />
                    {/*<GameSynergies opponent={true} />*/}
                    {/*<DojoPicker />*/}
                    <GameDpsMeter />
                </>
            ) : (
                <p id="status-message">{statusMessage}</p>
            )}
            <ConnectionStatusNotification />
        </main>
    )
}