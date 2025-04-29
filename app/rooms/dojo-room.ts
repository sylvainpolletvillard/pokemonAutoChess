import { Dispatcher } from "@colyseus/command"
import { Client, Room } from "colyseus"
import admin from "firebase-admin"
import DojoState from "./states/dojo-state"
import { MAX_SIMULATION_DELTA_TIME } from "../types/Config"
import { OnUpdateCommand } from "./commands/game-commands"
import { logger } from "../utils/logger"
import { CloseCodes } from "../types/enum/CloseCodes"
import { Transfer } from "../types"
import UserMetadata, {
  IUserMetadata
} from "../models/mongo-models/user-metadata"

export class DojoRoom extends Room<DojoState> {
  maxClients: number = 1
  dispatcher: Dispatcher<this>
  constructor() {
    super()
    this.dispatcher = new Dispatcher(this)
  }

  // When room is initialized
  async onCreate() {
    logger.debug("room created", this.roomId)
  }

  async onAuth(client: Client, options, context) {
    try {
      super.onAuth(client, options, context)
      const token = await admin.auth().verifyIdToken(options.idToken)
      const user = await admin.auth().getUser(token.uid)
      logger.debug("user", user)
      return user
    } catch (error) {
      logger.error(error)
    }
  }

  async onJoin(client: Client) {
    const userProfile = (await UserMetadata.findOne({
      uid: client.auth.uid
    })) as IUserMetadata
    if (userProfile?.banned) {
      throw "Account banned"
    }
    client.send(Transfer.USER_PROFILE, userProfile)
    const pendingGameId = await this.presence.hget(
      client.auth.uid,
      "pending_game_id"
    )
    if (pendingGameId) {
      client.leave(CloseCodes.USER_IN_ANOTHER_GAME)
    }

    this.state = new DojoState(userProfile)
    logger.debug("user joined", client.sessionId, client.auth.uid)
  }

  startGame() {
    this.setSimulationInterval((deltaTime: number) => {
      /* in case of lag spikes, the game should feel slower, 
        but this max simulation dt helps preserving the correctness of simulation result */
      deltaTime = Math.min(MAX_SIMULATION_DELTA_TIME, deltaTime)

      try {
        this.dispatcher.dispatch(new OnUpdateCommand(), { deltaTime })
      } catch (error) {
        logger.error("update error", error)
      }
    })
  }
}
