import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  Flame,
  FlaskConical,
  Heart,
  Lock,
  Move,
  Music,
  Pause,
  Plus,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Tv,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../game/audio';
import { ALLY_ALBUM, getUnlockedAlliesForStage } from '../game/bestiaryData';
import {
  CONSUMABLE_ORDER,
  CONSUMABLE_SPECS,
  ConsumableId,
} from '../game/storeCatalog';
import {
  HERO_SPECS,
  HudSnapshot,
  MAX_HERO_LEVEL,
  PET_ORDER,
  PET_SPECS,
  PetKind,
  SPELL_SPECS,
  SpellKind,
  UNIT_SPECS,
  UnitKind,
} from '../game/types';
import { AllyPortraitSvg } from './AlbumArtwork';
import { HeroClassIcon } from './GameModals';
import { PetPortraitSvg } from './PetArtwork';

interface GameHUDProps {
  hud: HudSnapshot;
  onSelectUnit: (kind: UnitKind) => void;
  onQuickRecruit: (kind: UnitKind) => void;
  onStartCardDrag: (kind: UnitKind, clientX: number, clientY: number) => void;
  onToggleHeroReposition: () => void;
  onSelectActiveHero: (index: number) => void;
  onSelectPet: (pet: PetKind) => void;
  onRequestPetAd: (targetPet?: PetKind) => void;
  onActivateSpell: (kind: SpellKind) => void;
  onUseConsumable: (id: ConsumableId) => void;
  onTogglePause: () => void;
  onToggleMuteMusic: () => void;
  onToggleMuteSfx: () => void;
  onRotateRing: (delta: number) => void;
  onRestart: () => void;
}

const SPELL_ORDER: SpellKind[] = ['blade', 'shockwave', 'overcharge'];

function UnitIcon({ kind }: { kind: UnitKind }) {
  const ally = ALLY_ALBUM.find((a) => a.unitKind === kind);
  if (ally) {
    return <AllyPortraitSvg ally={ally} unlocked={true} className="h-8 w-8 rounded-lg" />;
  }
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden="true">
      <rect x="5" y="4" width="14" height="16" rx="5" fill="#2563EB" stroke="#020617" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" fill="#FACC15" />
    </svg>
  );
}

function SpellIcon({ kind }: { kind: SpellKind }) {
  if (kind === 'blade') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#00D4FF" strokeWidth="2" strokeDasharray="5 3" />
        <path d="M5 19L19 5" stroke="#00D4FF" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M6 14l4 4" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'shockwave') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#00D4FF" strokeWidth="2.2" />
        <circle cx="12" cy="12" r="5" fill="none" stroke="#BAE6FD" strokeWidth="2" />
        <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path d="M13 2L5 14h6l-1 8 9-12h-6z" fill="#FACC15" stroke="#422006" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  onSelectUnit,
  onQuickRecruit,
  onStartCardDrag,
  onToggleHeroReposition,
  onSelectActiveHero,
  onSelectPet,
  onRequestPetAd,
  onActivateSpell,
  onUseConsumable,
  onTogglePause,
  onToggleMuteMusic,
  onToggleMuteSfx,
  onRotateRing,
  onRestart,
}) => {
  const [ghostHp, setGhostHp] = useState(hud.baseHp);
  const [hoveredUnitKind, setHoveredUnitKind] = useState<UnitKind | null>(null);
  const [petPickerOpen, setPetPickerOpen] = useState(false);

  useEffect(() => {
    if (hud.baseHp < ghostHp) {
      const timer = setTimeout(() => setGhostHp(hud.baseHp), 280);
      return () => clearTimeout(timer);
    }
    setGhostHp(hud.baseHp);
  }, [hud.baseHp, ghostHp]);

  if (hud.phase === 'title') return null;

  const hpPercent = Math.max(0, Math.min(100, (hud.baseHp / hud.baseMaxHp) * 100));
  const ghostPercent = Math.max(hpPercent, Math.min(100, (ghostHp / hud.baseMaxHp) * 100));
  const hpFillClass =
    hpPercent > 60
      ? 'from-[#22C55E] to-[#4ADE80]'
      : hpPercent > 30
        ? 'from-[#F59E0B] to-[#FACC15]'
        : 'from-[#DC2626] to-[#FF2E4C]';

  const activeHero = hud.activeHeroes[hud.activeHeroIndex] ?? hud.activeHeroes[0];
  const activeHeroClass = activeHero?.heroClass ?? hud.selectedHeroClass;
  const heroSpec = HERO_SPECS[activeHeroClass];
  const isHeroMax = hud.heroLevel >= MAX_HERO_LEVEL;
  const xpSpan = Math.max(1, hud.heroNextLevelXp - hud.heroCurrentLevelXp);
  const xpPercent = isHeroMax
    ? 100
    : Math.max(0, Math.min(100, ((hud.heroXp - hud.heroCurrentLevelXp) / xpSpan) * 100));
  const isTrio = hud.activeHeroes.length > 1;

  const bannerToneClass =
    hud.activeBanner?.tone === 'crimson'
      ? 'border-[#FF2E4C] bg-[#450A0A]/92 text-[#FEF08A]'
      : hud.activeBanner?.tone === 'electric'
        ? 'border-[#00D4FF] bg-[#082F49]/92 text-[#E0F2FE]'
        : 'border-[#FACC15] bg-[#422006]/92 text-[#FEF08A]';

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-2.5 sm:p-4">
      {/* Top Unified HUD: Castle HP + Hero XP Bar(s) + Economy/Wave/Routes + Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        {/* Top-Left: Castle HP & Persistent Hero XP Bar(s) */}
        <div className="pointer-events-auto flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
          {/* Castle HP Bar */}
          <div
            aria-label="Vida do Castelo"
            className="flex items-center gap-2 rounded-2xl border-2 border-[#334155] bg-[#0F172A]/95 px-2.5 py-1.5 shadow-[0_4px_0_rgba(2,6,23,0.75)] sm:min-w-[195px]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#334155] bg-[#1E293B] text-[#FACC15]">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold leading-none">
                <span className="flex items-center gap-1 whitespace-nowrap text-white">
                  <span className="uppercase tracking-wide text-[#FACC15]">Castelo</span>
                  <span className="font-mono-tabular text-[11px] text-[#94A3B8]" data-testid="hud-level">
                    Nv.{hud.baseLevel}
                  </span>
                </span>
                <span className="font-mono-tabular whitespace-nowrap text-white" data-testid="hud-hp">
                  {Math.round(hud.baseHp)}/{hud.baseMaxHp}
                </span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-[#020617] bg-[#080D1A]">
                <div
                  className="absolute inset-0 origin-left bg-[#FF2E4C]/70 transition-transform duration-300"
                  style={{ transform: `scaleX(${ghostPercent / 100})` }}
                />
                <div
                  className={`relative h-full w-full origin-left rounded-full bg-gradient-to-r transition-transform duration-150 ${hpFillClass}`}
                  style={{ transform: `scaleX(${hpPercent / 100})` }}
                />
              </div>
            </div>
          </div>

          {/* Persistent Hero(es) Bar */}
          {isTrio ? (
            <div
              aria-label="Trio de Heróis"
              data-testid="hud-trio-bar"
              className="flex items-center gap-1.5 rounded-2xl border-2 border-[#FACC15]/70 bg-[#0F172A]/95 px-2 py-1 shadow-[0_4px_0_rgba(2,6,23,0.75)]"
            >
              {hud.activeHeroes.map((h, idx) => {
                const spec = HERO_SPECS[h.heroClass];
                const selected = idx === hud.activeHeroIndex;
                const span = Math.max(1, h.nextLevelXp - h.currentLevelXp);
                const pct =
                  h.level >= MAX_HERO_LEVEL
                    ? 100
                    : Math.max(0, Math.min(100, ((h.xp - h.currentLevelXp) / span) * 100));
                return (
                  <button
                    key={h.heroClass}
                    type="button"
                    tabIndex={-1}
                    data-testid={`trio-hero-${h.heroClass}`}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      soundEngine.playClick();
                      onSelectActiveHero(idx);
                    }}
                    className={`flex items-center gap-1.5 rounded-xl border px-2 py-1 text-left transition-colors ${
                      selected
                        ? 'border-[#00D4FF] bg-[#082F49]'
                        : 'border-[#334155] bg-[#080D1A]/85 hover:border-[#FACC15]/70'
                    }`}
                    title={`Selecionar/Mover ${spec.name} (Nv.${h.level}) livremente`}
                  >
                    <HeroClassIcon heroClass={h.heroClass} className="h-5 w-5" />
                    <div className="w-16 leading-none">
                      <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-white">
                        <span>{spec.name.slice(0, 3)}</span>
                        <span className="font-mono-tabular text-[#00D4FF]">Nv.{h.level}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#020617]">
                        <div
                          className="h-full origin-left rounded-full bg-gradient-to-r from-[#00D4FF] to-[#FACC15]"
                          style={{ transform: `scaleX(${pct / 100})` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                tabIndex={-1}
                data-testid="btn-move-hero"
                aria-label="Mover Herói livremente"
                onClick={(e) => {
                  e.currentTarget.blur();
                  soundEngine.playClick();
                  onToggleHeroReposition();
                }}
                className={`flex h-8 shrink-0 items-center gap-1 rounded-lg border px-2 text-[11px] font-bold whitespace-nowrap transition-colors ${
                  hud.heroRepositionMode
                    ? 'border-[#FACC15] bg-[#00D4FF] text-[#020617]'
                    : 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] hover:border-[#00D4FF]'
                }`}
              >
                <Move className="h-3.5 w-3.5" />
                <span>{hud.heroRepositionMode ? 'Pos. Livre' : 'Mover'}</span>
              </button>
            </div>
          ) : (
            <div
              aria-label="Experiência do Herói"
              className="flex items-center gap-2 rounded-2xl border-2 border-[#334155] bg-[#0F172A]/95 px-2.5 py-1.5 shadow-[0_4px_0_rgba(2,6,23,0.75)] sm:min-w-[245px]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#334155] bg-[#080D1A]">
                <HeroClassIcon heroClass={activeHeroClass} className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold leading-none">
                  <span className="flex items-center gap-1 whitespace-nowrap text-white">
                    <span>{heroSpec.name}</span>
                    <span className="font-mono-tabular text-[11px] text-[#00D4FF]" data-testid="hud-hero-level">
                      {isHeroMax ? 'MÁX' : `Nv.${hud.heroLevel}`}
                    </span>
                  </span>
                  <span className="font-mono-tabular whitespace-nowrap text-[11px] text-[#FACC15]" data-testid="hud-hero-xp">
                    {isHeroMax ? `${hud.heroXp} XP` : `${hud.heroXp}/${hud.heroNextLevelXp} XP`}
                  </span>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-[#020617] bg-[#080D1A]">
                  <div
                    className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[#00D4FF] to-[#FACC15] transition-transform duration-200"
                    style={{ transform: `scaleX(${xpPercent / 100})` }}
                  />
                </div>
              </div>
              <button
                type="button"
                tabIndex={-1}
                data-testid="btn-move-hero"
                aria-label="Reposicionar Herói no mapa"
                title="Reposicionar Herói livremente ou em slot"
                onClick={(e) => {
                  e.currentTarget.blur();
                  soundEngine.playClick();
                  onToggleHeroReposition();
                }}
                className={`flex h-8 shrink-0 items-center gap-1 rounded-lg border px-2 text-[11px] font-bold whitespace-nowrap transition-colors ${
                  hud.heroRepositionMode
                    ? 'border-[#FACC15] bg-[#00D4FF] text-[#020617]'
                    : 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] hover:border-[#00D4FF]'
                }`}
              >
                <Move className="h-3.5 w-3.5" />
                <span>{hud.heroRepositionMode ? 'Pos. Livre' : 'Mover'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Center Plaque: Essence · Stage/Wave · Routes/Gates · Score */}
        <div
          aria-label="Recursos e progresso"
          className="pointer-events-auto flex items-center justify-between gap-2.5 rounded-2xl border-2 border-[#334155] bg-[#0F172A]/95 px-3 py-1.5 shadow-[0_4px_0_rgba(2,6,23,0.75)] sm:justify-center sm:gap-3.5 sm:px-4"
        >
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
              <polygon points="12,2 20,9 16,21 8,21 4,9" fill="#FACC15" stroke="#422006" strokeWidth="2" />
            </svg>
            <div className="leading-none">
              <div className="text-[10px] font-bold tracking-wider text-[#FACC15] uppercase whitespace-nowrap">
                {hud.overchargeTimer > 0 ? 'Essência 1.5x' : 'Essência'}
              </div>
              <div
                className="font-mono-tabular text-base font-bold text-white sm:text-lg"
                data-testid="hud-essence"
              >
                {Math.round(hud.essence)}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-white/15" />

          <div className="leading-none text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold tracking-wider text-[#00D4FF] uppercase whitespace-nowrap">
              <span>Fase {hud.stage}</span>
              {hud.isConvergenceStage && (
                <span className="rounded bg-[#FACC15] px-1 py-0.5 text-[9px] text-[#020617]">TRIO</span>
              )}
              {hud.bossActive && (
                <span className="rounded bg-[#FF2E4C] px-1 py-0.5 text-[9px] text-[#FEF08A]">CHEFE</span>
              )}
            </div>
            <div className="font-mono-tabular text-sm font-bold whitespace-nowrap text-white sm:text-base" data-testid="hud-wave">
              Onda {hud.wave}/{hud.totalWavesInStage}
            </div>
          </div>

          <div className="h-6 w-px bg-white/15" />

          <div className="leading-none text-center">
            <div className="text-[10px] font-bold tracking-wider text-[#CBD5E1] uppercase whitespace-nowrap">
              Rotas Nv.{hud.routeLevel}
            </div>
            <div
              className="font-mono-tabular text-sm font-bold whitespace-nowrap text-[#FACC15] sm:text-base"
              data-testid="hud-routes"
            >
              {hud.openGatesCount}/{hud.maxRouteLevel} Portões
            </div>
          </div>

          <div className="hidden h-6 w-px bg-white/15 sm:block" />

          <div className="hidden leading-none text-right sm:block">
            <div className="flex items-center justify-end gap-1 text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase whitespace-nowrap">
              {hud.paladinAuraActive && (
                <span className="flex items-center gap-0.5 text-[#FACC15]" title="Aura do Paladino: +20% Dano para todas as tropas">
                  <Sparkles className="h-3 w-3" />
                  +20%
                </span>
              )}
              <span>Pontos</span>
            </div>
            <div className="font-mono-tabular text-base font-bold text-white sm:text-lg" data-testid="hud-score">
              {Math.round(hud.score)}
            </div>
          </div>
        </div>

        {/* Top-Right Audio & Utility Controls */}
        <div className="pointer-events-auto flex items-center justify-end gap-1.5">
          <button
            type="button"
            tabIndex={-1}
            data-testid="btn-mute-music"
            aria-label={hud.mutedMusic ? 'Ativar música' : 'Silenciar música'}
            title={hud.mutedMusic ? 'Ativar música' : 'Silenciar música'}
            onClick={(e) => {
              e.currentTarget.blur();
              soundEngine.playClick();
              onToggleMuteMusic();
            }}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#334155] shadow-[0_3px_0_rgba(2,6,23,0.75)] transition-transform active:translate-y-0.5 ${
              hud.mutedMusic
                ? 'bg-[#0F172A]/95 text-[#FF2E4C] hover:bg-[#1E293B]'
                : 'bg-[#0F172A]/95 text-[#00D4FF] hover:bg-[#1E293B]'
            }`}
          >
            <Music className="h-4.5 w-4.5" />
            {hud.mutedMusic && (
              <span className="pointer-events-none absolute h-0.5 w-5 rotate-45 rounded bg-[#FF2E4C]" />
            )}
          </button>
          <button
            type="button"
            tabIndex={-1}
            data-testid="btn-mute-sfx"
            aria-label={hud.mutedSfx ? 'Ativar efeitos sonoros (M)' : 'Silenciar efeitos sonoros (M)'}
            title={hud.mutedSfx ? 'Ativar efeitos sonoros (M)' : 'Silenciar efeitos sonoros (M)'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMuteSfx();
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#334155] shadow-[0_3px_0_rgba(2,6,23,0.75)] transition-transform active:translate-y-0.5 ${
              hud.mutedSfx
                ? 'bg-[#0F172A]/95 text-[#FF2E4C] hover:bg-[#1E293B]'
                : 'bg-[#0F172A]/95 text-white hover:bg-[#1E293B]'
            }`}
          >
            {hud.mutedSfx ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Pausar jogo (P)"
            onClick={(e) => {
              e.currentTarget.blur();
              soundEngine.playClick();
              onTogglePause();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#334155] bg-[#0F172A]/95 text-white shadow-[0_3px_0_rgba(2,6,23,0.75)] transition-transform active:translate-y-0.5 hover:bg-[#1E293B]"
          >
            <Pause className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Reiniciar partida (R)"
            onClick={(e) => {
              e.currentTarget.blur();
              soundEngine.playClick();
              onRestart();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#334155] bg-[#0F172A]/95 text-white shadow-[0_3px_0_rgba(2,6,23,0.75)] transition-transform active:translate-y-0.5 hover:bg-[#1E293B]"
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Compact Positive Reinforcement Micro-Reward Banner */}
      {hud.activeBanner && (
        <div
          key={hud.activeBanner.id}
          data-testid="reward-banner"
          aria-live="polite"
          className="pointer-events-none fixed left-1/2 top-[234px] z-30 w-max max-w-[88vw] -translate-x-1/2 sm:top-[84px]"
        >
          <div
            className={`animate-reward-pop rounded-xl border px-3 py-1 text-center shadow-[0_4px_14px_rgba(0,0,0,0.55)] sm:px-3.5 sm:py-1 ${bannerToneClass}`}
          >
            <div className="font-display text-xs font-bold tracking-wide sm:text-sm">
              {hud.activeBanner.text}
            </div>
            {hud.activeBanner.subtext && (
              <div className="text-[10px] font-semibold text-white/85 sm:text-[11px]">
                {hud.activeBanner.subtext}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compact Passive Castle Guardian Pet HUD Widget (Top-Left below Castle/Hero Bar) */}
      {(() => {
        const activePet = PET_SPECS[hud.selectedPet];
        return (
          <div
            className="pointer-events-auto fixed left-2.5 top-[156px] z-20 flex flex-col items-start gap-1.5 sm:left-4 sm:top-[82px]"
            aria-label="Pet Guardião do Castelo"
          >
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-pet-toggle"
              aria-expanded={petPickerOpen}
              onClick={(e) => {
                e.currentTarget.blur();
                soundEngine.playClick();
                setPetPickerOpen((prev) => !prev);
              }}
              className="flex items-center gap-2 rounded-2xl border-2 bg-[#0F172A]/95 px-2.5 py-1.5 text-left shadow-[0_4px_0_rgba(2,6,23,0.8)] transition-transform active:translate-y-0.5 hover:bg-[#162033]"
              style={{
                borderColor: activePet.primaryColor,
                boxShadow: `0 4px 0 rgba(2,6,23,0.8), 0 0 14px ${activePet.glowColor}`,
              }}
              title={`${activePet.title}: ${activePet.description} (Clique para trocar de pet)`}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#050A14]"
                style={{ boxShadow: `inset 0 0 10px ${activePet.glowColor}` }}
              >
                <PetPortraitSvg pet={hud.selectedPet} className="h-7 w-7" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1 whitespace-nowrap text-[11px] font-bold text-white">
                  <span>{activePet.name}</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                    {hud.petWasRandom ? 'Sorteado' : 'Escolhido'}
                  </span>
                </div>
                <div
                  className="font-mono-tabular whitespace-nowrap text-[10px] font-bold"
                  style={{ color: activePet.primaryColor }}
                  data-testid="hud-pet-bonus"
                >
                  {activePet.shortBonus}
                </div>
              </div>
              <span className="ml-0.5 text-[#94A3B8]">
                {petPickerOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </span>
            </button>

            {petPickerOpen && (
              <div
                data-testid="hud-pet-picker"
                className="flex w-[264px] flex-col gap-1.5 rounded-2xl border-2 border-[#334155] bg-[#0A1124]/96 p-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.85)] backdrop-blur-md"
              >
                <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  <span>{hud.petChoiceUnlocked ? 'Escolher Novo Pet' : 'Pet Guardião'}</span>
                  <span className={hud.petChoiceUnlocked ? 'text-[#22C55E]' : 'text-[#FACC15]'}>
                    {hud.petChoiceUnlocked ? 'Liberado' : 'Anúncio p/ trocar'}
                  </span>
                </div>

                {!hud.petChoiceUnlocked && (
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="hud-pet-watch-ad"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      soundEngine.playClick();
                      onRequestPetAd();
                    }}
                    className="font-display flex items-center justify-center gap-1.5 rounded-xl border border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-2.5 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-[0_2px_0_#991B1B] active:translate-y-0.5"
                  >
                    <Tv className="h-3.5 w-3.5 shrink-0" />
                    <span>Ver Anúncio para Trocar</span>
                  </button>
                )}

                {PET_ORDER.map((petKind) => {
                  const spec = PET_SPECS[petKind];
                  const isActive = hud.selectedPet === petKind;
                  const locked = !hud.petChoiceUnlocked && !isActive;
                  return (
                    <button
                      key={petKind}
                      type="button"
                      tabIndex={-1}
                      data-testid={`hud-pet-option-${petKind}`}
                      aria-pressed={isActive}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        soundEngine.playClick();
                        if (isActive) {
                          setPetPickerOpen(false);
                          return;
                        }
                        if (hud.petChoiceUnlocked) {
                          onSelectPet(petKind);
                          setPetPickerOpen(false);
                        } else {
                          setPetPickerOpen(false);
                          onRequestPetAd(petKind);
                        }
                      }}
                      className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 text-left transition-colors ${
                        isActive
                          ? 'bg-[#162033]'
                          : locked
                            ? 'border-[#1E293B] bg-[#080D1A]/75 opacity-85 hover:border-[#FACC15]/70 hover:opacity-100'
                            : 'border-[#1E293B] bg-[#080D1A]/90 hover:border-[#475569] hover:bg-[#111B2E]'
                      }`}
                      style={
                        isActive
                          ? {
                              borderColor: spec.primaryColor,
                              boxShadow: `0 0 12px ${spec.glowColor}`,
                            }
                          : undefined
                      }
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#050A14]">
                        <PetPortraitSvg pet={petKind} className="h-7 w-7" />
                      </div>
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1 font-display text-xs font-bold text-white">
                            <span>{spec.name}</span>
                            {locked && <Lock className="h-3 w-3 text-[#FACC15]" />}
                          </span>
                          <span
                            className="font-mono-tabular text-[10px] font-bold"
                            style={{ color: spec.primaryColor }}
                          >
                            {spec.shortBonus}
                          </span>
                        </div>
                        <div className="truncate text-[10px] text-[#94A3B8]">
                          {spec.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Active Spells Panel */}
      <div
        className="pointer-events-auto fixed bottom-[152px] right-2.5 z-20 flex flex-row gap-1.5 sm:bottom-auto sm:right-4 sm:top-[84px] sm:flex-col sm:gap-2"
        aria-label="Habilidades especiais"
      >
        {SPELL_ORDER.map((kind) => {
          const spec = SPELL_SPECS[kind];
          const cd = hud.spellCooldowns[kind];
          const maxCd = hud.spellMaxCooldowns[kind];
          const isReady = cd <= 0;
          const isTargeting = hud.targetingSpell === kind;
          const isOverchargeActive = kind === 'overcharge' && hud.overchargeTimer > 0;
          const cdProgress = isReady ? 0 : Math.min(1, cd / maxCd);

          return (
            <button
              key={kind}
              type="button"
              tabIndex={-1}
              aria-label={`${spec.name} [${spec.hotkey}] — ${spec.description}`}
              onClick={(e) => {
                e.currentTarget.blur();
                onActivateSpell(kind);
              }}
              className={`relative flex items-center gap-2 overflow-hidden rounded-2xl border-2 px-2.5 py-1.5 text-left shadow-[0_4px_0_rgba(2,6,23,0.75)] transition-transform active:translate-y-0.5 sm:gap-2.5 sm:px-3 sm:py-2 ${
                isTargeting
                  ? 'border-[#00D4FF] bg-[#082F49]'
                  : isOverchargeActive
                    ? 'border-[#FACC15] bg-[#422006]'
                    : isReady
                      ? 'border-[#334155] bg-[#0F172A]/95 hover:border-[#00D4FF]'
                      : 'border-[#1E293B] bg-[#080D1A]/90 opacity-80'
              }`}
            >
              {!isReady && (
                <div
                  className="pointer-events-none absolute inset-0 origin-bottom bg-black/55"
                  style={{ transform: `scaleY(${cdProgress})` }}
                />
              )}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#080D1A]">
                <SpellIcon kind={kind} />
              </div>
              <div className="relative z-10 hidden leading-tight sm:block">
                <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-white">
                  <span>{spec.name}</span>
                  <span className="font-mono-tabular text-[11px] text-[#FACC15]">[{spec.hotkey}]</span>
                </div>
                <div className="font-mono-tabular whitespace-nowrap text-[11px] text-[#00D4FF]">
                  {isTargeting
                    ? 'Clique no mapa'
                    : isOverchargeActive
                      ? `Ativa ${hud.overchargeTimer.toFixed(1)}s`
                      : isReady
                        ? spec.description
                        : `Recarga ${Math.ceil(cd)}s`}
                </div>
              </div>
              {!isReady && (
                <span className="font-mono-tabular relative z-10 text-xs font-bold text-[#FACC15] sm:hidden">
                  {Math.ceil(cd)}s
                </span>
              )}
            </button>
          );
        })}

        {/* Dynamic Modular Ring Rotation Widget */}
        <div className="mt-2 flex items-center gap-1 rounded-xl border-2 border-[#334155] bg-[#0F172A]/95 p-1.5 shadow-[0_4px_0_rgba(2,6,23,0.75)]">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              soundEngine.playClick();
              onRotateRing(-Math.PI * 0.25);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E293B] text-white hover:bg-[#334155]"
            title="Girar Anel Sentido Anti-Horário"
          >
            ↺
          </button>
          <div className="flex flex-col items-center px-1 leading-tight">
            <span className="text-[9px] font-bold text-[#FACC15] uppercase">Anel 360°</span>
            <span className="font-mono-tabular text-[10px] text-[#00D4FF]">Calor {Math.round(hud.ringHeat * 100)}%</span>
          </div>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              soundEngine.playClick();
              onRotateRing(Math.PI * 0.25);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E293B] text-white hover:bg-[#334155]"
            title="Girar Anel Sentido Horário & Empurrar Inimigos"
          >
            ↻
          </button>
        </div>

        {/* Tactical Store Consumables Quick-Bar (Live Battle Items) */}
        <div
          aria-label="Itens Táticos de Combate"
          className="mt-1 flex items-center gap-1 rounded-xl border border-[#334155] bg-[#0A1124]/92 p-1 shadow-[0_4px_0_rgba(2,6,23,0.75)]"
        >
          {CONSUMABLE_ORDER.map((id) => {
            const spec = CONSUMABLE_SPECS[id];
            const qty = hud.consumables[id] ?? 0;
            const isFrenzyRunning = id === 'frenzy_flask' && hud.frenzyTimer > 0;
            return (
              <button
                key={id}
                type="button"
                tabIndex={-1}
                data-testid={`hud-consumable-${id}`}
                disabled={qty <= 0}
                title={`${spec.name} [${spec.hotkey}] — ${spec.description}`}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onUseConsumable(id);
                }}
                className={`relative flex flex-1 flex-col items-center justify-center rounded-lg border px-1.5 py-1 text-center transition-transform active:translate-y-0.5 ${
                  isFrenzyRunning
                    ? 'border-[#00D4FF] bg-[#082F49] text-[#00D4FF]'
                    : qty > 0
                      ? 'border-[#1E293B] bg-[#0F172A] text-white hover:border-[#FACC15]'
                      : 'cursor-not-allowed border-[#1E293B] bg-[#080D1A]/60 text-[#475569] opacity-55'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  {id === 'castle_potion' && <Heart className="h-3.5 w-3.5 text-[#22C55E]" />}
                  {id === 'meteor_scroll' && <Flame className="h-3.5 w-3.5 text-[#F97316]" />}
                  {id === 'frenzy_flask' && <FlaskConical className="h-3.5 w-3.5 text-[#00D4FF]" />}
                  <span className="font-mono-tabular text-[10px] font-bold">
                    {isFrenzyRunning ? `${hud.frenzyTimer.toFixed(0)}s` : `x${qty}`}
                  </span>
                </div>
                <span className="text-[9px] font-semibold text-[#94A3B8]">[{spec.hotkey}]</span>
              </button>
            );
          })}
        </div>

        {hud.phoenixShieldReady && (
          <div className="hidden items-center justify-center gap-1 rounded-lg border border-[#FACC15]/50 bg-[#422006]/85 px-2 py-1 text-[10px] font-bold text-[#FEF08A] sm:flex">
            <Shield className="h-3 w-3 text-[#FACC15]" />
            <span>Escudo da Fênix Pronto</span>
          </div>
        )}
      </div>

      {/* Bottom Support Troop Recruitment Dock (Dynamically unlocked Allies from ALLY_ALBUM) */}
      <div className="pointer-events-none flex w-full flex-col items-center">
        {/* Detailed Unit Tooltip Overlay */}
        {hoveredUnitKind && (() => {
          const spec = UNIT_SPECS[hoveredUnitKind];
          const ally = ALLY_ALBUM.find((a) => a.unitKind === hoveredUnitKind);
          if (!spec) return null;
          const activePetSpec = PET_SPECS[hud.selectedPet];
          const discountLvl = hud.talents?.towerDiscount ?? 0;
          const talentMult = Math.max(0.75, 1 - discountLvl * 0.04);
          const ironMult = hud.activePacts?.includes('iron') ? 1.15 : 1;
          const petCostMult = Math.max(0.5, 1 - activePetSpec.manaCostReductionPct);
          const effectiveCost = Math.max(
            10,
            Math.round(spec.cost * talentMult * ironMult * petCostMult)
          );
          const petAtkSpeedMult = 1 + activePetSpec.attackSpeedBonusPct;
          const effectiveCooldown = Math.max(0.2, spec.cooldown / petAtkSpeedMult);
          const attackSpeed = (1 / effectiveCooldown).toFixed(1);
          const paladinMult = hud.paladinAuraActive ? 1.2 : 1;
          const petDmgMult = 1 + activePetSpec.damageBonusPct;
          const effectiveDamage = Math.round(spec.damage * paladinMult * petDmgMult);

          return (
            <div
              data-testid="unit-tooltip"
              role="tooltip"
              className="pointer-events-none mb-2 z-40 flex w-full max-w-[94vw] sm:max-w-md flex-col gap-2 rounded-2xl border-2 border-[#00D4FF]/40 bg-[#0A1128]/95 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#020617]">
                    <UnitIcon kind={hoveredUnitKind} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-display text-sm font-bold tracking-wide text-white">
                        {spec.name}
                      </span>
                      <span className="font-mono-tabular rounded border border-[#FACC15]/30 bg-[#FACC15]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#FACC15]">
                        Tecla [{ally?.hotkey ?? spec.hotkey}]
                      </span>
                    </div>
                    <div
                      className="text-[11px] font-medium"
                      style={{ color: ally?.colorHex ?? '#38BDF8' }}
                    >
                      {spec.shortRole}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="font-mono-tabular text-xs font-bold text-[#FACC15]">
                    {effectiveCost} essência
                  </span>
                  <span className="text-[10px] text-white/60">{spec.maxHp} HP Base</span>
                </div>
              </div>

              {/* Primary Combat Stats: Damage, Range, Attack Speed */}
              <div className="grid grid-cols-3 gap-2">
                {/* Dano */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/25 bg-red-950/40 px-2 py-1.5 text-center">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
                    <Swords className="h-3 w-3" />
                    <span>Dano</span>
                  </div>
                  <div className="font-mono-tabular text-sm font-black text-red-300">
                    {effectiveDamage}
                    {(hud.paladinAuraActive || activePetSpec.damageBonusPct > 0) && (
                      <span className="ml-1 text-[9px] font-bold text-[#FACC15]">
                        ({activePetSpec.damageBonusPct > 0 ? activePetSpec.name : 'Aura'})
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-red-300/70">
                    Crit {Math.round(spec.critChance * 100)}%
                  </div>
                </div>

                {/* Alcance */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-sky-500/25 bg-sky-950/40 px-2 py-1.5 text-center">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    <Crosshair className="h-3 w-3" />
                    <span>Alcance</span>
                  </div>
                  <div className="font-mono-tabular text-sm font-black text-sky-300">
                    {spec.range} px
                  </div>
                  <div className="text-[9px] text-sky-300/70">raio de tiro</div>
                </div>

                {/* Velocidade de Ataque */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/25 bg-amber-950/40 px-2 py-1.5 text-center">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    <Zap className="h-3 w-3" />
                    <span>Vel. Ataque</span>
                  </div>
                  <div className="font-mono-tabular text-sm font-black text-amber-300">
                    {attackSpeed}/s
                  </div>
                  <div className="text-[9px] text-amber-300/70">
                    {effectiveCooldown.toFixed(2)}s cadência
                  </div>
                </div>
              </div>

              {/* Tactical Description */}
              <div className="rounded-lg border border-white/5 bg-black/35 px-2.5 py-1.5 text-[11px] leading-snug text-slate-300">
                <span className="mr-1 font-semibold text-white/70">Função tática:</span>
                {spec.role}
              </div>
            </div>
          );
        })()}

        {(() => {
          const unlockedAllies = getUnlockedAlliesForStage(
            Math.max(hud.stage, hud.highestUnlockedStage)
          );
          const discountLvl = hud.talents?.towerDiscount ?? 0;
          const talentMult = Math.max(0.75, 1 - discountLvl * 0.04);
          const ironMult = hud.activePacts?.includes('iron') ? 1.15 : 1;
          const petCostMult = Math.max(0.5, 1 - PET_SPECS[hud.selectedPet].manaCostReductionPct);
          return (
            <div
              data-testid="ally-dock"
              className="pointer-events-auto flex max-w-[96vw] items-center gap-1.5 overflow-x-auto rounded-2xl border-2 border-[#334155] bg-[#0F172A]/96 p-1.5 shadow-[0_6px_0_rgba(2,6,23,0.85)] sm:gap-2 sm:p-2"
            >
              {unlockedAllies.map((ally) => {
                const kind = ally.unitKind;
                const spec = UNIT_SPECS[kind];
                const effectiveCost = Math.max(
                  10,
                  Math.round(spec.cost * talentMult * ironMult * petCostMult)
                );
                const isSelected = hud.selectedUnit === kind;
                const canAfford = hud.essence >= effectiveCost;
                return (
                  <div
                    key={kind}
                    data-testid={`dock-unit-${kind}`}
                    onMouseEnter={() => setHoveredUnitKind(kind)}
                    onMouseLeave={() => setHoveredUnitKind(null)}
                    onFocus={() => setHoveredUnitKind(kind)}
                    onBlur={() => setHoveredUnitKind(null)}
                    onPointerDown={() => setHoveredUnitKind(null)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl border-2 px-2 py-1.5 transition-colors sm:gap-2 sm:px-2.5 ${
                      isSelected
                        ? 'border-[#FACC15] bg-[#1E293B]'
                        : 'border-[#1E293B] bg-[#080D1A]/90 hover:border-[#334155]'
                    } ${!canAfford ? 'opacity-70' : ''}`}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onPointerDown={(e) => {
                        onSelectUnit(kind);
                        onStartCardDrag(kind, e.clientX, e.clientY);
                      }}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onSelectUnit(kind);
                      }}
                      className="flex min-w-0 cursor-grab touch-none items-center gap-2 text-left active:cursor-grabbing"
                    >
                      <UnitIcon kind={kind} />
                      <div className="min-w-0 leading-tight">
                        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-white sm:text-sm">
                          <span>{spec.name}</span>
                          <span className="font-mono-tabular text-[11px] text-[#FACC15]">
                            [{ally.hotkey}]
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-[#94A3B8]">
                          <span className="font-mono-tabular font-bold text-[#FACC15]">
                            {effectiveCost} ess.
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[10px] sm:text-[11px]" style={{ color: ally.colorHex }}>
                            {spec.shortRole}
                          </span>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={`Recrutar ${spec.name} em slot livre (${effectiveCost} essência)`}
                      disabled={!canAfford}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onQuickRecruit(kind);
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#020617] bg-[#00D4FF] text-xs font-bold text-[#020617] shadow-[0_2px_0_#0369A1] transition-transform active:translate-y-0.5 hover:bg-[#38BDF8] disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
