import { DesignTiled } from "../../../../core/design"
import { DungeonDetails, DungeonPMDO } from "../../../../types/enum/Dungeon"
import { logger } from "../../../../utils/logger"
import { playMusic, preloadMusic } from "../../pages/utils/audio"
import AnimationManager from "../animation-manager"
import LoadingManager from "../components/loading-manager"

export class DojoScene extends Phaser.Scene {
  height: number
  width: number
  animationManager: AnimationManager | null = null
  loadingManager: LoadingManager | null = null
  onProgress: (value: number) => void
  onComplete: () => void
  tilemap: DesignTiled | undefined
  map: Phaser.Tilemaps.Tilemap | undefined
  music: Phaser.Sound.WebAudioSound | null = null

  constructor(
    height: number,
    width: number,
    onProgress: (value: number) => void,
    onComplete: () => void
  ) {
    super()
    this.height = height
    this.width = width
    this.onProgress = onProgress
    this.onComplete = onComplete
  }

  preload() {
    this.loadingManager = new LoadingManager(this)

    this.load.on("progress", (value: number) => {
      this.onProgress(value)
    })
    this.load.once("complete", () => {
      this.animationManager = new AnimationManager(this)
      this.onComplete()
    })
  }

  create() {}

  updateMap(mapName: DungeonPMDO | "town"): Promise<void> {
    if (this.map) this.map.destroy()
    console.log("updateMap", mapName)

    if (mapName === "town") {
      return new Promise((resolve) => {
        this.map = this.add.tilemap("town")
        const tileset = this.map.addTilesetImage(
          "town_tileset",
          "town_tileset"
        )!
        this.map.createLayer("layer0", tileset, 0, 0)?.setScale(2, 2)
        this.map.createLayer("layer1", tileset, 0, 0)?.setScale(2, 2)
        this.map.createLayer("layer2", tileset, 0, 0)?.setScale(2, 2)
        const sys = this.sys as any
        if (sys.animatedTiles) {
          sys.animatedTiles.pause()
        }
        //playMusic(this as any, DungeonDetails[mapName].music)
        resolve()
      })
    }

    return fetch(`/tilemap/${mapName}`)
      .then((res) => res.json())
      .then((tilemap: DesignTiled) => {
        this.tilemap = tilemap
        return new Promise((resolve) => {
          this.load.reset()
          tilemap.tilesets.forEach((t) => {
            //logger.debug(`loading tileset ${t.image}`)
            this.load.image(
              mapName + "/" + t.name,
              "/assets/tilesets/" + mapName + "/" + t.image
            )
          })
          this.load.tilemapTiledJSON(mapName, tilemap)
          preloadMusic(this, DungeonDetails[mapName].music)
          this.load.once("complete", resolve)
          this.load.start()
          logger.debug("starting load")
        })
      })
      .then(() => {
        const map = this.make.tilemap({ key: mapName })
        this.map = map
        this.tilemap!.layers.forEach((layer) => {
          const tileset = map.addTilesetImage(
            layer.name,
            mapName + "/" + layer.name
          )!
          map.createLayer(layer.name, tileset, 0, 0)?.setScale(2, 2)
        })
        ;(this.sys as any).animatedTiles.init(map)
        playMusic(this as any, DungeonDetails[mapName].music)
      })
  }
}
