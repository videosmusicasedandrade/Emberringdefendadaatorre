import type { DailyMissionState } from './dailyMissions';

export type GamePhase = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';

export type HeroClass = 'archer' | 'swordsman' | 'bomber';

export type PetKind = 'turtle' | 'tiger' | 'rabbit' | 'owl' | 'cat';

export interface PetSpec {
  kind: PetKind;
  name: string;
  title: string;
  shortBonus: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  auraInner: string;
  auraOuter: string;
  castleHpBonusPct: number;
  castleRegenPerSec: number;
  damageBonusPct: number;
  attackSpeedBonusPct: number;
  manaCostReductionPct: number;
  spellCooldownReductionPct: number;
  itemDropLuckBonusPct: number;
}

export const PET_ORDER: ReadonlyArray<PetKind> = ['turtle', 'tiger', 'rabbit', 'owl', 'cat'];

export const PET_SPECS: Record<PetKind, PetSpec> = {
  turtle: {
    kind: 'turtle',
    name: 'Tartaruga',
    title: 'Guardiã da Muralha',
    shortBonus: '+35% HP Castelo · +2 HP/s',
    description: 'Amuleto de Jade Ancestral: amplia a vida máxima do castelo em +35% e regenera +2 HP/s continuamente.',
    primaryColor: '#10B981',
    secondaryColor: '#065F46',
    accentColor: '#FACC15',
    glowColor: 'rgba(16, 185, 129, 0.55)',
    auraInner: 'rgba(110, 231, 183, 0.42)',
    auraOuter: 'rgba(16, 185, 129, 0)',
    castleHpBonusPct: 0.35,
    castleRegenPerSec: 2,
    damageBonusPct: 0,
    attackSpeedBonusPct: 0,
    manaCostReductionPct: 0,
    spellCooldownReductionPct: 0,
    itemDropLuckBonusPct: 0,
  },
  tiger: {
    kind: 'tiger',
    name: 'Tigre',
    title: 'Espírito da Fúria',
    shortBonus: '+18% Dano Herói & Aliados',
    description: 'Amuleto Solar Rubi: fortalece o ataque do herói principal e de todos os aliados em campo em +18%.',
    primaryColor: '#F97316',
    secondaryColor: '#9A3412',
    accentColor: '#FDE047',
    glowColor: 'rgba(249, 115, 22, 0.55)',
    auraInner: 'rgba(253, 186, 116, 0.44)',
    auraOuter: 'rgba(239, 68, 68, 0)',
    castleHpBonusPct: 0,
    castleRegenPerSec: 0,
    damageBonusPct: 0.18,
    attackSpeedBonusPct: 0,
    manaCostReductionPct: 0,
    spellCooldownReductionPct: 0,
    itemDropLuckBonusPct: 0,
  },
  rabbit: {
    kind: 'rabbit',
    name: 'Coelho',
    title: 'Pulso Lunar',
    shortBonus: '+20% Vel. Ataque Geral',
    description: 'Amuleto de Safira Veloz: acelera a cadência de ataque do herói principal e de todos os aliados em +20%.',
    primaryColor: '#38BDF8',
    secondaryColor: '#0369A1',
    accentColor: '#E0F2FE',
    glowColor: 'rgba(56, 189, 248, 0.55)',
    auraInner: 'rgba(186, 230, 253, 0.44)',
    auraOuter: 'rgba(0, 212, 255, 0)',
    castleHpBonusPct: 0,
    castleRegenPerSec: 0,
    damageBonusPct: 0,
    attackSpeedBonusPct: 0.2,
    manaCostReductionPct: 0,
    spellCooldownReductionPct: 0,
    itemDropLuckBonusPct: 0,
  },
  owl: {
    kind: 'owl',
    name: 'Coruja',
    title: 'Sábia do Éter',
    shortBonus: '-20% Custo Mana · -15% Recarga',
    description: 'Amuleto Arcano Violeta: reduz em 20% o custo de mana/essência das tropas e em 15% a recarga de magias.',
    primaryColor: '#A855F7',
    secondaryColor: '#4C1D95',
    accentColor: '#FACC15',
    glowColor: 'rgba(168, 85, 247, 0.55)',
    auraInner: 'rgba(216, 180, 254, 0.42)',
    auraOuter: 'rgba(139, 92, 246, 0)',
    castleHpBonusPct: 0,
    castleRegenPerSec: 0,
    damageBonusPct: 0,
    attackSpeedBonusPct: 0,
    manaCostReductionPct: 0.2,
    spellCooldownReductionPct: 0.15,
    itemDropLuckBonusPct: 0,
  },
  cat: {
    kind: 'cat',
    name: 'Gato',
    title: 'Amuleto da Fortuna',
    shortBonus: '+35% Sorte de Drop de Itens',
    description: 'Amuleto Dourado da Sorte: emana bênção de fortuna que concede +35% de sorte para drop de itens.',
    primaryColor: '#FACC15',
    secondaryColor: '#7C3AED',
    accentColor: '#FEF08A',
    glowColor: 'rgba(250, 204, 21, 0.58)',
    auraInner: 'rgba(254, 240, 138, 0.45)',
    auraOuter: 'rgba(250, 204, 21, 0)',
    castleHpBonusPct: 0,
    castleRegenPerSec: 0,
    damageBonusPct: 0,
    attackSpeedBonusPct: 0,
    manaCostReductionPct: 0,
    spellCooldownReductionPct: 0,
    itemDropLuckBonusPct: 35,
  },
};

export type RingSkinId =
  | 'classic'
  | 'frost'
  | 'crimson'
  | 'eclipse'
  | 'celestial'
  | 'dragonfire'
  | 'void_sovereign';
export type FxStyleId =
  | 'standard'
  | 'arcane'
  | 'solar'
  | 'venom'
  | 'astral'
  | 'starfire';

export interface RingSkinSpec {
  id: RingSkinId;
  name: string;
  description: string;
  cost: number;
  primaryColor: string;
  secondaryColor: string;
  runeColor: string;
  glowColor: string;
  /** Present when unlocked exclusively via a Player Experience Milestone */
  milestoneLevel?: number;
}

export interface FxStyleSpec {
  id: FxStyleId;
  name: string;
  description: string;
  cost: number;
  projectileTint: string;
  slashTint: string;
  /** Present when unlocked exclusively via a Player Experience Milestone */
  milestoneLevel?: number;
}

export interface AchievementSpec {
  id: string;
  title: string;
  description: string;
  category: 'combat' | 'mastery' | 'progression';
  target: number;
  rewardSouls: number;
}

export const RING_SKINS: Record<RingSkinId, RingSkinSpec> = {
  classic: {
    id: 'classic',
    name: 'Anel Brasa Clássica',
    description: 'Ouro forjado e runas solares da cidadela original.',
    cost: 0,
    primaryColor: '#FACC15',
    secondaryColor: '#F97316',
    runeColor: '#FEF08A',
    glowColor: 'rgba(250, 204, 21, 0.5)',
  },
  frost: {
    id: 'frost',
    name: 'Anel Geada Glacial',
    description: 'Cristais árticos que brilham em ciano elétrico.',
    cost: 12,
    primaryColor: '#00D4FF',
    secondaryColor: '#38BDF8',
    runeColor: '#E0F2FE',
    glowColor: 'rgba(0, 212, 255, 0.55)',
  },
  crimson: {
    id: 'crimson',
    name: 'Anel Rubi Abissal',
    description: 'Energia carmesim forjada nas profundezas do cerco.',
    cost: 18,
    primaryColor: '#FF2E4C',
    secondaryColor: '#DC2626',
    runeColor: '#FCA5A5',
    glowColor: 'rgba(255, 46, 76, 0.55)',
  },
  eclipse: {
    id: 'eclipse',
    name: 'Anel Eclipse Real',
    description: 'Ametista mística com núcleo estelar dourado.',
    cost: 25,
    primaryColor: '#A855F7',
    secondaryColor: '#FACC15',
    runeColor: '#E9D5FF',
    glowColor: 'rgba(168, 85, 247, 0.55)',
  },
  celestial: {
    id: 'celestial',
    name: 'Anel Brasa Celestial',
    description: 'Visual raro de Marco Nv.5: safira astral entrelaçada com ouro celeste.',
    cost: 0,
    primaryColor: '#38BDF8',
    secondaryColor: '#FACC15',
    runeColor: '#FEF9C3',
    glowColor: 'rgba(56, 189, 248, 0.62)',
    milestoneLevel: 5,
  },
  dragonfire: {
    id: 'dragonfire',
    name: 'Anel Dragão Solar',
    description: 'Visual lendário de Marco Nv.20: chama vulcânica e runas dracônicas.',
    cost: 0,
    primaryColor: '#F97316',
    secondaryColor: '#FF2E4C',
    runeColor: '#FDE047',
    glowColor: 'rgba(249, 115, 22, 0.66)',
    milestoneLevel: 20,
  },
  void_sovereign: {
    id: 'void_sovereign',
    name: 'Anel Soberano do Vazio',
    description: 'Visual mítico de Marco Nv.50: coroa carmesim-violeta de domínio absoluto.',
    cost: 0,
    primaryColor: '#FF2E4C',
    secondaryColor: '#9333EA',
    runeColor: '#FDE047',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    milestoneLevel: 50,
  },
};

export const FX_STYLES: Record<FxStyleId, FxStyleSpec> = {
  standard: {
    id: 'standard',
    name: 'Chama Padrão',
    description: 'Disparos e cortes clássicos em ciano e ouro.',
    cost: 0,
    projectileTint: '#00D4FF',
    slashTint: '#FACC15',
  },
  arcane: {
    id: 'arcane',
    name: 'Pulso Arcano',
    description: 'Rastros violeta e centelhas astrais nos ataques.',
    cost: 10,
    projectileTint: '#C084FC',
    slashTint: '#38BDF8',
  },
  solar: {
    id: 'solar',
    name: 'Explosão Solar',
    description: 'Cortes incandescentes dourados e faíscas rubras.',
    cost: 15,
    projectileTint: '#FACC15',
    slashTint: '#FF2E4C',
  },
  venom: {
    id: 'venom',
    name: 'Esmeralda Tóxica',
    description: 'Traços ácidos em verde jade e lima brilhante.',
    cost: 15,
    projectileTint: '#10B981',
    slashTint: '#A3E635',
  },
  astral: {
    id: 'astral',
    name: 'Rastro Astral',
    description: 'Efeito épico de Marco Nv.12: rajadas safira prismáticas e cortes celestes.',
    cost: 0,
    projectileTint: '#818CF8',
    slashTint: '#38BDF8',
    milestoneLevel: 12,
  },
  starfire: {
    id: 'starfire',
    name: 'Chama Estelar',
    description: 'Efeito lendário de Marco Nv.30: projéteis dourado-violeta incandescentes.',
    cost: 0,
    projectileTint: '#FDE047',
    slashTint: '#E879F9',
    milestoneLevel: 30,
  },
};

export const ACHIEVEMENT_CATALOG: ReadonlyArray<AchievementSpec> = [
  {
    id: 'first_blood',
    title: 'Primeiro Guardião',
    description: 'Abata 25 inimigos nas rotas da cidadela.',
    category: 'combat',
    target: 25,
    rewardSouls: 6,
  },
  {
    id: 'slayer_250',
    title: 'Sentinela Incansável',
    description: 'Acumule 250 abates totais em sua campanha.',
    category: 'combat',
    target: 250,
    rewardSouls: 14,
  },
  {
    id: 'first_merge',
    title: 'Alquimia de Batalha',
    description: 'Realize 5 fusões de aliados no campo.',
    category: 'mastery',
    target: 5,
    rewardSouls: 8,
  },
  {
    id: 'stage_5',
    title: 'Muralha Consolidada',
    description: 'Desbloqueie a Fase 5 da campanha.',
    category: 'progression',
    target: 5,
    rewardSouls: 10,
  },
  {
    id: 'stage_15',
    title: 'Comandante das Rotas',
    description: 'Alcance a Fase 15 enfrentando cercos múltiplos.',
    category: 'progression',
    target: 15,
    rewardSouls: 18,
  },
  {
    id: 'hero_lv10',
    title: 'Campeão da Brasa',
    description: 'Evolua qualquer Herói Principal até o Nível 10.',
    category: 'mastery',
    target: 10,
    rewardSouls: 15,
  },
];

export type UnitKind =
  | 'scout'
  | 'frog'
  | 'swordsman_ally'
  | 'fire_mage'
  | 'cleric'
  | 'shadow_assassin'
  | 'sniper'
  | 'golem'
  | 'spore_witch'
  | 'paladin'
  | 'shield';

export type EnemyKind =
  | 'walker'
  | 'shielded'
  | 'brute'
  | 'stalker'
  | 'pyro'
  | 'titan'
  | 'reaper'
  | 'boss'
  | 'shield_bearer'
  | 'corruptor';

export type EnemyArchetype =
  | 'beast'
  | 'slime'
  | 'goblin'
  | 'undead'
  | 'arachnid'
  | 'demon'
  | 'construct'
  | 'spirit'
  | 'orc'
  | 'mythic'
  | 'boss';

export interface EnemyCatalogEntry {
  id: number;
  code: string;
  name: string;
  hp: number;
  unlockStage: number;
  story: string;
  mysteryPreview: string;
  specialty: string;
  counterAllyId: number;
  engineKind: EnemyKind;
  archetype: EnemyArchetype;
  visualVariant: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  baseSpeed: number;
  radius: number;
  damage: number;
  isBoss?: boolean;
  isElite?: boolean;
}

export interface AllyCatalogEntry {
  id: number;
  code: string;
  unitKind: UnitKind;
  name: string;
  title: string;
  colorName: string;
  colorHex: string;
  accentHex: string;
  bgHex: string;
  unlockStage: number;
  specialty: string;
  story: string;
  mysteryPreview: string;
  hotkey: string;
}

export type SpellKind = 'blade' | 'shockwave' | 'overcharge';

export type ParticleKind = 'circle' | 'smoke' | 'grass' | 'spark';

export type RewardTone = 'gold' | 'electric' | 'crimson';

export type HeroUpgradeId = 'power' | 'haste' | 'fortress' | 'area';

export interface HeroUpgradeOption {
  id: HeroUpgradeId;
  title: string;
  effectText: string;
  accent: RewardTone;
}

export const HERO_UPGRADE_CATALOG: Record<HeroUpgradeId, HeroUpgradeOption> = {
  power: {
    id: 'power',
    title: 'Poder Bruto',
    effectText: '+7% Dano do Herói e +1.5% Crítico',
    accent: 'crimson',
  },
  haste: {
    id: 'haste',
    title: 'Ritmo Veloz',
    effectText: '+6% Cadência e +3% Alcance',
    accent: 'electric',
  },
  fortress: {
    id: 'fortress',
    title: 'Muralha & Tropas',
    effectText: '+20 HP Máx., cura +25 HP e +11% Dano Tropas',
    accent: 'gold',
  },
  area: {
    id: 'area',
    title: 'Impacto Amplo',
    effectText: '+8% Área/Recuo e +5% Dano Especial',
    accent: 'gold',
  },
};

export const MAX_UNIT_LEVEL = 10;
export const MAX_HERO_LEVEL = 30;
export const TOTAL_STAGES = 150;

export const UNIT_XP_THRESHOLDS: ReadonlyArray<number> = [
  0, 45, 110, 195, 305, 440, 600, 790, 1010, 1260,
];

export const HERO_XP_THRESHOLDS: ReadonlyArray<number> = [
  0, 14, 32, 55, 84, 120, 165, 220, 285, 360,
  450, 555, 675, 810, 960, 1125, 1305, 1500, 1710, 1935,
  2175, 2430, 2700, 2985, 3285, 3600, 3930, 4275, 4635, 5010,
];

export interface HeroSaveData {
  level: number;
  xp: number;
  kills: number;
  upgradeChoices: HeroUpgradeId[];
}

export interface RouteWaypoint {
  x: number;
  y: number;
}

export interface RouteBranch {
  id: string;
  gateIndex: number;
  label: string;
  unlockRouteLevel: number;
  color: string;
  waypoints: ReadonlyArray<RouteWaypoint>;
}

export interface SlotCoord {
  id: string;
  x: number;
  y: number;
  zone: number;
  angle: number;
}

export interface StageRouteDefinition {
  stage: number;
  title: string;
  routeArchetype: string;
  waypoints: ReadonlyArray<RouteWaypoint>;
  routes: ReadonlyArray<RouteBranch>;
  initialRouteLevel: number;
  castleX: number;
  castleY: number;
  slots: ReadonlyArray<SlotCoord>;
  heroStartSlotId: string;
  trioStartSlotIds?: ReadonlyArray<string>;
}

export interface StageConfig {
  stage: number;
  title: string;
  routeArchetype: string;
  routeCount: number;
  initialRouteLevel: number;
  isConvergenceStage: boolean;
  totalWaves: number;
  baseEnemiesPerWave: number;
  hpMultiplier: number;
  speedMultiplier: number;
  spawnInterval: number;
  bossHp: number;
  isFiveLevelMilestone: boolean;
  unlockedEnemyLabel?: string;
  unlockedEnemyId?: number;
  unlockedAllyLabel?: string;
  unlockedAllyId?: number;
}

export interface ArenaConfig {
  stage: number;
  worldWidth: number;
  worldHeight: number;
  centerX: number;
  centerY: number;
  castleX: number;
  castleY: number;
  castleRadius: number;
  roadHalfWidth: number;
  waypoints: ReadonlyArray<RouteWaypoint>;
  routes: ReadonlyArray<RouteBranch>;
}

export interface ArenaSlot {
  id: string;
  x: number;
  y: number;
  ring: number;
  angle: number;
  radius: number;
  unitId: number | null;
  hasHero: boolean;
}

export interface HeroSpec {
  heroClass: HeroClass;
  name: string;
  title: string;
  shortRole: string;
  description: string;
  range: number;
  damage: number;
  cooldown: number;
  critChance: number;
  blastRadius: number;
  cleaveHalfAngle: number;
  color: string;
  accentColor: string;
  glowColor: string;
  statPower: number;
  statSpeed: number;
  statArea: number;
}

export interface HeroEntity {
  heroClass: HeroClass;
  slotId: string | null;
  x: number;
  y: number;
  level: number;
  xp: number;
  kills: number;
  upgradeChoices?: HeroUpgradeId[];
  range: number;
  damage: number;
  cooldown: number;
  cooldownTimer: number;
  critChance: number;
  blastRadius: number;
  facingAngle: number;
  attackAnim: number;
  recoil: number;
  levelUpFlash: number;
}

export interface UnitSpec {
  kind: UnitKind;
  name: string;
  shortRole: string;
  role: string;
  cost: number;
  maxHp: number;
  range: number;
  damage: number;
  cooldown: number;
  critChance: number;
  color: string;
  accentColor: string;
  hotkey: string;
}

export interface UnitEntity {
  id: number;
  kind: UnitKind;
  slotId: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  range: number;
  damage: number;
  cooldown: number;
  cooldownTimer: number;
  critChance: number;
  facingAngle: number;
  attackAnim: number;
  recoil: number;
  hitFlash: number;
  level: number;
  xp?: number;
  kills?: number;
  levelUpFlash?: number;
}

export interface EnemyEntity {
  id: number;
  kind: EnemyKind;
  isBoss?: boolean;
  isElite?: boolean;
  catalogId?: number;
  displayName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackCooldown: number;
  attackTimer: number;
  attackAnim: number;
  rewardEssence: number;
  rewardScore: number;
  xpReward: number;
  walkPhase: number;
  distanceTraveled: number;
  routeIndex: number;
  waypointIndex: number;
  laneOffset: number;
  pathProgress: number;
  hitFlash: number;
  knockbackVx: number;
  knockbackVy: number;
  stunTimer: number;
  slowTimer?: number;
  corrosionTimer?: number;
  koTimer: number;
  isDead: boolean;
  bracingTimer: number;
  lungeTimer: number;
  lungeCooldown: number;
}

export interface ProjectileEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  critChance: number;
  color: string;
  trailColor: string;
  targetEnemyId: number;
  life: number;
  isShockwave: boolean;
  isPiercing?: boolean;
  hitIds?: number[];
  appliesSlow?: boolean;
  appliesCorrosion?: boolean;
  isHeroAttack?: boolean;
  sourceUnitId?: number;
  isBomb?: boolean;
  blastRadius?: number;
  startX?: number;
  startY?: number;
  targetX?: number;
  targetY?: number;
  arcDuration?: number;
  arcElapsed?: number;
}

export interface ExplosionEffect {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface SlashEffect {
  x: number;
  y: number;
  angle: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface SpinningBladeHazard {
  x: number;
  y: number;
  radius: number;
  damagePerTick: number;
  life: number;
  maxLife: number;
  tickTimer: number;
  rotation: number;
}

export interface ShockwaveRingEffect {
  x: number;
  y: number;
  currentRadius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color?: string;
}

export interface HordeWarningIndicator {
  x: number;
  y: number;
  angle: number;
  routeIndex: number;
  timer: number;
  maxTimer: number;
  spawnCount: number;
  spawned: boolean;
  isBoss?: boolean;
}

export interface Particle {
  active: boolean;
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  life: number;
  maxLife: number;
  gravity: number;
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  scale: number;
  life: number;
  maxLife: number;
  isCrit?: boolean;
}

export interface RewardBanner {
  id: number;
  text: string;
  subtext?: string;
  tone: RewardTone;
  life: number;
  maxLife: number;
}

export interface DragState {
  source: 'unit' | 'card' | 'hero';
  unitId?: number;
  heroClass?: HeroClass;
  heroIndex?: number;
  fromSlotId?: string | null;
  kind: UnitKind;
  level: number;
  worldX: number;
  worldY: number;
  startedAtX: number;
  startedAtY: number;
  hasMoved: boolean;
}

export interface SpellState {
  cooldowns: Record<SpellKind, number>;
  maxCooldowns: Record<SpellKind, number>;
  targetingSpell: SpellKind | null;
  overchargeTimer: number;
}

export interface ActiveHeroSummary {
  heroClass: HeroClass;
  level: number;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  kills: number;
  x: number;
  y: number;
  isFreePlaced: boolean;
}

export interface PactOption {
  id: string;
  title: string;
  description: string;
  tone: 'crimson' | 'gold' | 'electric';
}

export interface TalentNode {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
}

export interface HudSnapshot {
  phase: GamePhase;
  stage: number;
  routeArchetype: string;
  stageTitle: string;
  totalWavesInStage: number;
  highestUnlockedStage: number;
  isConvergenceStage: boolean;
  nextConvergenceStage: number;
  routeLevel: number;
  maxRouteLevel: number;
  openGatesCount: number;
  baseHp: number;
  baseMaxHp: number;
  baseLevel: number;
  essence: number;
  essenceCollected: number;
  evolutionPoints: number;
  lastEarnedEvolutionPoints: number;
  score: number;
  bestScore: number;
  wave: number;
  kills: number;
  survivalSeconds: number;
  selectedHeroClass: HeroClass;
  heroRoster: Record<HeroClass, HeroSaveData>;
  activeHeroes: ActiveHeroSummary[];
  activeHeroIndex: number;
  heroLevel: number;
  heroXp: number;
  heroCurrentLevelXp: number;
  heroNextLevelXp: number;
  heroKills: number;
  heroRepositionMode: boolean;
  selectedUnit: UnitKind;
  unitCount: number;
  maxUnitLevelReached: number;
  mergesPerformed: number;
  comboCount: number;
  activeBanner: RewardBanner | null;
  hoveredSlotId: string | null;
  mutedMusic: boolean;
  mutedSfx: boolean;
  spellCooldowns: Record<SpellKind, number>;
  spellMaxCooldowns: Record<SpellKind, number>;
  targetingSpell: SpellKind | null;
  overchargeTimer: number;
  bossActive: boolean;
  pendingUpgradeChoices: HeroUpgradeOption[] | null;
  pendingUpgradeMilestoneLevel: number | null;
  pendingUpgradeHeroClass: HeroClass | null;
  heroUpgradesCount: number;
  paladinAuraActive: boolean;
  emberSouls: number;
  talents: Record<string, number>;
  pendingPactChoices: PactOption[] | null;
  activePacts: string[];
  ringRotation: number;
  ringHeat: number;
  selectedPet: PetKind;
  petDropLuckBonus: number;
  petChoiceUnlocked: boolean;
  petWasRandom: boolean;
  gems: number;
  chestKeys: number;
  vipNoAds: boolean;
  starterPackClaimed: boolean;
  seasonPassPremium: boolean;
  seasonPassXp: number;
  claimedFreePassTiers: number[];
  claimedPremiumPassTiers: number[];
  ownedRelics: Record<string, number>;
  equippedRelics: string[];
  consumables: Record<string, number>;
  frenzyTimer: number;
  phoenixShieldReady: boolean;
  dailyRewardClaimedToday: boolean;
  purchaseHistoryCount: number;
  dailyMissions: DailyMissionState[];
  dailyMissionsDate: string;
  dailyMissionTier: number;
  dailyAllCompleteBonusClaimed: boolean;
  instagramBonusClaimedToday: boolean;
  playerXp: number;
  playerLevel: number;
  playerCurrentLevelXp: number;
  playerNextLevelXp: number;
  claimedMilestoneLevels: number[];
  readyMilestonesCount: number;
  enemyKillsByCatalogId: Record<number, number>;
  discoveredEnemyIds: number[];
  unlockedAchievements: string[];
  achievementProgress: Record<string, number>;
  unlockedCosmetics: string[];
  equippedRingSkin: RingSkinId;
  equippedFxStyle: FxStyleId;
  totalLifetimeKills: number;
}

export const HERO_SPECS: Record<HeroClass, HeroSpec> = {
  archer: {
    heroClass: 'archer',
    name: 'Arqueiro',
    title: 'Mestre da Precisão',
    shortRole: 'Alta velocidade à distância',
    description: 'Sobe de nível rápido como suporte à distância, mas depende de lutadores fundidos contra hordas densas.',
    range: 310,
    damage: 9,
    cooldown: 0.58,
    critChance: 0.1,
    blastRadius: 0,
    cleaveHalfAngle: 0,
    color: '#00D4FF',
    accentColor: '#FACC15',
    glowColor: 'rgba(0, 212, 255, 0.45)',
    statPower: 68,
    statSpeed: 94,
    statArea: 40,
  },
  swordsman: {
    heroClass: 'swordsman',
    name: 'Espadachim',
    title: 'Lâmina Carmesim',
    shortRole: 'Dano corpo a corpo firme',
    description: 'Contém inimigos próximos em arco, mas exige aliados evoluídos para vencer armaduras e chefes.',
    range: 175,
    damage: 15,
    cooldown: 0.88,
    critChance: 0.14,
    blastRadius: 0,
    cleaveHalfAngle: Math.PI * 0.65,
    color: '#FF2E4C',
    accentColor: '#FACC15',
    glowColor: 'rgba(255, 46, 76, 0.45)',
    statPower: 84,
    statSpeed: 70,
    statArea: 72,
  },
  bomber: {
    heroClass: 'bomber',
    name: 'Bombardeiro',
    title: 'Artífice Explosivo',
    shortRole: 'Explosões em área de grupo',
    description: 'Dispersa grupos com explosões moderadas; precisa de tropas fundidas para abater alvos resistentes.',
    range: 265,
    damage: 12,
    cooldown: 1.26,
    critChance: 0.1,
    blastRadius: 82,
    cleaveHalfAngle: 0,
    color: '#F59E0B',
    accentColor: '#EF4444',
    glowColor: 'rgba(250, 204, 21, 0.45)',
    statPower: 78,
    statSpeed: 54,
    statArea: 92,
  },
};

export const DEFAULT_ROUTE_WAYPOINTS: ReadonlyArray<RouteWaypoint> = [
  { x: 96, y: 410 },
  { x: 460, y: 410 },
  { x: 640, y: 375 },
  { x: 1045, y: 410 },
];

export const DEFAULT_ARENA: ArenaConfig = {
  stage: 1,
  worldWidth: 1200,
  worldHeight: 820,
  centerX: 580,
  centerY: 410,
  castleX: 1045,
  castleY: 410,
  castleRadius: 42,
  roadHalfWidth: 30,
  waypoints: DEFAULT_ROUTE_WAYPOINTS,
  routes: [
    {
      id: 'r1',
      gateIndex: 1,
      label: 'Portão Oeste',
      unlockRouteLevel: 1,
      color: '#FF2E4C',
      waypoints: DEFAULT_ROUTE_WAYPOINTS,
    },
  ],
};

export const SPELL_SPECS: Record<
  SpellKind,
  { name: string; hotkey: string; cooldown: number; description: string }
> = {
  blade: {
    name: 'Lâmina Giratória',
    hotkey: 'Q',
    cooldown: 11,
    description: 'Corte em área no alvo',
  },
  shockwave: {
    name: 'Onda de Choque',
    hotkey: 'W',
    cooldown: 14,
    description: 'Recua toda a horda',
  },
  overcharge: {
    name: 'SuperCarga',
    hotkey: 'E',
    cooldown: 18,
    description: '+50% Essência e XP',
  },
};

export const UNIT_SPECS: Record<UnitKind, UnitSpec> = {
  scout: {
    kind: 'scout',
    name: 'Batedor',
    shortRole: 'Tiro rápido',
    role: 'Ataques rápidos de longo alcance contra alvos ágeis',
    cost: 30,
    maxHp: 80,
    range: 265,
    damage: 11,
    cooldown: 0.6,
    critChance: 0.16,
    color: '#00D4FF',
    accentColor: '#FACC15',
    hotkey: '1',
  },
  frog: {
    kind: 'frog',
    name: 'Sapo Lâmina',
    shortRole: 'Ácido em área',
    role: 'Dano de veneno em área e corrosão de armaduras pesadas',
    cost: 48,
    maxHp: 135,
    range: 185,
    damage: 34,
    cooldown: 0.82,
    critChance: 0.24,
    color: '#10B981',
    accentColor: '#A3E635',
    hotkey: '2',
  },
  swordsman_ally: {
    kind: 'swordsman_ally',
    name: 'Espadachim',
    shortRole: 'Corte brutal',
    role: 'Dano corpo a corpo massivo e resistência contra chefes',
    cost: 55,
    maxHp: 210,
    range: 170,
    damage: 48,
    cooldown: 0.88,
    critChance: 0.3,
    color: '#DC2626',
    accentColor: '#FCA5A5',
    hotkey: '3',
  },
  fire_mage: {
    kind: 'fire_mage',
    name: 'Mago de Fogo',
    shortRole: 'Chama reta',
    role: 'Queima hordas inteiras em linha reta na rota',
    cost: 65,
    maxHp: 110,
    range: 280,
    damage: 38,
    cooldown: 1.05,
    critChance: 0.2,
    color: '#F97316',
    accentColor: '#FACC15',
    hotkey: '4',
  },
  cleric: {
    kind: 'cleric',
    name: 'Clérigo Protetor',
    shortRole: 'Cura castelo',
    role: 'Restaura o HP do castelo e protege aliados próximos',
    cost: 70,
    maxHp: 160,
    range: 240,
    damage: 24,
    cooldown: 1.15,
    critChance: 0.16,
    color: '#FEF3C7',
    accentColor: '#FACC15',
    hotkey: '5',
  },
  shadow_assassin: {
    kind: 'shadow_assassin',
    name: 'Assassino de Sombras',
    shortRole: 'Crítico letal',
    role: 'Acertos críticos letais em inimigos isolados',
    cost: 80,
    maxHp: 125,
    range: 230,
    damage: 54,
    cooldown: 0.72,
    critChance: 0.58,
    color: '#581C87',
    accentColor: '#C084FC',
    hotkey: '6',
  },
  sniper: {
    kind: 'sniper',
    name: 'Atirador de Elite',
    shortRole: 'Alcance máx.',
    role: 'Alcance máximo absoluto com dano perfurante',
    cost: 90,
    maxHp: 105,
    range: 460,
    damage: 78,
    cooldown: 1.28,
    critChance: 0.35,
    color: '#06B6D4',
    accentColor: '#E0F2FE',
    hotkey: '7',
  },
  golem: {
    kind: 'golem',
    name: 'Golem Defensor',
    shortRole: 'Tanque peso',
    role: 'Tanque intransponível que bloqueia o avanço inimigo na rota',
    cost: 95,
    maxHp: 340,
    range: 165,
    damage: 42,
    cooldown: 1.12,
    critChance: 0.14,
    color: '#64748B',
    accentColor: '#CBD5E1',
    hotkey: '8',
  },
  spore_witch: {
    kind: 'spore_witch',
    name: 'Bruxa dos Esporos',
    shortRole: 'Lentidão global',
    role: 'Lenta o movimento de todos os inimigos na tela',
    cost: 105,
    maxHp: 130,
    range: 310,
    damage: 32,
    cooldown: 1.15,
    critChance: 0.2,
    color: '#65A30D',
    accentColor: '#BEF264',
    hotkey: '9',
  },
  paladin: {
    kind: 'paladin',
    name: 'Paladino Supremo',
    shortRole: 'Aura +20% dano',
    role: 'O herói definitivo com bônus de dano universal para toda a tropa',
    cost: 130,
    maxHp: 280,
    range: 245,
    damage: 85,
    cooldown: 0.85,
    critChance: 0.32,
    color: '#EAB308',
    accentColor: '#FEF08A',
    hotkey: '0',
  },
  shield: {
    kind: 'shield',
    name: 'Escudeiro',
    shortRole: 'Onda azul',
    role: 'Onda de escudo & impacto',
    cost: 45,
    maxHp: 175,
    range: 195,
    damage: 25,
    cooldown: 0.96,
    critChance: 0.16,
    color: '#2563EB',
    accentColor: '#FACC15',
    hotkey: '2',
  },
};
