import type { Tree } from "../types/atlas"
import { Item } from "../types/enum/Item"
import { Synergy } from "../types/enum/Synergy"
import { TownEncounters } from "../types/enum/TownEncounter"

export const AtlasTree: Tree = {
  nodes: [
    { id: "root", position: [0, 0], type: "start" },
    // root - legendary_1 path
    {
      id: "step_1_root_legendary_1",
      type: "step",
      position: rotToXY(-120, 90)
    },
    {
      id: "encounter_croagunk",
      type: "encounter",
      position: rotToXY(-120, 150),
      encounter: TownEncounters.CROAGUNK
    },
    {
      id: "step_2_root_legendary_1",
      type: "step",
      position: rotToXY(-120, 210)
    },
    {
      id: "legendary_1",
      type: "keystone",
      position: rotToXY(-120, 300),
      emera: "legendary",
      types: [Synergy.FIRE, Synergy.WATER]
    },
    // root - legendary_2 path
    {
      id: "step_1_root_legendary_2",
      type: "step",
      position: rotToXY(-60, 90)
    },
    {
      id: "encounter_wobbuffet",
      type: "encounter",
      position: rotToXY(-60, 150),
      encounter: TownEncounters.WOBBUFFET
    },
    {
      id: "step_2_root_legendary_2",
      type: "step",
      position: rotToXY(-60, 210)
    },
    {
      id: "legendary_2",
      type: "keystone",
      position: rotToXY(-60, 300),
      emera: "legendary",
      types: [Synergy.ELECTRIC, Synergy.GRASS]
    },

    // zone up
    {
      id: "condition_fusion",
      position: rotToXY(-90, 260),
      type: "condition",
      condition: "fusion"
    },
    {
      id: "fusion",
      position: rotToXY(-90, 400),
      type: "keystone",
      emera: "fusion"
    },
    /*{
      id: "condition_primal",
      position: rotToXY(-90, 260),
      type: "condition",
      condition: "primal"
    },
    {
      id: "primal",
      position: rotToXY(-90, 180),
      type: "keystone",
      emera: "primal"
    },*/

    // stellar path
    {
      id: "step1_root_stellar",
      position: rotToXY(180, 90),
      type: "step"
    },
    {
      id: "encounter_kecleon",
      type: "encounter",
      position: rotToXY(180, 150),
      encounter: TownEncounters.KECLEON
    },
    {
      id: "step2_root_stellar",
      position: rotToXY(180, 210),
      type: "step"
    },
    {
      id: "stellar",
      position: rotToXY(180, 300),
      type: "keystone",
      emera: "stellar"
    },

    // Z-move left path
    {
      id: "step1_root_zmove1",
      position: rotToXY(120, 90),
      type: "step"
    },
    {
      id: "encounter_kangaskhan",
      type: "encounter",
      position: rotToXY(120, 150),
      encounter: TownEncounters.KANGASKHAN
    },
    {
      id: "step2_root_zmove1",
      position: rotToXY(120, 210),
      type: "step"
    },
    {
      id: "zmove_1",
      position: rotToXY(120, 300),
      type: "keystone",
      emera: "zmove",
      types: [Synergy.DRAGON, Synergy.FAIRY]
    },

    // Z-move right path
    {
      id: "step1_root_zmove2",
      position: rotToXY(60, 90),
      type: "step"
    },
    {
      id: "encounter_electivire",
      type: "encounter",
      position: rotToXY(60, 150),
      encounter: TownEncounters.ELECTIVIRE
    },
    {
      id: "step2_root_zmove2",
      position: rotToXY(60, 210),
      type: "step"
    },
    {
      id: "zmove_2",
      position: rotToXY(60, 300),
      type: "keystone",
      emera: "zmove",
      types: [Synergy.AMORPHOUS, Synergy.AQUATIC]
    },

    // legendary1 - gold bow
    {
      id: "step1_legendary1_goldbow",
      position: sumVectors(rotToXY(-120, 300), rotToXY(180, 90)),
      type: "step"
    },
    {
      id: "encounter_ludicolo",
      type: "encounter",
      position: sumVectors(rotToXY(-120, 300), rotToXY(180, 150)),
      encounter: TownEncounters.LUDICOLO
    },
    {
      id: "step2_legendary1_goldbow",
      position: sumVectors(rotToXY(-120, 300), rotToXY(180, 210)),
      type: "step"
    },
    {
      id: "goldbow",
      position: sumVectors(rotToXY(-120, 300), rotToXY(180, 300)),
      type: "item",
      item: Item.GOLD_BOW
    },

    // gold bow - stellar
    {
      id: "step1_stellar_goldbow",
      position: sumVectors(rotToXY(180, 300), rotToXY(-120, 90)),
      type: "step"
    },
    {
      id: "encounter_lapras",
      type: "encounter",
      position: sumVectors(rotToXY(180, 300), rotToXY(-120, 150)),
      encounter: TownEncounters.LAPRAS
    },
    {
      id: "step2_stellar_goldbow",
      position: sumVectors(rotToXY(180, 300), rotToXY(-120, 210)),
      type: "step"
    },

    // stellar - legendary 1
    {
      id: "step1_stellar_legendary1",
      position: sumVectors(rotToXY(180, 300), rotToXY(-60, 90)),
      type: "step"
    },
    {
      id: "encounter_sableye",
      type: "encounter",
      position: sumVectors(rotToXY(180, 300), rotToXY(-60, 150)),
      encounter: TownEncounters.SABLEYE
    },
    {
      id: "step2_stellar_legendary1",
      position: sumVectors(rotToXY(180, 300), rotToXY(-60, 210)),
      type: "step"
    },

    // stellar - tera orb
    {
      id: "condition_tera_orb",
      position: rotToXY(180, 400),
      type: "condition",
      condition: "stellar"
    },
    {
      id: "tera_orb",
      position: rotToXY(180, 500),
      type: "item",
      item: Item.TERA_ORB
    },

    // stellar - eviolite
    {
      id: "step1_stellar_eviolite",
      position: sumVectors(rotToXY(180, 300), rotToXY(120, 90)),
      type: "step"
    },
    {
      id: "encounter_chansey",
      type: "encounter",
      position: sumVectors(rotToXY(180, 300), rotToXY(120, 150)),
      encounter: TownEncounters.CHANSEY
    },
    {
      id: "step2_stellar_eviolite",
      position: sumVectors(rotToXY(180, 300), rotToXY(120, 210)),
      type: "step"
    },
    {
      id: "eviolite",
      position: sumVectors(rotToXY(180, 300), rotToXY(120, 300)),
      type: "item",
      item: Item.EVIOLITE
    },

    // zmove1- eviolite
    {
      id: "step1_zmove1_eviolite",
      position: sumVectors(rotToXY(120, 300), rotToXY(180, 90)),
      type: "step"
    },
    {
      id: "encounter_meowth",
      type: "encounter",
      position: sumVectors(rotToXY(120, 300), rotToXY(180, 150)),
      encounter: TownEncounters.MEOWTH
    },
    {
      id: "step2_zmove1_eviolite",
      position: sumVectors(rotToXY(120, 300), rotToXY(180, 210)),
      type: "step"
    },

    // stellar - zmove1
    {
      id: "step1_stellar_zmove1",
      position: sumVectors(rotToXY(180, 300), rotToXY(60, 90)),
      type: "step"
    },
    {
      id: "encounter_regirock",
      type: "encounter",
      position: sumVectors(rotToXY(180, 300), rotToXY(60, 150)),
      encounter: TownEncounters.REGIROCK
    },
    {
      id: "step2_stellar_zmove1",
      position: sumVectors(rotToXY(180, 300), rotToXY(60, 210)),
      type: "step"
    },

    // zmove1 - zmove2
    {
      id: "step1_zmove1_zmove2",
      position: sumVectors(rotToXY(120, 300), rotToXY(0, 90)),
      type: "step"
    },
    {
      id: "encounter_chimecho",
      type: "encounter",
      position: sumVectors(rotToXY(120, 300), rotToXY(0, 150)),
      encounter: TownEncounters.CHIMECHO
    },
    {
      id: "step2_zmove1_zmove2",
      position: sumVectors(rotToXY(120, 300), rotToXY(0, 210)),
      type: "step"
    },

    // zmove1 - star piece
    {
      id: "step1_zmove1_starpiece",
      position: sumVectors(rotToXY(120, 300), rotToXY(60, 90)),
      type: "step"
    },
    {
      id: "encounter_spinda",
      type: "encounter",
      position: sumVectors(rotToXY(120, 300), rotToXY(60, 150)),
      encounter: TownEncounters.SPINDA
    },
    {
      id: "step2_zmove1_starpiece",
      position: sumVectors(rotToXY(120, 300), rotToXY(60, 210)),
      type: "step"
    },
    {
      id: "starpiece",
      position: sumVectors(rotToXY(120, 300), rotToXY(60, 300)),
      type: "item",
      item: Item.STAR_PIECE
    },

    // zmove2 - star piece
    {
      id: "step1_zmove2_starpiece",
      position: sumVectors(rotToXY(60, 300), rotToXY(120, 90)),
      type: "step"
    },
    {
      id: "encounter_xatu",
      type: "encounter",
      position: sumVectors(rotToXY(60, 300), rotToXY(120, 150)),
      encounter: TownEncounters.XATU
    },
    {
      id: "step2_zmove2_starpiece",
      position: sumVectors(rotToXY(60, 300), rotToXY(120, 210)),
      type: "step"
    },

    // root - dynamax path
    {
      id: "step1_root_dynamax",
      position: rotToXY(0, 90),
      type: "step"
    },
    {
      id: "encounter_munchlax",
      type: "encounter",
      position: rotToXY(0, 150),
      encounter: TownEncounters.MUNCHLAX
    },
    {
      id: "step2_root_dynamax",
      position: rotToXY(0, 210),
      type: "step"
    },
    {
      id: "encounter_marowak",
      type: "encounter",
      position: rotToXY(0, 300),
      encounter: TownEncounters.MAROWAK
    },
    {
      id: "step3_root_dynamax",
      position: rotToXY(0, 400),
      type: "step"
    },
    {
      id: "dynamax",
      position: rotToXY(0, 500),
      type: "item",
      item: Item.DYNAMAX_BAND
    },

    // marowak - mega
    {
      id: "step1_marowak_mega",
      position: sumVectors(rotToXY(0, 300), rotToXY(-30, 100)),
      type: "condition",
      condition: "mega"
    },
    {
      id: "mega",
      position: sumVectors(rotToXY(0, 300), rotToXY(-30, 200)),
      type: "keystone",
      emera: "mega"
    },

    // marowak - gigantamax
    {
      id: "step1_marowak_gigantamax",
      position: sumVectors(rotToXY(0, 300), rotToXY(30, 100)),
      type: "condition",
      condition: "gigantamax"
    },
    {
      id: "gigantamax",
      position: sumVectors(rotToXY(0, 300), rotToXY(30, 200)),
      type: "keystone",
      emera: "gigantamax"
    },

    // marowak - legendary2
    {
      id: "step1_marowak_legendary2",
      position: sumVectors(rotToXY(0, 300), rotToXY(-120, 90)),
      type: "step"
    },
    {
      id: "encounter_cinccino",
      type: "encounter",
      position: sumVectors(rotToXY(0, 300), rotToXY(-120, 150)),
      encounter: TownEncounters.CINCCINO
    },
    {
      id: "step2_marowak_legendary2",
      position: sumVectors(rotToXY(0, 300), rotToXY(-120, 210)),
      type: "step"
    },

    // marowak - zmove2
    {
      id: "step1_marowak_zmove2",
      position: sumVectors(rotToXY(0, 300), rotToXY(120, 90)),
      type: "step"
    },
    {
      id: "encounter_celebi",
      type: "encounter",
      position: sumVectors(rotToXY(0, 300), rotToXY(120, 150)),
      encounter: TownEncounters.CELEBI
    },
    {
      id: "step2_marowak_zmove2",
      position: sumVectors(rotToXY(0, 300), rotToXY(120, 210)),
      type: "step"
    },

    // legendary2 - sacred ash
    {
      id: "step1_legendary2_sacredash",
      position: sumVectors(rotToXY(-60, 300), rotToXY(0, 90)),
      type: "step"
    },
    {
      id: "encounter_wigglytuff",
      position: sumVectors(rotToXY(-60, 300), rotToXY(0, 150)),
      type: "encounter",
      encounter: TownEncounters.WIGGLYTUFF
    },
    {
      id: "step2_legendary2_sacredash",
      position: sumVectors(rotToXY(-60, 300), rotToXY(0, 210)),
      type: "step"
    },
    {
      id: "sacred_ash",
      type: "item",
      position: sumVectors(rotToXY(-60, 300), rotToXY(0, 300)),
      item: Item.SACRED_ASH
    },

    // marowak - sacred ash
    {
      id: "step1_marowak_sacredash",
      position: sumVectors(rotToXY(0, 300), rotToXY(-60, 90)),
      type: "step"
    },
    {
      id: "encounter_kingambit",
      position: sumVectors(rotToXY(0, 300), rotToXY(-60, 150)),
      type: "encounter",
      encounter: TownEncounters.KINGAMBIT
    },
    {
      id: "step2_marowak_sacredash",
      position: sumVectors(rotToXY(0, 300), rotToXY(-60, 210)),
      type: "step"
    },

    // marowak - rare candy
    {
      id: "step1_marowak_candy",
      position: sumVectors(rotToXY(0, 300), rotToXY(60, 90)),
      type: "step"
    },
    {
      id: "encounter_makuhita",
      position: sumVectors(rotToXY(0, 300), rotToXY(60, 150)),
      type: "encounter",
      encounter: TownEncounters.MAKUHITA
    },
    {
      id: "step2_marowak_candy",
      position: sumVectors(rotToXY(0, 300), rotToXY(60, 210)),
      type: "step"
    },
    {
      id: "rare_candy",
      position: sumVectors(rotToXY(0, 300), rotToXY(60, 300)),
      type: "item",
      item: Item.RARE_CANDY
    },

    // zmove2 - rare candy
    {
      id: "step1_zmove2_candy",
      position: sumVectors(rotToXY(60, 300), rotToXY(0, 90)),
      type: "step"
    },
    {
      id: "encounter_duskull",
      position: sumVectors(rotToXY(60, 300), rotToXY(0, 150)),
      type: "encounter",
      encounter: TownEncounters.DUSKULL
    },
    {
      id: "step2_zmove2_candy",
      position: sumVectors(rotToXY(60, 300), rotToXY(0, 210)),
      type: "step"
    }
  ],
  connections: [
    { from: "root", to: "step_1_root_legendary_1" },
    { from: "step_1_root_legendary_1", to: "encounter_croagunk" },
    { from: "encounter_croagunk", to: "step_2_root_legendary_1" },
    { from: "step_2_root_legendary_1", to: "legendary_1" },

    { from: "root", to: "step_1_root_legendary_2" },
    { from: "step_1_root_legendary_2", to: "encounter_wobbuffet" },
    { from: "encounter_wobbuffet", to: "step_2_root_legendary_2" },
    { from: "step_2_root_legendary_2", to: "legendary_2" },

    { from: "legendary_1", to: "condition_fusion" },
    { from: "legendary_2", to: "condition_fusion" },
    { from: "condition_fusion", to: "fusion" },
    /*{ from: "legendary_1", to: "condition_primal" },
    { from: "legendary_2", to: "condition_primal" },
    { from: "condition_primal", to: "primal" },*/

    { from: "root", to: "step1_root_stellar" },
    { from: "step1_root_stellar", to: "encounter_kecleon" },
    { from: "encounter_kecleon", to: "step2_root_stellar" },
    { from: "step2_root_stellar", to: "stellar" },

    { from: "root", to: "step1_root_zmove1" },
    { from: "step1_root_zmove1", to: "encounter_kangaskhan" },
    { from: "encounter_kangaskhan", to: "step2_root_zmove1" },
    { from: "step2_root_zmove1", to: "zmove_1" },

    { from: "root", to: "step1_root_zmove2" },
    { from: "step1_root_zmove2", to: "encounter_electivire" },
    { from: "encounter_electivire", to: "step2_root_zmove2" },
    { from: "step2_root_zmove2", to: "zmove_2" },

    { from: "legendary_1", to: "step1_legendary1_goldbow" },
    { from: "step1_legendary1_goldbow", to: "encounter_ludicolo" },
    { from: "encounter_ludicolo", to: "step2_legendary1_goldbow" },
    { from: "step2_legendary1_goldbow", to: "goldbow" },

    { from: "stellar", to: "step1_stellar_goldbow" },
    { from: "step1_stellar_goldbow", to: "encounter_lapras" },
    { from: "encounter_lapras", to: "step2_stellar_goldbow" },
    { from: "step2_stellar_goldbow", to: "goldbow" },

    { from: "stellar", to: "step1_stellar_legendary1" },
    { from: "step1_stellar_legendary1", to: "encounter_sableye" },
    { from: "encounter_sableye", to: "step2_stellar_legendary1" },
    { from: "step2_stellar_legendary1", to: "legendary_1" },

    { from: "stellar", to: "step1_stellar_eviolite" },
    { from: "step1_stellar_eviolite", to: "encounter_chansey" },
    { from: "encounter_chansey", to: "step2_stellar_eviolite" },
    { from: "step2_stellar_eviolite", to: "eviolite" },

    { from: "zmove_1", to: "step1_zmove1_eviolite" },
    { from: "step1_zmove1_eviolite", to: "encounter_meowth" },
    { from: "encounter_meowth", to: "step2_zmove1_eviolite" },
    { from: "step2_zmove1_eviolite", to: "eviolite" },

    { from: "stellar", to: "step1_stellar_zmove1" },
    { from: "step1_stellar_zmove1", to: "encounter_regirock" },
    { from: "encounter_regirock", to: "step2_stellar_zmove1" },
    { from: "step2_stellar_zmove1", to: "zmove_1" },

    { from: "stellar", to: "condition_tera_orb" },
    { from: "condition_tera_orb", to: "tera_orb" },

    { from: "zmove_1", to: "step1_zmove1_zmove2" },
    { from: "step1_zmove1_zmove2", to: "encounter_chimecho" },
    { from: "encounter_chimecho", to: "step2_zmove1_zmove2" },
    { from: "step2_zmove1_zmove2", to: "zmove_2" },

    { from: "zmove_1", to: "step1_zmove1_starpiece" },
    { from: "step1_zmove1_starpiece", to: "encounter_spinda" },
    { from: "encounter_spinda", to: "step2_zmove1_starpiece" },
    { from: "step2_zmove1_starpiece", to: "starpiece" },

    { from: "zmove_2", to: "step1_zmove2_starpiece" },
    { from: "step1_zmove2_starpiece", to: "encounter_xatu" },
    { from: "encounter_xatu", to: "step2_zmove2_starpiece" },
    { from: "step2_zmove2_starpiece", to: "starpiece" },

    { from: "root", to: "step1_root_dynamax" },
    { from: "step1_root_dynamax", to: "encounter_munchlax" },
    { from: "encounter_munchlax", to: "step2_root_dynamax" },
    { from: "step2_root_dynamax", to: "encounter_marowak" },
    { from: "encounter_marowak", to: "step3_root_dynamax" },
    { from: "step3_root_dynamax", to: "dynamax" },

    { from: "encounter_marowak", to: "step1_marowak_mega" },
    { from: "step1_marowak_mega", to: "mega" },
    { from: "encounter_marowak", to: "step1_marowak_gigantamax" },
    { from: "step1_marowak_gigantamax", to: "gigantamax" },

    { from: "encounter_marowak", to: "step1_marowak_legendary2" },
    { from: "step1_marowak_legendary2", to: "encounter_cinccino" },
    { from: "encounter_cinccino", to: "step2_marowak_legendary2" },
    { from: "step2_marowak_legendary2", to: "legendary_2" },

    { from: "encounter_marowak", to: "step1_marowak_zmove2" },
    { from: "step1_marowak_zmove2", to: "encounter_celebi" },
    { from: "encounter_celebi", to: "step2_marowak_zmove2" },
    { from: "step2_marowak_zmove2", to: "zmove_2" },

    { from: "legendary_2", to: "step1_legendary2_sacredash" },
    { from: "step1_legendary2_sacredash", to: "encounter_wigglytuff" },
    { from: "encounter_wigglytuff", to: "step2_legendary2_sacredash" },
    { from: "step2_legendary2_sacredash", to: "sacred_ash" },

    { from: "encounter_marowak", to: "step1_marowak_sacredash" },
    { from: "step1_marowak_sacredash", to: "encounter_kingambit" },
    { from: "encounter_kingambit", to: "step2_marowak_sacredash" },
    { from: "step2_marowak_sacredash", to: "sacred_ash" },

    { from: "encounter_marowak", to: "step1_marowak_candy" },
    { from: "step1_marowak_candy", to: "encounter_makuhita" },
    { from: "encounter_makuhita", to: "step2_marowak_candy" },
    { from: "step1_marowak_candy", to: "rare_candy" },

    { from: "zmove_2", to: "step1_zmove2_candy" },
    { from: "step1_zmove2_candy", to: "encounter_duskull" },
    { from: "encounter_duskull", to: "step2_zmove2_candy" },
    { from: "step2_zmove2_candy", to: "rare_candy" }
  ]
}

export function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180)
}

export function rotToXY(degrees: number, radius: number): [number, number] {
  return [
    radius * Math.cos(degreesToRadians(degrees)),
    radius * Math.sin(degreesToRadians(degrees))
  ]
}

function sumVectors(...vectors: [number, number][]) {
  return vectors.reduce(([x, y], [dx, dy]) => {
    return [x + dx, y + dy]
  })
}
