import {
  FX_STYLES,
  FxStyleId,
  HERO_XP_THRESHOLDS,
  HeroClass,
  HeroSaveData,
  HeroUpgradeId,
  MAX_HERO_LEVEL,
  PET_ORDER,
  PetKind,
  RING_SKINS,
  RingSkinId,
  TOTAL_STAGES,
} from './types';

import {
  CONSUMABLE_ORDER,
  MAX_EQUIPPED_RELICS,
  PurchaseReceipt,
  RELIC_ORDER,
} from './storeCatalog';
import { DailyMissionState } from './dailyMissions';

const STORAGE_KEY = 'ember_ring_defense_progress_v3';
const LEGACY_STORAGE_KEY = 'ember_ring_defense_progress_v2';

export interface SavedProgress {
  highestUnlockedStage: number;
  bestScore: number;
  selectedHeroClass: HeroClass;
  evolutionPoints: number;
  emberSouls: number;
  talents: Record<string, number>;
  heroes: Record<HeroClass, HeroSaveData>;
  convergenceStages: number[];
  enemyKillsByCatalogId: Record<number, number>;
  discoveredEnemyIds: number[];
  unlockedAchievements: string[];
  achievementProgress: Record<string, number>;
  unlockedCosmetics: string[];
  equippedRingSkin: RingSkinId;
  equippedFxStyle: FxStyleId;
  totalLifetimeKills: number;
  selectedPet: PetKind;
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
  dailyRewardLastClaimDate: string;
  purchaseHistory: PurchaseReceipt[];
  dailyMissionsDate: string;
  dailyMissions: DailyMissionState[];
  dailyAllCompleteBonusDate: string;
  instagramBonusClaimedDate: string;
  playerXp: number;
  claimedMilestoneLevels: number[];
}

const VALID_HEROES: HeroClass[] = ['archer', 'swordsman', 'bomber'];
const VALID_PETS: ReadonlyArray<PetKind> = PET_ORDER;
const VALID_UPGRADES: HeroUpgradeId[] = ['power', 'haste', 'fortress', 'area'];
const VALID_RING_SKINS = Object.keys(RING_SKINS) as RingSkinId[];
const VALID_FX_STYLES = Object.keys(FX_STYLES) as FxStyleId[];

export function createDefaultHeroSave(): HeroSaveData {
  return {
    level: 1,
    xp: 0,
    kills: 0,
    upgradeChoices: [],
  };
}

export function createDefaultHeroRoster(): Record<HeroClass, HeroSaveData> {
  return {
    archer: createDefaultHeroSave(),
    swordsman: createDefaultHeroSave(),
    bomber: createDefaultHeroSave(),
  };
}

/**
 * Generates an irregular, non-standardized schedule of 3-Hero Convergence stages
 * spaced strictly between 4 and 8 stages apart across 1..TOTAL_STAGES.
 */
export function generateConvergenceStages(seed = Date.now()): number[] {
  let state = Math.max(1, Math.floor(Math.abs(seed)) % 2147483647);
  const nextRand = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };

  const stages: number[] = [];
  let cursor = 4 + Math.floor(nextRand() * 5); // 4..8 for the first Convergence stage
  while (cursor <= TOTAL_STAGES) {
    stages.push(cursor);
    const gap = 4 + Math.floor(nextRand() * 5); // 4..8 between every Convergence stage
    cursor += gap;
  }
  return stages;
}

function sanitizeHeroSave(raw: Partial<HeroSaveData> | undefined): HeroSaveData {
  const xp = Math.max(0, Math.floor(Number(raw?.xp) || 0));
  let computedLevel = 1;
  for (let i = 1; i < HERO_XP_THRESHOLDS.length; i++) {
    if (xp >= HERO_XP_THRESHOLDS[i]) computedLevel = i + 1;
  }
  const rawLevel = Math.max(1, Math.min(MAX_HERO_LEVEL, Math.floor(Number(raw?.level) || 1)));
  const level = Math.max(rawLevel, Math.min(MAX_HERO_LEVEL, computedLevel));
  const safeXp = Math.max(xp, HERO_XP_THRESHOLDS[level - 1] ?? 0);
  const kills = Math.max(0, Math.floor(Number(raw?.kills) || 0));
  const upgradeChoices = Array.isArray(raw?.upgradeChoices)
    ? raw!.upgradeChoices.filter((u): u is HeroUpgradeId => VALID_UPGRADES.includes(u))
    : [];
  return {
    level,
    xp: safeXp,
    kills,
    upgradeChoices,
  };
}

function sanitizeConvergenceStages(raw: unknown): number[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return generateConvergenceStages(7319);
  }
  const valid = raw
    .map((n) => Math.floor(Number(n)))
    .filter((n) => Number.isFinite(n) && n >= 4 && n <= TOTAL_STAGES)
    .sort((a, b) => a - b);
  if (valid.length === 0) return generateConvergenceStages(7319);
  for (let i = 1; i < valid.length; i++) {
    const gap = valid[i] - valid[i - 1];
    if (gap < 4 || gap > 8) {
      return generateConvergenceStages(7319);
    }
  }
  return valid;
}

function sanitizeNumberRecord(raw: unknown): Record<number, number> {
  const out: Record<number, number> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const numKey = Math.floor(Number(k));
    const numVal = Math.max(0, Math.floor(Number(v) || 0));
    if (Number.isFinite(numKey) && numKey > 0 && numVal > 0) {
      out[numKey] = numVal;
    }
  }
  return out;
}

function sanitizeStringNumberRecord(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const numVal = Math.max(0, Math.floor(Number(v) || 0));
    if (k && Number.isFinite(numVal)) {
      out[k] = numVal;
    }
  }
  return out;
}

export function createDefaultProgress(seed?: number): SavedProgress {
  return {
    highestUnlockedStage: 1,
    bestScore: 0,
    selectedHeroClass: 'archer',
    evolutionPoints: 2,
    emberSouls: 15,
    talents: {
      critMastery: 0,
      manaRegen: 0,
      ringReach: 0,
      towerDiscount: 0,
    },
    heroes: createDefaultHeroRoster(),
    convergenceStages: generateConvergenceStages(seed),
    enemyKillsByCatalogId: {},
    discoveredEnemyIds: [1],
    unlockedAchievements: [],
    achievementProgress: {},
    unlockedCosmetics: ['ring:classic', 'fx:standard'],
    equippedRingSkin: 'classic',
    equippedFxStyle: 'standard',
    totalLifetimeKills: 0,
    selectedPet: 'turtle',
    gems: 60,
    chestKeys: 1,
    vipNoAds: false,
    starterPackClaimed: false,
    seasonPassPremium: false,
    seasonPassXp: 0,
    claimedFreePassTiers: [],
    claimedPremiumPassTiers: [],
    ownedRelics: {},
    equippedRelics: [],
    consumables: {
      castle_potion: 1,
      meteor_scroll: 1,
      frenzy_flask: 1,
    },
    dailyRewardLastClaimDate: '',
    purchaseHistory: [],
    dailyMissionsDate: '',
    dailyMissions: [],
    dailyAllCompleteBonusDate: '',
    instagramBonusClaimedDate: '',
    playerXp: 0,
    claimedMilestoneLevels: [],
  };
}

export function loadProgress(): SavedProgress {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return createDefaultProgress(7319);
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as Partial<SavedProgress>;
        const migrated: SavedProgress = {
          ...createDefaultProgress(),
          highestUnlockedStage: Math.max(
            1,
            Math.min(TOTAL_STAGES, Math.floor(Number(legacy.highestUnlockedStage) || 1))
          ),
          bestScore: Math.max(0, Math.floor(Number(legacy.bestScore) || 0)),
          selectedHeroClass: VALID_HEROES.includes(legacy.selectedHeroClass as HeroClass)
            ? (legacy.selectedHeroClass as HeroClass)
            : 'archer',
        };
        saveProgress(migrated);
        return migrated;
      }
      const fresh = createDefaultProgress();
      saveProgress(fresh);
      return fresh;
    }

    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    const stage = Math.max(
      1,
      Math.min(TOTAL_STAGES, Math.floor(Number(parsed.highestUnlockedStage) || 1))
    );
    const bestScore = Math.max(0, Math.floor(Number(parsed.bestScore) || 0));
    const selectedHeroClass = VALID_HEROES.includes(parsed.selectedHeroClass as HeroClass)
      ? (parsed.selectedHeroClass as HeroClass)
      : 'archer';
    const evolutionPoints = Math.max(0, Math.floor(Number(parsed.evolutionPoints) ?? 0));
    const emberSouls = Math.max(0, Math.floor(Number(parsed.emberSouls) ?? 15));
    const talents = {
      critMastery: Math.max(0, Math.min(5, Math.floor(Number(parsed.talents?.critMastery) || 0))),
      manaRegen: Math.max(0, Math.min(5, Math.floor(Number(parsed.talents?.manaRegen) || 0))),
      ringReach: Math.max(0, Math.min(5, Math.floor(Number(parsed.talents?.ringReach) || 0))),
      towerDiscount: Math.max(0, Math.min(5, Math.floor(Number(parsed.talents?.towerDiscount) || 0))),
    };
    const heroes: Record<HeroClass, HeroSaveData> = {
      archer: sanitizeHeroSave(parsed.heroes?.archer),
      swordsman: sanitizeHeroSave(parsed.heroes?.swordsman),
      bomber: sanitizeHeroSave(parsed.heroes?.bomber),
    };
    const convergenceStages = sanitizeConvergenceStages(parsed.convergenceStages);

    const enemyKillsByCatalogId = sanitizeNumberRecord(parsed.enemyKillsByCatalogId);
    const discoveredEnemyIds = Array.isArray(parsed.discoveredEnemyIds)
      ? Array.from(
          new Set(
            [1, ...parsed.discoveredEnemyIds.map((n) => Math.floor(Number(n)))].filter(
              (n) => Number.isFinite(n) && n >= 1 && n <= 50
            )
          )
        )
      : [1];
    const unlockedAchievements = Array.isArray(parsed.unlockedAchievements)
      ? Array.from(new Set(parsed.unlockedAchievements.filter((s): s is string => typeof s === 'string')))
      : [];
    const achievementProgress = sanitizeStringNumberRecord(parsed.achievementProgress);
    const unlockedCosmetics = Array.isArray(parsed.unlockedCosmetics)
      ? Array.from(
          new Set([
            'ring:classic',
            'fx:standard',
            ...parsed.unlockedCosmetics.filter((s): s is string => typeof s === 'string'),
          ])
        )
      : ['ring:classic', 'fx:standard'];
    const equippedRingSkin = VALID_RING_SKINS.includes(parsed.equippedRingSkin as RingSkinId)
      ? (parsed.equippedRingSkin as RingSkinId)
      : 'classic';
    const equippedFxStyle = VALID_FX_STYLES.includes(parsed.equippedFxStyle as FxStyleId)
      ? (parsed.equippedFxStyle as FxStyleId)
      : 'standard';
    const totalLifetimeKills = Math.max(0, Math.floor(Number(parsed.totalLifetimeKills) || 0));
    const selectedPet: PetKind = VALID_PETS.includes(parsed.selectedPet as PetKind)
      ? (parsed.selectedPet as PetKind)
      : 'turtle';
    const gems =
      parsed.gems === undefined ? 60 : Math.max(0, Math.floor(Number(parsed.gems) || 0));
    const chestKeys =
      parsed.chestKeys === undefined ? 1 : Math.max(0, Math.floor(Number(parsed.chestKeys) || 0));
    const vipNoAds = Boolean(parsed.vipNoAds);
    const starterPackClaimed = Boolean(parsed.starterPackClaimed);
    const seasonPassPremium = Boolean(parsed.seasonPassPremium);
    const seasonPassXp = Math.max(0, Math.floor(Number(parsed.seasonPassXp) || 0));
    const claimedFreePassTiers = Array.isArray(parsed.claimedFreePassTiers)
      ? Array.from(
          new Set(
            parsed.claimedFreePassTiers
              .map((n) => Math.floor(Number(n)))
              .filter((n) => Number.isFinite(n) && n >= 1 && n <= 10)
          )
        )
      : [];
    const claimedPremiumPassTiers = Array.isArray(parsed.claimedPremiumPassTiers)
      ? Array.from(
          new Set(
            parsed.claimedPremiumPassTiers
              .map((n) => Math.floor(Number(n)))
              .filter((n) => Number.isFinite(n) && n >= 1 && n <= 10)
          )
        )
      : [];
    const rawRelics = sanitizeStringNumberRecord(parsed.ownedRelics);
    const ownedRelics: Record<string, number> = {};
    for (const rId of RELIC_ORDER) {
      if (rawRelics[rId] && rawRelics[rId] > 0) {
        ownedRelics[rId] = Math.min(5, rawRelics[rId]);
      }
    }
    const equippedRelics = Array.isArray(parsed.equippedRelics)
      ? Array.from(
          new Set(
            parsed.equippedRelics.filter(
              (id): id is string => typeof id === 'string' && (ownedRelics[id] ?? 0) > 0
            )
          )
        ).slice(0, MAX_EQUIPPED_RELICS)
      : [];
    const rawConsumables = parsed.consumables
      ? sanitizeStringNumberRecord(parsed.consumables)
      : { castle_potion: 1, meteor_scroll: 1, frenzy_flask: 1 };
    const consumables: Record<string, number> = {};
    for (const cId of CONSUMABLE_ORDER) {
      consumables[cId] = Math.max(0, Math.floor(rawConsumables[cId] ?? 0));
    }
    const dailyRewardLastClaimDate =
      typeof parsed.dailyRewardLastClaimDate === 'string' ? parsed.dailyRewardLastClaimDate : '';
    const purchaseHistory: PurchaseReceipt[] = Array.isArray(parsed.purchaseHistory)
      ? parsed.purchaseHistory
          .filter(
            (r): r is PurchaseReceipt =>
              Boolean(r) && typeof r.orderId === 'string' && typeof r.sku === 'string'
          )
          .slice(-50)
      : [];
    const dailyMissionsDate =
      typeof parsed.dailyMissionsDate === 'string' ? parsed.dailyMissionsDate : '';
    const dailyMissions: DailyMissionState[] = Array.isArray(parsed.dailyMissions)
      ? parsed.dailyMissions
          .filter(
            (m): m is DailyMissionState =>
              Boolean(m) &&
              typeof m.id === 'string' &&
              typeof m.kind === 'string' &&
              typeof m.target === 'number'
          )
          .slice(0, 5)
      : [];
    const dailyAllCompleteBonusDate =
      typeof parsed.dailyAllCompleteBonusDate === 'string'
        ? parsed.dailyAllCompleteBonusDate
        : '';
    const instagramBonusClaimedDate =
      typeof parsed.instagramBonusClaimedDate === 'string'
        ? parsed.instagramBonusClaimedDate
        : '';
    const playerXp = Math.max(0, Math.floor(Number(parsed.playerXp) || 0));
    const claimedMilestoneLevels = Array.isArray(parsed.claimedMilestoneLevels)
      ? Array.from(
          new Set(
            parsed.claimedMilestoneLevels
              .map((n) => Math.floor(Number(n)))
              .filter((n) => Number.isFinite(n) && n >= 1 && n <= 50)
          )
        ).sort((a, b) => a - b)
      : [];

    return {
      highestUnlockedStage: stage,
      bestScore,
      selectedHeroClass,
      evolutionPoints,
      emberSouls,
      talents,
      heroes,
      convergenceStages,
      enemyKillsByCatalogId,
      discoveredEnemyIds,
      unlockedAchievements,
      achievementProgress,
      unlockedCosmetics,
      equippedRingSkin,
      equippedFxStyle,
      totalLifetimeKills,
      selectedPet,
      gems,
      chestKeys,
      vipNoAds,
      starterPackClaimed,
      seasonPassPremium,
      seasonPassXp,
      claimedFreePassTiers,
      claimedPremiumPassTiers,
      ownedRelics,
      equippedRelics,
      consumables,
      dailyRewardLastClaimDate,
      purchaseHistory,
      dailyMissionsDate,
      dailyMissions,
      dailyAllCompleteBonusDate,
      instagramBonusClaimedDate,
      playerXp,
      claimedMilestoneLevels,
    };
  } catch {
    return createDefaultProgress(7319);
  }
}

export function saveProgress(progress: SavedProgress): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        highestUnlockedStage: Math.max(
          1,
          Math.min(TOTAL_STAGES, Math.floor(progress.highestUnlockedStage))
        ),
        bestScore: Math.max(0, Math.floor(progress.bestScore)),
        selectedHeroClass: VALID_HEROES.includes(progress.selectedHeroClass)
          ? progress.selectedHeroClass
          : 'archer',
        evolutionPoints: Math.max(0, Math.floor(progress.evolutionPoints)),
        emberSouls: Math.max(0, Math.floor(progress.emberSouls)),
        talents: {
          critMastery: Math.max(0, Math.min(5, Math.floor(progress.talents?.critMastery || 0))),
          manaRegen: Math.max(0, Math.min(5, Math.floor(progress.talents?.manaRegen || 0))),
          ringReach: Math.max(0, Math.min(5, Math.floor(progress.talents?.ringReach || 0))),
          towerDiscount: Math.max(0, Math.min(5, Math.floor(progress.talents?.towerDiscount || 0))),
        },
        heroes: {
          archer: sanitizeHeroSave(progress.heroes.archer),
          swordsman: sanitizeHeroSave(progress.heroes.swordsman),
          bomber: sanitizeHeroSave(progress.heroes.bomber),
        },
        convergenceStages: sanitizeConvergenceStages(progress.convergenceStages),
        enemyKillsByCatalogId: sanitizeNumberRecord(progress.enemyKillsByCatalogId),
        discoveredEnemyIds: Array.from(new Set([1, ...(progress.discoveredEnemyIds ?? [])])),
        unlockedAchievements: Array.from(new Set(progress.unlockedAchievements ?? [])),
        achievementProgress: sanitizeStringNumberRecord(progress.achievementProgress),
        unlockedCosmetics: Array.from(
          new Set(['ring:classic', 'fx:standard', ...(progress.unlockedCosmetics ?? [])])
        ),
        equippedRingSkin: VALID_RING_SKINS.includes(progress.equippedRingSkin)
          ? progress.equippedRingSkin
          : 'classic',
        equippedFxStyle: VALID_FX_STYLES.includes(progress.equippedFxStyle)
          ? progress.equippedFxStyle
          : 'standard',
        totalLifetimeKills: Math.max(0, Math.floor(progress.totalLifetimeKills || 0)),
        selectedPet: VALID_PETS.includes(progress.selectedPet) ? progress.selectedPet : 'turtle',
        gems: Math.max(0, Math.floor(progress.gems || 0)),
        chestKeys: Math.max(0, Math.floor(progress.chestKeys || 0)),
        vipNoAds: Boolean(progress.vipNoAds),
        starterPackClaimed: Boolean(progress.starterPackClaimed),
        seasonPassPremium: Boolean(progress.seasonPassPremium),
        seasonPassXp: Math.max(0, Math.floor(progress.seasonPassXp || 0)),
        claimedFreePassTiers: Array.from(new Set(progress.claimedFreePassTiers ?? [])),
        claimedPremiumPassTiers: Array.from(new Set(progress.claimedPremiumPassTiers ?? [])),
        ownedRelics: sanitizeStringNumberRecord(progress.ownedRelics),
        equippedRelics: (progress.equippedRelics ?? []).slice(0, MAX_EQUIPPED_RELICS),
        consumables: sanitizeStringNumberRecord(progress.consumables),
        dailyRewardLastClaimDate: progress.dailyRewardLastClaimDate ?? '',
        purchaseHistory: (progress.purchaseHistory ?? []).slice(-50),
        dailyMissionsDate: progress.dailyMissionsDate ?? '',
        dailyMissions: (progress.dailyMissions ?? []).slice(0, 5),
        dailyAllCompleteBonusDate: progress.dailyAllCompleteBonusDate ?? '',
        instagramBonusClaimedDate: progress.instagramBonusClaimedDate ?? '',
        playerXp: Math.max(0, Math.floor(progress.playerXp || 0)),
        claimedMilestoneLevels: Array.from(
          new Set(progress.claimedMilestoneLevels ?? [])
        ).sort((a, b) => a - b),
      })
    );
  } catch {
    // Ignore storage quota or private-mode failures
  }
}
