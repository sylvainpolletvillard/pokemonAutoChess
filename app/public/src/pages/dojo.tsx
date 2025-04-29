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
import { preference, subscribeToPreferences } from "../preferences"
import MoveToPlugin from "phaser3-rex-plugins/plugins/moveto-plugin"
import OutlinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin.js"
import { DEPTH } from "../game/depths"
import "./dojo.css"
import { clamp, max } from "../../../utils/number"

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

            const game = new Phaser.Game({
                type: +(preference("renderer") ?? Phaser.AUTO),
                parent: "game",
                pixelArt: true,
                width,
                height,
                scene: [dojoScene.current],
                scale: { mode: Phaser.Scale.FIT },
                dom: {
                    createContainer: true
                },
                disableContextMenu: true,
                backgroundColor: "#000000",
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

            gameRef.current = game

            game.domContainer.style.zIndex = DEPTH.PHASER_DOM_CONTAINER.toString()

            function resize() {
                const screenWidth = window.innerWidth - 60
                const screenHeight = window.innerHeight
                const screenRatio = screenWidth / screenHeight
                const IDEAL_WIDTH = 42 * 48
                const MIN_HEIGHT = 1050
                const MAX_HEIGHT = 32 * 48
                const height = clamp(IDEAL_WIDTH / screenRatio, MIN_HEIGHT, MAX_HEIGHT)
                const width = max(50 * 48)(height * screenRatio)

                if (
                    game &&
                    (game.scale.height !== height || game.scale.width !== width)
                ) {
                    game.scale.setGameSize(width, height)
                }
            }

            game.scale.on("resize", resize, this)
            if (game.renderer.type === Phaser.WEBGL) {
                game.plugins.install("rexOutline", OutlinePlugin, true)
            }
            const unsubscribeToPreferences = subscribeToPreferences(
                ({ antialiasing }) => {
                    if (!game?.canvas) return
                    game.canvas.style.imageRendering = antialiasing ? "" : "pixelated"
                },
                true
            )
            game.events.on("destroy", unsubscribeToPreferences)

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
        <main id="game-wrapper" className="dojo" onContextMenu={(e) => e.preventDefault()}>
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