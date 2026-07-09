import { AttackType, Team } from "../../types/enum/Game"
import { distanceC, distanceM } from "../../utils/distance"
import type { Board } from "../board"
import type { PokemonEntity } from "../pokemon-entity"
import { DelayedCommand } from "../simulation-command"
import { AbilityStrategy } from "./ability-strategy"

export class TectonicRageStrategy extends AbilityStrategy {
  requiresTarget = false
  process(pokemon: PokemonEntity, board: Board, target: null, crit: boolean) {
    super.process(pokemon, board, target, crit, true)
    const damageEdge = [30, 40, 50, 100][pokemon.stars - 1] ?? 100
    const damageCenter = [50, 100, 150, 300][pokemon.stars - 1] ?? 300
    const opponentTeam =
      pokemon.team === Team.BLUE_TEAM ? Team.RED_TEAM : Team.BLUE_TEAM
    const epicenter = pokemon.state.getMostSurroundedCoordinateAvailablePlace(
      opponentTeam,
      board
    ) ?? { x: pokemon.targetX, y: pokemon.targetY }

    pokemon.broadcastAbility({
      skill: "TECTONIC_RAGE",
      targetX: epicenter.x,
      targetY: epicenter.y
    })

    const cellsHit = board
      .getCellsInRadius(epicenter.x, epicenter.y, 4, true)
      .map((cell) => {
        return {
          ...cell,
          distanceToEpicenter: distanceC(
            epicenter.x,
            epicenter.y,
            cell.x,
            cell.y
          )
        }
      })

    cellsHit.forEach((cell) => {
      if (cell.distanceToEpicenter >= 2) {
        // edge damage
        if (cell.value && cell.value.team !== pokemon.team) {
          cell.value.handleSpecialDamage(
            damageEdge,
            board,
            AttackType.SPECIAL,
            pokemon,
            crit
          )
        }
      }
    })

    pokemon.commands.push(
      new DelayedCommand(() => {
        pokemon.broadcastAbility({
          skill: "TECTONIC_RAGE_FINAL",
          targetX: epicenter.x,
          targetY: epicenter.y
        })

        cellsHit.forEach((cell) => {
          if (cell.distanceToEpicenter < 2) {
            // epicenter damage
            if (cell.value && cell.value.team !== pokemon.team) {
              cell.value.handleSpecialDamage(
                damageCenter,
                board,
                AttackType.SPECIAL,
                pokemon,
                crit
              )
              cell.value.status.triggerBurn(5000, cell.value, pokemon)
            }
          }
        })
      }, 1000)
    )
  }
}
