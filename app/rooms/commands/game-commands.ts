import { Command } from "@colyseus/command"
import { MapSchema, ArraySchema } from "@colyseus/schema"
import { Client, updateLobby } from "colyseus"
import { nanoid } from "nanoid"

import {
  CountEvolutionRule,
  HatchEvolutionRule,
  MoneyEvolutionRule,
  TurnEvolutionRule
} from "../../core/evolution-rules"
import { selectMatchups } from "../../core/matchmaking"
import { canSell } from "../../core/pokemon-entity"
import Simulation from "../../core/simulation"
import { getLevelUpCost } from "../../models/colyseus-models/experience-manager"
import Player from "../../models/colyseus-models/player"
import PokemonFactory from "../../models/pokemon-factory"
import { PVEStages } from "../../models/pve-stages"
import { getAvatarString } from "../../public/src/utils"
import {
  IClient,
  IDragDropCombineMessage,
  IDragDropItemMessage,
  IDragDropMessage,
  IPokemonEntity,
  Title,
  Transfer
} from "../../types"
import {
  AdditionalPicksStages,
  FIGHTING_PHASE_DURATION,
  ITEM_CAROUSEL_BASE_DURATION,
  ItemCarouselStages,
  ItemProposalStages,
  MAX_PLAYERS_PER_GAME,
  PORTAL_CAROUSEL_BASE_DURATION,
  PortalCarouselStages,
  StageDuration
} from "../../types/Config"
import { Effect } from "../../types/enum/Effect"
import {
  BattleResult,
  GamePhaseState,
  PokemonActionState
} from "../../types/enum/Game"
import {
  ArtificialItems,
  BasicItems,
  Berries,
  Item,
  ItemRecipe,
  SynergyGivenByItem,
  SynergyItems
} from "../../types/enum/Item"
import { Passive } from "../../types/enum/Passive"
import { Pkm, PkmIndex, Unowns } from "../../types/enum/Pokemon"
import { SpecialGameRule } from "../../types/enum/SpecialGameRule"
import { logger } from "../../utils/logger"
import { max } from "../../utils/number"
import { chance, pickNRandomIn, pickRandomIn } from "../../utils/random"
import { resetArraySchema, values } from "../../utils/schemas"
import { getWeather } from "../../utils/weather"
import {
  isPositionEmpty,
  getFirstAvailablePositionInBench,
  getFirstAvailablePositionOnBoard,
  getFreeSpaceOnBench,
  getMaxTeamSize
} from "../../utils/board"
import GameRoom from "../game-room"
import { isOnBench } from "../../models/colyseus-models/pokemon"
import { repeat } from "../../utils/function"

export class OnShopCommand extends Command<
  GameRoom,
  {
    playerId: string
    index: number
  }
> {
  execute({ playerId, index }) {
    if (
      playerId === undefined ||
      index === undefined ||
      !this.state.players.has(playerId)
    )
      return
    const player = this.state.players.get(playerId)
    if (!player || !player.shop[index] || player.shop[index] === Pkm.DEFAULT)
      return

    const name = player.shop[index]
    const pokemon = PokemonFactory.createPokemonFromName(name, player)
    const isEvolution =
      pokemon.evolutionRule &&
      pokemon.evolutionRule instanceof CountEvolutionRule &&
      pokemon.evolutionRule.canEvolveIfBuyingOne(pokemon, player)

    let cost = PokemonFactory.getBuyPrice(name)
    const freeSpaceOnBench = getFreeSpaceOnBench(player.board)
    const hasSpaceOnBench = freeSpaceOnBench > 0 || isEvolution

    if (
      isEvolution &&
      this.state.specialGameRule === SpecialGameRule.BUYER_FEVER
    ) {
      cost = 0
    }

    const canBuy = player.money >= cost && hasSpaceOnBench
    if (!canBuy) return

    player.money -= cost

    const x = getFirstAvailablePositionInBench(player.board)
    pokemon.positionX = x !== undefined ? x : -1
    pokemon.positionY = 0
    player.board.set(pokemon.id, pokemon)
    pokemon.onAcquired(player)

    if (
      pokemon.passive === Passive.UNOWN &&
      player.effects.has(Effect.EERIE_SPELL) &&
      player.shop.every((p) => Unowns.includes(p))
    ) {
      // reset shop after picking in a unown shop
      this.state.shop.assignShop(player, true, this.state)
    } else {
      player.shop[index] = Pkm.DEFAULT
    }

    this.room.checkEvolutionsAfterPokemonAcquired(playerId)
  }
}

export class OnRemoveFromShopCommand extends Command<
  GameRoom,
  {
    playerId: string
    index: number
  }
> {
  execute({ playerId, index }) {
    if (
      playerId === undefined ||
      index === undefined ||
      !this.state.players.has(playerId)
    )
      return
    const player = this.state.players.get(playerId)
    if (!player || !player.shop[index] || player.shop[index] === Pkm.DEFAULT)
      return

    const name = player.shop[index]
    let cost = PokemonFactory.getBuyPrice(name)
    if (player.money >= cost) {
      player.shop = player.shop.with(index, Pkm.DEFAULT) as ArraySchema<Pkm> // waiting for https://github.com/colyseus/schema/pull/165
      this.state.shop.releasePokemon(name)
    }
  }
}

export class OnPokemonCatchCommand extends Command<
  GameRoom,
  {
    playerId: string
    pkm: Pkm
  }
> {
  execute({ playerId, pkm }) {
    if (
      playerId === undefined ||
      pkm === undefined ||
      !this.state.players.has(playerId)
    )
      return
    const player = this.state.players.get(playerId)
    if (!player) return

    const pokemon = PokemonFactory.createPokemonFromName(pkm, player)
    const freeSpaceOnBench = getFreeSpaceOnBench(player.board)
    const hasSpaceOnBench =
      freeSpaceOnBench > 0 ||
      (pokemon.evolutionRule &&
        pokemon.evolutionRule instanceof CountEvolutionRule &&
        pokemon.evolutionRule.canEvolveIfBuyingOne(pokemon, player))

    if (hasSpaceOnBench) {
      const x = getFirstAvailablePositionInBench(player.board)
      pokemon.positionX = x !== undefined ? x : -1
      pokemon.positionY = 0
      player.board.set(pokemon.id, pokemon)
      pokemon.onAcquired(player)
      this.room.checkEvolutionsAfterPokemonAcquired(playerId)
    }
  }
}

export class OnDragDropCommand extends Command<
  GameRoom,
  {
    client: IClient
    detail: IDragDropMessage
  }
> {
  execute({ client, detail }) {
    const commands = []
    let success = false
    let dittoReplaced = false
    const message = {
      updateBoard: true,
      updateItems: true
    }
    const playerId = client.auth.uid
    const player = this.state.players.get(playerId)

    if (player) {
      message.updateItems = false
      const pokemon = player.board.get(detail.id)
      if (pokemon) {
        const x = parseInt(detail.x)
        const y = parseInt(detail.y)
        if (
          pokemon.name === Pkm.DITTO &&
          !isPositionEmpty(x, y, player.board)
        ) {
          const pokemonToClone = this.room.getPokemonByPosition(player, x, y)
          if (pokemonToClone && pokemonToClone.canBeCloned) {
            dittoReplaced = true
            const replaceDitto = PokemonFactory.createPokemonFromName(
              PokemonFactory.getPokemonBaseEvolution(pokemonToClone.name),
              player
            )
            pokemon.items.forEach((it) => {
              player.items.add(it)
            })
            player.board.delete(detail.id)
            const position = getFirstAvailablePositionInBench(player.board)
            if (position !== undefined) {
              replaceDitto.positionX = position
              replaceDitto.positionY = 0
              player.board.set(replaceDitto.id, replaceDitto)
              success = true
              message.updateBoard = false
            }
          } else if (y === 0) {
            this.room.swap(player, pokemon, x, y)
            success = true
          }
        } else {
          const dropOnBench = y == 0
          const dropFromBench = isOnBench(pokemon)
          // Drag and drop pokemons through bench has no limitation
          if (dropOnBench && dropFromBench) {
            this.room.swap(player, pokemon, x, y)
            success = true
          } else if (this.state.phase == GamePhaseState.PICK) {
            // On pick, allow to drop on / from board
            const teamSize = this.room.getTeamSize(player.board)
            const isBoardFull =
              teamSize >=
              getMaxTeamSize(
                player.experienceManager.level,
                this.room.state.specialGameRule
              )
            const dropToEmptyPlace = isPositionEmpty(x, y, player.board)

            if (dropOnBench) {
              // From board to bench is always allowed (bench to bench is already handled)
              this.room.swap(player, pokemon, x, y)
              success = true
            } else if (
              pokemon.canBePlaced &&
              !(dropFromBench && dropToEmptyPlace && isBoardFull)
            ) {
              // Prevents a pokemon to go on the board only if it's adding a pokemon from the bench on a full board
              this.room.swap(player, pokemon, x, y)
              pokemon.onChangePosition(x, y, player)
              success = true
            }
          }
        }
      }

      if (!success && client.send) {
        client.send(Transfer.DRAG_DROP_FAILED, message)
      }
      if (dittoReplaced) {
        this.room.checkEvolutionsAfterPokemonAcquired(playerId)
      }

      player.updateSynergies()
      player.boardSize = this.room.getTeamSize(player.board)
    }
    if (commands.length > 0) {
      return commands
    }
  }
}

export class OnDragDropCombineCommand extends Command<
  GameRoom,
  {
    client: Client
    detail: IDragDropCombineMessage
  }
> {
  execute({ client, detail }) {
    const playerId = client.auth.uid
    const message = {
      updateBoard: true,
      updateItems: true
    }
    const player = this.state.players.get(playerId)

    if (player) {
      message.updateBoard = false
      message.updateItems = true

      const itemA = detail.itemA
      const itemB = detail.itemB

      //verify player has both items
      if (!player.items.has(itemA) || !player.items.has(itemB)) {
        client.send(Transfer.DRAG_DROP_FAILED, message)
        return
      }
      // check for two if both items are same
      else if (itemA == itemB) {
        let count = 0
        player.items.forEach((item) => {
          if (item == itemA) {
            count++
          }
        })

        if (count < 2) {
          client.send(Transfer.DRAG_DROP_FAILED, message)
          return
        }
      }

      // find recipe result
      let result: Item | undefined = undefined
      for (const [key, value] of Object.entries(ItemRecipe) as [
        Item,
        Item[]
      ][]) {
        if (
          (value[0] == itemA && value[1] == itemB) ||
          (value[0] == itemB && value[1] == itemA)
        ) {
          result = key
          break
        }
      }

      if (!result) {
        client.send(Transfer.DRAG_DROP_FAILED, message)
        return
      } else {
        player.items.add(result)
        player.items.delete(itemA)
        player.items.delete(itemB)
      }

      player.updateSynergies()
    }
  }
}
export class OnDragDropItemCommand extends Command<
  GameRoom,
  {
    client: Client
    detail: IDragDropItemMessage
  }
> {
  execute({ client, detail }) {
    const commands = new Array<Command>()
    const playerId = client.auth.uid
    const message = {
      updateBoard: true,
      updateItems: true
    }
    const player = this.state.players.get(playerId)
    if (!player) return

    message.updateBoard = false
    message.updateItems = true

    const item = detail.id

    if (!player.items.has(item) && !detail.bypass) {
      client.send(Transfer.DRAG_DROP_FAILED, message)
      return
    }

    const x = parseInt(detail.x)
    const y = parseInt(detail.y)

    const pokemon = player.getPokemonAt(x, y)

    if (pokemon === undefined || !pokemon.canHoldItems) {
      client.send(Transfer.DRAG_DROP_FAILED, message)
      return
    }
    // check if full items and nothing to combine
    if (
      pokemon.items.size >= 3 &&
      (BasicItems.includes(item) === false ||
        values(pokemon.items).some((i) => BasicItems.includes(i)) === false)
    ) {
      client.send(Transfer.DRAG_DROP_FAILED, message)
      return
    }

    if (
      SynergyItems.includes(item) &&
      pokemon.types.has(SynergyGivenByItem[item])
    ) {
      // prevent adding a synergy stone on a pokemon that already has this synergy
      client.send(Transfer.DRAG_DROP_FAILED, message)
      return
    }

    if (BasicItems.includes(item)) {
      const itemToCombine = values(pokemon.items).find((i) =>
        BasicItems.includes(i)
      )
      if (itemToCombine) {
        const recipe = Object.entries(ItemRecipe).find(
          ([result, recipe]) =>
            (recipe[0] == itemToCombine && recipe[1] == item) ||
            (recipe[0] == item && recipe[1] == itemToCombine)
        )
        if (recipe) {
          const itemCombined = recipe[0] as Item

          if (
            itemCombined in SynergyGivenByItem &&
            pokemon.types.has(SynergyGivenByItem[itemCombined])
          ) {
            // prevent combining into a synergy stone on a pokemon that already has this synergy
            client.send(Transfer.DRAG_DROP_FAILED, message)
            return
          }

          pokemon.items.delete(itemToCombine)
          player.items.delete(item)

          if (pokemon.items.has(itemCombined)) {
            // pokemon already has the combined item so the second one pops off and go to player inventory
            player.items.add(itemCombined)
          } else {
            const detail: IDragDropItemMessage = {
              id: itemCombined,
              x: pokemon.positionX,
              y: pokemon.positionY,
              bypass: true
            }
            commands.push(
              new OnDragDropItemCommand().setPayload({
                client: client,
                detail: detail
              })
            )
          }
        }
      } else {
        pokemon.items.add(item)
        player.items.delete(item)
      }
    } else {
      if (pokemon.items.has(item)) {
        client.send(Transfer.DRAG_DROP_FAILED, message)
        return
      } else {
        pokemon.items.add(item)
        player.items.delete(item)
      }
    }

    this.room.checkEvolutionsAfterItemAcquired(playerId, pokemon)

    player.updateSynergies()

    if (commands.length > 0) {
      return commands
    }
  }
}

export class OnSellDropCommand extends Command<
  GameRoom,
  {
    client: Client
    pokemonId: string
  }
> {
  execute({ client, pokemonId }) {
    const player = this.state.players.get(client.auth.uid)

    if (player) {
      const pokemon = player.board.get(pokemonId)
      if (
        pokemon &&
        !isOnBench(pokemon) &&
        this.state.phase === GamePhaseState.FIGHT
      ) {
        return // can't sell a pokemon currently fighting
      }

      if (
        pokemon &&
        canSell(pokemon.name, this.state.specialGameRule) === false
      ) {
        return
      }

      if (pokemon) {
        this.state.shop.releasePokemon(pokemon.name)
        player.money += PokemonFactory.getSellPrice(pokemon.name, player)
        pokemon.items.forEach((it) => {
          player.items.add(it)
        })

        player.board.delete(pokemonId)

        player.updateSynergies()
        player.boardSize = this.room.getTeamSize(player.board)
      }
    }
  }
}

export class OnRefreshCommand extends Command<
  GameRoom,
  {
    id: string
  }
> {
  execute(id) {
    const player = this.state.players.get(id)
    if (player && player.money >= 1 && player.alive) {
      this.state.shop.assignShop(player, true, this.state)
      player.money -= 1
      player.rerollCount++
    }
  }
}

export class OnLockCommand extends Command<
  GameRoom,
  {
    id: string
  }
> {
  execute(id) {
    const player = this.state.players.get(id)
    if (player) {
      player.shopLocked = !player.shopLocked
    }
  }
}

export class OnLevelUpCommand extends Command<
  GameRoom,
  {
    id: string
  }
> {
  execute(id) {
    const player = this.state.players.get(id)
    if (!player) return

    const cost = getLevelUpCost(this.state.specialGameRule)
    if (player.money >= cost && player.experienceManager.canLevel()) {
      player.experienceManager.addExperience(4)
      player.money -= cost
    }
  }
}

export class OnPickBerryCommand extends Command<
  GameRoom,
  {
    id: string
  }
> {
  execute(id) {
    const player = this.state.players.get(id)
    if (player && player.berryTreeStage >= 3) {
      player.berryTreeStage = 0
      player.items.add(player.berry)
      player.berry = pickRandomIn(Berries)
    }
  }
}

export class OnJoinCommand extends Command<
  GameRoom,
  {
    client: Client
    options: { spectate?: boolean }
    auth
  }
> {
  async execute({ client, options, auth }) {
    try {
      //logger.debug("onJoin", client.auth.uid)
      const players = values(this.state.players)
      if (options.spectate === true) {
        this.state.spectators.add(client.auth.uid)
      } else if (players.some((p) => p.id === auth.uid)) {
        /*logger.info(
          `${client.auth.displayName} (${client.id}) joined game room ${this.room.roomId}`
        )*/
        if (this.state.players.size >= MAX_PLAYERS_PER_GAME) {
          const humanPlayers = players.filter((p) => !p.isBot)
          if (humanPlayers.length === 1) {
            humanPlayers[0].titles.add(Title.LONE_WOLF)
          }
        }
      } else {
        logger.warn(`player not in game room whitelist tried to join game`, {
          userId: client.auth.uid,
          roomId: this.room.roomId
        })
      }
    } catch (error) {
      logger.error(error)
    }
  }
}

export class OnUpdateCommand extends Command<
  GameRoom,
  {
    deltaTime: number
  }
> {
  execute({ deltaTime }) {
    if (deltaTime) {
      this.state.time -= deltaTime
      if (Math.round(this.state.time / 1000) != this.state.roundTime) {
        this.state.roundTime = Math.round(this.state.time / 1000)
      }
      if (this.state.time < 0) {
        this.state.updatePhaseNeeded = true
      } else if (this.state.phase == GamePhaseState.FIGHT) {
        let everySimulationFinished = true

        this.state.simulations.forEach((simulation) => {
          if (!simulation.finished) {
            simulation.update(deltaTime)
            everySimulationFinished = false
          }
        })

        if (everySimulationFinished && !this.state.updatePhaseNeeded) {
          // wait for 3 seconds victory anim before moving to next stage
          this.state.time = 3000
          this.state.updatePhaseNeeded = true
        }
      } else if (this.state.phase === GamePhaseState.MINIGAME) {
        this.room.miniGame.update(deltaTime)
      }
      if (this.state.updatePhaseNeeded && this.state.time < 0) {
        return [new OnUpdatePhaseCommand()]
      }
    }
  }
}

export class OnUpdatePhaseCommand extends Command<GameRoom> {
  execute() {
    this.state.updatePhaseNeeded = false
    if (this.state.phase == GamePhaseState.MINIGAME) {
      this.room.miniGame.stop(this.state)
      this.initializePickingPhase()
    } else if (this.state.phase == GamePhaseState.PICK) {
      this.stopPickingPhase()
      this.checkForLazyTeam()
      this.initializeFightingPhase()
    } else if (this.state.phase == GamePhaseState.FIGHT) {
      this.stopFightingPhase()
      if (
        ItemCarouselStages.includes(this.state.stageLevel) ||
        PortalCarouselStages.includes(this.state.stageLevel)
      ) {
        this.initializeMinigamePhase()
      } else {
        this.initializePickingPhase()
      }
    }
  }

  computeAchievements() {
    this.state.players.forEach((player) => {
      this.checkSuccess(player)
    })
  }

  checkSuccess(player: Player) {
    player.titles.add(Title.NOVICE)
    const effects = this.state.simulations
      .get(player.simulationId)
      ?.getEffects(player.id)
    if (effects) {
      effects.forEach((effect) => {
        switch (effect) {
          case Effect.PURE_POWER:
            player.titles.add(Title.POKEFAN)
            break
          case Effect.SPORE:
            player.titles.add(Title.POKEMON_RANGER)
            break
          case Effect.DESOLATE_LAND:
            player.titles.add(Title.KINDLER)
            break
          case Effect.PRIMORDIAL_SEA:
            player.titles.add(Title.FIREFIGHTER)
            break
          case Effect.OVERDRIVE:
            player.titles.add(Title.ELECTRICIAN)
            break
          case Effect.JUSTIFIED:
            player.titles.add(Title.BLACK_BELT)
            break
          case Effect.EERIE_SPELL:
            player.titles.add(Title.TELEKINESIST)
            break
          case Effect.BEAT_UP:
            player.titles.add(Title.DELINQUENT)
            break
          case Effect.STEEL_SURGE:
            player.titles.add(Title.ENGINEER)
            break
          case Effect.DEEP_MINER:
            player.titles.add(Title.GEOLOGIST)
            break
          case Effect.TOXIC:
            player.titles.add(Title.TEAM_ROCKET_GRUNT)
            break
          case Effect.DRAGON_DANCE:
            player.titles.add(Title.DRAGON_TAMER)
            break
          case Effect.ANGER_POINT:
            player.titles.add(Title.CAMPER)
            break
          case Effect.POWER_TRIP:
            player.titles.add(Title.MYTH_TRAINER)
            break
          case Effect.CALM_MIND:
            player.titles.add(Title.RIVAL)
            break
          case Effect.WATER_VEIL:
            player.titles.add(Title.DIVER)
            break
          case Effect.HEART_OF_THE_SWARM:
            player.titles.add(Title.BUG_MANIAC)
            break
          case Effect.MAX_GUARD:
            player.titles.add(Title.BIRD_KEEPER)
            break
          case Effect.SUN_FLOWER:
            player.titles.add(Title.GARDENER)
            break
          case Effect.GOOGLE_SPECS:
            player.titles.add(Title.ALCHEMIST)
            break
          case Effect.DIAMOND_STORM:
            player.titles.add(Title.HIKER)
            break
          case Effect.CURSE:
            player.titles.add(Title.HEX_MANIAC)
            break
          case Effect.MOON_FORCE:
            player.titles.add(Title.CUTE_MANIAC)
            break
          case Effect.SHEER_COLD:
            player.titles.add(Title.SKIER)
            break
          case Effect.FORGOTTEN_POWER:
            player.titles.add(Title.MUSEUM_DIRECTOR)
            break
          case Effect.PRESTO:
            player.titles.add(Title.MUSICIAN)
            break
          case Effect.GOLDEN_EGGS:
            player.titles.add(Title.BABYSITTER)
            break
          case Effect.BERSERK:
            player.titles.add(Title.BEAST_MASTER)
            break
          case Effect.MAX_ILLUMINATION:
            player.titles.add(Title.CHOSEN_ONE)
            break
          default:
            break
        }
      })
      if (effects.size >= 5) {
        player.titles.add(Title.HARLEQUIN)
      }
      let shield = 0
      let heal = 0
      const dpsMeter = this.state.simulations
        .get(player.simulationId)
        ?.getHealDpsMeter(player.id)

      if (dpsMeter) {
        dpsMeter.forEach((v) => {
          shield += v.shield
          heal += v.heal
        })
      }

      if (shield > 1000) {
        player.titles.add(Title.GARDIAN)
      }
      if (heal > 1000) {
        player.titles.add(Title.NURSE)
      }
    }
  }

  checkEndGame() {
    const numberOfPlayersAlive = values(this.state.players).filter(
      (p) => p.alive
    ).length

    if (numberOfPlayersAlive <= 1) {
      this.state.gameFinished = true
      this.room.broadcast(Transfer.BROADCAST_INFO, {
        title: "End of the game",
        info: "We have a winner !"
      })
      setTimeout(() => {
        // dispose the room automatically after 30 seconds
        this.room.broadcast(Transfer.GAME_END)
        this.room.disconnect()
      }, 30 * 1000)
    }
  }

  computeRoundDamage(
    opponentTeam: MapSchema<IPokemonEntity>,
    stageLevel: number
  ) {
    if (this.state.specialGameRule === SpecialGameRule.NINE_LIVES) return 1

    let damage = Math.ceil(stageLevel / 2)
    if (opponentTeam.size > 0) {
      opponentTeam.forEach((pokemon) => {
        if (!pokemon.isClone) {
          damage += 1
        }
      })
    }
    return damage
  }

  rankPlayers() {
    const rankArray = new Array<{ id: string; life: number; level: number }>()
    this.state.players.forEach((player) => {
      if (!player.alive) {
        return
      }

      rankArray.push({
        id: player.id,
        life: player.life,
        level: player.experienceManager.level
      })
    })

    const sortPlayers = (
      a: { id: string; life: number; level: number },
      b: { id: string; life: number; level: number }
    ) => {
      let diff = b.life - a.life
      if (diff == 0) {
        diff = b.level - a.level
      }
      return diff
    }

    rankArray.sort(sortPlayers)

    rankArray.forEach((rankPlayer, index) => {
      const player = this.state.players.get(rankPlayer.id)
      if (player) {
        player.rank = index + 1
      }
    })
  }

  computeLife() {
    this.state.players.forEach((player) => {
      if (player.alive) {
        const currentResult = this.state.simulations
          .get(player.simulationId)
          ?.getCurrentBattleResult(player.id)

        const opponentTeam = this.state.simulations
          .get(player.simulationId)
          ?.getOpponentTeam(player.id)
        if (
          opponentTeam &&
          (currentResult === BattleResult.DEFEAT ||
            currentResult === BattleResult.DRAW)
        ) {
          const playerDamage = this.computeRoundDamage(
            opponentTeam,
            this.state.stageLevel
          )
          player.life -= playerDamage
          if (playerDamage > 0) {
            const client = this.room.clients.find(
              (cli) => cli.auth.uid === player.id
            )
            client?.send(Transfer.PLAYER_DAMAGE, playerDamage)
          }
        }
      }
    })
  }

  computeStreak(isPVE: boolean) {
    if (isPVE) return // PVE rounds do not change the current streak
    this.state.players.forEach((player) => {
      if (!player.alive) {
        return
      }
      const currentResult = this.state.simulations
        .get(player.simulationId)
        ?.getCurrentBattleResult(player.id)
      const currentStreakType = player.getCurrentStreakType()

      if (currentResult === BattleResult.DRAW) {
        // preserve existing streak but lose HP
      } else if (currentResult !== currentStreakType) {
        // reset streak
        player.streak = 0
      } else {
        player.streak = max(5)(player.streak + 1)
      }
    })
  }

  computeIncome() {
    this.state.players.forEach((player) => {
      let income = 0
      if (player.alive && !player.isBot) {
        player.interest = Math.min(Math.floor(player.money / 10), 5)
        income += player.interest
        income += player.streak
        if (player.getLastBattleResult() == BattleResult.WIN) {
          income += 1
        }
        income += 5
        player.money += income
        if (income > 0) {
          const client = this.room.clients.find(
            (cli) => cli.auth.uid === player.id
          )
          client?.send(Transfer.PLAYER_INCOME, income)
        }
        player.experienceManager.addExperience(2)
      }
    })
  }

  registerBattleResults() {
    this.state.players.forEach((player) => {
      if (player.alive) {
        const currentResult = this.state.simulations
          .get(player.simulationId)
          ?.getCurrentBattleResult(player.id)
        if (currentResult) {
          player.addBattleResult(
            player.opponentId,
            player.opponentName,
            currentResult,
            player.opponentAvatar,
            this.state.simulations.get(player.simulationId)?.weather
          )
        }
      }
    })
  }

  checkDeath() {
    this.state.players.forEach((player: Player) => {
      if (player.life <= 0 && player.alive) {
        if (!player.isBot) {
          player.shop.forEach((pkm) => {
            this.state.shop.releasePokemon(pkm)
          })
          player.board.forEach((pokemon) => {
            this.state.shop.releasePokemon(pokemon.name)
          })
        }
        player.life = 0
        player.alive = false
      }
    })
  }

  initializePickingPhase() {
    this.state.phase = GamePhaseState.PICK
    this.state.time =
      (StageDuration[this.state.stageLevel] ?? StageDuration.DEFAULT) * 1000

    // Item propositions stages
    if (ItemProposalStages.includes(this.state.stageLevel)) {
      this.state.players.forEach((player: Player) => {
        let itemSet = BasicItems
        if (this.state.specialGameRule === SpecialGameRule.TECHNOLOGIC) {
          itemSet = ArtificialItems
        }
        resetArraySchema(player.itemsProposition, pickNRandomIn(itemSet, 3))
      })
    }

    // Additional pick stages
    if (AdditionalPicksStages.includes(this.state.stageLevel)) {
      const pool =
        this.state.stageLevel === AdditionalPicksStages[0]
          ? this.room.additionalUncommonPool
          : this.state.stageLevel === AdditionalPicksStages[1]
          ? this.room.additionalRarePool
          : this.room.additionalEpicPool
      let remainingAddPicks = 8
      this.state.players.forEach((player: Player) => {
        if (!player.isBot) {
          const items = pickNRandomIn(BasicItems, 3)
          for (let i = 0; i < 3; i++) {
            const p = pool.pop()
            if (p) {
              player.pokemonsProposition.push(p)
              player.itemsProposition.push(items[i])
            }
          }
          remainingAddPicks--
        }
      })

      repeat(remainingAddPicks)(() => {
        const p = pool.pop()
        if (p) {
          this.state.additionalPokemons.push(p)
          this.state.shop.addAdditionalPokemon(p)
        }
      })
    }

    const isAfterPVE = this.state.stageLevel - 1 in PVEStages
    const commands = new Array<Command>()

    this.state.players.forEach((player: Player) => {
      if (
        getFreeSpaceOnBench(player.board) > 0 &&
        !isAfterPVE &&
        (player.effects.has(Effect.RAIN_DANCE) ||
          player.effects.has(Effect.DRIZZLE) ||
          player.effects.has(Effect.PRIMORDIAL_SEA))
      ) {
        const fishingLevel = player.effects.has(Effect.PRIMORDIAL_SEA)
          ? 3
          : player.effects.has(Effect.DRIZZLE)
          ? 2
          : 1
        const pkm = this.state.shop.fishPokemon(player, fishingLevel)
        const fish = PokemonFactory.createPokemonFromName(pkm, player)
        const x = getFirstAvailablePositionInBench(player.board)
        fish.positionX = x !== undefined ? x : -1
        fish.positionY = 0
        fish.action = PokemonActionState.FISH
        player.board.set(fish.id, fish)
        this.room.checkEvolutionsAfterPokemonAcquired(player.id)
        this.clock.setTimeout(() => {
          fish.action = PokemonActionState.IDLE
        }, 1000)
      }

      if (player.effects.has(Effect.INGRAIN)) {
        player.berryTreeStage = max(3)(player.berryTreeStage + 1)
      }
      if (player.effects.has(Effect.GROWTH)) {
        player.berryTreeStage = max(3)(player.berryTreeStage + 2)
      }
      if (player.effects.has(Effect.SPORE)) {
        player.berryTreeStage = max(3)(player.berryTreeStage + 3)
      }
    })

    this.spawnWanderingPokemons()

    return commands
  }

  checkForLazyTeam() {
    // force move on board some units if room available
    this.state.players.forEach((player, key) => {
      const teamSize = this.room.getTeamSize(player.board)
      const maxTeamSize = getMaxTeamSize(
        player.experienceManager.level,
        this.state.specialGameRule
      )
      if (teamSize < maxTeamSize) {
        const numberOfPokemonsToMove = maxTeamSize - teamSize
        for (let i = 0; i < numberOfPokemonsToMove; i++) {
          const pokemon = values(player.board).find(
            (p) => isOnBench(p) && p.canBePlaced
          )
          const coordinate = getFirstAvailablePositionOnBoard(player.board)
          if (coordinate && pokemon) {
            this.room.swap(player, pokemon, coordinate[0], coordinate[1])
          }
        }
        if (numberOfPokemonsToMove > 0) {
          player.updateSynergies()
        }
      }
    })
  }

  stopPickingPhase() {
    this.state.players.forEach((player) => {
      if (player.pokemonsProposition.length > 0) {
        // auto pick if not chosen
        this.room.pickPokemonProposition(
          player.id,
          pickRandomIn([...player.pokemonsProposition]),
          true
        )
        player.pokemonsProposition.clear()
      } else if (player.itemsProposition.length > 0) {
        // auto pick if not chosen
        this.room.pickItemProposition(
          player.id,
          pickRandomIn([...player.itemsProposition])
        )
        player.itemsProposition.clear()
      }
    })
  }

  stopFightingPhase() {
    const isPVE = this.state.stageLevel in PVEStages

    this.computeAchievements()
    this.computeStreak(isPVE)
    this.computeLife()
    this.registerBattleResults()
    this.rankPlayers()
    this.checkDeath()
    this.computeIncome()
    this.state.simulations.forEach((simulation) => {
      simulation.stop()
    })

    this.state.players.forEach((player: Player) => {
      if (player.alive) {
        if (player.isBot) {
          player.experienceManager.level = max(9)(
            Math.round(this.state.stageLevel / 2)
          )
        }

        if (isPVE && player.getLastBattleResult() === BattleResult.WIN) {
          const pveStage = PVEStages[this.state.stageLevel]
          while (player.pveRewards.length > 0) {
            const reward = player.pveRewards.pop()!
            if (pveStage.chooseOnlyOne) {
              player.itemsProposition.push(reward)
            } else {
              player.items.add(reward)
            }
          }
        }

        let eggChance = 0,
          nbMaxEggs = 0
        if (
          player.getLastBattleResult() == BattleResult.DEFEAT &&
          (player.effects.has(Effect.BREEDER) ||
            player.effects.has(Effect.GOLDEN_EGGS))
        ) {
          eggChance = 1
          nbMaxEggs = player.effects.has(Effect.GOLDEN_EGGS) ? 8 : 2
        }
        if (
          player.getLastBattleResult() == BattleResult.DEFEAT &&
          player.effects.has(Effect.HATCHER)
        ) {
          eggChance = 0.25 * player.streak
          nbMaxEggs = 1
        }

        if (
          this.state.specialGameRule === SpecialGameRule.OMELETTE_COOK &&
          [1, 2, 3].includes(this.state.stageLevel)
        ) {
          eggChance = 1
          nbMaxEggs = 8
        }

        const nbOfEggs = values(player.board).filter(
          (p) => p.name === Pkm.EGG
        ).length

        if (
          chance(eggChance) &&
          getFreeSpaceOnBench(player.board) > 0 &&
          nbOfEggs < nbMaxEggs
        ) {
          const egg = PokemonFactory.createRandomEgg()
          const x = getFirstAvailablePositionInBench(player.board)
          egg.positionX = x !== undefined ? x : -1
          egg.positionY = 0
          player.board.set(egg.id, egg)
        }

        if (!player.isBot) {
          if (!player.shopLocked) {
            this.state.shop.assignShop(player, false, this.state)
          } else {
            this.state.shop.refillShop(player, this.state)
            player.shopLocked = false
          }
        }

        player.board.forEach((pokemon, key) => {
          if (pokemon.evolutionRule) {
            if (pokemon.evolutionRule instanceof HatchEvolutionRule) {
              pokemon.evolutionRule.updateHatch(
                pokemon,
                player,
                this.state.stageLevel
              )
            }
            if (pokemon.evolutionRule instanceof TurnEvolutionRule) {
              pokemon.evolutionRule.tryEvolve(
                pokemon,
                player,
                this.state.stageLevel
              )
            }
            if (pokemon.evolutionRule instanceof MoneyEvolutionRule) {
              pokemon.evolutionRule.tryEvolve(
                pokemon,
                player,
                this.state.stageLevel
              )
            }
          }
          if (pokemon.passive === Passive.UNOWN && !isOnBench(pokemon)) {
            // remove after one fight
            player.board.delete(key)
            player.board.delete(pokemon.id)
            player.updateSynergies()
            if (!player.shopLocked) {
              this.state.shop.assignShop(player, false, this.state) // refresh unown shop in case player lost psychic 6
            }
          }
        })
        // Refreshes effects (like tapu Terrains)
        player.updateSynergies()
      }
    })

    this.state.stageLevel += 1
    this.checkEndGame()
  }

  initializeMinigamePhase() {
    this.state.phase = GamePhaseState.MINIGAME
    const nbPlayersAlive = values(this.state.players).filter(
      (p) => p.alive
    ).length

    let minigamePhaseDuration = ITEM_CAROUSEL_BASE_DURATION
    if (PortalCarouselStages.includes(this.state.stageLevel)) {
      minigamePhaseDuration = PORTAL_CAROUSEL_BASE_DURATION
    } else if (this.state.stageLevel !== ItemCarouselStages[0]) {
      minigamePhaseDuration += nbPlayersAlive * 2000
    }
    this.state.time = minigamePhaseDuration
    this.room.miniGame.initialize(this.state)
  }

  initializeFightingPhase() {
    this.state.simulations.clear()
    this.state.phase = GamePhaseState.FIGHT
    this.state.time = FIGHTING_PHASE_DURATION
    this.room.setMetadata({ stageLevel: this.state.stageLevel })
    updateLobby(this.room)
    this.state.botManager.updateBots()

    const pveStage = PVEStages[this.state.stageLevel]

    if (pveStage) {
      this.state.shinyEncounter = chance(pveStage.shinyChance ?? 0)
      this.state.players.forEach((player: Player) => {
        if (player.alive) {
          player.opponentId = "pve"
          player.opponentName = pveStage.name
          player.opponentAvatar = getAvatarString(
            PkmIndex[pveStage.avatar],
            this.state.shinyEncounter,
            pveStage.emotion
          )
          player.opponentTitle = "WILD"
          const rewards = pveStage.getRewards(this.state.shinyEncounter, player)
          resetArraySchema(player.pveRewards, rewards)

          const pveBoard = PokemonFactory.makePveBoard(
            pveStage,
            this.state.shinyEncounter
          )
          const weather = getWeather(player.board, pveBoard)
          const simulation = new Simulation(
            nanoid(),
            this.room,
            player.board,
            pveBoard,
            player,
            undefined,
            this.state.stageLevel,
            weather
          )
          player.simulationId = simulation.id
          player.simulationTeamIndex = 0
          this.state.simulations.set(simulation.id, simulation)
        }
      })
    } else {
      const matchups = selectMatchups(this.state)

      matchups.forEach((matchup) => {
        const playerA = matchup.a,
          playerB = matchup.b
        const weather = getWeather(playerA.board, playerB.board)
        const simulationId = nanoid()
        const simulation = new Simulation(
          simulationId,
          this.room,
          playerA.board,
          playerB.board,
          playerA,
          playerB,
          this.state.stageLevel,
          weather
        )
        playerA.simulationId = simulationId
        playerA.simulationTeamIndex = 0
        playerA.opponents.set(
          playerB.id,
          (playerA.opponents.get(playerB.id) ?? 0) + 1
        )
        playerA.opponentId = playerB.id
        playerA.opponentName = playerB.name
        playerA.opponentAvatar = playerB.avatar
        playerA.opponentTitle = playerB.title ?? ""

        if (!matchup.ghost) {
          playerB.simulationId = simulationId
          playerB.simulationTeamIndex = 1
          playerB.opponents.set(
            playerA.id,
            (playerB.opponents.get(playerA.id) ?? 0) + 1
          )
          playerB.opponentId = playerA.id
          playerB.opponentName = playerA.name
          playerB.opponentAvatar = playerA.avatar
          playerB.opponentTitle = playerA.title ?? ""
        }

        this.state.simulations.set(simulation.id, simulation)
      })
    }
  }

  spawnWanderingPokemons() {
    const isPVE = this.state.stageLevel in PVEStages

    this.state.players.forEach((player: Player) => {
      if (player.alive && !player.isBot) {
        const client = this.room.clients.find(
          (cli) => cli.auth.uid === player.id
        )
        if (!client) return

        const UNOWN_ENCOUNTER_CHANCE = 0.037
        if (chance(UNOWN_ENCOUNTER_CHANCE)) {
          setTimeout(() => {
            client.send(Transfer.UNOWN_WANDERING)
          }, Math.round((5 + 15 * Math.random()) * 1000))
        }

        if (
          isPVE &&
          this.state.specialGameRule === SpecialGameRule.GOTTA_CATCH_EM_ALL
        ) {
          const nbPokemonsToSpawn = Math.ceil(this.state.stageLevel / 2)
          for (let i = 0; i < nbPokemonsToSpawn; i++) {
            setTimeout(() => {
              client.send(
                Transfer.POKEMON_WANDERING,
                this.state.shop.pickPokemon(player, this.state)
              )
            }, 4000 + i * 400)
          }
        }
      }
    })
  }
}
