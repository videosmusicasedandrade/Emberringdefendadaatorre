import { getTodayDateKey } from './storeCatalog';

export type DailyMissionKind =
  | 'defend_waves'
  | 'defeat_enemies'
  | 'reach_combo'
  | 'speedrun_stage'
  | 'perform_merges'
  | 'cast_spells'
  | 'rotate_ring'
  | 'defeat_elites'
  | 'survive_victory'
  | 'level_up_ally'
  | 'visit_instagram'
  | 'share_game';

export type DailyMissionCategory = 'combat' | 'skill' | 'social';

export interface DailyMissionState {
  id: string;
  kind: DailyMissionKind;
  category: DailyMissionCategory;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardGems: number;
  rewardSouls: number;
  rewardPassXp: number;
  difficultyTier: number;
  claimed: boolean;
  /** Optional metadata for stage speedrun missions */
  targetStage?: number;
  maxSeconds?: number;
}

export const DAILY_ALL_COMPLETE_BONUS_GEMS = 30;
export const DAILY_ALL_COMPLETE_BONUS_KEYS = 1;

/**
 * Computes player difficulty tier (1..15) from highest Hero level and highest unlocked stage.
 * Higher tiers generate harder targets and higher Gem rewards.
 */
export function computeMissionDifficultyTier(
  maxHeroLevel: number,
  highestUnlockedStage: number
): number {
  const heroFactor = Math.floor(Math.max(0, maxHeroLevel - 1) / 2);
  const stageFactor = Math.floor(Math.max(0, highestUnlockedStage - 1) / 4);
  return Math.max(1, Math.min(15, 1 + heroFactor + stageFactor));
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 2147483647 || 1337;
}

function createSeededRng(seedStr: string): () => number {
  let state = hashSeed(seedStr);
  return () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function buildMissionFromKind(
  kind: DailyMissionKind,
  difficultyTier: number,
  highestUnlockedStage: number,
  dateKey: string,
  rng: () => number
): DailyMissionState {
  const tier = Math.max(1, Math.min(15, difficultyTier));
  const gemBase = 15 + tier * 2; // 17..45 gems per mission
  const soulsBase = 6 + tier * 2;
  const passXpBase = 25 + tier * 4;
  const id = `${dateKey}:${kind}`;

  switch (kind) {
    case 'defend_waves': {
      const target = Math.min(14, 2 + tier);
      return {
        id,
        kind,
        category: 'combat',
        title: `Defenda ${target} Ondas`,
        description: `Sobreviva e conclua ${target} ondas completas defendendo o Castelo.`,
        target,
        progress: 0,
        rewardGems: gemBase + 4,
        rewardSouls: soulsBase,
        rewardPassXp: passXpBase,
        difficultyTier: tier,
        claimed: false,
      };
    }

    case 'defeat_enemies': {
      const target = 25 + tier * 12;
      return {
        id,
        kind,
        category: 'combat',
        title: `Abata ${target} Inimigos`,
        description: `Derrote ${target} invasores ao longo das suas batalhas de hoje.`,
        target,
        progress: 0,
        rewardGems: gemBase + 2,
        rewardSouls: soulsBase,
        rewardPassXp: passXpBase,
        difficultyTier: tier,
        claimed: false,
      };
    }

    case 'reach_combo': {
      const target = Math.min(45, 7 + tier * 2);
      return {
        id,
        kind,
        category: 'skill',
        title: `Sequência de ${target}x Combos`,
        description: `Atinja um combo de ${target} abates seguidos em uma única partida.`,
        target,
        progress: 0,
        rewardGems: gemBase + 6,
        rewardSouls: soulsBase + 2,
        rewardPassXp: passXpBase + 5,
        difficultyTier: tier,
        claimed: false,
      };
    }

    case 'speedrun_stage': {
      const safeMaxStage = Math.max(1, highestUnlockedStage);
      const minCandidate = Math.max(1, safeMaxStage - 3);
      const span = Math.max(1, safeMaxStage - minCandidate + 1);
      const targetStage = minCandidate + Math.floor(rng() * span);
      // Challenging but fair speedrun window that tightens gently at higher tiers
      const maxSeconds = Math.max(85, 165 - Math.min(55, (tier - 1) * 4) + Math.min(45, Math.floor(targetStage / 2) * 3));
      const mins = Math.floor(maxSeconds / 60);
      const secs = String(maxSeconds % 60).padStart(2, '0');
      return {
        id,
        kind,
        category: 'skill',
        title: `Fase ${targetStage} em até ${mins}:${secs}`,
        description: `Vença a Fase ${targetStage} em menos de ${maxSeconds} segundos de combate.`,
        target: 1,
        progress: 0,
        rewardGems: gemBase + 10,
        rewardSouls: soulsBase + 4,
        rewardPassXp: passXpBase + 10,
        difficultyTier: tier,
        claimed: false,
        targetStage,
        maxSeconds,
      };
    }

    case 'perform_merges': {
      const target = Math.min(12, 2 + Math.floor(tier * 0.7));
      return {
        id,
        kind,
        category: 'skill',
        title: `Realize ${target} Fusões`,
        description: `Combine dois aliados iguais para evoluí-los ${target} vezes hoje.`,
        target,
        progress: 0,
        rewardGems: gemBase + 4,
        rewardSouls: soulsBase,
        rewardPassXp: passXpBase,
        difficultyTier: tier,
        claimed: false,
      };
    }

    case 'cast_spells': {
      const target = Math.min(14, 3 + Math.floor(tier * 0.75));
      return {
        id,
        kind,
        category: 'skill',
        title: `Ative ${target} Magias`,
        description: `Use Lâminas, Onda de Choque ou Sobrecarga ${target} vezes em combate.`,
        target,
        progress: 0,
        rewardGems: gemBase + 2,
        rewardSouls: soulsBase,
        rewardPassXp: passXpBase,
        difficultyTier: tier,
        claimed: false,
      };
    }

    case 'rotate_ring': {
      const target = Math.min(18, 4 + tier);
      return {
        id,
        kind,
        category: 'skill',
        title: `Gire o Anel ${target} Vezes`,
        description: `Acione a rotação 360° do Anel Central ${target} vezes para repelir hordas.`,
        target,
        progress: 0,
        rewardGems: gemBase + 3,
        rewardSouls: soulsBase,
        rewardPassXp: passXpBase,
        difficultyTier: tier,
        claimed: false,
      };
    }

    case 'defeat_elites': {
      const target = Math.min(12, 2 + Math.floor(tier * 0.65));
      return {
        id,
        kind,
        category: 'combat',
        title: `Derrote ${target} Elites/Chefes`,
        description: `Elimine ${target} inimigos de elite ou chefões de onda.`,
        target,
        progress: 0,
        rewardGems: gemBase + 7,
        rewardSouls: soulsBase + 3,
        rewardPassXp: passXpBase + 6,
        difficultyTier: tier,
        claimed: false,
      };
    }

    case 'survive_victory': {
      const target = tier >= 7 ? 3 : tier >= 3 ? 2 : 1;
      return {
        id,
        kind,
        category: 'combat',
        title: target === 1 ? 'Vença 1 Fase Hoje' : `Vença ${target} Fases Hoje`,
        description: `Complete todas as ondas e conquiste ${target} ${target === 1 ? 'vitória' : 'vitórias'} hoje.`,
        target,
        progress: 0,
        rewardGems: gemBase + 8,
        rewardSouls: soulsBase + 3,
        rewardPassXp: passXpBase + 8,
        difficultyTier: tier,
        claimed: false,
      };
    }

    case 'level_up_ally': {
      const target = Math.min(10, 2 + Math.floor(tier * 0.6));
      return {
        id,
        kind,
        category: 'skill',
        title: `Evolua Aliados ${target} Vezes`,
        description: `Faça aliados subirem de nível por abates ou fusões ${target} vezes.`,
        target,
        progress: 0,
        rewardGems: gemBase + 5,
        rewardSouls: soulsBase + 2,
        rewardPassXp: passXpBase,
        difficultyTier: tier,
        claimed: false,
      };
    }

    case 'visit_instagram':
      return {
        id,
        kind,
        category: 'social',
        title: 'Curta nosso Instagram',
        description: 'Clique na aba do Instagram do jogo para apoiar a comunidade e ganhar Gemas na hora!',
        target: 1,
        progress: 0,
        rewardGems: 20 + Math.min(15, tier),
        rewardSouls: 8,
        rewardPassXp: 25,
        difficultyTier: tier,
        claimed: false,
      };

    case 'share_game':
      return {
        id,
        kind,
        category: 'social',
        title: 'Compartilhe Ember Ring',
        description: 'Compartilhe o jogo com amigos para recrutar novos guardiões e receber Gemas na hora!',
        target: 1,
        progress: 0,
        rewardGems: 20 + Math.min(15, tier),
        rewardSouls: 8,
        rewardPassXp: 25,
        difficultyTier: tier,
        claimed: false,
      };
  }
}

const SLOT_1_COMBAT_POOL: ReadonlyArray<DailyMissionKind> = [
  'defend_waves',
  'defeat_enemies',
  'defeat_elites',
  'survive_victory',
];

const SLOT_2_SKILL_POOL: ReadonlyArray<DailyMissionKind> = [
  'reach_combo',
  'speedrun_stage',
  'perform_merges',
  'cast_spells',
  'rotate_ring',
  'level_up_ally',
];

const SLOT_3_MIX_POOL: ReadonlyArray<DailyMissionKind> = [
  'visit_instagram',
  'share_game',
  'reach_combo',
  'speedrun_stage',
  'perform_merges',
  'visit_instagram',
  'share_game',
];

/**
 * Deterministically generates 3 distinct daily missions for the given dateKey and player level.
 * Guarantees variety across days and progressive difficulty scaling with the player's level.
 */
export function generateDailyMissions(
  maxHeroLevel: number,
  highestUnlockedStage: number,
  dateKey: string = getTodayDateKey()
): DailyMissionState[] {
  const tier = computeMissionDifficultyTier(maxHeroLevel, highestUnlockedStage);
  const rng = createSeededRng(`ember-daily-v1:${dateKey}`);

  const pickDistinct = (
    pool: ReadonlyArray<DailyMissionKind>,
    used: Set<DailyMissionKind>
  ): DailyMissionKind => {
    const candidates = pool.filter((k) => !used.has(k));
    const list = candidates.length > 0 ? candidates : pool;
    const picked = list[Math.floor(rng() * list.length)] ?? list[0];
    used.add(picked);
    return picked;
  };

  const used = new Set<DailyMissionKind>();
  const kind1 = pickDistinct(SLOT_1_COMBAT_POOL, used);
  const kind2 = pickDistinct(SLOT_2_SKILL_POOL, used);
  const kind3 = pickDistinct(SLOT_3_MIX_POOL, used);

  return [
    buildMissionFromKind(kind1, tier, highestUnlockedStage, dateKey, rng),
    buildMissionFromKind(kind2, tier, highestUnlockedStage, dateKey, rng),
    buildMissionFromKind(kind3, tier, highestUnlockedStage, dateKey, rng),
  ];
}
