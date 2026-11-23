import { FxStyleId, RingSkinId } from './types';

export type RelicId =
  | 'blood_chalice'
  | 'essence_crown'
  | 'eclipse_blade'
  | 'arcane_hourglass'
  | 'phoenix_shield'
  | 'sovereign_ring'
  | 'convergence_seal'
  | 'dragon_heart';

export type RelicRarity = 'rare' | 'epic' | 'legendary' | 'mythic';

export type ConsumableId = 'castle_potion' | 'meteor_scroll' | 'frenzy_flask';

export type PlayStoreSkuId =
  | 'com.emberring.vip_no_ads'
  | 'com.emberring.starter_pack'
  | 'com.emberring.season_pass'
  | 'com.emberring.gems_120'
  | 'com.emberring.gems_360'
  | 'com.emberring.gems_850'
  | 'com.emberring.gems_1900'
  | 'com.emberring.gems_4500';

export interface RelicSpec {
  id: RelicId;
  name: string;
  rarity: RelicRarity;
  maxLevel: number;
  primaryColor: string;
  accentColor: string;
  shortTag: string;
  getEffectText: (level: number) => string;
}

export interface ConsumableSpec {
  id: ConsumableId;
  name: string;
  shortLabel: string;
  description: string;
  gemCost: number;
  accentColor: string;
  hotkey: string;
}

export interface PlayStoreProduct {
  sku: PlayStoreSkuId;
  title: string;
  subtitle: string;
  priceBrl: string;
  priceMicros: number;
  category: 'vip' | 'bundle' | 'pass' | 'gems';
  oneTime?: boolean;
  bonusLabel?: string;
  accentColor: string;
  rewards: {
    gems?: number;
    emberSouls?: number;
    chestKeys?: number;
    consumables?: Partial<Record<ConsumableId, number>>;
    vipNoAds?: boolean;
    seasonPassPremium?: boolean;
    unlockRingSkin?: RingSkinId;
    unlockFxStyle?: FxStyleId;
  };
}

export interface PurchaseReceipt {
  orderId: string;
  sku: PlayStoreSkuId;
  priceBrl: string;
  timestamp: number;
  provider: 'google_play_sandbox' | 'google_play_live';
}

export interface ChestPullResult {
  relicId: RelicId;
  isNew: boolean;
  newLevel: number;
  bonusGems: number;
}

export interface SeasonPassReward {
  label: string;
  gems?: number;
  emberSouls?: number;
  chestKeys?: number;
  consumables?: Partial<Record<ConsumableId, number>>;
  guaranteedMythicRelic?: boolean;
}

export interface SeasonPassTier {
  tier: number;
  xpRequired: number;
  free: SeasonPassReward;
  premium: SeasonPassReward;
}

export interface EquippedRelicBonuses {
  castleRegenPerSec: number;
  castleHealOnEliteKill: number;
  startingEssenceBonus: number;
  essenceKillBonusPct: number;
  critChanceBonus: number;
  spellCooldownReductionPct: number;
  phoenixReviveHpPct: number;
  ringDamageBonusPct: number;
  ringHeatReductionPct: number;
  allyXpBonusPct: number;
  allyRangeBonusPct: number;
  globalDamageBonusPct: number;
}

export const MAX_EQUIPPED_RELICS = 3;
export const RELIC_CHEST_SINGLE_COST = 80;
export const RELIC_CHEST_FIVE_COST = 360;
export const SOULS_BUNDLE_GEM_COST = 120;
export const SOULS_BUNDLE_AMOUNT = 60;

export const RELIC_RARITY_LABELS: Record<RelicRarity, { label: string; color: string }> = {
  rare: { label: 'Rara', color: '#38BDF8' },
  epic: { label: 'Épica', color: '#C084FC' },
  legendary: { label: 'Lendária', color: '#FACC15' },
  mythic: { label: 'Mítica', color: '#FF2E4C' },
};

export const RELIC_ORDER: ReadonlyArray<RelicId> = [
  'blood_chalice',
  'essence_crown',
  'eclipse_blade',
  'arcane_hourglass',
  'phoenix_shield',
  'sovereign_ring',
  'convergence_seal',
  'dragon_heart',
];

export const RELIC_SPECS: Record<RelicId, RelicSpec> = {
  blood_chalice: {
    id: 'blood_chalice',
    name: 'Cálice Real',
    rarity: 'rare',
    maxLevel: 5,
    primaryColor: '#38BDF8',
    accentColor: '#7DD3FC',
    shortTag: 'Cura Castelo',
    getEffectText: (lvl) =>
      `+${(0.8 + (lvl - 1) * 0.4).toFixed(1)} HP/s no Castelo e +${3 + lvl * 2} HP por Elite/Chefe abatido.`,
  },
  essence_crown: {
    id: 'essence_crown',
    name: 'Coroa da Essência',
    rarity: 'rare',
    maxLevel: 5,
    primaryColor: '#38BDF8',
    accentColor: '#FDE047',
    shortTag: '+Essência',
    getEffectText: (lvl) =>
      `+${20 + (lvl - 1) * 12} Essência inicial e +${10 + (lvl - 1) * 4}% Essência por abate.`,
  },
  eclipse_blade: {
    id: 'eclipse_blade',
    name: 'Lâmina do Eclipse',
    rarity: 'epic',
    maxLevel: 5,
    primaryColor: '#C084FC',
    accentColor: '#E9D5FF',
    shortTag: '+Crítico',
    getEffectText: (lvl) =>
      `+${8 + (lvl - 1) * 3}% Chance de Crítico para Heróis e Aliados.`,
  },
  arcane_hourglass: {
    id: 'arcane_hourglass',
    name: 'Ampulheta Arcana',
    rarity: 'epic',
    maxLevel: 5,
    primaryColor: '#A855F7',
    accentColor: '#67E8F9',
    shortTag: '-Recarga Magia',
    getEffectText: (lvl) =>
      `-${10 + (lvl - 1) * 3}% tempo de recarga de todas as Magias.`,
  },
  phoenix_shield: {
    id: 'phoenix_shield',
    name: 'Escudo da Fênix',
    rarity: 'legendary',
    maxLevel: 5,
    primaryColor: '#FACC15',
    accentColor: '#FB923C',
    shortTag: 'Revive Castelo',
    getEffectText: (lvl) =>
      `1x por partida, impede a queda do Castelo ressuscitando com ${30 + (lvl - 1) * 6}% de HP e onda de fogo.`,
  },
  sovereign_ring: {
    id: 'sovereign_ring',
    name: 'Anel do Soberano',
    rarity: 'legendary',
    maxLevel: 5,
    primaryColor: '#F59E0B',
    accentColor: '#FEF08A',
    shortTag: '+Anel 360°',
    getEffectText: (lvl) =>
      `+${35 + (lvl - 1) * 15}% dano ao girar o Anel e -${15 + (lvl - 1) * 5}% aquecimento.`,
  },
  convergence_seal: {
    id: 'convergence_seal',
    name: 'Selo da Convergência',
    rarity: 'mythic',
    maxLevel: 5,
    primaryColor: '#FF2E4C',
    accentColor: '#FDA4AF',
    shortTag: '+XP Aliados',
    getEffectText: (lvl) =>
      `+${35 + (lvl - 1) * 12}% XP de combate para Aliados e +${8 + (lvl - 1) * 3}% alcance.`,
  },
  dragon_heart: {
    id: 'dragon_heart',
    name: 'Coração de Dragão',
    rarity: 'mythic',
    maxLevel: 5,
    primaryColor: '#EF4444',
    accentColor: '#FDE047',
    shortTag: '+Dano Global',
    getEffectText: (lvl) =>
      `+${12 + (lvl - 1) * 5}% dano global para todos os Heróis e Aliados.`,
  },
};

export const CONSUMABLE_ORDER: ReadonlyArray<ConsumableId> = [
  'castle_potion',
  'meteor_scroll',
  'frenzy_flask',
];

export const CONSUMABLE_SPECS: Record<ConsumableId, ConsumableSpec> = {
  castle_potion: {
    id: 'castle_potion',
    name: 'Poção Real do Castelo',
    shortLabel: 'Poção +HP',
    description: 'Restaura instantaneamente 35% da Vida Máxima do Castelo durante o combate.',
    gemCost: 35,
    accentColor: '#22C55E',
    hotkey: 'Z',
  },
  meteor_scroll: {
    id: 'meteor_scroll',
    name: 'Chuva de Meteoros',
    shortLabel: 'Meteoros',
    description: 'Explode todos os inimigos da tela com dano massivo de fogo e 1,8s de atordoamento.',
    gemCost: 45,
    accentColor: '#F97316',
    hotkey: 'X',
  },
  frenzy_flask: {
    id: 'frenzy_flask',
    name: 'Ampola de Frenesi',
    shortLabel: 'Frenesi',
    description: '+50% velocidade de ataque e +30% dano por 10s + zera recarga de todas as magias.',
    gemCost: 50,
    accentColor: '#00D4FF',
    hotkey: 'C',
  },
};

export const PLAY_STORE_PRODUCTS: ReadonlyArray<PlayStoreProduct> = [
  {
    sku: 'com.emberring.vip_no_ads',
    title: 'Passe VIP · Sem Anúncios',
    subtitle: 'Escolha Livre de Pet permanente (sem anúncios), +20% Almas de Brasa e +100 Gemas.',
    priceBrl: 'R$ 19,90',
    priceMicros: 19900000,
    category: 'vip',
    oneTime: true,
    bonusLabel: 'PERMANENTE',
    accentColor: '#FACC15',
    rewards: {
      vipNoAds: true,
      gems: 100,
      chestKeys: 1,
    },
  },
  {
    sku: 'com.emberring.starter_pack',
    title: 'Pacote Iniciante do Guardião',
    subtitle: '350 Gemas, 120 Almas de Brasa, 2 Chaves de Baú, 2x cada Item Tático e Anel Eclipse Real.',
    priceBrl: 'R$ 9,90',
    priceMicros: 9900000,
    category: 'bundle',
    oneTime: true,
    bonusLabel: '5X VALOR',
    accentColor: '#22C55E',
    rewards: {
      gems: 350,
      emberSouls: 120,
      chestKeys: 2,
      consumables: { castle_potion: 2, meteor_scroll: 2, frenzy_flask: 2 },
      unlockRingSkin: 'eclipse',
    },
  },
  {
    sku: 'com.emberring.season_pass',
    title: 'Passe de Temporada · Premium',
    subtitle: 'Desbloqueia toda a Trilha Premium (10 níveis): +700 Gemas, Chaves e Relíquia Mítica.',
    priceBrl: 'R$ 24,90',
    priceMicros: 24900000,
    category: 'pass',
    oneTime: true,
    bonusLabel: 'TEMPORADA 1',
    accentColor: '#C084FC',
    rewards: {
      seasonPassPremium: true,
      gems: 120,
    },
  },
  {
    sku: 'com.emberring.gems_120',
    title: 'Punhado de Gemas',
    subtitle: '120 Gemas Arcanas para Baús de Relíquias, Itens e Visuais.',
    priceBrl: 'R$ 4,90',
    priceMicros: 4900000,
    category: 'gems',
    accentColor: '#38BDF8',
    rewards: { gems: 120 },
  },
  {
    sku: 'com.emberring.gems_360',
    title: 'Bolsa do Mago',
    subtitle: '360 Gemas Arcanas · Suficiente para 1 Pacote de 5 Baús.',
    priceBrl: 'R$ 12,90',
    priceMicros: 12900000,
    category: 'gems',
    bonusLabel: '+10% BÔNUS',
    accentColor: '#38BDF8',
    rewards: { gems: 360 },
  },
  {
    sku: 'com.emberring.gems_850',
    title: 'Cofre de Brasa',
    subtitle: '850 Gemas Arcanas + 1 Chave de Baú bônus.',
    priceBrl: 'R$ 27,90',
    priceMicros: 27900000,
    category: 'gems',
    bonusLabel: 'POPULAR',
    accentColor: '#A855F7',
    rewards: { gems: 850, chestKeys: 1 },
  },
  {
    sku: 'com.emberring.gems_1900',
    title: 'Tesouro Real',
    subtitle: '1.900 Gemas Arcanas + 3 Chaves de Baú bônus.',
    priceBrl: 'R$ 54,90',
    priceMicros: 54900000,
    category: 'gems',
    bonusLabel: '+25% BÔNUS',
    accentColor: '#F59E0B',
    rewards: { gems: 1900, chestKeys: 3 },
  },
  {
    sku: 'com.emberring.gems_4500',
    title: 'Câmara do Dragão',
    subtitle: '4.500 Gemas Arcanas + 6 Chaves de Baú + 200 Almas de Brasa.',
    priceBrl: 'R$ 109,90',
    priceMicros: 109900000,
    category: 'gems',
    bonusLabel: 'MELHOR VALOR',
    accentColor: '#FF2E4C',
    rewards: { gems: 4500, chestKeys: 6, emberSouls: 200 },
  },
];

export const SEASON_PASS_TIERS: ReadonlyArray<SeasonPassTier> = [
  {
    tier: 1,
    xpRequired: 60,
    free: { label: '25 Almas de Brasa', emberSouls: 25 },
    premium: { label: '80 Gemas + 1 Poção', gems: 80, consumables: { castle_potion: 1 } },
  },
  {
    tier: 2,
    xpRequired: 160,
    free: { label: '1 Poção do Castelo', consumables: { castle_potion: 1 } },
    premium: { label: '1 Chave de Baú', chestKeys: 1 },
  },
  {
    tier: 3,
    xpRequired: 300,
    free: { label: '40 Gemas Arcanas', gems: 40 },
    premium: { label: '100 Gemas + Meteoro', gems: 100, consumables: { meteor_scroll: 1 } },
  },
  {
    tier: 4,
    xpRequired: 480,
    free: { label: '40 Almas de Brasa', emberSouls: 40 },
    premium: { label: '2 Chaves de Baú', chestKeys: 2 },
  },
  {
    tier: 5,
    xpRequired: 700,
    free: { label: '1 Chave de Baú', chestKeys: 1 },
    premium: { label: '140 Gemas + Frenesi', gems: 140, consumables: { frenzy_flask: 2 } },
  },
  {
    tier: 6,
    xpRequired: 960,
    free: { label: '1 Chuva de Meteoros', consumables: { meteor_scroll: 1 } },
    premium: { label: '100 Almas + 1 Chave', emberSouls: 100, chestKeys: 1 },
  },
  {
    tier: 7,
    xpRequired: 1260,
    free: { label: '60 Gemas Arcanas', gems: 60 },
    premium: { label: '160 Gemas Arcanas', gems: 160 },
  },
  {
    tier: 8,
    xpRequired: 1600,
    free: { label: '1 Ampola de Frenesi', consumables: { frenzy_flask: 1 } },
    premium: { label: '2 Chaves + 2 Meteoros', chestKeys: 2, consumables: { meteor_scroll: 2 } },
  },
  {
    tier: 9,
    xpRequired: 2000,
    free: { label: '80 Almas de Brasa', emberSouls: 80 },
    premium: { label: '220 Gemas Arcanas', gems: 220 },
  },
  {
    tier: 10,
    xpRequired: 2500,
    free: { label: '2 Chaves de Baú', chestKeys: 2 },
    premium: { label: 'Relíquia Mítica Garantida + 3 Chaves', guaranteedMythicRelic: true, chestKeys: 3 },
  },
];

export function getSeasonPassTierFromXp(xp: number): number {
  let tier = 0;
  for (const t of SEASON_PASS_TIERS) {
    if (xp >= t.xpRequired) tier = t.tier;
  }
  return tier;
}

export function getPlayStoreProduct(sku: PlayStoreSkuId): PlayStoreProduct | undefined {
  return PLAY_STORE_PRODUCTS.find((p) => p.sku === sku);
}

export function createPlayStoreSandboxReceipt(product: PlayStoreProduct): PurchaseReceipt {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return {
    orderId: `GPA.${Date.now()}-${rand}`,
    sku: product.sku,
    priceBrl: product.priceBrl,
    timestamp: Date.now(),
    provider: 'google_play_sandbox',
  };
}

export function rollRelicFromChest(
  guaranteedEpicPlus = false,
  rng: () => number = Math.random
): RelicId {
  const roll = rng();
  let pool: RelicId[];
  if (guaranteedEpicPlus) {
    if (roll < 0.14) {
      pool = ['convergence_seal', 'dragon_heart'];
    } else if (roll < 0.45) {
      pool = ['phoenix_shield', 'sovereign_ring'];
    } else {
      pool = ['eclipse_blade', 'arcane_hourglass'];
    }
  } else {
    if (roll < 0.06) {
      pool = ['convergence_seal', 'dragon_heart'];
    } else if (roll < 0.22) {
      pool = ['phoenix_shield', 'sovereign_ring'];
    } else if (roll < 0.56) {
      pool = ['eclipse_blade', 'arcane_hourglass'];
    } else {
      pool = ['blood_chalice', 'essence_crown'];
    }
  }
  const idx = Math.min(pool.length - 1, Math.floor(rng() * pool.length));
  return pool[idx] ?? 'blood_chalice';
}

export function computeEquippedRelicBonuses(
  ownedRelics: Record<string, number>,
  equippedRelics: ReadonlyArray<string>
): EquippedRelicBonuses {
  const bonuses: EquippedRelicBonuses = {
    castleRegenPerSec: 0,
    castleHealOnEliteKill: 0,
    startingEssenceBonus: 0,
    essenceKillBonusPct: 0,
    critChanceBonus: 0,
    spellCooldownReductionPct: 0,
    phoenixReviveHpPct: 0,
    ringDamageBonusPct: 0,
    ringHeatReductionPct: 0,
    allyXpBonusPct: 0,
    allyRangeBonusPct: 0,
    globalDamageBonusPct: 0,
  };

  for (const rawId of equippedRelics.slice(0, MAX_EQUIPPED_RELICS)) {
    const id = rawId as RelicId;
    const lvl = Math.max(0, Math.min(5, Math.floor(ownedRelics[id] ?? 0)));
    if (lvl <= 0) continue;

    switch (id) {
      case 'blood_chalice':
        bonuses.castleRegenPerSec += 0.8 + (lvl - 1) * 0.4;
        bonuses.castleHealOnEliteKill += 3 + lvl * 2;
        break;
      case 'essence_crown':
        bonuses.startingEssenceBonus += 20 + (lvl - 1) * 12;
        bonuses.essenceKillBonusPct += 0.1 + (lvl - 1) * 0.04;
        break;
      case 'eclipse_blade':
        bonuses.critChanceBonus += 0.08 + (lvl - 1) * 0.03;
        break;
      case 'arcane_hourglass':
        bonuses.spellCooldownReductionPct += 0.1 + (lvl - 1) * 0.03;
        break;
      case 'phoenix_shield':
        bonuses.phoenixReviveHpPct = Math.max(bonuses.phoenixReviveHpPct, 0.3 + (lvl - 1) * 0.06);
        break;
      case 'sovereign_ring':
        bonuses.ringDamageBonusPct += 0.35 + (lvl - 1) * 0.15;
        bonuses.ringHeatReductionPct += 0.15 + (lvl - 1) * 0.05;
        break;
      case 'convergence_seal':
        bonuses.allyXpBonusPct += 0.35 + (lvl - 1) * 0.12;
        bonuses.allyRangeBonusPct += 0.08 + (lvl - 1) * 0.03;
        break;
      case 'dragon_heart':
        bonuses.globalDamageBonusPct += 0.12 + (lvl - 1) * 0.05;
        break;
    }
  }

  return bonuses;
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
