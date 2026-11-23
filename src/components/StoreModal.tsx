import React, { useEffect, useState } from 'react';
import {
  Camera,
  Check,
  ClipboardCheck,
  Crown,
  Flame,
  Gem,
  Gift,
  KeyRound,
  Lock,
  Palette,
  Share2,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Timer,
  X,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../game/audio';
import {
  DAILY_ALL_COMPLETE_BONUS_GEMS,
  DAILY_ALL_COMPLETE_BONUS_KEYS,
} from '../game/dailyMissions';
import {
  ChestPullResult,
  CONSUMABLE_ORDER,
  CONSUMABLE_SPECS,
  ConsumableId,
  getSeasonPassTierFromXp,
  MAX_EQUIPPED_RELICS,
  PLAY_STORE_PRODUCTS,
  PlayStoreProduct,
  PlayStoreSkuId,
  RELIC_CHEST_FIVE_COST,
  RELIC_CHEST_SINGLE_COST,
  RELIC_ORDER,
  RELIC_RARITY_LABELS,
  RELIC_SPECS,
  RelicId,
  SEASON_PASS_TIERS,
  SOULS_BUNDLE_AMOUNT,
  SOULS_BUNDLE_GEM_COST,
} from '../game/storeCatalog';
import {
  FX_STYLES,
  FxStyleId,
  HudSnapshot,
  RING_SKINS,
  RingSkinId,
} from '../game/types';

export type StoreTab = 'featured' | 'missions' | 'gems' | 'relics' | 'pass' | 'cosmetics';

interface StoreModalProps {
  isOpen: boolean;
  initialTab?: StoreTab;
  hud: HudSnapshot;
  onClose: () => void;
  onPurchasePlayStore: (sku: PlayStoreSkuId) => { ok: boolean; message: string };
  onOpenRelicChest: (count: 1 | 5) => { ok: boolean; pulls: ChestPullResult[]; message: string };
  onToggleEquipRelic: (relicId: RelicId) => boolean;
  onBuyConsumable: (id: ConsumableId) => boolean;
  onBuySoulsBundle: () => boolean;
  onClaimDailyReward: () => { ok: boolean; gems: number; souls: number };
  onClaimSeasonPassReward: (tier: number, track: 'free' | 'premium') => boolean;
  onBuyOrEquipRingSkin: (skinId: RingSkinId) => void;
  onBuyOrEquipFxStyle: (fxId: FxStyleId) => void;
  onClaimDailyMission: (missionId: string) => {
    ok: boolean;
    gems: number;
    souls: number;
    passXp: number;
    title: string;
  };
  onTriggerSocialMission: (kind: 'visit_instagram' | 'share_game') => {
    ok: boolean;
    gems: number;
    souls: number;
    message: string;
  };
  onClaimDailyAllCompleteBonus: () => { ok: boolean; gems: number; keys: number };
}

const TAB_ITEMS: { id: StoreTab; label: string }[] = [
  { id: 'featured', label: 'Destaques' },
  { id: 'missions', label: 'Missões Diárias' },
  { id: 'gems', label: 'Gemas Play' },
  { id: 'relics', label: 'Baús & Relíquias' },
  { id: 'pass', label: 'Itens & Passe' },
  { id: 'cosmetics', label: 'Visuais' },
];

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  initialTab = 'featured',
  hud,
  onClose,
  onPurchasePlayStore,
  onOpenRelicChest,
  onToggleEquipRelic,
  onBuyConsumable,
  onBuySoulsBundle,
  onClaimDailyReward,
  onClaimSeasonPassReward,
  onBuyOrEquipRingSkin,
  onBuyOrEquipFxStyle,
  onClaimDailyMission,
  onTriggerSocialMission,
  onClaimDailyAllCompleteBonus,
}) => {
  const [activeTab, setActiveTab] = useState<StoreTab>(initialTab);
  const [checkoutProduct, setCheckoutProduct] = useState<PlayStoreProduct | null>(null);
  const [toast, setToast] = useState<{ text: string; tone: 'gold' | 'cyan' | 'rose' } | null>(null);
  const [lastPulls, setLastPulls] = useState<ChestPullResult[] | null>(null);
  const [instagramPanelOpen, setInstagramPanelOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCheckoutProduct(null);
      setLastPulls(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (checkoutProduct) {
          setCheckoutProduct(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, checkoutProduct, onClose]);

  if (!isOpen) return null;

  const currentPassTier = getSeasonPassTierFromXp(hud.seasonPassXp);
  const featuredProducts = PLAY_STORE_PRODUCTS.filter((p) => p.category !== 'gems');
  const gemProducts = PLAY_STORE_PRODUCTS.filter((p) => p.category === 'gems');
  const claimedMissionsCount = hud.dailyMissions.filter((m) => m.claimed).length;
  const readyMissionsCount = hud.dailyMissions.filter(
    (m) => !m.claimed && m.progress >= m.target
  ).length;
  const allMissionsClaimed =
    hud.dailyMissions.length === 3 && claimedMissionsCount === 3;
  const dailyBonusReady = allMissionsClaimed && !hud.dailyAllCompleteBonusClaimed;
  const instagramMissionUnclaimed = hud.dailyMissions.some(
    (m) => m.kind === 'visit_instagram' && !m.claimed
  );
  const instagramDailyGems = 15 + Math.min(10, hud.dailyMissionTier);

  const handleInstagramAction = () => {
    soundEngine.playClick();
    setInstagramPanelOpen(true);
    const res = onTriggerSocialMission('visit_instagram');
    setToast({
      text: res.message,
      tone: res.ok ? 'gold' : 'cyan',
    });
  };

  const handleShareGameAction = () => {
    soundEngine.playClick();
    const shareText = `Estou defendendo o castelo na Fase ${hud.highestUnlockedStage} de Ember Ring Defense! Venha jogar também!`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(shareText);
      }
    } catch {
      // Clipboard may be restricted in sandboxed iframes; reward still succeeds
    }
    const res = onTriggerSocialMission('share_game');
    setToast({
      text: res.ok ? `${res.message} (Convite copiado!)` : res.message,
      tone: res.ok ? 'gold' : 'cyan',
    });
  };

  const isOneTimeOwned = (sku: PlayStoreSkuId) => {
    if (sku === 'com.emberring.vip_no_ads') return hud.vipNoAds;
    if (sku === 'com.emberring.starter_pack') return hud.starterPackClaimed;
    if (sku === 'com.emberring.season_pass') return hud.seasonPassPremium;
    return false;
  };

  const handleConfirmSandboxPurchase = () => {
    if (!checkoutProduct) return;
    const res = onPurchasePlayStore(checkoutProduct.sku);
    setCheckoutProduct(null);
    setToast({ text: res.message, tone: res.ok ? 'gold' : 'rose' });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Loja Play Store e Forja de Relíquias"
      data-testid="store-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-2.5 sm:p-4 backdrop-blur-sm"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 border-[#FACC15] bg-[#0B1120] shadow-[0_18px_56px_rgba(0,0,0,0.95)]">
        {/* Top Store Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#080D1A] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FACC15]/50 bg-[#422006] text-[#FACC15]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-white sm:text-xl">
                  Loja do Guardião
                </h2>
                {hud.vipNoAds && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#FACC15]/60 bg-[#422006] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#FACC15]">
                    <Crown className="h-3 w-3" />
                    VIP
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-[#94A3B8]">
                Catálogo preparado para Google Play Billing · Relíquias, Itens e Passe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="font-mono-tabular flex items-center gap-3 rounded-xl border border-white/10 bg-[#0F172A] px-3 py-1.5 text-xs font-bold">
              <span className="flex items-center gap-1 text-[#00D4FF]" title="Gemas Arcanas">
                <Gem className="h-3.5 w-3.5" />
                {hud.gems}
              </span>
              <span className="text-[#334155]">|</span>
              <span className="flex items-center gap-1 text-[#C084FC]" title="Chaves de Baú">
                <KeyRound className="h-3.5 w-3.5" />
                {hud.chestKeys}
              </span>
              <span className="text-[#334155]">|</span>
              <span className="flex items-center gap-1 text-[#FACC15]" title="Almas de Brasa">
                <Flame className="h-3.5 w-3.5" />
                {hud.emberSouls}
              </span>
            </div>

            <button
              type="button"
              data-testid="store-close"
              aria-label="Fechar loja"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#334155] bg-[#1E293B] text-white hover:border-[#FACC15] hover:bg-[#334155]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav
          aria-label="Abas da Loja"
          className="flex gap-1.5 overflow-x-auto border-b border-white/10 bg-[#0A0F1D] px-4 py-2.5 sm:px-5"
        >
          {TAB_ITEMS.map((tab) => {
            const active = activeTab === tab.id;
            const missionsReadyBadge =
              tab.id === 'missions' && (readyMissionsCount > 0 || dailyBonusReady)
                ? ` (${readyMissionsCount + (dailyBonusReady ? 1 : 0)})`
                : '';
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`store-tab-${tab.id}`}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab(tab.id);
                }}
                className={`rounded-xl border px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                  active
                    ? 'border-[#FACC15] bg-[#422006] text-[#FEF08A]'
                    : 'border-[#1E293B] bg-[#0F172A] text-[#94A3B8] hover:border-[#475569] hover:text-white'
                }`}
              >
                {tab.label}
                {missionsReadyBadge}
              </button>
            );
          })}
        </nav>

        {/* Toast Notification */}
        {toast && (
          <div
            data-testid="store-toast"
            className={`mx-4 mt-3 rounded-xl border px-3.5 py-2 text-xs font-bold sm:mx-5 ${
              toast.tone === 'gold'
                ? 'border-[#FACC15]/60 bg-[#422006]/80 text-[#FEF08A]'
                : toast.tone === 'cyan'
                  ? 'border-[#00D4FF]/60 bg-[#082F49]/80 text-[#BAE6FD]'
                  : 'border-[#FF2E4C]/60 bg-[#450A0A]/80 text-[#FECACA]'
            }`}
          >
            {toast.text}
          </div>
        )}

        {/* Scrollable Store Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {/* TAB 1: FEATURED PLAY STORE OFFERS & DAILY GIFT */}
          {activeTab === 'featured' && (
            <div className="flex flex-col gap-4">
              {/* Free Daily Chest Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#00D4FF]/50 bg-gradient-to-r from-[#082F49]/90 to-[#0F172A] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#00D4FF]/50 bg-[#051829] text-[#00D4FF]">
                    <Gift className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-display text-base font-bold text-white">
                      Presente Diário da Loja {hud.vipNoAds ? '(2x VIP)' : ''}
                    </div>
                    <div className="text-xs text-[#BAE6FD]">
                      Resgate grátis hoje: +{hud.vipNoAds ? 50 : 25} Gemas Arcanas e +{hud.vipNoAds ? 30 : 15} Almas de Brasa.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="store-daily-claim"
                  disabled={hud.dailyRewardClaimedToday}
                  onClick={() => {
                    const res = onClaimDailyReward();
                    if (res.ok) {
                      setToast({
                        text: `Presente diário resgatado: +${res.gems} Gemas e +${res.souls} Almas!`,
                        tone: 'cyan',
                      });
                    }
                  }}
                  className={`font-display rounded-xl border-2 px-4 py-2 text-xs font-bold whitespace-nowrap transition-transform active:translate-y-0.5 ${
                    hud.dailyRewardClaimedToday
                      ? 'cursor-not-allowed border-[#334155] bg-[#1E293B] text-[#64748B]'
                      : 'border-[#BAE6FD] bg-[#0284C7] text-white shadow-[0_3px_0_#075985] hover:bg-[#0369A1]'
                  }`}
                >
                  {hud.dailyRewardClaimedToday ? 'Resgatado Hoje' : 'Resgatar Grátis'}
                </button>
              </div>

              {/* Featured Play Store Products */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {featuredProducts.map((product) => {
                  const owned = isOneTimeOwned(product.sku);
                  return (
                    <div
                      key={product.sku}
                      className="flex flex-col justify-between rounded-2xl border-2 bg-[#0F172A] p-4 shadow-[0_6px_0_rgba(2,6,23,0.85)]"
                      style={{ borderColor: owned ? '#334155' : `${product.accentColor}99` }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-[10px] font-extrabold tracking-wider uppercase"
                            style={{ color: product.accentColor }}
                          >
                            {product.bonusLabel ?? 'OFERTA PLAY STORE'}
                          </span>
                          <span className="font-mono-tabular text-[10px] text-[#64748B]">
                            Google Play
                          </span>
                        </div>
                        <h3 className="mt-1.5 font-display text-base font-bold text-white">
                          {product.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#CBD5E1]">
                          {product.subtitle}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                        <span className="font-mono-tabular text-base font-extrabold text-[#FACC15]">
                          {product.priceBrl}
                        </span>
                        <button
                          type="button"
                          data-testid={`store-buy-${product.sku}`}
                          disabled={owned}
                          onClick={() => {
                            soundEngine.playClick();
                            setCheckoutProduct(product);
                          }}
                          className={`font-display rounded-xl border-2 px-4 py-2 text-xs font-bold whitespace-nowrap transition-transform active:translate-y-0.5 ${
                            owned
                              ? 'cursor-not-allowed border-[#334155] bg-[#1E293B] text-[#22C55E]'
                              : 'border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] text-white shadow-[0_3px_0_#991B1B]'
                          }`}
                        >
                          {owned ? 'Ativo' : 'Comprar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Architecture Readiness Note */}
              <div className="rounded-2xl border border-white/10 bg-[#080D1A] px-4 py-3 text-xs text-[#94A3B8]">
                <strong className="text-[#E2E8F0]">Integração Google Play Billing:</strong> Todos os pacotes acima já possuem IDs de produto (<code className="text-[#00D4FF]">com.emberring.*</code>) e recibos locais salvos ({hud.purchaseHistoryCount} compra{hud.purchaseHistoryCount === 1 ? '' : 's'} simulada{hud.purchaseHistoryCount === 1 ? '' : 's'}). No momento, o checkout roda em <strong className="text-[#FACC15]">Modo Sandbox Simulado</strong> sem cobrança real.
              </div>
            </div>
          )}

          {/* TAB 2: DAILY MISSIONS (3 ROTATING LEVEL-SCALED MISSIONS + INSTANT INSTAGRAM GEM TAB) */}
          {activeTab === 'missions' && (
            <div data-testid="daily-missions-panel" className="flex flex-col gap-4">
              {/* Top Difficulty & 3/3 Daily Completion Bonus Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#FACC15]/55 bg-gradient-to-r from-[#422006]/85 via-[#1E293B] to-[#0F172A] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#FACC15]/60 bg-[#080D1A] text-[#FACC15]">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-white">
                        Missões Diárias · Nível de Desafio {hud.dailyMissionTier}/15
                      </h3>
                      <span className="font-mono-tabular text-xs font-bold text-[#FACC15]">
                        {claimedMissionsCount}/3 concluídas
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#CBD5E1]">
                      3 missões diferentes todos os dias! A dificuldade e as Gemas aumentam conforme o nível dos seus heróis e fases.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  data-testid="daily-missions-all-bonus-btn"
                  disabled={!dailyBonusReady}
                  onClick={() => {
                    const res = onClaimDailyAllCompleteBonus();
                    if (res.ok) {
                      setToast({
                        text: `Bônus Diário 3/3 resgatado: +${res.gems} Gemas Arcanas e +${res.keys} Chave de Baú!`,
                        tone: 'gold',
                      });
                    }
                  }}
                  className={`font-display rounded-xl border-2 px-4 py-2 text-xs font-bold whitespace-nowrap transition-transform active:translate-y-0.5 ${
                    hud.dailyAllCompleteBonusClaimed
                      ? 'cursor-not-allowed border-[#334155] bg-[#1E293B] text-[#22C55E]'
                      : dailyBonusReady
                        ? 'border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] text-white shadow-[0_3px_0_#991B1B]'
                        : 'cursor-not-allowed border-[#334155] bg-[#080D1A] text-[#94A3B8]'
                  }`}
                >
                  {hud.dailyAllCompleteBonusClaimed
                    ? 'Bônus 3/3 Coletado'
                    : `Bônus 3/3 (+${DAILY_ALL_COMPLETE_BONUS_GEMS} Gemas · +${DAILY_ALL_COMPLETE_BONUS_KEYS} Chave)`}
                </button>
              </div>

              {/* 3 Rotating Daily Mission Cards */}
              <div className="grid grid-cols-1 gap-3">
                {hud.dailyMissions.map((mission) => {
                  const pct = Math.min(
                    100,
                    Math.round((mission.progress / Math.max(1, mission.target)) * 100)
                  );
                  const isReady = !mission.claimed && mission.progress >= mission.target;
                  const categoryLabel =
                    mission.category === 'combat'
                      ? 'Combate'
                      : mission.category === 'social'
                        ? 'Comunidade'
                        : 'Desafio Tático';
                  const categoryColor =
                    mission.category === 'combat'
                      ? '#FF2E4C'
                      : mission.category === 'social'
                        ? '#F472B6'
                        : '#00D4FF';

                  return (
                    <div
                      key={mission.id}
                      data-testid={`daily-mission-card-${mission.kind}`}
                      className={`flex flex-col justify-between gap-3 rounded-2xl border-2 p-4 sm:flex-row sm:items-center ${
                        mission.claimed
                          ? 'border-[#1E293B] bg-[#080D1A]/85 opacity-80'
                          : isReady
                            ? 'border-[#FACC15] bg-[#162033]'
                            : 'border-[#334155] bg-[#0F172A]'
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div
                          className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#050A14]"
                          style={{ color: categoryColor }}
                        >
                          {mission.kind === 'visit_instagram' ? (
                            <Camera className="h-5 w-5" />
                          ) : mission.kind === 'share_game' ? (
                            <Share2 className="h-5 w-5" />
                          ) : mission.kind === 'speedrun_stage' ? (
                            <Timer className="h-5 w-5" />
                          ) : mission.kind === 'defend_waves' || mission.kind === 'survive_victory' ? (
                            <Shield className="h-5 w-5" />
                          ) : mission.kind === 'reach_combo' || mission.kind === 'cast_spells' ? (
                            <Zap className="h-5 w-5" />
                          ) : (
                            <Swords className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span
                              className="text-[10px] font-extrabold tracking-wider uppercase"
                              style={{ color: categoryColor }}
                            >
                              {categoryLabel}
                            </span>
                            <span className="font-mono-tabular text-[11px] font-bold text-[#00D4FF]">
                              +{mission.rewardGems} Gemas
                            </span>
                            <span className="font-mono-tabular text-[11px] font-semibold text-[#FACC15]">
                              +{mission.rewardSouls} Almas · +{mission.rewardPassXp} XP Passe
                            </span>
                          </div>
                          <h4 className="mt-0.5 font-display text-base font-bold text-white">
                            {mission.title}
                          </h4>
                          <p className="mt-0.5 text-xs text-[#CBD5E1]">{mission.description}</p>

                          {/* Progress bar */}
                          <div className="mt-2.5 flex items-center gap-2.5">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#020617]">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: mission.claimed
                                    ? '#22C55E'
                                    : isReady
                                      ? '#FACC15'
                                      : categoryColor,
                                }}
                              />
                            </div>
                            <span className="font-mono-tabular text-xs font-bold text-[#E2E8F0]">
                              {mission.progress}/{mission.target}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className="flex shrink-0 items-center justify-end">
                        {mission.claimed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#22C55E]/40 bg-[#14532D]/40 px-4 py-2 text-xs font-bold text-[#4ADE80]">
                            <Check className="h-4 w-4" />
                            Concluída
                          </span>
                        ) : mission.kind === 'visit_instagram' ? (
                          <button
                            type="button"
                            data-testid="daily-mission-action-instagram"
                            onClick={handleInstagramAction}
                            className="font-display flex items-center gap-1.5 rounded-xl border-2 border-[#FBCFE8] bg-gradient-to-r from-[#DB2777] to-[#EA580C] px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-[0_3px_0_#831843] transition-transform active:translate-y-0.5"
                          >
                            <Camera className="h-4 w-4" />
                            <span>Ir ao Instagram (+{mission.rewardGems} Gemas)</span>
                          </button>
                        ) : mission.kind === 'share_game' ? (
                          <button
                            type="button"
                            data-testid="daily-mission-action-share"
                            onClick={handleShareGameAction}
                            className="font-display flex items-center gap-1.5 rounded-xl border-2 border-[#BAE6FD] bg-gradient-to-r from-[#0284C7] to-[#2563EB] px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-[0_3px_0_#1E3A8A] transition-transform active:translate-y-0.5"
                          >
                            <Share2 className="h-4 w-4" />
                            <span>Compartilhar (+{mission.rewardGems} Gemas)</span>
                          </button>
                        ) : isReady ? (
                          <button
                            type="button"
                            data-testid={`daily-mission-claim-${mission.kind}`}
                            onClick={() => {
                              const res = onClaimDailyMission(mission.id);
                              if (res.ok) {
                                setToast({
                                  text: `${res.title}: +${res.gems} Gemas e +${res.souls} Almas!`,
                                  tone: 'gold',
                                });
                              }
                            }}
                            className="font-display flex items-center gap-1.5 rounded-xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-[0_3px_0_#991B1B] transition-transform active:translate-y-0.5"
                          >
                            <Gem className="h-3.5 w-3.5" />
                            <span>Resgatar +{mission.rewardGems} Gemas</span>
                          </button>
                        ) : (
                          <span className="font-mono-tabular rounded-xl border border-[#334155] bg-[#080D1A] px-3.5 py-2 text-xs font-bold text-[#94A3B8]">
                            Em andamento
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Official Game Instagram Community Tab / Instant Daily Gem Reward */}
              <div className="rounded-2xl border-2 border-[#EC4899]/55 bg-gradient-to-r from-[#500724]/80 via-[#1E1B4B]/90 to-[#0F172A] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#F472B6]/60 bg-gradient-to-br from-[#DB2777] via-[#EA580C] to-[#FACC15] text-white">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-display text-base font-bold text-white">
                        Aba Oficial · Instagram do Ember Ring (@emberringdefense)
                      </div>
                      <p className="mt-0.5 text-xs text-[#FBCFE8]">
                        Só clicar para visitar nossa página do Instagram já garante Gemas Arcanas instantâneas todos os dias!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid="store-instagram-tab-btn"
                    onClick={handleInstagramAction}
                    className={`font-display flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-xs font-bold whitespace-nowrap transition-transform active:translate-y-0.5 ${
                      hud.instagramBonusClaimedToday && !instagramMissionUnclaimed
                        ? 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] hover:border-[#F472B6]'
                        : 'border-[#FBCFE8] bg-gradient-to-r from-[#DB2777] to-[#EA580C] text-white shadow-[0_3px_0_#831843]'
                    }`}
                  >
                    <Camera className="h-4 w-4" />
                    <span>
                      {hud.instagramBonusClaimedToday && !instagramMissionUnclaimed
                        ? 'Ver Página @emberringdefense'
                        : `Curtir Instagram (+${instagramDailyGems} Gemas)`}
                    </span>
                  </button>
                </div>

                {instagramPanelOpen && (
                  <div
                    data-testid="instagram-community-card"
                    className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F472B6]/35 bg-[#080D1A]/90 px-3.5 py-2.5 text-xs"
                  >
                    <div className="text-[#E2E8F0]">
                      <strong className="text-[#F472B6]">@emberringdefense</strong> · Novidades de heróis, pets guardiões, códigos de gemas e eventos de temporada.
                    </div>
                    <a
                      href="https://instagram.com/emberringdefense"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#FACC15] underline hover:text-white"
                    >
                      Abrir perfil oficial
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE PLAY GEMS PACKS */}
          {activeTab === 'gems' && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-[#CBD5E1]">
                Use <strong className="text-[#00D4FF]">Gemas Arcanas</strong> para abrir Baús de Relíquias, comprar Itens Táticos de combate ou trocar por Almas de Brasa.
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gemProducts.map((product) => (
                  <div
                    key={product.sku}
                    className="flex flex-col justify-between rounded-2xl border-2 bg-[#0F172A] p-4 shadow-[0_6px_0_rgba(2,6,23,0.85)]"
                    style={{ borderColor: `${product.accentColor}88` }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#050A14]"
                            style={{ color: product.accentColor }}
                          >
                            <Gem className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-display text-sm font-bold text-white">
                              {product.title}
                            </div>
                            <div className="font-mono-tabular text-xs font-extrabold text-[#00D4FF]">
                              +{product.rewards.gems} Gemas
                            </div>
                          </div>
                        </div>
                        {product.bonusLabel && (
                          <span
                            className="text-[10px] font-extrabold uppercase"
                            style={{ color: product.accentColor }}
                          >
                            {product.bonusLabel}
                          </span>
                        )}
                      </div>
                      <p className="mt-2.5 text-xs text-[#94A3B8]">{product.subtitle}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <span className="font-mono-tabular text-[10px] text-[#64748B]">
                        {product.sku}
                      </span>
                      <button
                        type="button"
                        data-testid={`store-buy-${product.sku}`}
                        onClick={() => {
                          soundEngine.playClick();
                          setCheckoutProduct(product);
                        }}
                        className="font-display rounded-xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#0284C7] to-[#2563EB] px-4 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-[0_3px_0_#1E3A8A] hover:brightness-110 active:translate-y-0.5"
                      >
                        {product.priceBrl}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RELIC CHESTS (GACHA) & 3-SLOT ACTIVE RELIC LOADOUT */}
          {activeTab === 'relics' && (
            <div className="flex flex-col gap-4">
              {/* Chest Opener Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#C084FC]/60 bg-gradient-to-r from-[#2E1065]/90 to-[#0F172A] p-4">
                <div>
                  <div className="font-display text-lg font-bold text-white">
                    Forja de Baús de Relíquias
                  </div>
                  <p className="mt-0.5 text-xs text-[#E9D5FF]">
                    Colete 8 Relíquias poderosas (Rara a Mítica). Repetidas evoluem o nível até Nv.5!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid="store-open-chest-1"
                    disabled={hud.chestKeys < 1 && hud.gems < RELIC_CHEST_SINGLE_COST}
                    onClick={() => {
                      const res = onOpenRelicChest(1);
                      if (res.ok) {
                        setLastPulls(res.pulls);
                        setToast({ text: res.message, tone: 'gold' });
                      } else {
                        setToast({ text: res.message, tone: 'rose' });
                      }
                    }}
                    className="font-display flex items-center gap-1.5 rounded-xl border-2 border-[#E9D5FF] bg-[#7E22CE] px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-[0_3px_0_#4C1D95] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {hud.chestKeys >= 1 ? (
                      <>
                        <KeyRound className="h-3.5 w-3.5" />
                        <span>Abrir 1x (1 Chave)</span>
                      </>
                    ) : (
                      <>
                        <Gem className="h-3.5 w-3.5" />
                        <span>Abrir 1x ({RELIC_CHEST_SINGLE_COST} Gemas)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    data-testid="store-open-chest-5"
                    disabled={hud.gems < RELIC_CHEST_FIVE_COST}
                    onClick={() => {
                      const res = onOpenRelicChest(5);
                      if (res.ok) {
                        setLastPulls(res.pulls);
                        setToast({ text: res.message, tone: 'gold' });
                      } else {
                        setToast({ text: res.message, tone: 'rose' });
                      }
                    }}
                    className="font-display flex items-center gap-1.5 rounded-xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-[0_3px_0_#991B1B] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Abrir 5x ({RELIC_CHEST_FIVE_COST} Gemas · Épica+)</span>
                  </button>
                </div>
              </div>

              {/* Latest Pull Reveal Strip */}
              {lastPulls && lastPulls.length > 0 && (
                <div
                  data-testid="chest-pull-reveal"
                  className="rounded-2xl border-2 border-[#FACC15] bg-[#080D1A] p-3.5"
                >
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#FACC15]">
                    <span>Resultado do Baú</span>
                    <button
                      type="button"
                      onClick={() => setLastPulls(null)}
                      className="text-[11px] text-[#94A3B8] hover:text-white"
                    >
                      Ocultar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                    {lastPulls.map((pull, idx) => {
                      const spec = RELIC_SPECS[pull.relicId];
                      const rar = RELIC_RARITY_LABELS[spec.rarity];
                      return (
                        <div
                          key={`${pull.relicId}-${idx}`}
                          className="rounded-xl border bg-[#0F172A] p-2.5 text-center"
                          style={{ borderColor: rar.color }}
                        >
                          <div className="text-[10px] font-extrabold uppercase" style={{ color: rar.color }}>
                            {rar.label}
                          </div>
                          <div className="mt-0.5 font-display text-xs font-bold text-white">
                            {spec.name}
                          </div>
                          <div className="mt-1 text-[10px] font-bold text-[#FACC15]">
                            {pull.bonusGems > 0
                              ? `Máx. (+${pull.bonusGems} Gemas)`
                              : pull.isNew
                                ? 'NOVA · Nv.1'
                                : `Evoluiu p/ Nv.${pull.newLevel}!`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Equipped Relics Summary */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-display text-sm font-bold text-white">
                  Relíquias Equipadas ({hud.equippedRelics.length}/{MAX_EQUIPPED_RELICS})
                </div>
                <span className="text-xs text-[#94A3B8]">
                  Clique em uma relíquia desbloqueada para equipar ou remover
                </span>
              </div>

              {/* Full 8-Relic Grid */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {RELIC_ORDER.map((relicId) => {
                  const spec = RELIC_SPECS[relicId];
                  const rar = RELIC_RARITY_LABELS[spec.rarity];
                  const level = hud.ownedRelics[relicId] ?? 0;
                  const owned = level > 0;
                  const equipped = hud.equippedRelics.includes(relicId);
                  return (
                    <button
                      key={relicId}
                      type="button"
                      data-testid={`relic-card-${relicId}`}
                      disabled={!owned}
                      onClick={() => {
                        const ok = onToggleEquipRelic(relicId);
                        if (!ok && owned && !equipped) {
                          setToast({
                            text: `Limite de ${MAX_EQUIPPED_RELICS} relíquias equipadas atingido. Remova uma primeiro.`,
                            tone: 'rose',
                          });
                        }
                      }}
                      className={`flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition-transform active:translate-y-0.5 ${
                        equipped
                          ? 'bg-[#162033]'
                          : owned
                            ? 'border-[#334155] bg-[#0F172A] hover:border-[#FACC15]'
                            : 'cursor-not-allowed border-[#1E293B] bg-[#080D1A]/70 opacity-65'
                      }`}
                      style={equipped ? { borderColor: rar.color } : undefined}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="text-[10px] font-extrabold uppercase"
                            style={{ color: rar.color }}
                          >
                            {rar.label}
                          </span>
                          <span className="font-mono-tabular text-[10px] font-bold text-[#FACC15]">
                            {owned ? `Nv.${level}/${spec.maxLevel}` : 'Bloqueada'}
                          </span>
                        </div>
                        <div className="mt-1 font-display text-sm font-bold text-white">
                          {spec.name}
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-[#CBD5E1]">
                          {spec.getEffectText(Math.max(1, level))}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] font-bold">
                        <span style={{ color: spec.accentColor }}>{spec.shortTag}</span>
                        {equipped ? (
                          <span className="inline-flex items-center gap-1 text-[#22C55E]">
                            <Check className="h-3.5 w-3.5" />
                            Equipada
                          </span>
                        ) : owned ? (
                          <span className="text-[#FACC15]">Equipar</span>
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-[#64748B]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TACTICAL BATTLE ITEMS & 10-TIER SEASON PASS */}
          {activeTab === 'pass' && (
            <div className="flex flex-col gap-5">
              {/* Tactical Consumables & Souls Exchange */}
              <section>
                <h3 className="font-display text-sm font-bold text-white">
                  Itens Táticos de Combate (Ative durante a batalha)
                </h3>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {CONSUMABLE_ORDER.map((id) => {
                    const spec = CONSUMABLE_SPECS[id];
                    const ownedQty = hud.consumables[id] ?? 0;
                    const canBuy = hud.gems >= spec.gemCost;
                    return (
                      <div
                        key={id}
                        className="flex flex-col justify-between rounded-2xl border border-[#334155] bg-[#0F172A] p-3.5"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="font-display text-sm font-bold"
                              style={{ color: spec.accentColor }}
                            >
                              {spec.name}
                            </span>
                            <span className="font-mono-tabular text-xs font-bold text-white">
                              x{ownedQty}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] leading-snug text-[#CBD5E1]">
                            {spec.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          data-testid={`store-buy-consumable-${id}`}
                          disabled={!canBuy}
                          onClick={() => {
                            if (onBuyConsumable(id)) {
                              setToast({ text: `+1 ${spec.name} adicionado à mochila!`, tone: 'cyan' });
                            }
                          }}
                          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-[#00D4FF]/60 bg-[#082F49] px-3 py-1.5 text-xs font-bold text-[#BAE6FD] hover:bg-[#0C4A6E] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Gem className="h-3.5 w-3.5" />
                          <span>Comprar ({spec.gemCost} Gemas)</span>
                        </button>
                      </div>
                    );
                  })}

                  {/* Ember Souls Bundle for Gems */}
                  <div className="flex flex-col justify-between rounded-2xl border border-[#FACC15]/40 bg-[#0F172A] p-3.5">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-sm font-bold text-[#FACC15]">
                          +{SOULS_BUNDLE_AMOUNT} Almas de Brasa
                        </span>
                        <Flame className="h-4 w-4 text-[#FACC15]" />
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-[#CBD5E1]">
                        Converta Gemas Arcanas em Almas de Brasa para acelerar a Árvore de Talentos.
                      </p>
                    </div>
                    <button
                      type="button"
                      data-testid="store-buy-souls-bundle"
                      disabled={hud.gems < SOULS_BUNDLE_GEM_COST}
                      onClick={() => {
                        if (onBuySoulsBundle()) {
                          setToast({
                            text: `+${SOULS_BUNDLE_AMOUNT} Almas de Brasa adicionadas!`,
                            tone: 'gold',
                          });
                        }
                      }}
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-[#FACC15]/60 bg-[#422006] px-3 py-1.5 text-xs font-bold text-[#FEF08A] hover:bg-[#713F12] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Gem className="h-3.5 w-3.5" />
                      <span>Trocar ({SOULS_BUNDLE_GEM_COST} Gemas)</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* 10-Tier Season Pass */}
              <section>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm font-bold text-white">
                      Passe de Temporada · Nível {currentPassTier}/10 ({hud.seasonPassXp} XP)
                    </h3>
                    <p className="text-[11px] text-[#94A3B8]">
                      Ganhe XP derrotando inimigos, chefes e concluindo fases.
                    </p>
                  </div>
                  {!hud.seasonPassPremium && (
                    <button
                      type="button"
                      onClick={() => {
                        const passProd = PLAY_STORE_PRODUCTS.find(
                          (p) => p.sku === 'com.emberring.season_pass'
                        );
                        if (passProd) setCheckoutProduct(passProd);
                      }}
                      className="font-display rounded-xl border-2 border-[#E9D5FF] bg-[#7E22CE] px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-[0_3px_0_#4C1D95]"
                    >
                      Ativar Premium · R$ 24,90
                    </button>
                  )}
                </div>

                <div className="mt-2.5 flex flex-col gap-2">
                  {SEASON_PASS_TIERS.map((t) => {
                    const unlocked = currentPassTier >= t.tier;
                    const freeClaimed = hud.claimedFreePassTiers.includes(t.tier);
                    const premClaimed = hud.claimedPremiumPassTiers.includes(t.tier);
                    return (
                      <div
                        key={t.tier}
                        className={`grid grid-cols-1 items-center gap-2 rounded-2xl border p-3 sm:grid-cols-[88px_1fr_1fr] ${
                          unlocked
                            ? 'border-[#FACC15]/45 bg-[#0F172A]'
                            : 'border-[#1E293B] bg-[#080D1A]/80 opacity-75'
                        }`}
                      >
                        <div className="font-mono-tabular text-xs font-bold text-white">
                          <div>Nível {t.tier}</div>
                          <div className="text-[10px] text-[#94A3B8]">{t.xpRequired} XP</div>
                        </div>

                        {/* Free Track */}
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#080D1A] px-3 py-2">
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase text-[#94A3B8]">Grátis</div>
                            <div className="truncate text-xs font-semibold text-white">
                              {t.free.label}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={!unlocked || freeClaimed}
                            onClick={() => {
                              if (onClaimSeasonPassReward(t.tier, 'free')) {
                                setToast({ text: `Recompensa Grátis Nv.${t.tier} resgatada!`, tone: 'cyan' });
                              }
                            }}
                            className="shrink-0 rounded-lg border border-[#334155] bg-[#1E293B] px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-45"
                          >
                            {freeClaimed ? 'Coletado' : unlocked ? 'Resgatar' : 'Bloq.'}
                          </button>
                        </div>

                        {/* Premium Track */}
                        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#C084FC]/40 bg-[#1E1038]/60 px-3 py-2">
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase text-[#E9D5FF]">Premium</div>
                            <div className="truncate text-xs font-semibold text-[#FEF08A]">
                              {t.premium.label}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={!unlocked || !hud.seasonPassPremium || premClaimed}
                            onClick={() => {
                              if (onClaimSeasonPassReward(t.tier, 'premium')) {
                                setToast({ text: `Recompensa Premium Nv.${t.tier} resgatada!`, tone: 'gold' });
                              }
                            }}
                            className="shrink-0 rounded-lg border border-[#FACC15]/60 bg-[#422006] px-2.5 py-1 text-[11px] font-bold text-[#FEF08A] disabled:opacity-45"
                          >
                            {premClaimed
                              ? 'Coletado'
                              : !hud.seasonPassPremium
                                ? 'VIP Passe'
                                : unlocked
                                  ? 'Resgatar'
                                  : 'Bloq.'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* TAB 5: COSMETICS (RING SKINS & FX STYLES) */}
          {activeTab === 'cosmetics' && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-white">
                  <Palette className="h-4 w-4 text-[#00D4FF]" />
                  <span>Skins do Anel Central (Almas de Brasa)</span>
                </h3>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {(Object.keys(RING_SKINS) as RingSkinId[]).map((skinId) => {
                    const skin = RING_SKINS[skinId];
                    const owned = hud.unlockedCosmetics.includes(`ring:${skinId}`);
                    const equipped = hud.equippedRingSkin === skinId;
                    const isMilestoneLocked = !owned && skin.milestoneLevel !== undefined;
                    const canBuy = !isMilestoneLocked && hud.emberSouls >= skin.cost;
                    return (
                      <div
                        key={skinId}
                        className={`flex items-center justify-between gap-3 rounded-2xl border-2 bg-[#0F172A] px-3.5 py-3 ${
                          equipped ? 'border-[#00D4FF]' : 'border-[#334155]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-9 w-9 shrink-0 rounded-full border-2 border-white/25"
                            style={{ backgroundColor: skin.primaryColor }}
                          />
                          <div>
                            <div className="font-display text-sm font-bold text-white">
                              {skin.name}
                            </div>
                            <div className="text-[11px] text-[#94A3B8]">
                              {equipped
                                ? 'Equipada'
                                : owned
                                  ? 'Desbloqueada'
                                  : isMilestoneLocked
                                    ? `Exclusivo · Marco Nv.${skin.milestoneLevel}`
                                    : `${skin.cost} Almas`}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!owned && !canBuy}
                          onClick={() => {
                            soundEngine.playClick();
                            onBuyOrEquipRingSkin(skinId);
                          }}
                          className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold whitespace-nowrap ${
                            equipped
                              ? 'border-[#00D4FF] bg-[#082F49] text-[#00D4FF]'
                              : owned
                                ? 'border-[#FACC15] bg-[#422006] text-[#FACC15]'
                                : canBuy
                                  ? 'border-[#22C55E] bg-[#14532D] text-[#86EFAC]'
                                  : 'cursor-not-allowed border-[#334155] bg-[#1E293B] text-[#64748B]'
                          }`}
                        >
                          {equipped
                            ? 'Ativo'
                            : owned
                              ? 'Equipar'
                              : isMilestoneLocked
                                ? `Marco Nv.${skin.milestoneLevel}`
                                : `${skin.cost} Almas`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-white">
                  <Sparkles className="h-4 w-4 text-[#FACC15]" />
                  <span>Efeitos de Impacto</span>
                </h3>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {(Object.keys(FX_STYLES) as FxStyleId[]).map((fxId) => {
                    const fx = FX_STYLES[fxId];
                    const owned = hud.unlockedCosmetics.includes(`fx:${fxId}`);
                    const equipped = hud.equippedFxStyle === fxId;
                    const isMilestoneLocked = !owned && fx.milestoneLevel !== undefined;
                    const canBuy = !isMilestoneLocked && hud.emberSouls >= fx.cost;
                    return (
                      <div
                        key={fxId}
                        className={`flex items-center justify-between gap-3 rounded-2xl border-2 bg-[#0F172A] px-3.5 py-3 ${
                          equipped ? 'border-[#FACC15]' : 'border-[#334155]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-9 w-9 shrink-0 rounded-xl border-2 border-white/25"
                            style={{ backgroundColor: fx.projectileTint }}
                          />
                          <div>
                            <div className="font-display text-sm font-bold text-white">
                              {fx.name}
                            </div>
                            <div className="text-[11px] text-[#94A3B8]">
                              {equipped
                                ? 'Ativo'
                                : owned
                                  ? 'Desbloqueado'
                                  : isMilestoneLocked
                                    ? `Exclusivo · Marco Nv.${fx.milestoneLevel}`
                                    : `${fx.cost} Almas`}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!owned && !canBuy}
                          onClick={() => {
                            soundEngine.playClick();
                            onBuyOrEquipFxStyle(fxId);
                          }}
                          className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold whitespace-nowrap ${
                            equipped
                              ? 'border-[#FACC15] bg-[#422006] text-[#FACC15]'
                              : owned
                                ? 'border-[#00D4FF] bg-[#082F49] text-[#00D4FF]'
                                : canBuy
                                  ? 'border-[#22C55E] bg-[#14532D] text-[#86EFAC]'
                                  : 'cursor-not-allowed border-[#334155] bg-[#1E293B] text-[#64748B]'
                          }`}
                        >
                          {equipped
                            ? 'Ativo'
                            : owned
                              ? 'Equipar'
                              : isMilestoneLocked
                                ? `Marco Nv.${fx.milestoneLevel}`
                                : `${fx.cost} Almas`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GOOGLE PLAY BILLING SANDBOX CHECKOUT MODAL */}
      {checkoutProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Checkout Simulado Google Play"
          data-testid="playstore-checkout-modal"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#34D399] bg-[#0F172A] shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#080D1A] px-5 py-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#34D399]">
                <Shield className="h-4 w-4" />
                <span>Google Play · Checkout Simulado</span>
              </div>
              <button
                type="button"
                aria-label="Cancelar compra"
                onClick={() => setCheckoutProduct(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1E293B] text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-lg font-bold text-white">
                    {checkoutProduct.title}
                  </div>
                  <div className="font-mono-tabular mt-0.5 text-[11px] text-[#64748B]">
                    SKU: {checkoutProduct.sku}
                  </div>
                </div>
                <div className="font-mono-tabular text-xl font-extrabold text-[#FACC15]">
                  {checkoutProduct.priceBrl}
                </div>
              </div>

              <p className="mt-3 rounded-xl border border-white/10 bg-[#080D1A] p-3 text-xs leading-relaxed text-[#CBD5E1]">
                {checkoutProduct.subtitle}
              </p>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-[#34D399]/30 bg-[#052E16]/40 px-3 py-2 text-[11px] text-[#A7F3D0]">
                <span>Forma de Pagamento</span>
                <span className="font-bold">Play Billing Sandbox (R$ 0,00 real)</span>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setCheckoutProduct(null);
                  }}
                  className="rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-xs font-bold text-[#CBD5E1] hover:bg-[#334155]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  data-testid="playstore-confirm-buy"
                  onClick={handleConfirmSandboxPurchase}
                  className="font-display flex items-center gap-2 rounded-xl border-2 border-[#A7F3D0] bg-[#059669] px-5 py-2.5 text-sm font-bold whitespace-nowrap text-white shadow-[0_3px_0_#065F46] hover:bg-[#10B981] active:translate-y-0.5"
                >
                  <Swords className="h-4 w-4" />
                  <span>Confirmar Compra</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
