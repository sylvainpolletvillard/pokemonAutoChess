import { Emotion, PkmWithCustom } from "."

export type IBoosterCard = PkmWithCustom & {
  shiny: boolean
  emotion: Emotion
  new: boolean
}

export type Booster = IBoosterCard[]
