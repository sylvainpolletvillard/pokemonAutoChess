import { Schema } from "@colyseus/schema"
import Player from "../../models/colyseus-models/player"
import { IUserMetadata } from "../../models/mongo-models/user-metadata"

export default class DojoState extends Schema {
  type = "dojo"
  blue: Player
  red: Player
  lightX = 3
  lightY = 1
  specialGameRule = null

  constructor(user: IUserMetadata) {
    super()
    this.blue = new Player(
      "blue",
      "Blue",
      0,
      "",
      false,
      0,
      user.pokemonCollection,
      user.title,
      user.role,
      this
    )
    this.red = new Player(
      "red",
      "Red",
      0,
      "",
      false,
      0,
      user.pokemonCollection,
      user.title,
      user.role,
      this
    )
  }
}
