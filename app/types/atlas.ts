import type { Item } from "./enum/Item"
import type { TownEncounter } from "./enum/TownEncounter"

export type Emera =
  | "fusion"
  | "mega"
  | "gigantamax"
  | "stellar"
  | "legendary"
  | "zmove"

export type BaseTreeNode = {
  id: string
  type: "start" | "step" | "keystone" | "encounter" | "condition" | "item"
  position: [number, number]
}

export type StartNode = BaseTreeNode & {
  type: "start"
}

export type StepNode = BaseTreeNode & {
  type: "step"
}

export type KeystoneNode = BaseTreeNode & {
  type: "keystone"
  emera: Emera
}

export type EncounterNode = BaseTreeNode & {
  type: "encounter"
  encounter: TownEncounter
}

export type ConditionNode = BaseTreeNode & {
  type: "condition"
  condition: "fusion" | "mega" | "gigantamax" | "stellar"
}

export type ItemNode = BaseTreeNode & {
  type: "item"
  item: Item
}

export type TreeNode =
  | StartNode
  | KeystoneNode
  | EncounterNode
  | ConditionNode
  | StepNode
  | ItemNode

export type TreeConnection = {
  from: string
  to: string
}

export type Tree = {
  nodes: TreeNode[]
  connections: TreeConnection[]
}
