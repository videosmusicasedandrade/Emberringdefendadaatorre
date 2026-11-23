import { getAllyUnlockForStage, getEnemyUnlockForStage } from './bestiaryData';
import {
  ArenaConfig,
  ArenaSlot,
  DEFAULT_ARENA,
  EnemyEntity,
  EnemyKind,
  HERO_SPECS,
  HERO_XP_THRESHOLDS,
  HeroClass,
  HeroEntity,
  MAX_HERO_LEVEL,
  MAX_UNIT_LEVEL,
  RouteBranch,
  RouteWaypoint,
  SlotCoord,
  StageConfig,
  StageRouteDefinition,
  TOTAL_STAGES,
  UNIT_SPECS,
  UNIT_XP_THRESHOLDS,
  UnitEntity,
} from './types';

function makeBranch(
  id: string,
  gateIndex: number,
  label: string,
  unlockRouteLevel: number,
  color: string,
  waypoints: ReadonlyArray<RouteWaypoint>
): RouteBranch {
  return { id, gateIndex, label, unlockRouteLevel, color, waypoints };
}

export const STAGE_ROUTES: ReadonlyArray<StageRouteDefinition> = [
  // 0: 1 Route — Straight Clearing
  {
    stage: 1,
    title: 'Trilha da Clareira',
    routeArchetype: '1 Rota · Trilha Reta',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 410,
    waypoints: [
      { x: 96, y: 410 },
      { x: 380, y: 410 },
      { x: 580, y: 390 },
      { x: 780, y: 410 },
      { x: 1055, y: 410 },
    ],
    routes: [
      makeBranch('r1', 1, 'Portão Oeste', 1, '#FF2E4C', [
        { x: 96, y: 410 },
        { x: 380, y: 410 },
        { x: 580, y: 390 },
        { x: 780, y: 410 },
        { x: 1055, y: 410 },
      ]),
    ],
    heroStartSlotId: 's1-5',
    trioStartSlotIds: ['s1-5', 's1-7', 's1-4'],
    slots: [
      { id: 's1-1', x: 215, y: 315, zone: 1, angle: Math.PI * 0.5 },
      { id: 's1-2', x: 215, y: 505, zone: 1, angle: -Math.PI * 0.5 },
      { id: 's1-3', x: 380, y: 310, zone: 2, angle: Math.PI * 0.5 },
      { id: 's1-4', x: 380, y: 510, zone: 2, angle: -Math.PI * 0.5 },
      { id: 's1-5', x: 545, y: 295, zone: 2, angle: Math.PI * 0.5 },
      { id: 's1-6', x: 545, y: 495, zone: 2, angle: -Math.PI * 0.5 },
      { id: 's1-7', x: 710, y: 300, zone: 3, angle: Math.PI * 0.5 },
      { id: 's1-8', x: 710, y: 505, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's1-9', x: 875, y: 315, zone: 4, angle: Math.PI * 0.5 },
      { id: 's1-10', x: 875, y: 505, zone: 4, angle: -Math.PI * 0.5 },
      { id: 's1-11', x: 465, y: 215, zone: 2, angle: Math.PI * 0.5 },
      { id: 's1-12', x: 635, y: 585, zone: 3, angle: -Math.PI * 0.5 },
    ],
  },
  // 1: 1 Route — S-Curve
  {
    stage: 2,
    title: 'Curva das Brasas',
    routeArchetype: '1 Rota · Curva em S',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 360,
    waypoints: [
      { x: 96, y: 255 },
      { x: 365, y: 255 },
      { x: 420, y: 295 },
      { x: 420, y: 515 },
      { x: 475, y: 555 },
      { x: 725, y: 555 },
      { x: 780, y: 515 },
      { x: 780, y: 325 },
      { x: 835, y: 285 },
      { x: 1010, y: 295 },
      { x: 1055, y: 360 },
    ],
    routes: [
      makeBranch('r1', 1, 'Portão Oeste', 1, '#FF2E4C', [
        { x: 96, y: 255 },
        { x: 365, y: 255 },
        { x: 420, y: 295 },
        { x: 420, y: 515 },
        { x: 475, y: 555 },
        { x: 725, y: 555 },
        { x: 780, y: 515 },
        { x: 780, y: 325 },
        { x: 835, y: 285 },
        { x: 1010, y: 295 },
        { x: 1055, y: 360 },
      ]),
    ],
    heroStartSlotId: 's2-5',
    trioStartSlotIds: ['s2-5', 's2-7', 's2-3'],
    slots: [
      { id: 's2-1', x: 215, y: 170, zone: 1, angle: Math.PI * 0.5 },
      { id: 's2-2', x: 215, y: 345, zone: 1, angle: -Math.PI * 0.5 },
      { id: 's2-3', x: 325, y: 385, zone: 2, angle: 0 },
      { id: 's2-4', x: 325, y: 495, zone: 2, angle: 0 },
      { id: 's2-5', x: 525, y: 445, zone: 2, angle: Math.PI * 0.5 },
      { id: 's2-6', x: 600, y: 345, zone: 3, angle: 0 },
      { id: 's2-7', x: 675, y: 445, zone: 3, angle: 0 },
      { id: 's2-8', x: 595, y: 635, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's2-9', x: 880, y: 385, zone: 4, angle: Math.PI },
      { id: 's2-10', x: 880, y: 500, zone: 4, angle: Math.PI },
      { id: 's2-11', x: 925, y: 205, zone: 4, angle: Math.PI * 0.5 },
      { id: 's2-12', x: 515, y: 210, zone: 2, angle: Math.PI },
    ],
  },
  // 2: 1 Route — Labyrinth
  {
    stage: 3,
    title: 'Labirinto Sinuoso',
    routeArchetype: '1 Rota · Labirinto',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 435,
    waypoints: [
      { x: 96, y: 245 },
      { x: 255, y: 245 },
      { x: 295, y: 290 },
      { x: 295, y: 515 },
      { x: 340, y: 560 },
      { x: 505, y: 560 },
      { x: 550, y: 515 },
      { x: 550, y: 270 },
      { x: 595, y: 225 },
      { x: 765, y: 225 },
      { x: 810, y: 270 },
      { x: 810, y: 520 },
      { x: 855, y: 565 },
      { x: 1005, y: 555 },
      { x: 1055, y: 495 },
      { x: 1055, y: 435 },
    ],
    routes: [
      makeBranch('r1', 1, 'Portão Oeste', 1, '#FF2E4C', [
        { x: 96, y: 245 },
        { x: 255, y: 245 },
        { x: 295, y: 290 },
        { x: 295, y: 515 },
        { x: 340, y: 560 },
        { x: 505, y: 560 },
        { x: 550, y: 515 },
        { x: 550, y: 270 },
        { x: 595, y: 225 },
        { x: 765, y: 225 },
        { x: 810, y: 270 },
        { x: 810, y: 520 },
        { x: 855, y: 565 },
        { x: 1005, y: 555 },
        { x: 1055, y: 495 },
        { x: 1055, y: 435 },
      ]),
    ],
    heroStartSlotId: 's3-6',
    trioStartSlotIds: ['s3-6', 's3-9', 's3-4'],
    slots: [
      { id: 's3-1', x: 195, y: 165, zone: 1, angle: Math.PI * 0.5 },
      { id: 's3-2', x: 195, y: 350, zone: 1, angle: 0 },
      { id: 's3-3', x: 195, y: 475, zone: 1, angle: 0 },
      { id: 's3-4', x: 390, y: 345, zone: 2, angle: Math.PI },
      { id: 's3-5', x: 390, y: 465, zone: 2, angle: 0 },
      { id: 's3-6', x: 465, y: 395, zone: 2, angle: 0 },
      { id: 's3-7', x: 435, y: 640, zone: 2, angle: -Math.PI * 0.5 },
      { id: 's3-8', x: 645, y: 325, zone: 3, angle: Math.PI },
      { id: 's3-9', x: 645, y: 445, zone: 3, angle: Math.PI },
      { id: 's3-10', x: 720, y: 385, zone: 3, angle: 0 },
      { id: 's3-11', x: 705, y: 635, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's3-12', x: 915, y: 335, zone: 4, angle: Math.PI },
      { id: 's3-13', x: 915, y: 455, zone: 4, angle: Math.PI },
    ],
  },
  // 3: 1 Route — Zig-Zag
  {
    stage: 4,
    title: 'Zigue-Zague Carmesim',
    routeArchetype: '1 Rota · Zigue-Zague',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 405,
    waypoints: [
      { x: 96, y: 245 },
      { x: 245, y: 245 },
      { x: 410, y: 555 },
      { x: 580, y: 245 },
      { x: 750, y: 555 },
      { x: 910, y: 265 },
      { x: 1055, y: 405 },
    ],
    routes: [
      makeBranch('r1', 1, 'Portão Oeste', 1, '#FF2E4C', [
        { x: 96, y: 245 },
        { x: 245, y: 245 },
        { x: 410, y: 555 },
        { x: 580, y: 245 },
        { x: 750, y: 555 },
        { x: 910, y: 265 },
        { x: 1055, y: 405 },
      ]),
    ],
    heroStartSlotId: 's4-6',
    trioStartSlotIds: ['s4-6', 's4-4', 's4-8'],
    slots: [
      { id: 's4-1', x: 185, y: 345, zone: 1, angle: 0 },
      { id: 's4-2', x: 335, y: 215, zone: 1, angle: Math.PI * 0.5 },
      { id: 's4-3', x: 255, y: 475, zone: 2, angle: 0 },
      { id: 's4-4', x: 410, y: 405, zone: 2, angle: Math.PI * 0.5 },
      { id: 's4-5', x: 410, y: 640, zone: 2, angle: -Math.PI * 0.5 },
      { id: 's4-6', x: 580, y: 395, zone: 3, angle: 0 },
      { id: 's4-7', x: 580, y: 525, zone: 3, angle: 0 },
      { id: 's4-8', x: 750, y: 405, zone: 3, angle: Math.PI * 0.5 },
      { id: 's4-9', x: 750, y: 640, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's4-10', x: 725, y: 215, zone: 3, angle: Math.PI * 0.5 },
      { id: 's4-11', x: 910, y: 430, zone: 4, angle: -Math.PI * 0.5 },
      { id: 's4-12', x: 935, y: 185, zone: 4, angle: Math.PI * 0.5 },
    ],
  },
  // 4: 2 Routes — Pinça do Norte (West + North)
  {
    stage: 5,
    title: 'Pinça do Norte',
    routeArchetype: '2 Rotas · Pinça Norte',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 410,
    waypoints: [
      { x: 96, y: 465 },
      { x: 430, y: 465 },
      { x: 660, y: 410 },
      { x: 1055, y: 410 },
    ],
    routes: [
      makeBranch('r1', 1, 'Portão Oeste', 1, '#FF2E4C', [
        { x: 96, y: 465 },
        { x: 430, y: 465 },
        { x: 660, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r2', 2, 'Fenda Norte', 2, '#00D4FF', [
        { x: 265, y: 118 },
        { x: 265, y: 265 },
        { x: 560, y: 265 },
        { x: 660, y: 410 },
        { x: 1055, y: 410 },
      ]),
    ],
    heroStartSlotId: 's5-5',
    trioStartSlotIds: ['s5-5', 's5-8', 's5-3'],
    slots: [
      { id: 's5-1', x: 175, y: 355, zone: 1, angle: Math.PI * 0.5 },
      { id: 's5-2', x: 175, y: 560, zone: 1, angle: -Math.PI * 0.5 },
      { id: 's5-3', x: 355, y: 365, zone: 2, angle: 0 },
      { id: 's5-4', x: 355, y: 560, zone: 2, angle: -Math.PI * 0.5 },
      { id: 's5-5', x: 505, y: 365, zone: 2, angle: 0 },
      { id: 's5-6', x: 385, y: 175, zone: 2, angle: Math.PI * 0.5 },
      { id: 's5-7', x: 535, y: 175, zone: 3, angle: Math.PI * 0.5 },
      { id: 's5-8', x: 755, y: 315, zone: 3, angle: Math.PI * 0.5 },
      { id: 's5-9', x: 755, y: 510, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's5-10', x: 575, y: 565, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's5-11', x: 905, y: 315, zone: 4, angle: Math.PI * 0.5 },
      { id: 's5-12', x: 905, y: 510, zone: 4, angle: -Math.PI * 0.5 },
    ],
  },
  // 5: 2 Routes — Twin Canals (Top-Left + Bottom-Left)
  {
    stage: 6,
    title: 'Canais Gêmeos',
    routeArchetype: '2 Rotas · Canais Gêmeos',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 410,
    waypoints: [
      { x: 96, y: 230 },
      { x: 430, y: 230 },
      { x: 640, y: 310 },
      { x: 810, y: 410 },
      { x: 1055, y: 410 },
    ],
    routes: [
      makeBranch('r1', 1, 'Portão Superior', 1, '#FF2E4C', [
        { x: 96, y: 230 },
        { x: 430, y: 230 },
        { x: 640, y: 310 },
        { x: 810, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r2', 2, 'Portão Inferior', 2, '#FACC15', [
        { x: 96, y: 590 },
        { x: 430, y: 590 },
        { x: 640, y: 510 },
        { x: 810, y: 410 },
        { x: 1055, y: 410 },
      ]),
    ],
    heroStartSlotId: 's6-6',
    trioStartSlotIds: ['s6-6', 's6-3', 's6-4'],
    slots: [
      { id: 's6-1', x: 190, y: 335, zone: 1, angle: 0 },
      { id: 's6-2', x: 190, y: 485, zone: 1, angle: 0 },
      { id: 's6-3', x: 350, y: 335, zone: 2, angle: -Math.PI * 0.5 },
      { id: 's6-4', x: 350, y: 485, zone: 2, angle: Math.PI * 0.5 },
      { id: 's6-5', x: 510, y: 410, zone: 2, angle: 0 },
      { id: 's6-6', x: 655, y: 410, zone: 3, angle: 0 },
      { id: 's6-7', x: 270, y: 150, zone: 1, angle: Math.PI * 0.5 },
      { id: 's6-8', x: 560, y: 195, zone: 3, angle: Math.PI * 0.5 },
      { id: 's6-9', x: 270, y: 660, zone: 1, angle: -Math.PI * 0.5 },
      { id: 's6-10', x: 560, y: 625, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's6-11', x: 900, y: 310, zone: 4, angle: Math.PI * 0.5 },
      { id: 's6-12', x: 900, y: 510, zone: 4, angle: -Math.PI * 0.5 },
    ],
  },
  // 6: 2 Routes — Crossed Canyon
  {
    stage: 7,
    title: 'Desfiladeiro Cruzado',
    routeArchetype: '2 Rotas · Flanco Cruzado',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 425,
    waypoints: [
      { x: 96, y: 575 },
      { x: 380, y: 575 },
      { x: 550, y: 425 },
      { x: 1055, y: 425 },
    ],
    routes: [
      makeBranch('r1', 1, 'Desfiladeiro Sul', 1, '#FF2E4C', [
        { x: 96, y: 575 },
        { x: 380, y: 575 },
        { x: 550, y: 425 },
        { x: 1055, y: 425 },
      ]),
      makeBranch('r2', 2, 'Rampa Norte', 2, '#00D4FF', [
        { x: 350, y: 125 },
        { x: 350, y: 255 },
        { x: 750, y: 255 },
        { x: 870, y: 425 },
        { x: 1055, y: 425 },
      ]),
    ],
    heroStartSlotId: 's7-6',
    trioStartSlotIds: ['s7-6', 's7-8', 's7-3'],
    slots: [
      { id: 's7-1', x: 175, y: 470, zone: 1, angle: Math.PI * 0.5 },
      { id: 's7-2', x: 175, y: 295, zone: 1, angle: 0 },
      { id: 's7-3', x: 330, y: 420, zone: 2, angle: 0 },
      { id: 's7-4', x: 495, y: 340, zone: 2, angle: 0 },
      { id: 's7-5', x: 515, y: 570, zone: 2, angle: -Math.PI * 0.5 },
      { id: 's7-6', x: 675, y: 345, zone: 3, angle: 0 },
      { id: 's7-7', x: 675, y: 525, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's7-8', x: 485, y: 170, zone: 2, angle: Math.PI * 0.5 },
      { id: 's7-9', x: 670, y: 170, zone: 3, angle: Math.PI * 0.5 },
      { id: 's7-10', x: 855, y: 225, zone: 3, angle: Math.PI * 0.5 },
      { id: 's7-11', x: 840, y: 530, zone: 4, angle: -Math.PI * 0.5 },
      { id: 's7-12', x: 960, y: 325, zone: 4, angle: Math.PI * 0.5 },
    ],
  },
  // 7: 2 Routes — Horseshoe & North Flank
  {
    stage: 8,
    title: 'Ferradura & Flanco',
    routeArchetype: '2 Rotas · Ferradura',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 545,
    waypoints: [
      { x: 96, y: 545 },
      { x: 245, y: 545 },
      { x: 245, y: 245 },
      { x: 660, y: 245 },
      { x: 660, y: 545 },
      { x: 1055, y: 545 },
    ],
    routes: [
      makeBranch('r1', 1, 'Arco Oeste', 1, '#FF2E4C', [
        { x: 96, y: 545 },
        { x: 245, y: 545 },
        { x: 245, y: 245 },
        { x: 660, y: 245 },
        { x: 660, y: 545 },
        { x: 1055, y: 545 },
      ]),
      makeBranch('r2', 2, 'Brecha Nordeste', 2, '#FACC15', [
        { x: 845, y: 120 },
        { x: 845, y: 370 },
        { x: 845, y: 545 },
        { x: 1055, y: 545 },
      ]),
    ],
    heroStartSlotId: 's8-5',
    trioStartSlotIds: ['s8-5', 's8-9', 's8-3'],
    slots: [
      { id: 's8-1', x: 155, y: 420, zone: 1, angle: 0 },
      { id: 's8-2', x: 155, y: 295, zone: 1, angle: 0 },
      { id: 's8-3', x: 350, y: 355, zone: 2, angle: 0 },
      { id: 's8-4', x: 350, y: 485, zone: 2, angle: 0 },
      { id: 's8-5', x: 525, y: 355, zone: 2, angle: 0 },
      { id: 's8-6', x: 525, y: 485, zone: 2, angle: 0 },
      { id: 's8-7', x: 455, y: 165, zone: 2, angle: Math.PI * 0.5 },
      { id: 's8-8', x: 750, y: 355, zone: 3, angle: 0 },
      { id: 's8-9', x: 750, y: 465, zone: 3, angle: Math.PI * 0.5 },
      { id: 's8-10', x: 940, y: 270, zone: 4, angle: Math.PI },
      { id: 's8-11', x: 940, y: 435, zone: 4, angle: Math.PI },
      { id: 's8-12', x: 845, y: 635, zone: 4, angle: -Math.PI * 0.5 },
    ],
  },
  // 8: 3 Routes — Trident Siege (West, North-West, South-West)
  {
    stage: 9,
    title: 'Cerco do Tridente',
    routeArchetype: '3 Rotas · Tridente',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 410,
    waypoints: [
      { x: 96, y: 410 },
      { x: 780, y: 410 },
      { x: 1055, y: 410 },
    ],
    routes: [
      makeBranch('r1', 1, 'Portão Central', 1, '#FF2E4C', [
        { x: 96, y: 410 },
        { x: 780, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r2', 2, 'Portão Norte', 2, '#00D4FF', [
        { x: 355, y: 120 },
        { x: 355, y: 230 },
        { x: 640, y: 230 },
        { x: 780, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r3', 3, 'Portão Sul', 3, '#FACC15', [
        { x: 355, y: 700 },
        { x: 355, y: 590 },
        { x: 640, y: 590 },
        { x: 780, y: 410 },
        { x: 1055, y: 410 },
      ]),
    ],
    heroStartSlotId: 's9-5',
    trioStartSlotIds: ['s9-5', 's9-6', 's9-9'],
    slots: [
      { id: 's9-1', x: 205, y: 315, zone: 1, angle: Math.PI * 0.5 },
      { id: 's9-2', x: 205, y: 505, zone: 1, angle: -Math.PI * 0.5 },
      { id: 's9-3', x: 465, y: 320, zone: 2, angle: 0 },
      { id: 's9-4', x: 465, y: 500, zone: 2, angle: 0 },
      { id: 's9-5', x: 610, y: 320, zone: 2, angle: 0 },
      { id: 's9-6', x: 610, y: 500, zone: 2, angle: 0 },
      { id: 's9-7', x: 515, y: 155, zone: 2, angle: Math.PI * 0.5 },
      { id: 's9-8', x: 515, y: 660, zone: 2, angle: -Math.PI * 0.5 },
      { id: 's9-9', x: 870, y: 315, zone: 4, angle: Math.PI * 0.5 },
      { id: 's9-10', x: 870, y: 505, zone: 4, angle: -Math.PI * 0.5 },
      { id: 's9-11', x: 775, y: 205, zone: 3, angle: Math.PI * 0.5 },
      { id: 's9-12', x: 775, y: 615, zone: 3, angle: -Math.PI * 0.5 },
    ],
  },
  // 9: 3 Routes — Three Western Breaches
  {
    stage: 10,
    title: 'Três Fendas',
    routeArchetype: '3 Rotas · Três Fendas',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 410,
    waypoints: [
      { x: 96, y: 410 },
      { x: 685, y: 410 },
      { x: 1055, y: 410 },
    ],
    routes: [
      makeBranch('r1', 1, 'Fenda Central', 1, '#FF2E4C', [
        { x: 96, y: 410 },
        { x: 685, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r2', 2, 'Fenda Alta', 2, '#00D4FF', [
        { x: 96, y: 195 },
        { x: 520, y: 195 },
        { x: 685, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r3', 3, 'Fenda Baixa', 3, '#FACC15', [
        { x: 96, y: 625 },
        { x: 520, y: 625 },
        { x: 685, y: 410 },
        { x: 1055, y: 410 },
      ]),
    ],
    heroStartSlotId: 's10-5',
    trioStartSlotIds: ['s10-5', 's10-6', 's10-9'],
    slots: [
      { id: 's10-1', x: 205, y: 300, zone: 1, angle: 0 },
      { id: 's10-2', x: 205, y: 520, zone: 1, angle: 0 },
      { id: 's10-3', x: 380, y: 300, zone: 2, angle: 0 },
      { id: 's10-4', x: 380, y: 520, zone: 2, angle: 0 },
      { id: 's10-5', x: 525, y: 315, zone: 2, angle: 0 },
      { id: 's10-6', x: 525, y: 505, zone: 2, angle: 0 },
      { id: 's10-7', x: 790, y: 315, zone: 3, angle: Math.PI * 0.5 },
      { id: 's10-8', x: 790, y: 505, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's10-9', x: 925, y: 315, zone: 4, angle: Math.PI * 0.5 },
      { id: 's10-10', x: 925, y: 505, zone: 4, angle: -Math.PI * 0.5 },
      { id: 's10-11', x: 675, y: 200, zone: 3, angle: Math.PI * 0.5 },
      { id: 's10-12', x: 675, y: 620, zone: 3, angle: -Math.PI * 0.5 },
    ],
  },
  // 10: 3 Routes — Triple Staircase Assault
  {
    stage: 11,
    title: 'Escadaria Tripla',
    routeArchetype: '3 Rotas · Assalto Misto',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 395,
    waypoints: [
      { x: 96, y: 575 },
      { x: 295, y: 575 },
      { x: 295, y: 405 },
      { x: 775, y: 405 },
      { x: 1055, y: 395 },
    ],
    routes: [
      makeBranch('r1', 1, 'Escada Oeste', 1, '#FF2E4C', [
        { x: 96, y: 575 },
        { x: 295, y: 575 },
        { x: 295, y: 405 },
        { x: 775, y: 405 },
        { x: 1055, y: 395 },
      ]),
      makeBranch('r2', 2, 'Queda do Norte', 2, '#00D4FF', [
        { x: 485, y: 118 },
        { x: 485, y: 255 },
        { x: 775, y: 255 },
        { x: 775, y: 405 },
        { x: 1055, y: 395 },
      ]),
      makeBranch('r3', 3, 'Tunel do Sul', 3, '#FACC15', [
        { x: 625, y: 700 },
        { x: 625, y: 565 },
        { x: 895, y: 565 },
        { x: 1055, y: 395 },
      ]),
    ],
    heroStartSlotId: 's11-5',
    trioStartSlotIds: ['s11-5', 's11-7', 's11-10'],
    slots: [
      { id: 's11-1', x: 195, y: 475, zone: 1, angle: Math.PI * 0.5 },
      { id: 's11-2', x: 195, y: 315, zone: 1, angle: 0 },
      { id: 's11-3', x: 390, y: 315, zone: 2, angle: 0 },
      { id: 's11-4', x: 390, y: 500, zone: 2, angle: 0 },
      { id: 's11-5', x: 565, y: 330, zone: 2, angle: 0 },
      { id: 's11-6', x: 515, y: 500, zone: 2, angle: -Math.PI * 0.5 },
      { id: 's11-7', x: 695, y: 330, zone: 3, angle: 0 },
      { id: 's11-8', x: 715, y: 490, zone: 3, angle: 0 },
      { id: 's11-9', x: 635, y: 175, zone: 3, angle: Math.PI * 0.5 },
      { id: 's11-10', x: 880, y: 310, zone: 4, angle: Math.PI * 0.5 },
      { id: 's11-11', x: 870, y: 485, zone: 4, angle: -Math.PI * 0.5 },
      { id: 's11-12', x: 455, y: 635, zone: 2, angle: 0 },
    ],
  },
  // 11: 3 Routes — Spiral of Ruin
  {
    stage: 12,
    title: 'Espiral da Ruína',
    routeArchetype: '3 Rotas · Espiral',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 430,
    waypoints: [
      { x: 96, y: 230 },
      { x: 380, y: 230 },
      { x: 380, y: 430 },
      { x: 1055, y: 430 },
    ],
    routes: [
      makeBranch('r1', 1, 'Arco Superior', 1, '#FF2E4C', [
        { x: 96, y: 230 },
        { x: 380, y: 230 },
        { x: 380, y: 430 },
        { x: 1055, y: 430 },
      ]),
      makeBranch('r2', 2, 'Vala Inferior', 2, '#00D4FF', [
        { x: 96, y: 615 },
        { x: 560, y: 615 },
        { x: 695, y: 430 },
        { x: 1055, y: 430 },
      ]),
      makeBranch('r3', 3, 'Brecha do Pico', 3, '#FACC15', [
        { x: 675, y: 118 },
        { x: 675, y: 255 },
        { x: 855, y: 255 },
        { x: 925, y: 430 },
        { x: 1055, y: 430 },
      ]),
    ],
    heroStartSlotId: 's12-5',
    trioStartSlotIds: ['s12-5', 's12-7', 's12-9'],
    slots: [
      { id: 's12-1', x: 205, y: 330, zone: 1, angle: 0 },
      { id: 's12-2', x: 205, y: 505, zone: 1, angle: 0 },
      { id: 's12-3', x: 295, y: 425, zone: 2, angle: 0 },
      { id: 's12-4', x: 475, y: 325, zone: 2, angle: 0 },
      { id: 's12-5', x: 475, y: 525, zone: 2, angle: 0 },
      { id: 's12-6', x: 590, y: 335, zone: 3, angle: 0 },
      { id: 's12-7', x: 785, y: 345, zone: 3, angle: 0 },
      { id: 's12-8', x: 785, y: 525, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's12-9', x: 530, y: 170, zone: 2, angle: Math.PI * 0.5 },
      { id: 's12-10', x: 945, y: 295, zone: 4, angle: Math.PI },
      { id: 's12-11', x: 945, y: 530, zone: 4, angle: -Math.PI * 0.5 },
      { id: 's12-12', x: 265, y: 150, zone: 1, angle: Math.PI * 0.5 },
    ],
  },
  // 12: 4 Routes — Quatro Portões do Cerco (Central-East Bastion at 825, 410!)
  {
    stage: 13,
    title: 'Quatro Portões do Cerco',
    routeArchetype: '4 Rotas · Cerco Cardinal',
    initialRouteLevel: 1,
    castleX: 825,
    castleY: 410,
    waypoints: [
      { x: 96, y: 410 },
      { x: 450, y: 410 },
      { x: 825, y: 410 },
    ],
    routes: [
      makeBranch('r1', 1, 'Portão Oeste', 1, '#FF2E4C', [
        { x: 96, y: 410 },
        { x: 450, y: 410 },
        { x: 825, y: 410 },
      ]),
      makeBranch('r2', 2, 'Portão Norte', 2, '#00D4FF', [
        { x: 430, y: 118 },
        { x: 430, y: 245 },
        { x: 645, y: 245 },
        { x: 825, y: 410 },
      ]),
      makeBranch('r3', 3, 'Portão Sul', 3, '#FACC15', [
        { x: 430, y: 700 },
        { x: 430, y: 575 },
        { x: 645, y: 575 },
        { x: 825, y: 410 },
      ]),
      makeBranch('r4', 4, 'Portão Leste', 4, '#A855F7', [
        { x: 1105, y: 495 },
        { x: 1005, y: 495 },
        { x: 1005, y: 410 },
        { x: 825, y: 410 },
      ]),
    ],
    heroStartSlotId: 's13-6',
    trioStartSlotIds: ['s13-6', 's13-7', 's13-9'],
    slots: [
      { id: 's13-1', x: 215, y: 315, zone: 1, angle: Math.PI * 0.5 },
      { id: 's13-2', x: 215, y: 505, zone: 1, angle: -Math.PI * 0.5 },
      { id: 's13-3', x: 335, y: 225, zone: 1, angle: 0 },
      { id: 's13-4', x: 335, y: 595, zone: 1, angle: 0 },
      { id: 's13-5', x: 525, y: 325, zone: 2, angle: 0 },
      { id: 's13-6', x: 525, y: 495, zone: 2, angle: 0 },
      { id: 's13-7', x: 675, y: 350, zone: 3, angle: 0 },
      { id: 's13-8', x: 675, y: 470, zone: 3, angle: 0 },
      { id: 's13-9', x: 915, y: 300, zone: 4, angle: Math.PI },
      { id: 's13-10', x: 915, y: 520, zone: 4, angle: Math.PI },
      { id: 's13-11', x: 765, y: 205, zone: 3, angle: Math.PI * 0.5 },
      { id: 's13-12', x: 765, y: 615, zone: 3, angle: -Math.PI * 0.5 },
    ],
  },
  // 13: 4 Routes — Tempestade dos Ventos
  {
    stage: 14,
    title: 'Tempestade dos Ventos',
    routeArchetype: '4 Rotas · Quatro Ventos',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 410,
    waypoints: [
      { x: 96, y: 220 },
      { x: 415, y: 220 },
      { x: 655, y: 345 },
      { x: 830, y: 410 },
      { x: 1055, y: 410 },
    ],
    routes: [
      makeBranch('r1', 1, 'Vento Noroeste', 1, '#FF2E4C', [
        { x: 96, y: 220 },
        { x: 415, y: 220 },
        { x: 655, y: 345 },
        { x: 830, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r2', 2, 'Vento Sudoeste', 2, '#00D4FF', [
        { x: 96, y: 600 },
        { x: 415, y: 600 },
        { x: 655, y: 475 },
        { x: 830, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r3', 3, 'Vento Norte', 3, '#FACC15', [
        { x: 655, y: 118 },
        { x: 655, y: 235 },
        { x: 830, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r4', 4, 'Vento Sul', 4, '#A855F7', [
        { x: 655, y: 700 },
        { x: 655, y: 585 },
        { x: 830, y: 410 },
        { x: 1055, y: 410 },
      ]),
    ],
    heroStartSlotId: 's14-5',
    trioStartSlotIds: ['s14-5', 's14-7', 's14-8'],
    slots: [
      { id: 's14-1', x: 185, y: 325, zone: 1, angle: 0 },
      { id: 's14-2', x: 185, y: 495, zone: 1, angle: 0 },
      { id: 's14-3', x: 340, y: 325, zone: 2, angle: 0 },
      { id: 's14-4', x: 340, y: 495, zone: 2, angle: 0 },
      { id: 's14-5', x: 485, y: 410, zone: 2, angle: 0 },
      { id: 's14-6', x: 635, y: 410, zone: 3, angle: 0 },
      { id: 's14-7', x: 540, y: 175, zone: 2, angle: Math.PI * 0.5 },
      { id: 's14-8', x: 540, y: 645, zone: 2, angle: -Math.PI * 0.5 },
      { id: 's14-9', x: 800, y: 235, zone: 3, angle: Math.PI * 0.5 },
      { id: 's14-10', x: 800, y: 585, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's14-11', x: 930, y: 315, zone: 4, angle: Math.PI * 0.5 },
      { id: 's14-12', x: 930, y: 505, zone: 4, angle: -Math.PI * 0.5 },
    ],
  },
  // 14: 4 Routes — Cruzamento Abissal (4 Corners converging on 795, 410)
  {
    stage: 15,
    title: 'Cruzamento Abissal',
    routeArchetype: '4 Rotas · Quatro Cantos',
    initialRouteLevel: 1,
    castleX: 795,
    castleY: 410,
    waypoints: [
      { x: 96, y: 235 },
      { x: 375, y: 235 },
      { x: 565, y: 370 },
      { x: 795, y: 410 },
    ],
    routes: [
      makeBranch('r1', 1, 'Canto Noroeste', 1, '#FF2E4C', [
        { x: 96, y: 235 },
        { x: 375, y: 235 },
        { x: 565, y: 370 },
        { x: 795, y: 410 },
      ]),
      makeBranch('r2', 2, 'Canto Sudoeste', 2, '#00D4FF', [
        { x: 96, y: 585 },
        { x: 375, y: 585 },
        { x: 565, y: 450 },
        { x: 795, y: 410 },
      ]),
      makeBranch('r3', 3, 'Canto Nordeste', 3, '#FACC15', [
        { x: 965, y: 155 },
        { x: 965, y: 275 },
        { x: 915, y: 345 },
        { x: 795, y: 410 },
      ]),
      makeBranch('r4', 4, 'Canto Sudeste', 4, '#A855F7', [
        { x: 1095, y: 625 },
        { x: 970, y: 625 },
        { x: 925, y: 480 },
        { x: 795, y: 410 },
      ]),
    ],
    heroStartSlotId: 's15-5',
    trioStartSlotIds: ['s15-5', 's15-7', 's15-8'],
    slots: [
      { id: 's15-1', x: 185, y: 345, zone: 1, angle: 0 },
      { id: 's15-2', x: 185, y: 475, zone: 1, angle: 0 },
      { id: 's15-3', x: 345, y: 345, zone: 2, angle: 0 },
      { id: 's15-4', x: 345, y: 475, zone: 2, angle: 0 },
      { id: 's15-5', x: 485, y: 410, zone: 2, angle: 0 },
      { id: 's15-6', x: 575, y: 225, zone: 3, angle: Math.PI * 0.5 },
      { id: 's15-7', x: 575, y: 595, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's15-8', x: 735, y: 265, zone: 3, angle: Math.PI * 0.5 },
      { id: 's15-9', x: 735, y: 555, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's15-10', x: 1030, y: 335, zone: 4, angle: Math.PI },
      { id: 's15-11', x: 1030, y: 485, zone: 4, angle: Math.PI },
      { id: 's15-12', x: 890, y: 245, zone: 4, angle: Math.PI * 0.5 },
    ],
  },
  // 15: 4 Routes — Coroa do Imperador
  {
    stage: 16,
    title: 'Coroa do Imperador',
    routeArchetype: '4 Rotas · Coroa Real',
    initialRouteLevel: 1,
    castleX: 1055,
    castleY: 410,
    waypoints: [
      { x: 96, y: 410 },
      { x: 805, y: 410 },
      { x: 1055, y: 410 },
    ],
    routes: [
      makeBranch('r1', 1, 'Eixo Imperial', 1, '#FF2E4C', [
        { x: 96, y: 410 },
        { x: 805, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r2', 2, 'Corredor Alto', 2, '#00D4FF', [
        { x: 96, y: 185 },
        { x: 480, y: 185 },
        { x: 685, y: 325 },
        { x: 805, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r3', 3, 'Corredor Baixo', 3, '#FACC15', [
        { x: 96, y: 635 },
        { x: 480, y: 635 },
        { x: 685, y: 495 },
        { x: 805, y: 410 },
        { x: 1055, y: 410 },
      ]),
      makeBranch('r4', 4, 'Fenda Real', 4, '#A855F7', [
        { x: 755, y: 118 },
        { x: 755, y: 245 },
        { x: 915, y: 410 },
        { x: 1055, y: 410 },
      ]),
    ],
    heroStartSlotId: 's16-5',
    trioStartSlotIds: ['s16-5', 's16-6', 's16-9'],
    slots: [
      { id: 's16-1', x: 185, y: 295, zone: 1, angle: 0 },
      { id: 's16-2', x: 185, y: 525, zone: 1, angle: 0 },
      { id: 's16-3', x: 365, y: 295, zone: 2, angle: 0 },
      { id: 's16-4', x: 365, y: 525, zone: 2, angle: 0 },
      { id: 's16-5', x: 520, y: 320, zone: 2, angle: 0 },
      { id: 's16-6', x: 520, y: 500, zone: 2, angle: 0 },
      { id: 's16-7', x: 630, y: 185, zone: 3, angle: Math.PI * 0.5 },
      { id: 's16-8', x: 695, y: 595, zone: 3, angle: -Math.PI * 0.5 },
      { id: 's16-9', x: 895, y: 265, zone: 4, angle: Math.PI * 0.5 },
      { id: 's16-10', x: 855, y: 525, zone: 4, angle: -Math.PI * 0.5 },
      { id: 's16-11', x: 970, y: 315, zone: 4, angle: Math.PI * 0.5 },
      { id: 's16-12', x: 970, y: 505, zone: 4, angle: -Math.PI * 0.5 },
    ],
  },
];

// Non-standardized irregular stage-to-template mapping (1 to 4 routes mixed organically)
const NON_STANDARD_TEMPLATE_SEQUENCE: ReadonlyArray<number> = [
  0, // St 1: 1 route
  1, // St 2: 1 route
  4, // St 3: 2 routes (Pinça do Norte)
  2, // St 4: 1 route (unless Convergence)
  8, // St 5: 3 routes (Cerco do Tridente)
  5, // St 6: 2 routes
  3, // St 7: 1 route
  12, // St 8: 4 routes (Quatro Portões)
  6, // St 9: 2 routes
  9, // St 10: 3 routes
  13, // St 11: 4 routes
  7, // St 12: 2 routes
  10, // St 13: 3 routes
  14, // St 14: 4 routes
  11, // St 15: 3 routes
  15, // St 16: 4 routes
];

export function getStageRouteDefinition(
  stageNumber: number,
  isConvergenceStage = false
): StageRouteDefinition {
  const stage = Math.max(1, Math.min(TOTAL_STAGES, Math.floor(stageNumber)));
  const seqPos = (stage - 1) % NON_STANDARD_TEMPLATE_SEQUENCE.length;
  let templateIndex = NON_STANDARD_TEMPLATE_SEQUENCE[seqPos];
  const cycle = Math.floor((stage - 1) / NON_STANDARD_TEMPLATE_SEQUENCE.length);

  // Convergence stages (every 4-8 stages) always use a multi-gate 3 or 4 route siege!
  if (isConvergenceStage && STAGE_ROUTES[templateIndex].routes.length < 3) {
    const multiPool = [8, 12, 9, 13, 10, 14, 11, 15];
    templateIndex = multiPool[(stage * 3 + cycle) % multiPool.length];
  }

  const template = STAGE_ROUTES[templateIndex] ?? STAGE_ROUTES[0];
  const mirrorY = cycle % 2 === 1;
  const transformY = (y: number) => (mirrorY ? 810 - y : y);

  // As campaign deepens, some multi-route maps start with 2 open gates right away!
  const initialRouteLevel =
    template.routes.length >= 3 && (isConvergenceStage || stage >= 18)
      ? Math.min(2, template.routes.length)
      : template.initialRouteLevel;

  return {
    stage,
    title:
      cycle === 0
        ? template.title
        : `${template.title} ${cycle >= 2 ? `· Ato ${cycle + 1}` : '· Invertida'}`,
    routeArchetype: mirrorY ? `${template.routeArchetype} (Espelho)` : template.routeArchetype,
    initialRouteLevel,
    castleX: template.castleX,
    castleY: transformY(template.castleY),
    waypoints: template.waypoints.map((w) => ({ x: w.x, y: transformY(w.y) })),
    routes: template.routes.map((r) => ({
      ...r,
      waypoints: r.waypoints.map((w) => ({ x: w.x, y: transformY(w.y) })),
    })),
    heroStartSlotId: `s${stage}-hero`,
    trioStartSlotIds: (template.trioStartSlotIds ?? [
      template.heroStartSlotId,
      template.slots[0]?.id ?? template.heroStartSlotId,
      template.slots[template.slots.length - 1]?.id ?? template.heroStartSlotId,
    ]).map((origId) => {
      if (origId === template.heroStartSlotId) return `s${stage}-hero`;
      const idx = template.slots.findIndex((s) => s.id === origId);
      return idx >= 0 ? `s${stage}-${idx + 1}` : `s${stage}-1`;
    }),
    slots: template.slots.map((s: SlotCoord, idx: number) => ({
      id: s.id === template.heroStartSlotId ? `s${stage}-hero` : `s${stage}-${idx + 1}`,
      x: s.x,
      y: transformY(s.y),
      zone: s.zone,
      angle: mirrorY ? -s.angle : s.angle,
    })),
  };
}

export function buildArenaForStage(
  stageNumber: number,
  isConvergenceStage = false
): ArenaConfig {
  const route = getStageRouteDefinition(stageNumber, isConvergenceStage);
  return {
    stage: route.stage,
    worldWidth: DEFAULT_ARENA.worldWidth,
    worldHeight: DEFAULT_ARENA.worldHeight,
    centerX: DEFAULT_ARENA.centerX,
    centerY: DEFAULT_ARENA.centerY,
    castleX: route.castleX,
    castleY: route.castleY,
    castleRadius: DEFAULT_ARENA.castleRadius,
    roadHalfWidth: DEFAULT_ARENA.roadHalfWidth,
    waypoints: route.waypoints,
    routes: route.routes,
  };
}

export function getStageConfig(
  stageNumber: number,
  convergenceStages: ReadonlyArray<number> = []
): StageConfig {
  const stage = Math.max(1, Math.min(TOTAL_STAGES, Math.floor(stageNumber)));
  const isConvergenceStage = convergenceStages.includes(stage);
  const route = getStageRouteDefinition(stage, isConvergenceStage);
  const baseWaves = stage === 1 ? 2 : stage <= 6 ? 3 : stage <= 25 ? 4 : 5;
  const totalWaves = isConvergenceStage ? Math.max(4, baseWaves) : baseWaves;
  const isFiveLevelMilestone = stage % 5 === 0;
  const enemyUnlock = getEnemyUnlockForStage(stage);
  const allyUnlock = getAllyUnlockForStage(stage);

  return {
    stage,
    title: route.title,
    routeArchetype: route.routeArchetype,
    routeCount: route.routes.length,
    initialRouteLevel: route.initialRouteLevel,
    isConvergenceStage,
    totalWaves,
    baseEnemiesPerWave:
      Math.min(42, 12 + Math.round(stage * 0.85)) + (isConvergenceStage ? 8 : 0),
    hpMultiplier: (1.28 + (stage - 1) * 0.13) * (isConvergenceStage ? 1.42 : 1),
    speedMultiplier: Math.min(1.78, 1.08 + (stage - 1) * 0.008) * (isConvergenceStage ? 1.06 : 1),
    spawnInterval: Math.max(
      0.22,
      (0.92 - (stage - 1) * 0.012) * (isConvergenceStage ? 0.82 : 1)
    ),
    bossHp:
      stage >= TOTAL_STAGES
        ? 25000
        : Math.round((480 + (stage - 1) * 165) * (isConvergenceStage ? 1.45 : 1)),
    isFiveLevelMilestone,
    unlockedEnemyLabel: enemyUnlock?.name,
    unlockedEnemyId: enemyUnlock?.id,
    unlockedAllyLabel: allyUnlock?.name,
    unlockedAllyId: allyUnlock?.id,
  };
}

export function computeEnemyEssenceReward(
  kind: EnemyKind,
  stage: number,
  overchargeActive: boolean
): number {
  let base = 4;
  if (kind === 'shielded') base = 6;
  else if (kind === 'brute') base = 9;
  else if (kind === 'stalker') base = 10;
  else if (kind === 'pyro') base = 11;
  else if (kind === 'titan') base = 14;
  else if (kind === 'shield_bearer') base = 12;
  else if (kind === 'corruptor') base = 13;
  else if (kind === 'reaper') base = 16;
  else if (kind === 'boss') base = 24 + Math.max(1, stage) * 2;
  return overchargeActive ? Math.round(base * 1.5) : base;
}

export function crossedHeroUpgradeMilestone(
  previousLevel: number,
  newLevel: number
): number | null {
  for (let lvl = Math.max(1, previousLevel) + 1; lvl <= newLevel; lvl++) {
    if (lvl % 5 === 0) return lvl;
  }
  return null;
}

export function getHeroEvolutionCost(currentLevel: number): number {
  const lvl = Math.max(1, Math.min(MAX_HERO_LEVEL, currentLevel));
  return Math.max(1, Math.floor(1 + (lvl - 1) * 0.45));
}

export function getHeroRankTitle(level: number): string {
  if (level >= 25) return 'Mítico';
  if (level >= 20) return 'Lendário';
  if (level >= 15) return 'Mestre';
  if (level >= 10) return 'Campeão';
  if (level >= 5) return 'Veterano';
  if (level >= 3) return 'Guardião';
  return 'Aprendiz';
}

export function isValidFreeHeroPosition(
  worldX: number,
  worldY: number,
  arena: ArenaConfig,
  otherHeroes: ReadonlyArray<{ x: number; y: number }> = []
): boolean {
  if (worldX < 85 || worldX > arena.worldWidth - 85) return false;
  if (worldY < 110 || worldY > arena.worldHeight - 125) return false;

  // Must not stand inside the Castle
  if (distanceBetween(worldX, worldY, arena.castleX, arena.castleY) < arena.castleRadius + 24) {
    return false;
  }

  // Must stay clear of every route road & gate portal
  for (const branch of arena.routes) {
    const start = branch.waypoints[0];
    if (start && distanceBetween(worldX, worldY, start.x, start.y) < 48) {
      return false;
    }
    for (let i = 0; i < branch.waypoints.length - 1; i++) {
      const a = branch.waypoints[i];
      const b = branch.waypoints[i + 1];
      if (pointToSegmentDistance(worldX, worldY, a.x, a.y, b.x, b.y) < arena.roadHalfWidth + 14) {
        return false;
      }
    }
  }

  // Keep enough spacing from other deployed heroes so clicks never overlap
  for (const other of otherHeroes) {
    if (distanceBetween(worldX, worldY, other.x, other.y) < 42) {
      return false;
    }
  }

  return true;
}

export function computeViewportTransform(
  cssWidth: number,
  cssHeight: number,
  arena: ArenaConfig = DEFAULT_ARENA
): { scale: number; offsetX: number; offsetY: number } {
  const safeW = Math.max(240, cssWidth);
  const safeH = Math.max(240, cssHeight);
  const isPortrait = safeH > safeW;
  if (isPortrait) {
    const scale = Math.min(safeW / 1140, safeH / 840);
    return {
      scale,
      offsetX: safeW * 0.5 - arena.centerX * scale,
      offsetY: safeH * 0.5 - arena.centerY * scale,
    };
  }
  const scale = Math.min(safeW / arena.worldWidth, safeH / arena.worldHeight);
  return {
    scale,
    offsetX: (safeW - arena.worldWidth * scale) * 0.5,
    offsetY: (safeH - arena.worldHeight * scale) * 0.5,
  };
}

export function unlockNextStage(completedStage: number, currentHighest: number): number {
  const next = Math.min(TOTAL_STAGES, completedStage + 1);
  return Math.max(currentHighest, next);
}

export function formatSurvivalTime(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export function buildArenaSlots(
  arena: ArenaConfig = DEFAULT_ARENA,
  isConvergenceStage = false
): ArenaSlot[] {
  const route = getStageRouteDefinition(arena.stage, isConvergenceStage);
  return route.slots.map((c) => ({
    id: c.id,
    x: c.x,
    y: c.y,
    ring: c.zone,
    angle: c.angle,
    radius: 28,
    unitId: null,
    hasHero: false,
  }));
}

export function getHeroLevelFromXp(xp: number): number {
  const safeXp = Math.max(0, xp);
  let lvl = 1;
  for (let i = 1; i < HERO_XP_THRESHOLDS.length; i++) {
    if (safeXp >= HERO_XP_THRESHOLDS[i]) {
      lvl = i + 1;
    }
  }
  return Math.min(MAX_HERO_LEVEL, lvl);
}

export function getHeroXpBounds(level: number): { currentFloor: number; nextThreshold: number } {
  const clamped = Math.max(1, Math.min(MAX_HERO_LEVEL, level));
  const currentFloor = HERO_XP_THRESHOLDS[clamped - 1] ?? 0;
  const nextThreshold =
    clamped >= MAX_HERO_LEVEL
      ? currentFloor
      : HERO_XP_THRESHOLDS[clamped] ?? currentFloor + 100;
  return { currentFloor, nextThreshold };
}

export function getHeroStatsForLevel(
  heroClass: HeroClass,
  level: number
): {
  damage: number;
  cooldown: number;
  range: number;
  critChance: number;
  blastRadius: number;
} {
  const spec = HERO_SPECS[heroClass];
  const delta = Math.max(0, Math.min(MAX_HERO_LEVEL, level) - 1);
  // 50% slower strictly linear strength progression per Hero level
  const damageMult = 1 + delta * 0.0425;
  const cooldownMult = Math.max(0.75, 1 - delta * 0.0075);

  return {
    damage: Math.round(spec.damage * damageMult),
    cooldown: Math.max(0.24, Number((spec.cooldown * cooldownMult).toFixed(3))),
    range: Math.round(spec.range * (1 + Math.min(0.14, delta * 0.006))),
    critChance: Math.min(0.26, Number((spec.critChance + delta * 0.004).toFixed(3))),
    blastRadius:
      spec.blastRadius > 0 ? Math.round(spec.blastRadius * (1 + Math.min(0.18, delta * 0.0075))) : 0,
  };
}

export function applyHeroXpGain(
  hero: HeroEntity,
  gainedXp: number
): { leveledUp: boolean; previousLevel: number; newLevel: number; isMaxReached: boolean } {
  const prev = hero.level;
  hero.xp += Math.max(0, gainedXp);
  const nextLevel = getHeroLevelFromXp(hero.xp);
  if (nextLevel > prev) {
    hero.level = nextLevel;
    const stats = getHeroStatsForLevel(hero.heroClass, nextLevel);
    hero.damage = stats.damage;
    hero.cooldown = stats.cooldown;
    hero.range = stats.range;
    hero.critChance = stats.critChance;
    hero.blastRadius = stats.blastRadius;
    hero.levelUpFlash = 1.25;
    hero.attackAnim = 1;
    return {
      leveledUp: true,
      previousLevel: prev,
      newLevel: nextLevel,
      isMaxReached: nextLevel >= MAX_HERO_LEVEL,
    };
  }
  return {
    leveledUp: false,
    previousLevel: prev,
    newLevel: prev,
    isMaxReached: false,
  };
}

export function pointToSegmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const abx = bx - ax;
  const aby = by - ay;
  const lenSq = abx * abx + aby * aby;
  if (lenSq <= 0.0001) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lenSq));
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t));
}

export function computeRouteTotalLength(waypoints: ReadonlyArray<RouteWaypoint>): number {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += distanceBetween(waypoints[i].x, waypoints[i].y, waypoints[i + 1].x, waypoints[i + 1].y);
  }
  return total;
}

export function computeRouteSpawnPoint(
  waypoints: ReadonlyArray<RouteWaypoint>,
  laneOffset = 0
): { x: number; y: number; angle: number } {
  const start = waypoints[0] ?? { x: 96, y: 410 };
  const next = waypoints[1] ?? { x: 380, y: 410 };
  const dx = next.x - start.x;
  const dy = next.y - start.y;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  return {
    x: start.x + nx * laneOffset,
    y: start.y + ny * laneOffset,
    angle: Math.atan2(dy, dx),
  };
}

export function computeRemainingPathDistance(
  enemy: Pick<EnemyEntity, 'x' | 'y' | 'waypointIndex'>,
  waypoints: ReadonlyArray<RouteWaypoint>
): number {
  if (waypoints.length === 0) return 0;
  const idx = Math.max(1, Math.min(waypoints.length - 1, enemy.waypointIndex));
  let dist = distanceBetween(enemy.x, enemy.y, waypoints[idx].x, waypoints[idx].y);
  for (let i = idx; i < waypoints.length - 1; i++) {
    dist += distanceBetween(waypoints[i].x, waypoints[i].y, waypoints[i + 1].x, waypoints[i + 1].y);
  }
  return dist;
}

export function advanceEnemyAlongRoute(
  enemy: Pick<
    EnemyEntity,
    'x' | 'y' | 'vx' | 'vy' | 'waypointIndex' | 'laneOffset' | 'distanceTraveled' | 'pathProgress' | 'walkPhase'
  >,
  waypoints: ReadonlyArray<RouteWaypoint>,
  stepDist: number,
  speedScalar: number,
  totalLength: number
): { reachedCastle: boolean; remainingPathDistance: number } {
  if (waypoints.length < 2) {
    return { reachedCastle: true, remainingPathDistance: 0 };
  }

  let remainingMove = Math.max(0, stepDist);
  let wpIdx = Math.max(1, Math.min(waypoints.length - 1, enemy.waypointIndex));
  let curX = enemy.x;
  let curY = enemy.y;
  let lastDirX = 1;
  let lastDirY = 0;

  while (remainingMove > 0 && wpIdx < waypoints.length) {
    const prev = waypoints[wpIdx - 1];
    const target = waypoints[wpIdx];
    const segDx = target.x - prev.x;
    const segDy = target.y - prev.y;
    const segLen = Math.hypot(segDx, segDy) || 1;
    const perpX = -segDy / segLen;
    const perpY = segDx / segLen;
    const isFinalNode = wpIdx === waypoints.length - 1;
    const offset = isFinalNode ? 0 : enemy.laneOffset;
    const tx = target.x + perpX * offset;
    const ty = target.y + perpY * offset;

    const dx = tx - curX;
    const dy = ty - curY;
    const distToWp = Math.hypot(dx, dy);

    if (distToWp <= remainingMove) {
      curX = tx;
      curY = ty;
      remainingMove -= distToWp;
      lastDirX = distToWp > 0.01 ? dx / distToWp : segDx / segLen;
      lastDirY = distToWp > 0.01 ? dy / distToWp : segDy / segLen;
      if (isFinalNode) {
        enemy.x = curX;
        enemy.y = curY;
        enemy.vx = lastDirX * speedScalar;
        enemy.vy = lastDirY * speedScalar;
        enemy.waypointIndex = wpIdx;
        enemy.distanceTraveled += stepDist;
        enemy.walkPhase = enemy.distanceTraveled * 0.14;
        enemy.pathProgress = 1;
        return { reachedCastle: true, remainingPathDistance: 0 };
      }
      wpIdx += 1;
    } else {
      const nx = dx / (distToWp || 1);
      const ny = dy / (distToWp || 1);
      curX += nx * remainingMove;
      curY += ny * remainingMove;
      lastDirX = nx;
      lastDirY = ny;
      remainingMove = 0;
    }
  }

  enemy.x = curX;
  enemy.y = curY;
  enemy.vx = lastDirX * speedScalar;
  enemy.vy = lastDirY * speedScalar;
  enemy.waypointIndex = wpIdx;
  enemy.distanceTraveled += stepDist;
  enemy.walkPhase = enemy.distanceTraveled * 0.14;

  const remDist = computeRemainingPathDistance(enemy, waypoints);
  enemy.pathProgress = totalLength > 0 ? Math.max(0, Math.min(1, 1 - remDist / totalLength)) : 0;

  return {
    reachedCastle: wpIdx >= waypoints.length - 1 && remDist <= 14,
    remainingPathDistance: remDist,
  };
}

export function pushEnemyBackAlongRoute(
  enemy: Pick<EnemyEntity, 'x' | 'y' | 'waypointIndex' | 'laneOffset' | 'pathProgress'>,
  waypoints: ReadonlyArray<RouteWaypoint>,
  pushDist: number,
  totalLength: number
) {
  if (waypoints.length < 2 || pushDist <= 0) return;

  let remainingPush = pushDist;
  let wpIdx = Math.max(1, Math.min(waypoints.length - 1, enemy.waypointIndex));
  let curX = enemy.x;
  let curY = enemy.y;

  while (remainingPush > 0 && wpIdx >= 1) {
    const prev = waypoints[wpIdx - 1];
    const target = waypoints[wpIdx];
    const segDx = target.x - prev.x;
    const segDy = target.y - prev.y;
    const segLen = Math.hypot(segDx, segDy) || 1;
    const perpX = -segDy / segLen;
    const perpY = segDx / segLen;
    const prevOffset = wpIdx - 1 === 0 ? 0 : enemy.laneOffset;
    const backX = prev.x + perpX * prevOffset;
    const backY = prev.y + perpY * prevOffset;

    const dx = backX - curX;
    const dy = backY - curY;
    const distToPrev = Math.hypot(dx, dy);

    if (distToPrev <= remainingPush) {
      curX = backX;
      curY = backY;
      remainingPush -= distToPrev;
      if (wpIdx === 1) {
        remainingPush = 0;
      } else {
        wpIdx -= 1;
      }
    } else {
      curX += (dx / (distToPrev || 1)) * remainingPush;
      curY += (dy / (distToPrev || 1)) * remainingPush;
      remainingPush = 0;
    }
  }

  enemy.x = curX;
  enemy.y = curY;
  enemy.waypointIndex = wpIdx;
  const remDist = computeRemainingPathDistance(enemy, waypoints);
  enemy.pathProgress = totalLength > 0 ? Math.max(0, Math.min(1, 1 - remDist / totalLength)) : 0;
}

export function distanceBetween(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function circlesCollide(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const minSum = r1 + r2;
  return dx * dx + dy * dy <= minSum * minSum;
}

export function rollCriticalHit(
  baseDamage: number,
  critChance: number,
  rngValue: number = Math.random()
): { damage: number; isCrit: boolean } {
  const isCrit = rngValue < critChance;
  return {
    damage: isCrit ? Math.round(baseDamage * 1.75) : baseDamage,
    isCrit,
  };
}

export function computeRadialKnockbackVector(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  impulse: number
): { vx: number; vy: number } {
  const dx = targetX - originX;
  const dy = targetY - originY;
  const dist = Math.hypot(dx, dy) || 1;
  return {
    vx: (dx / dist) * impulse,
    vy: (dy / dist) * impulse,
  };
}

export function findNearestEnemyInRange(
  unit: Pick<UnitEntity, 'x' | 'y' | 'range'>,
  enemies: ReadonlyArray<EnemyEntity>,
  _arena: ArenaConfig = DEFAULT_ARENA
): EnemyEntity | null {
  let bestEnemy: EnemyEntity | null = null;
  let bestProgress = -1;
  let bestDist = Infinity;

  for (const enemy of enemies) {
    if (enemy.isDead || enemy.hp <= 0) continue;
    const distFromUnit = distanceBetween(unit.x, unit.y, enemy.x, enemy.y);
    if (distFromUnit > unit.range + enemy.radius) continue;

    if (
      enemy.pathProgress > bestProgress + 0.002 ||
      (Math.abs(enemy.pathProgress - bestProgress) <= 0.002 && distFromUnit < bestDist)
    ) {
      bestProgress = enemy.pathProgress;
      bestDist = distFromUnit;
      bestEnemy = enemy;
    }
  }

  return bestEnemy;
}

export function findEnemiesInSlashArc(
  originX: number,
  originY: number,
  slashAngle: number,
  slashRadius: number,
  arcHalfAngle: number,
  enemies: ReadonlyArray<EnemyEntity>
): EnemyEntity[] {
  const hit: EnemyEntity[] = [];
  for (const enemy of enemies) {
    if (enemy.isDead || enemy.hp <= 0) continue;
    const dx = enemy.x - originX;
    const dy = enemy.y - originY;
    const dist = Math.hypot(dx, dy);
    if (dist > slashRadius + enemy.radius) continue;

    const angleToEnemy = Math.atan2(dy, dx);
    let diff = angleToEnemy - slashAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    if (Math.abs(diff) <= arcHalfAngle || dist <= enemy.radius + 16) {
      hit.push(enemy);
    }
  }
  return hit;
}

export function getEnemyResistanceMultiplier(
  enemy: Pick<EnemyEntity, 'kind' | 'bracingTimer' | 'corrosionTimer'>,
  byHero = false
): number {
  const hasCorrosion = (enemy.corrosionTimer ?? 0) > 0;
  if (hasCorrosion) {
    return enemy.kind === 'boss' || enemy.kind === 'titan' ? 1.08 : 1.2;
  }

  let baseMult = 1;
  if (enemy.kind === 'pyro') {
    baseMult = 0.88;
  } else if (enemy.kind === 'brute') {
    baseMult = 0.72;
  } else if (enemy.kind === 'shielded') {
    baseMult = enemy.bracingTimer > 0 ? 0.42 : 0.65;
  } else if (enemy.kind === 'reaper') {
    baseMult = 0.6;
  } else if (enemy.kind === 'titan') {
    baseMult = enemy.bracingTimer > 0 ? 0.34 : 0.5;
  } else if (enemy.kind === 'boss') {
    baseMult = 0.48;
  }

  const isToughTarget =
    enemy.kind === 'shielded' ||
    enemy.kind === 'brute' ||
    enemy.kind === 'titan' ||
    enemy.kind === 'reaper' ||
    enemy.kind === 'shield_bearer' ||
    enemy.kind === 'boss';

  if (byHero && isToughTarget) {
    baseMult *= 0.65;
  }

  return baseMult;
}

export function isEliteEnemy(enemy: { kind: EnemyKind; isElite?: boolean; isBoss?: boolean }): boolean {
  if (enemy.isBoss || enemy.kind === 'boss') return false;
  return Boolean(enemy.isElite) || enemy.kind === 'titan' || enemy.kind === 'reaper' || enemy.kind === 'brute';
}

export function applyDamageToEnemy(
  enemy: EnemyEntity,
  rawDamage: number,
  options?: { byHero?: boolean }
): { actualDamage: number; killed: boolean } {
  if (enemy.isDead || enemy.hp <= 0) {
    return { actualDamage: 0, killed: false };
  }
  const resistanceMult = getEnemyResistanceMultiplier(enemy, options?.byHero ?? false);
  const actualDamage = Math.max(1, Math.round(rawDamage * resistanceMult));
  enemy.hp = Math.max(0, enemy.hp - actualDamage);
  enemy.hitFlash = 0.08;

  if (enemy.hp <= 0) {
    enemy.isDead = true;
    enemy.koTimer =
      enemy.kind === 'boss' || enemy.kind === 'titan' || enemy.kind === 'reaper'
        ? 0.52
        : 0.32;
    return { actualDamage, killed: true };
  }
  return { actualDamage, killed: false };
}

export function applyDamageToUnit(
  unit: UnitEntity,
  damage: number
): { actualDamage: number; destroyed: boolean } {
  if (unit.hp <= 0) return { actualDamage: 0, destroyed: true };
  const actualDamage = Math.max(1, Math.round(damage));
  unit.hp = Math.max(0, unit.hp - actualDamage);
  unit.hitFlash = 0.1;
  return {
    actualDamage,
    destroyed: unit.hp <= 0,
  };
}

export function findBlockingUnitForEnemy(
  enemy: Pick<EnemyEntity, 'x' | 'y' | 'radius'>,
  units: ReadonlyArray<UnitEntity>
): UnitEntity | null {
  let closest: UnitEntity | null = null;
  let closestDist = Infinity;

  for (const unit of units) {
    if (unit.hp <= 0) continue;
    const blockRadius =
      unit.kind === 'golem'
        ? 36
        : unit.kind === 'shield' || unit.kind === 'swordsman_ally' || unit.kind === 'paladin'
          ? 30
          : 24;
    const dist = distanceBetween(enemy.x, enemy.y, unit.x, unit.y);
    if (dist <= enemy.radius + blockRadius && dist < closestDist) {
      closestDist = dist;
      closest = unit;
    }
  }

  return closest;
}

export function canMergeUnits(
  source: Pick<UnitEntity, 'id' | 'kind' | 'level'>,
  target: Pick<UnitEntity, 'id' | 'kind' | 'level'>
): boolean {
  if (source.id === target.id) return false;
  if (source.kind !== target.kind) return false;
  if (source.level !== target.level) return false;
  if (target.level >= MAX_UNIT_LEVEL) return false;
  return true;
}

export function getUnitStatsForLevel(
  kind: UnitEntity['kind'],
  level: number
): {
  damage: number;
  maxHp: number;
  cooldown: number;
  range: number;
  critChance: number;
} {
  const spec = UNIT_SPECS[kind];
  const levelDelta = Math.max(0, Math.min(MAX_UNIT_LEVEL, level) - 1);
  // 50% slower strictly linear strength progression per Ally merge level
  const damageMult = 1 + levelDelta * 0.475;
  const maxHpMult = 1 + levelDelta * 0.375;
  const cooldownMult = Math.max(0.65, 1 - levelDelta * 0.08);

  return {
    damage: Math.round(spec.damage * damageMult),
    maxHp: Math.round(spec.maxHp * maxHpMult),
    cooldown: Math.max(0.24, Number((spec.cooldown * cooldownMult).toFixed(3))),
    range: Math.round(spec.range * (1 + levelDelta * 0.05)),
    critChance: Math.min(0.5, Number((spec.critChance + levelDelta * 0.025).toFixed(3))),
  };
}

export function getUnitLevelFromXp(xp: number): number {
  const safeXp = Math.max(0, xp);
  let lvl = 1;
  for (let i = 1; i < UNIT_XP_THRESHOLDS.length; i++) {
    if (safeXp >= UNIT_XP_THRESHOLDS[i]) {
      lvl = i + 1;
    }
  }
  return Math.min(MAX_UNIT_LEVEL, lvl);
}

export function getUnitXpBounds(level: number): { currentFloor: number; nextThreshold: number } {
  const clamped = Math.max(1, Math.min(MAX_UNIT_LEVEL, level));
  const currentFloor = UNIT_XP_THRESHOLDS[clamped - 1] ?? 0;
  const nextThreshold =
    clamped >= MAX_UNIT_LEVEL
      ? currentFloor
      : UNIT_XP_THRESHOLDS[clamped] ?? currentFloor + 100;
  return { currentFloor, nextThreshold };
}

export function applyUnitXpGain(
  unit: UnitEntity,
  gainedXp: number
): { leveledUp: boolean; previousLevel: number; newLevel: number; isMaxReached: boolean } {
  const prev = unit.level;
  unit.xp = (unit.xp ?? 0) + Math.max(0, gainedXp);
  const xpLevel = getUnitLevelFromXp(unit.xp);
  const nextLevel = Math.min(MAX_UNIT_LEVEL, Math.max(prev, xpLevel));

  if (nextLevel > prev) {
    const prevMaxHp = unit.maxHp;
    const scaled = getUnitStatsForLevel(unit.kind, nextLevel);
    unit.level = nextLevel;
    unit.damage = scaled.damage;
    unit.maxHp = scaled.maxHp;
    unit.hp = Math.min(scaled.maxHp, unit.hp + Math.max(0, scaled.maxHp - prevMaxHp));
    unit.cooldown = scaled.cooldown;
    unit.range = scaled.range;
    unit.critChance = scaled.critChance;
    unit.levelUpFlash = 1.0;
    unit.attackAnim = 1;
    return {
      leveledUp: true,
      previousLevel: prev,
      newLevel: nextLevel,
      isMaxReached: nextLevel >= MAX_UNIT_LEVEL,
    };
  }

  return {
    leveledUp: false,
    previousLevel: prev,
    newLevel: prev,
    isMaxReached: prev >= MAX_UNIT_LEVEL,
  };
}

export function applyMergeUpgrade(
  target: UnitEntity,
  sourceXp = 0,
  sourceKills = 0
): UnitEntity {
  const nextLevel = Math.min(MAX_UNIT_LEVEL, target.level + 1);
  const scaled = getUnitStatsForLevel(target.kind, nextLevel);
  const nextFloorXp = UNIT_XP_THRESHOLDS[nextLevel - 1] ?? 0;

  target.level = nextLevel;
  target.xp = Math.max(nextFloorXp, (target.xp ?? 0) + Math.round(Math.max(0, sourceXp) * 0.5));
  target.kills = (target.kills ?? 0) + Math.max(0, sourceKills);
  target.damage = scaled.damage;
  target.maxHp = scaled.maxHp;
  target.hp = target.maxHp;
  target.cooldown = scaled.cooldown;
  target.range = scaled.range;
  target.critChance = scaled.critChance;
  target.levelUpFlash = 1.0;
  target.attackAnim = 1;
  return target;
}

export function applyDamageToBase(
  currentHp: number,
  damage: number
): { nextHp: number; isGameOver: boolean } {
  const nextHp = Math.max(0, Math.round(currentHp - Math.max(0, damage)));
  return {
    nextHp,
    isGameOver: nextHp <= 0,
  };
}

export function computeWaveConfig(
  wave: number,
  stage = 1,
  convergenceStages: ReadonlyArray<number> = []
): {
  totalEnemies: number;
  spawnInterval: number;
  hpMultiplier: number;
  speedMultiplier: number;
  isBossWave: boolean;
  bossHp: number;
  mix: Record<Exclude<EnemyKind, 'boss'>, number>;
} {
  const stageCfg = getStageConfig(stage, convergenceStages);
  const clampedWave = Math.max(1, wave);
  const totalEnemies = stageCfg.baseEnemiesPerWave + (clampedWave - 1) * 5;
  const spawnInterval = Math.max(0.2, stageCfg.spawnInterval - (clampedWave - 1) * 0.07);
  const hpMultiplier = stageCfg.hpMultiplier * (1 + (clampedWave - 1) * 0.24);
  const speedMultiplier = Math.min(1.82, stageCfg.speedMultiplier + (clampedWave - 1) * 0.04);

  const stalkerWeight =
    stage >= 8
      ? Math.min(0.22, 0.1 + (stage - 8) * 0.008 + (clampedWave - 1) * 0.02)
      : stage >= 3
        ? Math.min(0.16, 0.08 + (clampedWave - 1) * 0.02)
        : 0;
  const pyroWeight =
    stage >= 23
      ? Math.min(0.18, 0.09 + (stage - 23) * 0.006 + (clampedWave - 1) * 0.015)
      : stage >= 5
        ? Math.min(0.12, 0.06 + (clampedWave - 1) * 0.015)
        : 0;
  const titanWeight =
    stage >= 70
      ? Math.min(0.18, 0.09 + (stage - 70) * 0.004 + (clampedWave - 1) * 0.015)
      : stage >= 8
        ? Math.min(0.12, 0.06 + (clampedWave - 1) * 0.015)
        : 0;
  const reaperWeight =
    stage >= 116
      ? Math.min(0.16, 0.09 + (clampedWave - 1) * 0.015)
      : stage >= 10
        ? Math.min(0.1, 0.06 + (clampedWave - 1) * 0.01)
        : 0;
  const shieldBearerWeight = stage >= 4 ? Math.min(0.12, 0.05 + (clampedWave - 1) * 0.015) : 0;
  const corruptorWeight = stage >= 7 ? Math.min(0.1, 0.04 + (clampedWave - 1) * 0.015) : 0;

  const bruteWeight =
    stage === 1 && clampedWave === 1
      ? 0.08
      : Math.min(0.26, 0.12 + (stage - 1) * 0.01 + (clampedWave - 1) * 0.03);
  const shieldedWeight =
    stage === 1 && clampedWave === 1
      ? 0.24
      : Math.min(0.32, 0.24 + (stage - 1) * 0.008 + (clampedWave - 1) * 0.025);
  const walkerWeight = Math.max(
    0.12,
    1 -
      bruteWeight -
      shieldedWeight -
      stalkerWeight -
      pyroWeight -
      titanWeight -
      reaperWeight -
      shieldBearerWeight -
      corruptorWeight
  );

  return {
    totalEnemies,
    spawnInterval,
    hpMultiplier,
    speedMultiplier,
    isBossWave: clampedWave >= stageCfg.totalWaves,
    bossHp: stageCfg.bossHp,
    mix: {
      walker: walkerWeight,
      shielded: shieldedWeight,
      brute: bruteWeight,
      stalker: stalkerWeight,
      pyro: pyroWeight,
      titan: titanWeight,
      reaper: reaperWeight,
      shield_bearer: shieldBearerWeight,
      corruptor: corruptorWeight,
    },
  };
}

export function findSlotAtPoint(
  worldX: number,
  worldY: number,
  slots: ReadonlyArray<ArenaSlot>
): ArenaSlot | null {
  for (const slot of slots) {
    if (distanceBetween(worldX, worldY, slot.x, slot.y) <= slot.radius + 14) {
      return slot;
    }
  }
  return null;
}

/**
 * Computes the stationary guard position for the active Passive Pet right beside the Castle.
 * Evaluates candidate side positions around (castleX, castleY) and picks the spot that stays
 * inside safe viewport bounds while maximizing clearance from all incoming enemy routes.
 */
export function computeCastlePetPosition(arena: ArenaConfig): { x: number; y: number } {
  const { castleX: cx, castleY: cy, worldWidth, worldHeight } = arena;
  const minX = 68;
  const maxX = worldWidth - 58;
  const minY = 128;
  const maxY = worldHeight - 108;

  // Ordered by visual preference: right beside the Castle (east guard post), then south-east, north-east, south, north, west
  const candidates: Array<{ x: number; y: number; pref: number }> = [
    { x: cx + 82, y: cy + 12, pref: 18 },
    { x: cx + 76, y: cy + 56, pref: 14 },
    { x: cx + 76, y: cy - 42, pref: 12 },
    { x: cx + 10, y: cy + 92, pref: 10 },
    { x: cx + 10, y: cy - 94, pref: 8 },
    { x: cx - 84, y: cy + 68, pref: 4 },
    { x: cx - 84, y: cy - 68, pref: 2 },
  ];

  let best = { x: Math.min(maxX, cx + 82), y: Math.min(maxY, Math.max(minY, cy + 12)) };
  let bestScore = -Infinity;

  for (const c of candidates) {
    if (c.x < minX || c.x > maxX || c.y < minY || c.y > maxY) continue;
    let minRoadDist = Infinity;
    for (const branch of arena.routes) {
      const wps = branch.waypoints;
      for (let i = 0; i < wps.length - 1; i++) {
        const d = pointToSegmentDistance(c.x, c.y, wps[i].x, wps[i].y, wps[i + 1].x, wps[i + 1].y);
        if (d < minRoadDist) minRoadDist = d;
      }
    }
    // Strongly prefer candidates clearly off the road (roadHalfWidth + 24 = 54px+)
    const clearanceScore = Math.min(minRoadDist, 120) + (minRoadDist >= arena.roadHalfWidth + 22 ? 60 : -120);
    const totalScore = clearanceScore + c.pref;
    if (totalScore > bestScore) {
      bestScore = totalScore;
      best = { x: Math.round(c.x), y: Math.round(c.y) };
    }
  }

  return best;
}

