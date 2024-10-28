import { path } from "@assetpack/core"
import { compress } from "@assetpack/core/image"
//import { audio } from "@assetpack/core/ffmpeg"
import { json } from "@assetpack/core/json"
import { texturePacker } from "@assetpack/core/texture-packer"
import { cacheBuster } from "@assetpack/core/cache-buster"
import { texturePackerCacheBuster } from "@assetpack/core/texture-packer"
//import { texturePacker } from "./plugin-texturepacker-fork/dist/es/index.js"
import fs from "fs-extra"

export default {
  entry: "../../app/public/src/assets",
  output: "../../app/public/dist/client/assets",
  pipes: [
    /*audio({
      inputs: [".mp3", ".wav", ".ogg"],
      outputs: [
        {
          formats: [".mp3"],
          recompress: false,
          options: {
            audioBitrate: 96,
            audioChannels: 1,
            audioFrequency: 48000
          }
        },
        {
          formats: [".ogg"],
          recompress: false,
          options: {
            audioBitrate: 32,
            audioChannels: 1,
            audioFrequency: 22050
          }
        }
      ]
    }),*/
    texturePacker({
      texturePacker: {
        exporter: "Phaser3",
        allowRotation: false // i spotted some bugs when activated
      },
      resolutionOptions: {
        resolutions: { default: 1 },
        template: "" // prevent adding @1x suffix when not generating multiple resolutions
      }
    }),
    compress({
      webp: false
    }),
    json(),
    cacheBuster(),
    texturePackerCacheBuster(),
    texturePackAtlas()
  ]
}

function texturePackAtlas() {
  return {
    folder: true,
    name: "texture-pack-indexer",
    async finish(rootAsset, options, pipeSystem) {
      const atlasPath = path.joinSafe(pipeSystem.entryPath, "atlas.json")

      const existingAtlas = fs.existsSync(atlasPath)
        ? fs.readJSONSync(atlasPath)
        : null

      const pkg = fs.readJSONSync("../../package.json")
      const previousVersion = existingAtlas?.version
        ? Number(existingAtlas.version.split(".").pop())
        : 0
      const newVersion = pkg.version + "." + (previousVersion + 1)
      const atlas = {
        version: newVersion,
        packs: {}
      }

      function walk(asset) {
        if (asset.children.length > 0) {
          for (let child of asset.children) walk(child)
        } else if (
          asset.parent &&
          asset.parent.path.includes("{tps}") &&
          asset.path.endsWith(".png")
        ) {
          let [packPath, animName] = asset.parent.path.split("{tps}")
          packPath = packPath.replace(rootAsset.path + "/", "")
          let packName = packPath.split("/").pop()

          if (packPath in atlas.packs === false) {
            // find file in directory starting with packName and ending with .json
            const cachebustedFile = fs
              .readdirSync(pipeSystem.outputPath)
              .find(
                (file) => file.startsWith(packName) && file.endsWith(".json")
              )

            if (!cachebustedFile) {
              throw new Error(`No cache busted file found for pack ${packName}`)
            }

            // waiting for https://github.com/pixijs/assetpack/pull/70
            rewriteAtlasFile(
              path.joinSafe(pipeSystem.outputPath, cachebustedFile)
            )

            atlas.packs[packPath] = {
              name: packName,
              path: cachebustedFile
            }
          }

          // declare automatically anims if it matches 000.png, 001.png etc.
          if (/\d\d\d\.png$/.test(asset.path)) {
            if ("anims" in atlas.packs[packPath] === false) {
              atlas.packs[packPath].anims = {}
            }

            if (animName === "") {
              // case where the pack contains a single anim (no sub folder)
              animName = asset.parent.path.split("/").pop().replace("{tps}", "")
            } else {
              // case where the pack contains several anims, we remove trailing slash
              animName = animName.replace(/^\//, "")
            }

            if (animName in atlas.packs[packPath].anims === false) {
              atlas.packs[packPath].anims[animName] = {
                ...(existingAtlas?.packs?.[packPath]?.anims?.[animName] ?? {}), // preserve previous config
                frames: 0
              }
            }
            atlas.packs[packPath].anims[animName].frames += 1
          }
        }
      }
      walk(rootAsset)

      //fs.writeJSONSync("tree.json", tree)
      fs.writeJSONSync(atlasPath, atlas)

      const sw = fs.readFileSync("../../app/public/dist/client/sw.js", "utf8")
      fs.writeFileSync(
        "../../app/public/dist/client/sw.js",
        sw.replace(/CACHE v[\d\.]+/, `CACHE v${newVersion}`)
      )

      // Copy items individual sprites as we need them unpacked as well
      fs.cpSync(
        "../../app/public/src/assets/item{tps}",
        "../../app/public/dist/client/assets/item",
        { recursive: true }
      )
    }
  }
}

function rewriteAtlasFile(path) {
  const pixiJSON = fs.readJSONSync(path)
  const phaserJSON = {
    meta: {
      app: "http://github.com/pixijs/assetpack",
      version: "1.0"
    },
    textures: [
      {
        images: pixiJSON.meta.image,
        format: pixiJSON.meta.format,
        size: pixiJSON.meta.size,
        scale: pixiJSON.meta.scale,
        frames: Object.entries(pixiJSON.frames).map(
          ([filename, frameData]) => ({
            filename,
            ...frameData
          })
        )
      }
    ]
  }
  // rewrite with the format used by Phaser
  fs.writeJSONSync(path, phaserJSON)
}
