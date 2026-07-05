import type { Tree } from "../types/atlas"
import { Item } from "../types/enum/Item"
import { TownEncounters } from "../types/enum/TownEncounter"

export const AtlasTree: Tree = {
  nodes: [
    { id: "root", position: [0, 0], type: "start" },
    // root - legendary1 path
    {
      id: "step_1_root_legendary1",
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
      id: "step_2_root_legendary1",
      type: "step",
      position: rotToXY(-120, 210)
    },
    {
      id: "legendary1",
      type: "keystone",
      position: rotToXY(-120, 300),
      emera: "legendary"
    },
    // root - legendary2 path
    {
      id: "step_1_root_legendary2",
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
      id: "step_2_root_legendary2",
      type: "step",
      position: rotToXY(-60, 210)
    },
    {
      id: "legendary2",
      type: "keystone",
      position: rotToXY(-60, 300),
      emera: "legendary"
    },

    // fusion
    {
      id: "condition_fusion",
      position: rotToXY(-90, 260),
      type: "condition",
      condition: "fusion"
    },
    {
      id: "fusion",
      position: rotToXY(-90, 350),
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

    // legendary1 - gold mask
    {
      id: "step1_legendary1_mask",
      position: sumVectors(rotToXY(-120, 300), rotToXY(-60, 90)),
      type: "step"
    },
    {
      id: "encounter_magnezone",
      position: sumVectors(rotToXY(-120, 300), rotToXY(-60, 150)),
      type: "encounter",
      encounter: TownEncounters.MAGNEZONE
    },
    {
      id: "step2_legendary1_mask",
      position: sumVectors(rotToXY(-120, 300), rotToXY(-60, 210)),
      type: "step"
    },
    {
      id: "gold_mask",
      position: sumVectors(rotToXY(-120, 300), rotToXY(-60, 300)),
      type: "item",
      item: Item.GOLD_MASK
    },

    // legendary2 - mask
    {
      id: "step1_legendary2_mask",
      position: sumVectors(rotToXY(-60, 300), rotToXY(-120, 90)),
      type: "step"
    },
    {
      id: "encounter_grovyle",
      position: sumVectors(rotToXY(-60, 300), rotToXY(-120, 150)),
      type: "encounter",
      encounter: TownEncounters.GROVYLE
    },
    {
      id: "step2_legendary2_mask",
      position: sumVectors(rotToXY(-60, 300), rotToXY(-120, 210)),
      type: "step"
    },

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
      id: "step1_root_zmove",
      position: rotToXY(120, 90),
      type: "step"
    },
    {
      id: "encounter_electivire",
      type: "encounter",
      position: rotToXY(120, 150),
      encounter: TownEncounters.ELECTIVIRE
    },
    {
      id: "step2_root_zmove",
      position: rotToXY(120, 210),
      type: "step"
    },
    {
      id: "zmove",
      position: rotToXY(120, 300),
      type: "keystone",
      emera: "zmove"
    },

    // Awakening path
    {
      id: "step1_root_awakening",
      position: rotToXY(60, 90),
      type: "step"
    },
    {
      id: "encounter_kangaskhan",
      type: "encounter",
      position: rotToXY(60, 150),
      encounter: TownEncounters.KANGASKHAN
    },
    {
      id: "step2_root_awakening",
      position: rotToXY(60, 210),
      type: "step"
    },
    {
      id: "awakening",
      position: rotToXY(60, 300),
      type: "keystone",
      emera: "awakening"
    },

    // looplet

    {
      id: "step1_looplet",
      position: rotToXY(-120, 390),
      type: "step"
    },
    {
      id: "looplet",
      position: rotToXY(-120, 480),
      type: "item",
      item: Item.LOOPLET
    },
    {
      id: "looplet_pink_buff",
      position: sumVectors(rotToXY(-120, 480), rotToXY(-180, 90)),
      type: "buff",
      buff: "pink"
    },
    {
      id: "looplet_red_buff",
      position: sumVectors(rotToXY(-120, 480), rotToXY(-150, 90)),
      type: "buff",
      buff: "red"
    },
    {
      id: "looplet_gold_buff",
      position: sumVectors(rotToXY(-120, 480), rotToXY(-120, 90)),
      type: "buff",
      buff: "yellow"
    },
    {
      id: "looplet_green_buff",
      position: sumVectors(rotToXY(-120, 480), rotToXY(-90, 90)),
      type: "buff",
      buff: "green"
    },
    {
      id: "looplet_blue_buff",
      position: sumVectors(rotToXY(-120, 480), rotToXY(-60, 90)),
      type: "buff",
      buff: "blue"
    },

    // legendary1 - gold bow
    {
      id: "step1_legendary1_goldbow",
      position: sumVectors(rotToXY(-120, 300), rotToXY(180, 90)),
      type: "step"
    },
    {
      id: "encounter_chansey",
      type: "encounter",
      position: sumVectors(rotToXY(-120, 300), rotToXY(180, 150)),
      encounter: TownEncounters.CHANSEY
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
      position: rotToXY(180, 390),
      type: "condition",
      condition: "stellar"
    },
    {
      id: "step1_tera_orb",
      position: rotToXY(180, 450),
      type: "step"
    },
    {
      id: "tera_orb",
      position: rotToXY(180, 540),
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
      id: "encounter_ludicolo",
      type: "encounter",
      position: sumVectors(rotToXY(180, 300), rotToXY(120, 150)),
      encounter: TownEncounters.LUDICOLO
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

    // zmove - eviolite
    {
      id: "step1_zmove_eviolite",
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
      id: "step2_zmove_eviolite",
      position: sumVectors(rotToXY(120, 300), rotToXY(180, 210)),
      type: "step"
    },

    // stellar - zmove
    {
      id: "step1_stellar_zmove",
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
      id: "step2_stellar_zmove",
      position: sumVectors(rotToXY(180, 300), rotToXY(60, 210)),
      type: "step"
    },

    // zmove - awakening
    {
      id: "step1_zmove_awakening",
      position: sumVectors(rotToXY(120, 300), rotToXY(0, 90)),
      type: "step"
    },
    {
      id: "encounter_spinda",
      type: "encounter",
      position: sumVectors(rotToXY(120, 300), rotToXY(0, 150)),
      encounter: TownEncounters.SPINDA
    },
    {
      id: "step2_zmove_awakening",
      position: sumVectors(rotToXY(120, 300), rotToXY(0, 210)),
      type: "step"
    },

    // zmove - star piece
    {
      id: "step1_zmove_starpiece",
      position: sumVectors(rotToXY(120, 300), rotToXY(60, 90)),
      type: "step"
    },
    {
      id: "encounter_chimecho",
      type: "encounter",
      position: sumVectors(rotToXY(120, 300), rotToXY(60, 150)),
      encounter: TownEncounters.CHIMECHO
    },
    {
      id: "step2_zmove_starpiece",
      position: sumVectors(rotToXY(120, 300), rotToXY(60, 210)),
      type: "step"
    },
    {
      id: "starpiece",
      position: sumVectors(rotToXY(120, 300), rotToXY(60, 300)),
      type: "item",
      item: Item.STAR_PIECE
    },

    // awakening - star piece
    {
      id: "step1_awakening_starpiece",
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
      id: "step2_awakening_starpiece",
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
      id: "encounter_cinccino",
      type: "encounter",
      position: rotToXY(0, 150),
      encounter: TownEncounters.CINCCINO
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
      id: "dynamax",
      position: rotToXY(0, 390),
      type: "item",
      item: Item.DYNAMAX_BAND
    },
    {
      id: "condition_gigantamax",
      position: rotToXY(0, 470),
      type: "condition",
      condition: "gigantamax"
    },
    {
      id: "gigantamax",
      position: rotToXY(0, 550),
      type: "keystone",
      emera: "gigantamax"
    },

    // mega paths
    {
      id: "condition_mega_1",
      position: rotToXY(-60, 400),
      type: "condition",
      condition: "mega"
    },
    {
      id: "mega_1",
      position: rotToXY(-60, 500),
      type: "keystone",
      emera: "mega"
    },

    {
      id: "condition_mega_2",
      position: rotToXY(60, 400),
      type: "condition",
      condition: "mega"
    },
    {
      id: "mega_2",
      position: rotToXY(60, 500),
      type: "keystone",
      emera: "mega"
    },

    // marowak - legendary2
    {
      id: "step1_marowak_legendary2",
      position: sumVectors(rotToXY(0, 300), rotToXY(-120, 90)),
      type: "step"
    },
    {
      id: "encounter_duskull",
      type: "encounter",
      position: sumVectors(rotToXY(0, 300), rotToXY(-120, 150)),
      encounter: TownEncounters.DUSKULL
    },
    {
      id: "step2_marowak_legendary2",
      position: sumVectors(rotToXY(0, 300), rotToXY(-120, 210)),
      type: "step"
    },

    // marowak - awakening
    {
      id: "step1_marowak_awakening",
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
      id: "step2_marowak_awakening",
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

    // awakening - rare candy
    {
      id: "step1_awakening_candy",
      position: sumVectors(rotToXY(60, 300), rotToXY(0, 90)),
      type: "step"
    },
    {
      id: "encounter_munchlax",
      position: sumVectors(rotToXY(60, 300), rotToXY(0, 150)),
      type: "encounter",
      encounter: TownEncounters.MUNCHLAX
    },
    {
      id: "step2_awakening_candy",
      position: sumVectors(rotToXY(60, 300), rotToXY(0, 210)),
      type: "step"
    }
  ],
  connections: [
    { from: "root", to: "step_1_root_legendary1" },
    { from: "step_1_root_legendary1", to: "encounter_croagunk" },
    { from: "encounter_croagunk", to: "step_2_root_legendary1" },
    { from: "step_2_root_legendary1", to: "legendary1" },

    { from: "root", to: "step_1_root_legendary2" },
    { from: "step_1_root_legendary2", to: "encounter_wobbuffet" },
    { from: "encounter_wobbuffet", to: "step_2_root_legendary2" },
    { from: "step_2_root_legendary2", to: "legendary2" },

    { from: "legendary1", to: "condition_fusion" },
    { from: "legendary2", to: "condition_fusion" },
    { from: "condition_fusion", to: "fusion" },
    /*{ from: "legendary1", to: "condition_primal" },
    { from: "legendary2", to: "condition_primal" },
    { from: "condition_primal", to: "primal" },*/

    { from: "legendary1", to: "step1_legendary1_mask" },
    { from: "step1_legendary1_mask", to: "encounter_magnezone" },
    { from: "encounter_magnezone", to: "step2_legendary1_mask" },
    { from: "step2_legendary1_mask", to: "gold_mask" },

    { from: "legendary2", to: "step1_legendary2_mask" },
    { from: "step1_legendary2_mask", to: "encounter_grovyle" },
    { from: "encounter_grovyle", to: "step2_legendary2_mask" },
    { from: "step2_legendary2_mask", to: "gold_mask" },

    { from: "root", to: "step1_root_stellar" },
    { from: "step1_root_stellar", to: "encounter_kecleon" },
    { from: "encounter_kecleon", to: "step2_root_stellar" },
    { from: "step2_root_stellar", to: "stellar" },

    { from: "root", to: "step1_root_zmove" },
    { from: "step1_root_zmove", to: "encounter_electivire" },
    { from: "encounter_electivire", to: "step2_root_zmove" },
    { from: "step2_root_zmove", to: "zmove" },

    { from: "root", to: "step1_root_awakening" },
    { from: "step1_root_awakening", to: "encounter_kangaskhan" },
    { from: "encounter_kangaskhan", to: "step2_root_awakening" },
    { from: "step2_root_awakening", to: "awakening" },

    { from: "legendary1", to: "step1_legendary1_goldbow" },
    { from: "step1_legendary1_goldbow", to: "encounter_chansey" },
    { from: "encounter_chansey", to: "step2_legendary1_goldbow" },
    { from: "step2_legendary1_goldbow", to: "goldbow" },

    { from: "stellar", to: "step1_stellar_goldbow" },
    { from: "step1_stellar_goldbow", to: "encounter_lapras" },
    { from: "encounter_lapras", to: "step2_stellar_goldbow" },
    { from: "step2_stellar_goldbow", to: "goldbow" },

    { from: "stellar", to: "step1_stellar_legendary1" },
    { from: "step1_stellar_legendary1", to: "encounter_sableye" },
    { from: "encounter_sableye", to: "step2_stellar_legendary1" },
    { from: "step2_stellar_legendary1", to: "legendary1" },

    { from: "stellar", to: "step1_stellar_eviolite" },
    { from: "step1_stellar_eviolite", to: "encounter_ludicolo" },
    { from: "encounter_ludicolo", to: "step2_stellar_eviolite" },
    { from: "step2_stellar_eviolite", to: "eviolite" },

    { from: "zmove", to: "step1_zmove_eviolite" },
    { from: "step1_zmove_eviolite", to: "encounter_meowth" },
    { from: "encounter_meowth", to: "step2_zmove_eviolite" },
    { from: "step2_zmove_eviolite", to: "eviolite" },

    { from: "stellar", to: "step1_stellar_zmove" },
    { from: "step1_stellar_zmove", to: "encounter_regirock" },
    { from: "encounter_regirock", to: "step2_stellar_zmove" },
    { from: "step2_stellar_zmove", to: "zmove" },

    { from: "stellar", to: "condition_tera_orb" },
    { from: "condition_tera_orb", to: "step1_tera_orb" },
    { from: "step1_tera_orb", to: "tera_orb" },

    { from: "zmove", to: "step1_zmove_awakening" },
    { from: "step1_zmove_awakening", to: "encounter_spinda" },
    { from: "encounter_spinda", to: "step2_zmove_awakening" },
    { from: "step2_zmove_awakening", to: "awakening" },

    { from: "zmove", to: "step1_zmove_starpiece" },
    { from: "step1_zmove_starpiece", to: "encounter_chimecho" },
    { from: "encounter_chimecho", to: "step2_zmove_starpiece" },
    { from: "step2_zmove_starpiece", to: "starpiece" },

    { from: "awakening", to: "step1_awakening_starpiece" },
    { from: "step1_awakening_starpiece", to: "encounter_xatu" },
    { from: "encounter_xatu", to: "step2_awakening_starpiece" },
    { from: "step2_awakening_starpiece", to: "starpiece" },

    { from: "root", to: "step1_root_dynamax" },
    { from: "step1_root_dynamax", to: "encounter_cinccino" },
    { from: "encounter_cinccino", to: "step2_root_dynamax" },
    { from: "step2_root_dynamax", to: "encounter_marowak" },
    { from: "encounter_marowak", to: "dynamax" },
    { from: "dynamax", to: "condition_gigantamax" },
    { from: "condition_gigantamax", to: "gigantamax" },

    { from: "encounter_marowak", to: "step1_marowak_legendary2" },
    { from: "step1_marowak_legendary2", to: "encounter_duskull" },
    { from: "encounter_duskull", to: "step2_marowak_legendary2" },
    { from: "step2_marowak_legendary2", to: "legendary2" },

    { from: "encounter_marowak", to: "step1_marowak_awakening" },
    { from: "step1_marowak_awakening", to: "encounter_celebi" },
    { from: "encounter_celebi", to: "step2_marowak_awakening" },
    { from: "step2_marowak_awakening", to: "awakening" },

    { from: "legendary2", to: "condition_mega_1" },
    { from: "condition_mega_1", to: "mega_1" },

    { from: "awakening", to: "condition_mega_2" },
    { from: "condition_mega_2", to: "mega_2" },

    { from: "legendary2", to: "step1_legendary2_sacredash" },
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

    { from: "awakening", to: "step1_awakening_candy" },
    { from: "step1_awakening_candy", to: "encounter_munchlax" },
    { from: "encounter_munchlax", to: "step2_awakening_candy" },
    { from: "step2_awakening_candy", to: "rare_candy" },

    { from: "legendary1", to: "step1_looplet" },
    { from: "step1_looplet", to: "looplet" },
    { from: "looplet", to: "looplet_pink_buff" },
    { from: "looplet", to: "looplet_red_buff" },
    { from: "looplet", to: "looplet_gold_buff" },
    { from: "looplet", to: "looplet_green_buff" },
    { from: "looplet", to: "looplet_blue_buff" }
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
