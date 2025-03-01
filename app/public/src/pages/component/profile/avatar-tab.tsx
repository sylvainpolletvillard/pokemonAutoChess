import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Pkm, PkmIndex } from "../../../../../types/enum/Pokemon"
import { useAppDispatch, useAppSelector } from "../../../hooks"
import { changeAvatar } from "../../../stores/NetworkStore"
import { getPortraitSrc } from "../../../../../utils/avatar"
import { PokemonTypeahead } from "../typeahead/pokemon-typeahead"
import PokemonPortrait from "../pokemon-portrait"

export function AvatarTab() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const pokemonCollectionMap = useAppSelector(
    (state) => state.network.profile?.pokemonCollection
  )

  const pokemonCollection = pokemonCollectionMap
    ? [...pokemonCollectionMap.values()]
    : []
  const [selectedPkm, setSelectedPkm] = useState<Pkm | "">("")

  return (
    <div>
      <h3>{t("change_avatar")}</h3>
      <PokemonTypeahead value={selectedPkm} onChange={setSelectedPkm} />
      <div style={{ display: "flex", flexWrap: "wrap", margin: "0.5em 0" }}>
        {pokemonCollection.length === 0 && <p>{t("play_more_games_hint")}</p>}
        {["normal", "shiny"].flatMap((type) =>
          pokemonCollection
            .filter(
              (pokemonConfig) =>
                !selectedPkm || pokemonConfig.id === PkmIndex[selectedPkm]
            )
            .map((pokemonConfig) => {
              return (
                type === "shiny"
                  ? pokemonConfig.shinyEmotions
                  : pokemonConfig.emotions
              ).map((emotion) => {
                return (
                  <PokemonPortrait
                    key={`${type}-${pokemonConfig.id}${emotion}`}
                    className="clickable"
                    onClick={() => {
                      dispatch(
                        changeAvatar({
                          index: pokemonConfig.id,
                          emotion: emotion,
                          shiny: type === "shiny"
                        })
                      )
                    }}
                    portrait={{
                      index: pokemonConfig.id,
                      shiny: type === "shiny",
                      emotion
                    }}
                  />
                )
              })
            })
        )}
      </div>
    </div>
  )
}
