import React, { useEffect, useState } from 'react';
import {
  Award,
  Check,
  Crown,
  Lock,
  Palette,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { soundEngine } from '../game/audio';
import {
  computeMilestonePassiveBonuses,
  MAX_PLAYER_LEVEL,
  MILESTONE_CATALOG,
  MILESTONE_RARITY_LABELS,
  MilestoneRewardType,
} from '../game/milestones';
import {
  FX_STYLES,
  FxStyleId,
  HudSnapshot,
  RING_SKINS,
  RingSkinId,
} from '../game/types';

type MilestoneFilter = 'all' | 'aesthetic' | 'passive' | 'ready';

interface MilestoneModalProps {
  isOpen: boolean;
  hud: HudSnapshot;
  onClose: () => void;
  onClaimMilestone: (level: number) => {
    ok: boolean;
    title: string;
    rewardType: MilestoneRewardType;
    gems: number;
    souls: number;
    unlockedSkin?: RingSkinId;
    unlockedFx?: FxStyleId;
  };
  onEquipRingSkin: (skinId: RingSkinId) => void;
  onEquipFxStyle: (fxId: FxStyleId) => void;
}

const FILTER_TABS: { id: MilestoneFilter; label: string }[] = [
  { id: 'all', label: 'Todos (10)' },
  { id: 'aesthetic', label: 'Estética Rara' },
  { id: 'passive', label: 'Buffs Passivos' },
  { id: 'ready', label: 'Prontos' },
];

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  hud,
  onClose,
  onClaimMilestone,
  onEquipRingSkin,
  onEquipFxStyle,
}) => {
  const [filter, setFilter] = useState<MilestoneFilter>('all');
  const [toast, setToast] = useState<string | null>(null);

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
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMaxLevel = hud.playerLevel >= MAX_PLAYER_LEVEL;
  const xpSpan = Math.max(1, hud.playerNextLevelXp - hud.playerCurrentLevelXp);
  const xpIntoLevel = Math.max(0, hud.playerXp - hud.playerCurrentLevelXp);
  const xpPct = isMaxLevel ? 100 : Math.min(100, Math.round((xpIntoLevel / xpSpan) * 100));
  const xpRemaining = Math.max(0, hud.playerNextLevelXp - hud.playerXp);

  const activeBonuses = computeMilestonePassiveBonuses(hud.claimedMilestoneLevels);
  const activeBonusParts: string[] = [];
  if (activeBonuses.castleMaxHpBonus > 0) {
    activeBonusParts.push(`+${activeBonuses.castleMaxHpBonus} HP Castelo`);
  }
  if (activeBonuses.castleRegenPerSec > 0) {
    activeBonusParts.push(`+${activeBonuses.castleRegenPerSec} HP/s Regen.`);
  }
  if (activeBonuses.startingEssenceBonus > 0) {
    activeBonusParts.push(`+${activeBonuses.startingEssenceBonus} Essência Inicial`);
  }
  if (activeBonuses.globalDamageBonusPct > 0) {
    activeBonusParts.push(`+${Math.round(activeBonuses.globalDamageBonusPct * 100)}% Dano Global`);
  }
  if (activeBonuses.attackSpeedBonusPct > 0) {
    activeBonusParts.push(`+${Math.round(activeBonuses.attackSpeedBonusPct * 100)}% Vel. Ataque`);
  }
  if (activeBonuses.critChanceBonus > 0) {
    activeBonusParts.push(`+${Math.round(activeBonuses.critChanceBonus * 100)}% Crítico`);
  }
  if (activeBonuses.spellCooldownReductionPct > 0) {
    activeBonusParts.push(
      `-${Math.round(activeBonuses.spellCooldownReductionPct * 100)}% Recarga Magias`
    );
  }
  if (activeBonuses.allyXpBonusPct > 0) {
    activeBonusParts.push(`+${Math.round(activeBonuses.allyXpBonusPct * 100)}% XP Aliados`);
  }

  const visibleMilestones = MILESTONE_CATALOG.filter((m) => {
    const claimed = hud.claimedMilestoneLevels.includes(m.level);
    const ready = hud.playerLevel >= m.level && !claimed;
    if (filter === 'aesthetic') return m.rewardType === 'aesthetic' || m.rewardType === 'mythic';
    if (filter === 'passive') return m.rewardType === 'passive' || m.rewardType === 'mythic';
    if (filter === 'ready') return ready;
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Marcos de Experiência do Jogador"
      data-testid="milestone-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-2.5 sm:p-4 backdrop-blur-sm"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 border-[#C084FC] bg-[#0B1120] shadow-[0_18px_56px_rgba(0,0,0,0.95)]">
        {/* Top Modal Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#080D1A] px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#C084FC]/60 bg-[#2E1065] text-[#E9D5FF]">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white sm:text-xl">
                Marcos de Experiência
              </h2>
              <p className="text-xs font-medium text-[#94A3B8]">
                Recompensas raras de estética e buffs passivos permanentes por nível da sua conta
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="milestone-close"
            aria-label="Fechar Marcos de Experiência"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#334155] bg-[#1E293B] text-white hover:border-[#C084FC] hover:bg-[#334155]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Player Level & Account XP Summary Strip */}
        <section className="border-b border-white/10 bg-[#0F172A]/90 px-4 py-3.5 sm:px-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span
                data-testid="milestone-player-level"
                className="font-display text-xl font-bold text-[#FACC15]"
              >
                Nível do Jogador {hud.playerLevel}
              </span>
              <span className="font-mono-tabular text-xs font-semibold text-[#CBD5E1]">
                {isMaxLevel
                  ? `${hud.playerXp} XP · Nível Máximo`
                  : `${hud.playerXp} XP · Faltam ${xpRemaining} XP para o Nv.${hud.playerLevel + 1}`}
              </span>
            </div>
            <div className="font-mono-tabular text-xs font-bold text-[#E9D5FF]">
              {hud.claimedMilestoneLevels.length}/{MILESTONE_CATALOG.length} marcos resgatados
            </div>
          </div>

          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#020617]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C084FC] via-[#38BDF8] to-[#FACC15] transition-all"
              style={{ width: `${xpPct}%` }}
            />
          </div>

          {/* Unboxed Active Permanent Buffs Summary */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#CBD5E1]">
            <span className="font-bold text-[#94A3B8]">Buffs Passivos Ativos:</span>
            {activeBonusParts.length > 0 ? (
              activeBonusParts.map((part, i) => (
                <React.Fragment key={part}>
                  {i > 0 && (
                    <span aria-hidden="true" className="text-[#475569]">
                      ·
                    </span>
                  )}
                  <span className="font-mono-tabular font-semibold text-[#86EFAC]">{part}</span>
                </React.Fragment>
              ))
            ) : (
              <span className="text-[#94A3B8]">
                Suba para o Nível 2 derrotando inimigos, fundindo aliados e vencendo fases para ativar seu primeiro buff.
              </span>
            )}
          </div>
        </section>

        {/* Interactive Filter Tabs */}
        <nav
          aria-label="Filtrar Marcos"
          className="flex items-center gap-1.5 overflow-x-auto border-b border-white/10 bg-[#0A0F1D] px-4 py-2.5 sm:px-5"
        >
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.id;
            const readyLabel =
              tab.id === 'ready' && hud.readyMilestonesCount > 0
                ? ` (${hud.readyMilestonesCount})`
                : '';
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`milestone-filter-${tab.id}`}
                onClick={() => {
                  soundEngine.playClick();
                  setFilter(tab.id);
                }}
                className={`rounded-xl border px-3.5 py-2 text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'border-[#C084FC] bg-[#2E1065] text-[#F3E8FF]'
                    : 'border-[#1E293B] bg-[#0F172A] text-[#94A3B8] hover:border-[#475569] hover:text-white'
                }`}
              >
                {tab.label}
                {readyLabel}
              </button>
            );
          })}
        </nav>

        {/* Feedback Toast */}
        {toast && (
          <div
            data-testid="milestone-toast"
            className="mx-4 mt-3 rounded-xl border border-[#FACC15]/60 bg-[#422006]/85 px-3.5 py-2 text-xs font-bold text-[#FEF08A] sm:mx-5"
          >
            {toast}
          </div>
        )}

        {/* Scrollable Milestone Progression Track */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {visibleMilestones.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0F172A]/80 px-5 py-8 text-center text-sm text-[#94A3B8]">
              Nenhum marco pronto para resgate no momento. Continue jogando fases para acumular XP da conta!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleMilestones.map((m) => {
                const claimed = hud.claimedMilestoneLevels.includes(m.level);
                const unlocked = hud.playerLevel >= m.level;
                const ready = unlocked && !claimed;
                const levelsLeft = Math.max(0, m.level - hud.playerLevel);
                const rarityInfo = MILESTONE_RARITY_LABELS[m.rarity];
                const ringSkin = m.unlockRingSkin ? RING_SKINS[m.unlockRingSkin] : null;
                const fxStyle = m.unlockFxStyle ? FX_STYLES[m.unlockFxStyle] : null;
                const isSkinEquipped =
                  Boolean(m.unlockRingSkin) && hud.equippedRingSkin === m.unlockRingSkin;
                const isFxEquipped =
                  Boolean(m.unlockFxStyle) && hud.equippedFxStyle === m.unlockFxStyle;

                return (
                  <div
                    key={m.id}
                    data-testid={`milestone-card-lv${m.level}`}
                    className={`flex flex-col justify-between gap-3 rounded-2xl border-2 p-4 sm:flex-row sm:items-center ${
                      ready
                        ? 'border-[#FACC15] bg-[#162033]'
                        : claimed
                          ? 'border-[#1E293B] bg-[#0B1324]'
                          : 'border-[#1E293B] bg-[#080D1A]/85 opacity-85'
                    }`}
                  >
                    {/* Left: Level Crest + Visual Preview + Description */}
                    <div className="flex min-w-0 flex-1 items-start gap-3.5">
                      {/* Level Crest / Rare Cosmetic Swatch */}
                      <div
                        className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border-2 bg-[#050A14]"
                        style={{
                          borderColor: unlocked ? m.accentColor : '#334155',
                        }}
                      >
                        {ringSkin ? (
                          <span
                            aria-hidden="true"
                            className="h-7 w-7 rounded-full border-2"
                            style={{
                              borderColor: ringSkin.primaryColor,
                              background: `radial-gradient(circle, ${ringSkin.secondaryColor}55 0%, #050A14 75%)`,
                              boxShadow: `0 0 10px ${ringSkin.glowColor}`,
                            }}
                          />
                        ) : fxStyle ? (
                          <span
                            aria-hidden="true"
                            className="h-7 w-7 rounded-lg border-2"
                            style={{
                              borderColor: fxStyle.slashTint,
                              background: `linear-gradient(135deg, ${fxStyle.projectileTint}, ${fxStyle.slashTint})`,
                            }}
                          />
                        ) : m.rewardType === 'mythic' ? (
                          <Crown className="h-6 w-6 text-[#FF2E4C]" />
                        ) : (
                          <Shield className="h-6 w-6" style={{ color: m.accentColor }} />
                        )}
                        <span className="font-mono-tabular mt-0.5 text-[10px] font-extrabold text-white">
                          Nv.{m.level}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Unboxed Metadata Line */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-bold">
                          <span style={{ color: rarityInfo.color }}>{rarityInfo.label}</span>
                          <span aria-hidden="true" className="text-[#475569]">
                            ·
                          </span>
                          <span className="text-[#94A3B8]">{m.subtitle}</span>
                          {m.bonusGems && (
                            <>
                              <span aria-hidden="true" className="text-[#475569]">
                                ·
                              </span>
                              <span className="font-mono-tabular text-[#00D4FF]">
                                +{m.bonusGems} Gemas
                              </span>
                            </>
                          )}
                          {m.bonusSouls && (
                            <>
                              <span aria-hidden="true" className="text-[#475569]">
                                ·
                              </span>
                              <span className="font-mono-tabular text-[#FACC15]">
                                +{m.bonusSouls} Almas
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="mt-0.5 font-display text-base font-bold text-white">
                          {m.title}
                        </h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#CBD5E1]">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Single-Line Action Button */}
                    <div className="flex shrink-0 items-center justify-end gap-2">
                      {ready ? (
                        <button
                          type="button"
                          data-testid={`milestone-claim-lv${m.level}`}
                          onClick={() => {
                            const res = onClaimMilestone(m.level);
                            if (res.ok) {
                              setToast(
                                res.unlockedSkin || res.unlockedFx
                                  ? `${res.title} desbloqueado e equipado automaticamente!`
                                  : `Buff permanente ${res.title} ativado!`
                              );
                            }
                          }}
                          className="font-display flex items-center gap-1.5 rounded-xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0 text-white shadow-[0_3px_0_#991B1B] transition-transform active:translate-y-0.5"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Resgatar Marco</span>
                        </button>
                      ) : claimed && m.unlockRingSkin ? (
                        <button
                          type="button"
                          data-testid={`milestone-equip-skin-${m.unlockRingSkin}`}
                          disabled={isSkinEquipped}
                          onClick={() => {
                            soundEngine.playClick();
                            onEquipRingSkin(m.unlockRingSkin!);
                            setToast(`Skin ${m.title} equipada no Anel Central!`);
                          }}
                          className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0 ${
                            isSkinEquipped
                              ? 'cursor-default border-[#22C55E]/50 bg-[#14532D]/40 text-[#4ADE80]'
                              : 'border-[#38BDF8] bg-[#082F49] text-[#BAE6FD] hover:bg-[#0C4A6E]'
                          }`}
                        >
                          {isSkinEquipped ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Visual Equipado</span>
                            </>
                          ) : (
                            <>
                              <Palette className="h-3.5 w-3.5" />
                              <span>Equipar Anel</span>
                            </>
                          )}
                        </button>
                      ) : claimed && m.unlockFxStyle ? (
                        <button
                          type="button"
                          data-testid={`milestone-equip-fx-${m.unlockFxStyle}`}
                          disabled={isFxEquipped}
                          onClick={() => {
                            soundEngine.playClick();
                            onEquipFxStyle(m.unlockFxStyle!);
                            setToast(`Efeito ${m.title} equipado nos ataques!`);
                          }}
                          className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0 ${
                            isFxEquipped
                              ? 'cursor-default border-[#22C55E]/50 bg-[#14532D]/40 text-[#4ADE80]'
                              : 'border-[#C084FC] bg-[#2E1065] text-[#E9D5FF] hover:bg-[#4C1D95]'
                          }`}
                        >
                          {isFxEquipped ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Efeito Equipado</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Equipar Efeito</span>
                            </>
                          )}
                        </button>
                      ) : claimed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#22C55E]/40 bg-[#14532D]/40 px-4 py-2 text-xs font-bold whitespace-nowrap text-[#4ADE80]">
                          <Check className="h-3.5 w-3.5" />
                          Buff Ativo
                        </span>
                      ) : (
                        <span className="font-mono-tabular inline-flex items-center gap-1.5 rounded-xl border border-[#334155] bg-[#0F172A] px-3.5 py-2 text-xs font-bold whitespace-nowrap text-[#94A3B8]">
                          <Lock className="h-3.5 w-3.5" />
                          {levelsLeft === 1 ? 'Falta 1 nível' : `Faltam ${levelsLeft} níveis`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
