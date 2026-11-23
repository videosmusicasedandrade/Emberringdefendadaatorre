import type { FxStyleId, RingSkinId } from './types';

export const MAX_PLAYER_LEVEL = 50;

/**
 * Cumulative Player Account XP required for Levels 1..50.
 * Separate from individual Hero levels and Daily Missions.
 * Smooth early milestones (Lv.2 at 60 XP, Lv.5 at 340 XP) scaling up to veteran Mastery at Lv.50.
 */
export const PLAYER_LEVEL_XP_THRESHOLDS: ReadonlyArray<number> = (() => {
  const arr: number[] = [0];
  let total = 0;
  for (let lvl = 2; lvl <= MAX_PLAYER_LEVEL; lvl++) {
    const step = Math.round(45 + (lvl - 1) * 18 + Math.pow(lvl - 1, 1.55) * 4.2);
    total += step;
    arr.push(total);
  }
  return arr;
})();

export function getPlayerLevelFromXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;
  for (let i = 1; i < PLAYER_LEVEL_XP_THRESHOLDS.length; i++) {
    if (safeXp >= PLAYER_LEVEL_XP_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(MAX_PLAYER_LEVEL, level);
}

export function getPlayerXpBounds(level: number): { currentFloor: number; nextThreshold: number } {
  const clamped = Math.max(1, Math.min(MAX_PLAYER_LEVEL, Math.floor(level)));
  const currentFloor = PLAYER_LEVEL_XP_THRESHOLDS[clamped - 1] ?? 0;
  const nextThreshold =
    clamped >= MAX_PLAYER_LEVEL
      ? currentFloor
      : (PLAYER_LEVEL_XP_THRESHOLDS[clamped] ?? currentFloor + 100);
  return { currentFloor, nextThreshold };
}

export interface MilestonePassiveBonuses {
  castleMaxHpBonus: number;
  castleRegenPerSec: number;
  startingEssenceBonus: number;
  globalDamageBonusPct: number;
  attackSpeedBonusPct: number;
  critChanceBonus: number;
  spellCooldownReductionPct: number;
  allyXpBonusPct: number;
}

export type MilestoneRewardType = 'aesthetic' | 'passive' | 'mythic';
export type MilestoneRarity = 'rare' | 'epic' | 'legendary' | 'mythic';

export interface MilestoneRewardSpec {
  level: number;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  rewardType: MilestoneRewardType;
  rarity: MilestoneRarity;
  accentColor: string;
  unlockRingSkin?: RingSkinId;
  unlockFxStyle?: FxStyleId;
  bonusGems?: number;
  bonusSouls?: number;
  passiveBuff?: Partial<MilestonePassiveBonuses>;
}

export const MILESTONE_RARITY_LABELS: Record<
  MilestoneRarity,
  { label: string; color: string }
> = {
  rare: { label: 'Raro', color: '#38BDF8' },
  epic: { label: 'Épico', color: '#C084FC' },
  legendary: { label: 'Lendário', color: '#FACC15' },
  mythic: { label: 'Mítico', color: '#FF2E4C' },
};

export const MILESTONE_CATALOG: ReadonlyArray<MilestoneRewardSpec> = [
  {
    level: 2,
    id: 'milestone_lv2',
    title: 'Vigor do Guardião',
    subtitle: 'Buff Passivo Permanente',
    description: '+15 HP Máximo para o Castelo em todas as fases e +15 Gemas Arcanas.',
    rewardType: 'passive',
    rarity: 'rare',
    accentColor: '#10B981',
    bonusGems: 15,
    passiveBuff: {
      castleMaxHpBonus: 15,
    },
  },
  {
    level: 5,
    id: 'milestone_lv5',
    title: 'Anel Brasa Celestial',
    subtitle: 'Estética Rara · Skin Exclusiva do Anel',
    description:
      'Desbloqueia o visual raro Anel Brasa Celestial com aura dourado-safira e runas estelares no campo de batalha.',
    rewardType: 'aesthetic',
    rarity: 'rare',
    accentColor: '#38BDF8',
    unlockRingSkin: 'celestial',
    bonusGems: 20,
  },
  {
    level: 8,
    id: 'milestone_lv8',
    title: 'Foco Tático',
    subtitle: 'Buff Passivo Permanente',
    description: '+10 Essência inicial no começo de cada fase e +8% XP para Aliados em combate.',
    rewardType: 'passive',
    rarity: 'rare',
    accentColor: '#00D4FF',
    bonusSouls: 10,
    passiveBuff: {
      startingEssenceBonus: 10,
      allyXpBonusPct: 0.08,
    },
  },
  {
    level: 12,
    id: 'milestone_lv12',
    title: 'Rastro Astral',
    subtitle: 'Estética Épica · Efeito de Ataque Exclusivo',
    description:
      'Desbloqueia o efeito visual exclusivo Rastro Astral que tinge disparos e cortes com energia safira prismática.',
    rewardType: 'aesthetic',
    rarity: 'epic',
    accentColor: '#818CF8',
    unlockFxStyle: 'astral',
    bonusGems: 30,
  },
  {
    level: 16,
    id: 'milestone_lv16',
    title: 'Lâmina Veterana',
    subtitle: 'Buff Passivo Permanente',
    description: '+6% Dano Global para Heróis e Aliados e +3% Chance Crítica permanente.',
    rewardType: 'passive',
    rarity: 'epic',
    accentColor: '#F59E0B',
    bonusSouls: 15,
    passiveBuff: {
      globalDamageBonusPct: 0.06,
      critChanceBonus: 0.03,
    },
  },
  {
    level: 20,
    id: 'milestone_lv20',
    title: 'Anel Dragão Solar',
    subtitle: 'Estética Lendária · Skin Exclusiva do Anel',
    description:
      'Desbloqueia a skin lendária Anel Dragão Solar com fogo vulcânico âmbar e runas dracônicas incandescentes.',
    rewardType: 'aesthetic',
    rarity: 'legendary',
    accentColor: '#F97316',
    unlockRingSkin: 'dragonfire',
    bonusGems: 40,
  },
  {
    level: 25,
    id: 'milestone_lv25',
    title: 'Fluxo Etéreo',
    subtitle: 'Buff Passivo Permanente',
    description: '-8% tempo de recarga das Magias e +6% Velocidade de Ataque para toda a defesa.',
    rewardType: 'passive',
    rarity: 'legendary',
    accentColor: '#C084FC',
    bonusGems: 35,
    passiveBuff: {
      spellCooldownReductionPct: 0.08,
      attackSpeedBonusPct: 0.06,
    },
  },
  {
    level: 30,
    id: 'milestone_lv30',
    title: 'Chama Estelar',
    subtitle: 'Estética Lendária · Efeito de Ataque Exclusivo',
    description:
      'Desbloqueia o efeito lendário Chama Estelar com projéteis dourado-violeta e cortes solares radiantes.',
    rewardType: 'aesthetic',
    rarity: 'legendary',
    accentColor: '#FACC15',
    unlockFxStyle: 'starfire',
    bonusGems: 50,
  },
  {
    level: 40,
    id: 'milestone_lv40',
    title: 'Bastião Imortal',
    subtitle: 'Buff Passivo Lendário',
    description: '+30 HP Máximo do Castelo, +1 HP/s regeneração contínua e +8% Dano Global.',
    rewardType: 'passive',
    rarity: 'legendary',
    accentColor: '#10B981',
    bonusGems: 60,
    bonusSouls: 25,
    passiveBuff: {
      castleMaxHpBonus: 30,
      castleRegenPerSec: 1,
      globalDamageBonusPct: 0.08,
    },
  },
  {
    level: 50,
    id: 'milestone_lv50',
    title: 'Soberano do Vazio',
    subtitle: 'Recompensa Mítica · Skin + Aura Suprema',
    description:
      'Skin Mítica exclusiva Anel Soberano do Vazio + +10% Dano Global, +10% Velocidade de Ataque e +100 Gemas.',
    rewardType: 'mythic',
    rarity: 'mythic',
    accentColor: '#FF2E4C',
    unlockRingSkin: 'void_sovereign',
    bonusGems: 100,
    bonusSouls: 40,
    passiveBuff: {
      globalDamageBonusPct: 0.1,
      attackSpeedBonusPct: 0.1,
    },
  },
];

export function computeMilestonePassiveBonuses(
  claimedLevels: ReadonlyArray<number>
): MilestonePassiveBonuses {
  const claimedSet = new Set(claimedLevels);
  const out: MilestonePassiveBonuses = {
    castleMaxHpBonus: 0,
    castleRegenPerSec: 0,
    startingEssenceBonus: 0,
    globalDamageBonusPct: 0,
    attackSpeedBonusPct: 0,
    critChanceBonus: 0,
    spellCooldownReductionPct: 0,
    allyXpBonusPct: 0,
  };

  for (const milestone of MILESTONE_CATALOG) {
    if (!claimedSet.has(milestone.level) || !milestone.passiveBuff) continue;
    const b = milestone.passiveBuff;
    out.castleMaxHpBonus += b.castleMaxHpBonus ?? 0;
    out.castleRegenPerSec += b.castleRegenPerSec ?? 0;
    out.startingEssenceBonus += b.startingEssenceBonus ?? 0;
    out.globalDamageBonusPct += b.globalDamageBonusPct ?? 0;
    out.attackSpeedBonusPct += b.attackSpeedBonusPct ?? 0;
    out.critChanceBonus += b.critChanceBonus ?? 0;
    out.spellCooldownReductionPct += b.spellCooldownReductionPct ?? 0;
    out.allyXpBonusPct += b.allyXpBonusPct ?? 0;
  }

  return out;
}

export function getUnclaimedReadyMilestonesCount(
  playerLevel: number,
  claimedLevels: ReadonlyArray<number>
): number {
  const claimedSet = new Set(claimedLevels);
  return MILESTONE_CATALOG.filter(
    (m) => playerLevel >= m.level && !claimedSet.has(m.level)
  ).length;
}
