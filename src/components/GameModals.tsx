import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Compass,
  Crown,
  Gem,
  Home,
  Lock,
  Palette,
  Play,
  RotateCcw,
  ShieldAlert,
  ShoppingBag,
  Shuffle,
  Sparkles,
  Trophy,
  Tv,
  X,
} from 'lucide-react';
import titlePixelArt from '../assets/images/title_pixel_heroes_pets_1795398207404.jpg';
import { soundEngine } from '../game/audio';
import { MAX_EQUIPPED_RELICS } from '../game/storeCatalog';
import {
  ALLY_ALBUM,
  ENEMY_ALBUM,
  getAllyUnlockForStage,
  getEnemyUnlockForStage,
  isAllyUnlocked,
  isEnemyUnlocked,
} from '../game/bestiaryData';
import {
  formatSurvivalTime,
  getHeroRankTitle,
  getHeroStatsForLevel,
  getHeroXpBounds,
  getStageConfig,
} from '../game/engineMath';
import {
  ACHIEVEMENT_CATALOG,
  FX_STYLES,
  FxStyleId,
  HERO_SPECS,
  HeroClass,
  HeroUpgradeId,
  HudSnapshot,
  MAX_HERO_LEVEL,
  PET_ORDER,
  PET_SPECS,
  PetKind,
  RING_SKINS,
  RingSkinId,
  TOTAL_STAGES,
} from '../game/types';
import { TALENT_SPECS } from '../game/simulation';
import { AlbumTab } from './AlbumModal';
import { PetPortraitSvg } from './PetArtwork';
import { StoreTab } from './StoreModal';

type TitleScreenView = 'splash' | 'hub';
type HubModalKind = 'hero' | 'pet' | 'stage' | 'talents' | 'shop' | null;

interface GameModalsProps {
  hud: HudSnapshot;
  selectedStage: number;
  convergenceStages: ReadonlyArray<number>;
  onSelectHero: (heroClass: HeroClass) => void;
  onSelectPet: (pet: PetKind) => void;
  onRequestPetAd: (targetPet?: PetKind) => void;
  onSelectStage: (stage: number) => void;
  onSelectUpgrade: (upgradeId: HeroUpgradeId) => void;
  onUpgradeTalent: (talentId: string) => void;
  onSelectPact: (pactId: string) => void;
  onBuyOrEquipRingSkin: (skinId: RingSkinId) => void;
  onBuyOrEquipFxStyle: (fxId: FxStyleId) => void;
  onStart: (stage?: number) => void;
  onNextStage: () => void;
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
  onOpenAlbum: (tab: AlbumTab) => void;
  onOpenStore: (tab?: StoreTab) => void;
  onOpenMilestones: () => void;
}

const STAGES_PER_CHAPTER = 10;
const TOTAL_CHAPTERS = Math.ceil(TOTAL_STAGES / STAGES_PER_CHAPTER);
const HERO_ORDER: HeroClass[] = ['archer', 'swordsman', 'bomber'];

export function HeroClassIcon({ heroClass, className = 'h-8 w-8' }: { heroClass: HeroClass; className?: string }) {
  if (heroClass === 'archer') {
    return (
      <svg viewBox="0 0 32 32" className={`${className} shrink-0`} aria-hidden="true">
        <path d="M21 5c5 5 5 17 0 22" fill="none" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
        <line x1="20" y1="6" x2="20" y2="26" stroke="#BAE6FD" strokeWidth="1.6" />
        <line x1="6" y1="16" x2="26" y2="16" stroke="#00D4FF" strokeWidth="3" strokeLinecap="round" />
        <polygon points="28,16 22,12 22,20" fill="#FACC15" />
      </svg>
    );
  }
  if (heroClass === 'swordsman') {
    return (
      <svg viewBox="0 0 32 32" className={`${className} shrink-0`} aria-hidden="true">
        <path d="M9 23L24 6l2 2-15 17z" fill="#F8FAFC" stroke="#020617" strokeWidth="1.8" />
        <path d="M6 19l7 7" stroke="#FACC15" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="6" y1="26" x2="10" y2="22" stroke="#FF2E4C" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className={`${className} shrink-0`} aria-hidden="true">
      <circle cx="15" cy="18" r="9" fill="#1E293B" stroke="#FACC15" strokeWidth="2.4" />
      <path d="M18 10c2-3 5-4 8-3" fill="none" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="26" cy="7" r="3" fill="#FF2E4C" />
      <circle cx="12" cy="15" r="2.2" fill="#FACC15" />
    </svg>
  );
}

export const GameModals: React.FC<GameModalsProps> = ({
  hud,
  selectedStage,
  convergenceStages,
  onSelectHero,
  onSelectPet,
  onRequestPetAd,
  onSelectStage,
  onSelectUpgrade,
  onUpgradeTalent,
  onSelectPact,
  onBuyOrEquipRingSkin,
  onBuyOrEquipFxStyle,
  onStart,
  onNextStage,
  onResume,
  onRestart,
  onReturnTitle,
  onOpenAlbum,
  onOpenStore,
  onOpenMilestones,
}) => {
  const [chapterIndex, setChapterIndex] = useState(() =>
    Math.floor((Math.max(1, selectedStage) - 1) / STAGES_PER_CHAPTER)
  );
  const [titleScreen, setTitleScreen] = useState<TitleScreenView>('splash');
  const [activeHubModal, setActiveHubModal] = useState<HubModalKind>(null);
  const [backdropImgError, setBackdropImgError] = useState(false);

  useEffect(() => {
    setChapterIndex(Math.floor((Math.max(1, selectedStage) - 1) / STAGES_PER_CHAPTER));
  }, [selectedStage]);

  useEffect(() => {
    if (hud.phase !== 'title' || activeHubModal === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setActiveHubModal(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hud.phase, activeHubModal]);

  // Show Pact Choice Modal if pendingPactChoices is active
  if (hud.phase === 'playing' && hud.pendingPactChoices && hud.pendingPactChoices.length > 0) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-[#00D4FF] bg-[#0F172A] p-5 text-center shadow-[0_12px_32px_rgba(0,0,0,0.85)]">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-[#00D4FF] bg-[#082F49] text-[#00D4FF]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-[#00D4FF]">Escolha de Pacto (Wave {hud.wave})</h2>
          <p className="mt-1 text-xs text-[#94A3B8]">Cada pacto concede poder formidável com um custo de risco.</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {hud.pendingPactChoices.map((pact) => {
              const border =
                pact.tone === 'crimson'
                  ? 'border-[#FF2E4C] hover:bg-[#450A0A]'
                  : pact.tone === 'electric'
                    ? 'border-[#00D4FF] hover:bg-[#082F49]'
                    : 'border-[#FACC15] hover:bg-[#422006]';
              return (
                <button
                  key={pact.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectPact(pact.id);
                  }}
                  className={`flex flex-col rounded-xl border-2 bg-[#080D1A] p-3 text-left transition-transform active:translate-y-0.5 ${border}`}
                >
                  <div className="font-display text-sm font-bold text-white">{pact.title}</div>
                  <div className="mt-1 text-xs text-[#CBD5E1]">{pact.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Show Upgrade Milestone Modal whenever a hero hits a 5-level milestone (in Menu or in Combat!)
  if (
    (hud.phase === 'playing' || hud.phase === 'title') &&
    hud.pendingUpgradeChoices &&
    hud.pendingUpgradeChoices.length > 0
  ) {
    const milestone = hud.pendingUpgradeMilestoneLevel ?? 5;
    const upgradeHeroClass = hud.pendingUpgradeHeroClass ?? hud.selectedHeroClass;
    const upgradeHeroName = HERO_SPECS[upgradeHeroClass].name;
    const incomingEnemy =
      milestone >= 15
        ? 'Ceifador Abissal'
        : milestone >= 10
          ? 'Titã Arcano'
          : hud.stage >= 3
            ? 'Espectro Ígneo'
            : 'Sombra Veloz';
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-title"
          data-testid="upgrade-modal"
          className="w-full max-w-md rounded-2xl border-2 border-[#FACC15] bg-[#0F172A] p-4 text-center shadow-[0_10px_0_rgba(2,6,23,0.92)] sm:p-5"
        >
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#FACC15] bg-[#422006] text-[#FACC15]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 id="upgrade-title" className="font-display text-xl font-bold text-[#FACC15] sm:text-2xl">
            {upgradeHeroName} · Nível {milestone}!
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#00D4FF]">
            {hud.phase === 'playing'
              ? `Escolha 1 evolução permanente · Novo inimigo: ${incomingEnemy}`
              : 'Escolha 1 evolução permanente para este herói'}
          </p>

          <div className="mt-3.5 flex flex-col gap-2">
            {hud.pendingUpgradeChoices.map((opt) => {
              const borderAccent =
                opt.accent === 'crimson'
                  ? 'border-[#FF2E4C] hover:bg-[#450A0A]/60'
                  : opt.accent === 'electric'
                    ? 'border-[#00D4FF] hover:bg-[#082F49]/60'
                    : 'border-[#FACC15] hover:bg-[#422006]/60';
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`upgrade-option-${opt.id}`}
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectUpgrade(opt.id);
                  }}
                  className={`flex items-center justify-between gap-3 rounded-xl border-2 bg-[#080D1A] px-3.5 py-2.5 text-left transition-transform active:translate-y-0.5 ${borderAccent}`}
                >
                  <div>
                    <div className="font-display text-sm font-bold text-white sm:text-base">
                      {opt.title}
                    </div>
                    <div className="text-xs font-medium text-[#CBD5E1]">{opt.effectText}</div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-[#1E293B] px-2.5 py-1 text-xs font-bold text-[#FACC15]">
                    Aplicar
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (hud.phase === 'title') {
    const stageCfg = getStageConfig(selectedStage, convergenceStages);
    const unlockedEnemies = ENEMY_ALBUM.filter((e) =>
      isEnemyUnlocked(e, hud.highestUnlockedStage)
    ).length;
    const unlockedAllies = ALLY_ALBUM.filter((a) =>
      isAllyUnlocked(a, hud.highestUnlockedStage)
    ).length;
    const activeHeroSpec = HERO_SPECS[hud.selectedHeroClass];
    const activeHeroSaved = hud.heroRoster[hud.selectedHeroClass];
    const activePet = PET_SPECS[hud.selectedPet];

    const chapterStart = chapterIndex * STAGES_PER_CHAPTER + 1;
    const chapterEnd = Math.min(TOTAL_STAGES, chapterStart + STAGES_PER_CHAPTER - 1);
    const chapterStages = Array.from(
      { length: chapterEnd - chapterStart + 1 },
      (_, idx) => chapterStart + idx
    );

    return (
      <div className="fixed inset-0 z-30 overflow-hidden bg-[#0B0D22]">
        {/* Seamless Twilight Sky & Castle Courtyard Atmosphere (matches pixel-art palette on every aspect ratio) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0B0D26_0%,#14163B_46%,#171529_68%,#0A0B14_100%)]" />
          {!backdropImgError && (
            <img
              src={titlePixelArt}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="h-full w-full scale-110 object-cover object-center opacity-28 blur-2xl"
            />
          )}
          {/* Crisp Pixel-Art Sky Stars & Warm Embers for Portrait/Tablet Sky Continuity */}
          <svg
            viewBox="0 0 400 800"
            preserveAspectRatio="xMidYMin slice"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full opacity-85"
          >
            <g fill="#CBD5F5">
              <rect x="28" y="34" width="2" height="2" opacity="0.7" />
              <rect x="74" y="68" width="3" height="3" opacity="0.85" />
              <rect x="132" y="26" width="2" height="2" opacity="0.6" />
              <rect x="196" y="48" width="2" height="2" opacity="0.55" />
              <rect x="268" y="30" width="3" height="3" opacity="0.8" />
              <rect x="336" y="54" width="2" height="2" opacity="0.7" />
              <rect x="372" y="96" width="2" height="2" opacity="0.6" />
              <rect x="46" y="138" width="2" height="2" opacity="0.65" />
              <rect x="114" y="116" width="2" height="2" opacity="0.5" />
              <rect x="292" y="124" width="2" height="2" opacity="0.6" />
              <rect x="354" y="162" width="3" height="3" opacity="0.75" />
              <rect x="22" y="198" width="2" height="2" opacity="0.5" />
            </g>
            <g fill="#F59E0B">
              <rect x="86" y="176" width="4" height="2" opacity="0.75" />
              <rect x="164" y="148" width="3" height="2" opacity="0.6" />
              <rect x="242" y="184" width="4" height="2" opacity="0.7" />
              <rect x="318" y="202" width="3" height="2" opacity="0.65" />
              <rect x="64" y="646" width="3" height="2" opacity="0.45" />
              <rect x="328" y="672" width="3" height="2" opacity="0.45" />
            </g>
          </svg>
        </div>

        {/* HUB BACKDROP: Uncropped Pixel-Art Cast Softly Dimmed Behind Separated Buttons */}
        {titleScreen === 'hub' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {!backdropImgError && (
              <img
                src={titlePixelArt}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                onError={() => setBackdropImgError(true)}
                className="h-full w-full object-contain object-center [image-rendering:pixelated]"
              />
            )}
            <div className="absolute inset-0 bg-[#050814]/82 backdrop-blur-[3px]" />
          </div>
        )}

        {/* SCREEN 1: PIXEL-ART SPLASH WITH ALL 3 HEROES & ALL 5 PETS FULLY VISIBLE + "INÍCIO" AT BOTTOM */}
        {titleScreen === 'splash' && (
          <div
            data-testid="title-splash"
            className="relative z-10 flex h-full w-full flex-col items-center justify-between px-4 py-6 landscape:py-3.5 sm:landscape:py-6"
          >
            {/* Landscape Mode: Full-Viewport Uncropped Pixel-Art Panorama (Zero Horizontal Clipping) */}
            {!backdropImgError && (
              <div className="pointer-events-none hidden landscape:absolute landscape:inset-0 landscape:flex landscape:items-center landscape:justify-center">
                <div className="flex h-full w-full items-center justify-center [mask-image:linear-gradient(to_right,transparent_0%,black_2.5%,black_97.5%,transparent_100%)]">
                  <img
                    src={titlePixelArt}
                    alt="Arte pixel art dos 3 heróis e 5 pets guardiões de Ember Ring Defense"
                    referrerPolicy="no-referrer"
                    onError={() => setBackdropImgError(true)}
                    className="h-full w-full object-contain object-center [image-rendering:pixelated] [mask-image:linear-gradient(to_bottom,transparent_0%,black_2.5%,black_97%,transparent_100%)]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#050814]/65 via-transparent via-35% to-[#050814]/75" />
              </div>
            )}

            {/* Top Game Title Crest */}
            <div className="relative z-10 flex flex-col items-center pt-1 text-center">
              <svg
                viewBox="0 0 430 96"
                className="w-[260px] drop-shadow-[0_8px_18px_rgba(2,6,23,0.95)] landscape:w-[220px] sm:w-[340px] sm:landscape:w-[320px]"
                role="img"
                aria-label="Ember Ring Defense"
              >
                <rect x="14" y="10" width="402" height="76" rx="22" fill="#0F172A" fillOpacity="0.92" stroke="#FACC15" strokeWidth="3.5" />
                <rect x="22" y="18" width="386" height="60" rx="16" fill="#1E293B" fillOpacity="0.88" />
                <text
                  x="215"
                  y="52"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  stroke="#020617"
                  strokeWidth="6"
                  paintOrder="stroke fill"
                  fontFamily="Fredoka, Plus Jakarta Sans, sans-serif"
                  fontWeight="700"
                  fontSize="30"
                >
                  EMBER RING
                </text>
                <text
                  x="215"
                  y="70"
                  textAnchor="middle"
                  fill="#00D4FF"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight="800"
                  fontSize="11"
                  letterSpacing="3.2"
                >
                  DEFESA HEROICA DO CASTELO
                </text>
              </svg>
            </div>

            {/* Portrait Mode: Edge-to-Edge Full-Width Uncropped Showcase (All 3 Heroes + All 5 Pets 100% Visible) */}
            <div className="relative z-10 my-auto flex w-full flex-1 flex-col items-center justify-center py-2 landscape:hidden">
              {!backdropImgError ? (
                <div className="relative -mx-4 w-[calc(100%+2rem)] max-w-[960px]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-x-4 -inset-y-8 bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.14)_0%,rgba(14,16,52,0)_72%)]"
                  />
                  <img
                    src={titlePixelArt}
                    alt="Arte pixel art dos 3 heróis e 5 pets guardiões de Ember Ring Defense"
                    referrerPolicy="no-referrer"
                    onError={() => setBackdropImgError(true)}
                    className="relative block h-auto max-h-[58vh] w-full object-contain [image-rendering:pixelated] [mask-image:linear-gradient(to_bottom,transparent_0%,black_3%,black_97%,transparent_100%)]"
                  />
                </div>
              ) : (
                <div className="h-48 w-full rounded-2xl bg-[radial-gradient(ellipse_at_top,#1E1B4B_0%,#0B1120_65%,#04070F_100%)]" />
              )}
            </div>

            {/* Bottom Dominant "Início" Action Button */}
            <div className="relative z-10 flex flex-col items-center pb-2 landscape:pb-1 sm:pb-3">
              <button
                type="button"
                data-testid="btn-enter-hub"
                onClick={() => {
                  soundEngine.playClick();
                  setTitleScreen('hub');
                }}
                className="font-display flex min-h-[54px] min-w-[230px] items-center justify-center gap-3 rounded-2xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-12 py-3 text-2xl font-bold whitespace-nowrap text-white shadow-[0_6px_0_#991B1B,0_14px_32px_rgba(0,0,0,0.85)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#991B1B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FACC15] landscape:min-h-[48px] landscape:px-10 landscape:py-2.5 landscape:text-xl sm:landscape:min-h-[54px] sm:landscape:px-12 sm:landscape:text-2xl"
              >
                <span>Início</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: CLEANLY SEPARATED HUB MENU */}
        {titleScreen === 'hub' && (
          <div
            data-testid="title-hub"
            className="relative z-10 flex h-full w-full flex-col items-center justify-between overflow-y-auto px-4 py-5 sm:px-8 sm:py-7"
          >
            {/* Top Bar: Back to Splash · Title · Ember Souls */}
            <header className="flex w-full max-w-3xl items-center justify-between gap-4">
              <button
                type="button"
                data-testid="hub-back-splash"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveHubModal(null);
                  setTitleScreen('splash');
                }}
                className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#334155] bg-[#0F172A]/90 px-3 py-2 text-xs font-bold whitespace-nowrap text-[#E2E8F0] transition-colors hover:border-[#FACC15] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>Tela Inicial</span>
              </button>

              <h1 className="font-display text-xl font-bold tracking-wide whitespace-nowrap text-white sm:text-2xl">
                EMBER RING
              </h1>

              <div className="font-mono-tabular flex items-center gap-2.5 text-right text-xs font-bold whitespace-nowrap sm:text-sm">
                {hud.vipNoAds && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#FACC15]/60 bg-[#422006] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#FACC15]">
                    <Crown className="h-3 w-3" />
                    VIP
                  </span>
                )}
                <span className="text-[#E9D5FF]" title="Nível de Experiência do Jogador">
                  Nv.{hud.playerLevel}
                </span>
                <span aria-hidden="true" className="text-[#475569]">·</span>
                <span className="flex items-center gap-1 text-[#00D4FF]" title="Gemas Arcanas">
                  <Gem className="h-3.5 w-3.5" />
                  {hud.gems}
                </span>
                <span aria-hidden="true" className="text-[#475569]">·</span>
                <span className="text-[#FACC15]">{hud.emberSouls} Almas</span>
              </div>
            </header>

            {/* Center Separated Hub Controls */}
            <div className="my-auto flex w-full max-w-3xl flex-col items-center gap-5 py-6">
              {/* Clean Unboxed Active Loadout Summary Line */}
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-xs font-semibold text-[#CBD5E1] sm:text-sm">
                <span>
                  Herói:{' '}
                  <strong className="text-white">
                    {stageCfg.isConvergenceStage
                      ? 'Trio de Heróis'
                      : `${activeHeroSpec.name} Nv.${activeHeroSaved.level}`}
                  </strong>
                </span>
                <span aria-hidden="true" className="text-[#64748B]">·</span>
                <span>
                  Pet:{' '}
                  {hud.petChoiceUnlocked ? (
                    <strong style={{ color: activePet.primaryColor }}>{activePet.name}</strong>
                  ) : (
                    <strong className="text-[#CBD5E1]">Aleatório</strong>
                  )}
                </span>
                <span aria-hidden="true" className="text-[#64748B]">·</span>
                <span className="font-mono-tabular">
                  Nível: <strong className="text-[#FACC15]">Fase {selectedStage}/{TOTAL_STAGES}</strong>
                </span>
              </div>

              {/* Row 1: 3 Dedicated Separated Preparation Buttons (Hero · Pet · Level) */}
              <section
                aria-label="Preparação da Partida"
                className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3"
              >
                <button
                  type="button"
                  data-testid="hub-btn-hero"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal('hero');
                  }}
                  className="flex min-h-[86px] items-center gap-3.5 rounded-2xl border-2 border-[#334155] bg-[#0F172A]/95 px-4 py-3.5 text-left shadow-[0_6px_0_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-0.5 hover:border-[#00D4FF] active:translate-y-0.5"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#080D1A]"
                    style={{ boxShadow: `0 0 14px ${activeHeroSpec.glowColor}` }}
                  >
                    <HeroClassIcon heroClass={hud.selectedHeroClass} className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-bold whitespace-nowrap text-white">
                      Selecionar Herói
                    </div>
                    <div className="mt-0.5 truncate text-xs font-semibold text-[#00D4FF]">
                      {stageCfg.isConvergenceStage
                        ? 'Trio na Convergência'
                        : `${activeHeroSpec.name} · Nv.${activeHeroSaved.level}`}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="hub-btn-pet"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal('pet');
                  }}
                  className="flex min-h-[86px] items-center gap-3.5 rounded-2xl border-2 border-[#334155] bg-[#0F172A]/95 px-4 py-3.5 text-left shadow-[0_6px_0_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-0.5 hover:border-[#FACC15] active:translate-y-0.5"
                  style={
                    hud.petChoiceUnlocked
                      ? { borderColor: `${activePet.primaryColor}99` }
                      : undefined
                  }
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#050A14]"
                    style={
                      hud.petChoiceUnlocked
                        ? { boxShadow: `inset 0 0 14px ${activePet.glowColor}` }
                        : undefined
                    }
                  >
                    {hud.petChoiceUnlocked ? (
                      <PetPortraitSvg pet={hud.selectedPet} className="h-10 w-10" />
                    ) : (
                      <Shuffle className="h-6 w-6 text-[#FACC15]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-bold whitespace-nowrap text-white">
                      {hud.vipNoAds
                        ? 'Pet VIP'
                        : hud.petChoiceUnlocked
                          ? 'Pet Escolhido'
                          : 'Escolher Pet'}
                    </div>
                    <div
                      className="mt-0.5 truncate text-xs font-semibold"
                      style={{
                        color: hud.petChoiceUnlocked ? activePet.primaryColor : '#FACC15',
                      }}
                    >
                      {hud.petChoiceUnlocked
                        ? `${activePet.name} · ${activePet.shortBonus}`
                        : 'Aleatório · Ver anúncio'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="hub-btn-stage"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal('stage');
                  }}
                  className="flex min-h-[86px] items-center gap-3.5 rounded-2xl border-2 border-[#334155] bg-[#0F172A]/95 px-4 py-3.5 text-left shadow-[0_6px_0_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-0.5 hover:border-[#FACC15] active:translate-y-0.5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#FACC15]/40 bg-[#422006] text-[#FACC15]">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-bold whitespace-nowrap text-white">
                      Escolher Nível
                    </div>
                    <div className="font-mono-tabular mt-0.5 truncate text-xs font-semibold text-[#FACC15]">
                      Fase {selectedStage} · {stageCfg.routeCount} {stageCfg.routeCount === 1 ? 'rota' : 'rotas'}
                    </div>
                  </div>
                </button>
              </section>

              {/* Row 2: Dominant Focal Play CTA */}
              <button
                type="button"
                data-start="true"
                data-testid="hub-btn-play"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveHubModal(null);
                  onStart(selectedStage);
                }}
                className="font-display flex min-h-[58px] w-full max-w-md items-center justify-center gap-3 rounded-2xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-10 py-3.5 text-2xl font-bold whitespace-nowrap text-white shadow-[0_6px_0_#991B1B,0_12px_28px_rgba(0,0,0,0.75)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#991B1B]"
              >
                <Play className="h-6 w-6 fill-current" />
                <span>Play · Fase {selectedStage}</span>
              </button>

              {/* Row 3: Completely Separated Store, Missions, Milestones, Relics, Talents, Achievements, Albums */}
              <section
                aria-label="Loja, Missões, Marcos, Relíquias, Talentos, Conquistas e Álbuns"
                className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7"
              >
                <button
                  type="button"
                  data-testid="open-store-modal"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenStore('featured');
                  }}
                  className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#FACC15]/80 bg-gradient-to-b from-[#422006]/90 to-[#0F172A]/95 px-2.5 py-3 text-center shadow-[0_4px_0_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-0.5 hover:border-[#FEF08A]"
                >
                  <ShoppingBag className="h-5 w-5 text-[#FACC15]" />
                  <span className="font-display text-sm font-bold whitespace-nowrap text-white">
                    Loja
                  </span>
                  <span className="font-mono-tabular text-[11px] font-semibold text-[#FEF08A]">
                    {!hud.dailyRewardClaimedToday ? 'Presente!' : `${hud.gems} Gemas`}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="open-missions-modal"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenStore('missions');
                  }}
                  className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#00D4FF]/70 bg-gradient-to-b from-[#082F49]/90 to-[#0F172A]/95 px-2.5 py-3 text-center shadow-[0_4px_0_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-0.5 hover:border-[#BAE6FD]"
                >
                  <ClipboardCheck className="h-5 w-5 text-[#00D4FF]" />
                  <span className="font-display text-sm font-bold whitespace-nowrap text-white">
                    Missões
                  </span>
                  <span className="font-mono-tabular text-[11px] font-semibold text-[#BAE6FD]">
                    {hud.dailyMissions.some((m) => !m.claimed && m.progress >= m.target)
                      ? 'Resgatar!'
                      : `${hud.dailyMissions.filter((m) => m.claimed).length}/3 hoje`}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="open-milestones-modal"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenMilestones();
                  }}
                  className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#C084FC]/75 bg-gradient-to-b from-[#2E1065]/90 to-[#0F172A]/95 px-2.5 py-3 text-center shadow-[0_4px_0_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-0.5 hover:border-[#E9D5FF]"
                >
                  <Award className="h-5 w-5 text-[#E9D5FF]" />
                  <span className="font-display text-sm font-bold whitespace-nowrap text-white">
                    Marcos
                  </span>
                  <span className="font-mono-tabular text-[11px] font-semibold text-[#E9D5FF]">
                    {hud.readyMilestonesCount > 0
                      ? `Resgatar (${hud.readyMilestonesCount})`
                      : `Nv.${hud.playerLevel} · ${hud.claimedMilestoneLevels.length}/10`}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="open-relics-modal"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenStore('relics');
                  }}
                  className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#334155] bg-[#0F172A]/92 px-3 py-3 text-center shadow-[0_4px_0_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-0.5 hover:border-[#C084FC]"
                >
                  <Gem className="h-5 w-5 text-[#C084FC]" />
                  <span className="font-display text-sm font-bold whitespace-nowrap text-white">
                    Relíquias
                  </span>
                  <span className="font-mono-tabular text-[11px] font-semibold text-[#94A3B8]">
                    {hud.equippedRelics.length}/{MAX_EQUIPPED_RELICS} ativas
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="open-talents-modal"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal('talents');
                  }}
                  className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#334155] bg-[#0F172A]/92 px-3 py-3 text-center shadow-[0_4px_0_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-0.5 hover:border-[#F59E0B]"
                >
                  <Sparkles className="h-5 w-5 text-[#F59E0B]" />
                  <span className="font-display text-sm font-bold whitespace-nowrap text-white">
                    Talentos
                  </span>
                  <span className="font-mono-tabular text-[11px] font-semibold text-[#FACC15]">
                    {hud.emberSouls} Almas
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="open-achievements-album"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenAlbum('achievements');
                  }}
                  className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#334155] bg-[#0F172A]/92 px-3 py-3 text-center shadow-[0_4px_0_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-0.5 hover:border-[#FACC15]"
                >
                  <Trophy className="h-5 w-5 text-[#FACC15]" />
                  <span className="font-display text-sm font-bold whitespace-nowrap text-white">
                    Conquistas
                  </span>
                  <span className="font-mono-tabular text-[11px] font-semibold text-[#94A3B8]">
                    {hud.unlockedAchievements.length}/{ACHIEVEMENT_CATALOG.length}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="open-albums-hub"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenAlbum('enemies');
                  }}
                  className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#334155] bg-[#0F172A]/92 px-3 py-3 text-center shadow-[0_4px_0_rgba(2,6,23,0.85)] transition-transform hover:-translate-y-0.5 hover:border-[#00D4FF]"
                >
                  <BookOpen className="h-5 w-5 text-[#00D4FF]" />
                  <span className="font-display text-sm font-bold whitespace-nowrap text-white">
                    Álbuns
                  </span>
                  <span className="font-mono-tabular text-[11px] font-semibold text-[#94A3B8]">
                    {unlockedEnemies + unlockedAllies}/60 cards
                  </span>
                </button>
              </section>
            </div>

            {/* Quiet Footer Hint */}
            <p className="text-center text-xs font-medium text-[#94A3B8]">
              Heróis mantêm o nível entre fases · Aliados evoluem por fusão e abates em cada fase
            </p>
          </div>
        )}

        {/* DEDICATED SUB-MODAL 1: SELECIONAR HERÓI */}
        {activeHubModal === 'hero' && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Selecionar Herói"
            data-testid="modal-hero-select"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <div className="w-full max-w-2xl rounded-3xl border-2 border-[#00D4FF] bg-[#0F172A] p-5 text-left shadow-[0_14px_40px_rgba(0,0,0,0.92)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {stageCfg.isConvergenceStage
                      ? 'Convergência Trio · Todos os 3 Heróis'
                      : 'Selecionar Herói Principal'}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#94A3B8]">
                    Os níveis dos heróis permanecem salvos entre todas as fases.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal(null);
                  }}
                  aria-label="Fechar seleção de herói"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#334155] bg-[#1E293B] text-white hover:bg-[#334155]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {HERO_ORDER.map((heroClass) => {
                  const spec = HERO_SPECS[heroClass];
                  const saved = hud.heroRoster[heroClass];
                  const isSelected = stageCfg.isConvergenceStage || hud.selectedHeroClass === heroClass;
                  const isMax = saved.level >= MAX_HERO_LEVEL;
                  const bounds = getHeroXpBounds(saved.level);
                  const xpLeft = Math.max(0, bounds.nextThreshold - saved.xp);
                  const xpSpan = Math.max(1, bounds.nextThreshold - bounds.currentFloor);
                  const xpPct = isMax
                    ? 100
                    : Math.max(0, Math.min(100, ((saved.xp - bounds.currentFloor) / xpSpan) * 100));
                  const scaled = getHeroStatsForLevel(heroClass, saved.level);
                  const rankTitle = getHeroRankTitle(saved.level);

                  return (
                    <button
                      key={heroClass}
                      type="button"
                      data-testid={`hero-card-${heroClass}`}
                      aria-pressed={hud.selectedHeroClass === heroClass}
                      onClick={() => {
                        soundEngine.playClick();
                        onSelectHero(heroClass);
                      }}
                      className={`flex flex-col justify-between rounded-2xl border-2 p-3.5 text-left transition-transform active:translate-y-0.5 ${
                        isSelected
                          ? 'border-[#FACC15] bg-[#1E293B] shadow-[0_4px_0_#B45309]'
                          : 'border-[#1E293B] bg-[#080D1A] hover:border-[#38BDF8]/70 hover:bg-[#131D31]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#050A14]"
                            style={{
                              boxShadow: isSelected ? `0 0 14px ${spec.glowColor}` : undefined,
                            }}
                          >
                            <HeroClassIcon heroClass={heroClass} className="h-7 w-7" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-display text-base font-bold text-white">
                                {spec.name}
                              </span>
                              <span
                                data-testid={`menu-hero-level-${heroClass}`}
                                className="font-mono-tabular text-xs font-extrabold text-[#00D4FF]"
                              >
                                {isMax ? 'MÁX' : `Nv.${saved.level}`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                              <span style={{ color: spec.color }}>{rankTitle}</span>
                              <span className="font-mono-tabular text-[#CBD5E1]">ATK {scaled.damage}</span>
                            </div>
                          </div>
                        </div>

                        <p className="mt-2.5 text-xs leading-snug text-[#94A3B8]">
                          {spec.shortRole}
                        </p>

                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-[#94A3B8]">
                            <span className="font-mono-tabular">{saved.kills} abates</span>
                            <span className="font-mono-tabular text-[#FACC15]">
                              {isMax ? 'Poder Supremo' : `${xpLeft} XP`}
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[#020617]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#FACC15]"
                              style={{ width: `${xpPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal(null);
                  }}
                  className="font-display rounded-xl border-2 border-[#020617] bg-[#00D4FF] px-6 py-2 text-sm font-bold whitespace-nowrap text-[#020617] shadow-[0_3px_0_#0369A1] hover:bg-[#38BDF8]"
                >
                  Confirmar Herói
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED SUB-MODAL 2: ESCOLHER PET GUARDIÃO */}
        {activeHubModal === 'pet' && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Escolher Pet Guardião"
            data-testid="menu-pet-selector"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <div className="w-full max-w-2xl rounded-3xl border-2 border-[#FACC15] bg-[#0F172A] p-5 text-left shadow-[0_14px_40px_rgba(0,0,0,0.92)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    Pet Guardião do Castelo
                  </h2>
                  <p className="mt-0.5 text-xs text-[#94A3B8]">
                    {hud.petChoiceUnlocked
                      ? 'Escolha liberada para a próxima partida! Selecione o pet desejado abaixo.'
                      : 'No início de cada partida o pet é sorteado aleatoriamente. Veja um anúncio para escolher.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal(null);
                  }}
                  aria-label="Fechar escolha de pet"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#334155] bg-[#1E293B] text-white hover:bg-[#334155]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {PET_ORDER.map((petKind) => {
                  const spec = PET_SPECS[petKind];
                  const isSelected = hud.petChoiceUnlocked && hud.selectedPet === petKind;
                  return (
                    <button
                      key={petKind}
                      type="button"
                      data-testid={`menu-pet-card-${petKind}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        soundEngine.playClick();
                        if (hud.petChoiceUnlocked) {
                          onSelectPet(petKind);
                        } else {
                          onRequestPetAd(petKind);
                        }
                      }}
                      className={`relative flex flex-col items-center rounded-2xl border-2 px-2.5 py-3 text-center transition-transform active:translate-y-0.5 ${
                        isSelected
                          ? 'bg-[#162033]'
                          : hud.petChoiceUnlocked
                            ? 'border-[#1E293B] bg-[#080D1A] hover:border-[#475569] hover:bg-[#111B2E]'
                            : 'border-[#1E293B] bg-[#080D1A]/85 opacity-90 hover:border-[#FACC15]/70 hover:opacity-100'
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: spec.primaryColor,
                              boxShadow: `0 4px 0 rgba(2,6,23,0.9), 0 0 18px ${spec.glowColor}`,
                            }
                          : undefined
                      }
                    >
                      {!hud.petChoiceUnlocked && (
                        <span
                          aria-hidden="true"
                          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-md border border-[#FACC15]/40 bg-[#0F172A]/95 text-[#FACC15]"
                        >
                          <Lock className="h-3 w-3" />
                        </span>
                      )}
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#050A14]"
                        style={{
                          boxShadow: isSelected ? `inset 0 0 16px ${spec.glowColor}` : undefined,
                        }}
                      >
                        <PetPortraitSvg pet={petKind} className="h-12 w-12" />
                      </div>
                      <div className="mt-2 font-display text-sm font-bold text-white">
                        {spec.name}
                      </div>
                      <div
                        className="mt-0.5 text-[11px] font-bold leading-tight"
                        style={{ color: spec.primaryColor }}
                      >
                        {spec.shortBonus}
                      </div>
                    </button>
                  );
                })}
              </div>

              {hud.petChoiceUnlocked ? (
                <div
                  className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-[#080D1A] px-4 py-3"
                  style={{ borderColor: `${activePet.primaryColor}55` }}
                >
                  <div className="text-xs leading-relaxed text-[#E2E8F0]">
                    <span className="font-display font-bold" style={{ color: activePet.primaryColor }}>
                      {activePet.title}:
                    </span>{' '}
                    <span>{activePet.description}</span>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold text-[#22C55E]">
                    Liberado p/ próxima partida
                  </span>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FACC15]/40 bg-[#080D1A] px-4 py-3">
                  <div className="flex items-center gap-2.5 text-xs leading-relaxed text-[#E2E8F0]">
                    <Shuffle className="h-5 w-5 shrink-0 text-[#FACC15]" />
                    <span>
                      Sem anúncio, <strong className="text-white">1 dos 5 pets</strong> será sorteado automaticamente ao iniciar a fase.
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
                {!hud.petChoiceUnlocked ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveHubModal(null);
                      }}
                      className="rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-2 text-xs font-bold whitespace-nowrap text-[#CBD5E1] hover:bg-[#334155] hover:text-white"
                    >
                      Usar Aleatório
                    </button>
                    <button
                      type="button"
                      data-testid="btn-watch-ad-pet"
                      onClick={() => {
                        soundEngine.playClick();
                        onRequestPetAd();
                      }}
                      className="font-display flex items-center gap-2 rounded-xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-5 py-2 text-sm font-bold whitespace-nowrap text-white shadow-[0_3px_0_#991B1B] hover:brightness-105 active:translate-y-0.5"
                    >
                      <Tv className="h-4 w-4 shrink-0" />
                      <span>Ver Anúncio para Escolher</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveHubModal(null);
                    }}
                    className="font-display rounded-xl border-2 border-[#020617] bg-[#FACC15] px-6 py-2 text-sm font-bold whitespace-nowrap text-[#020617] shadow-[0_3px_0_#B45309] hover:bg-[#FDE047]"
                  >
                    Confirmar Pet
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED SUB-MODAL 3: ESCOLHER NÍVEL / FASE */}
        {activeHubModal === 'stage' && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Escolher Nível"
            data-testid="modal-stage-select"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <div className="w-full max-w-2xl rounded-3xl border-2 border-[#FACC15] bg-[#0F172A] p-5 text-left shadow-[0_14px_40px_rgba(0,0,0,0.92)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    Escolher Nível · Fase {selectedStage}
                  </h2>
                  <p className="font-mono-tabular mt-0.5 text-xs font-semibold text-[#00D4FF]">
                    {stageCfg.title} · {stageCfg.routeCount}{' '}
                    {stageCfg.routeCount === 1 ? 'Rota' : 'Rotas'} · {stageCfg.totalWaves} ondas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal(null);
                  }}
                  aria-label="Fechar seleção de nível"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#334155] bg-[#1E293B] text-white hover:bg-[#334155]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#94A3B8]">
                  Desbloqueado até a Fase {hud.highestUnlockedStage} de {TOTAL_STAGES}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Capítulo anterior"
                    disabled={chapterIndex <= 0}
                    onClick={() => {
                      soundEngine.playClick();
                      setChapterIndex((prev) => Math.max(0, prev - 1));
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#334155] bg-[#1E293B] text-white disabled:opacity-35"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-mono-tabular text-xs font-bold text-white">
                    Fases {chapterStart}-{chapterEnd}
                  </span>
                  <button
                    type="button"
                    aria-label="Próximo capítulo"
                    disabled={chapterIndex >= TOTAL_CHAPTERS - 1}
                    onClick={() => {
                      soundEngine.playClick();
                      setChapterIndex((prev) => Math.min(TOTAL_CHAPTERS - 1, prev + 1));
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#334155] bg-[#1E293B] text-white disabled:opacity-35"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
                {chapterStages.map((stageNum) => {
                  const unlocked = stageNum <= hud.highestUnlockedStage;
                  const active = stageNum === selectedStage;
                  const isConvergence = convergenceStages.includes(stageNum);
                  const enemyUnlock = getEnemyUnlockForStage(stageNum);
                  const allyUnlock = getAllyUnlockForStage(stageNum);
                  const isBossStage = Boolean(enemyUnlock?.isBoss);
                  return (
                    <button
                      key={stageNum}
                      type="button"
                      disabled={!unlocked}
                      data-testid={`stage-btn-${stageNum}`}
                      data-convergence={isConvergence ? 'true' : 'false'}
                      aria-label={unlocked ? `Selecionar Fase ${stageNum}` : `Fase ${stageNum} bloqueada`}
                      onClick={() => {
                        soundEngine.playClick();
                        onSelectStage(stageNum);
                      }}
                      className={`font-mono-tabular relative flex h-11 items-center justify-center rounded-xl border-2 text-sm font-bold transition-transform active:translate-y-0.5 ${
                        !unlocked
                          ? 'cursor-not-allowed border-[#1E293B] bg-[#080D1A] text-white/30'
                          : active
                            ? 'border-[#FACC15] bg-[#FF2E4C] text-white shadow-[0_3px_0_#991B1B]'
                            : isConvergence
                              ? 'border-[#FACC15] bg-[#422006]/85 text-[#FEF08A] hover:border-[#00D4FF]'
                              : isBossStage
                                ? 'border-[#FACC15]/80 bg-[#1E293B] text-[#FACC15] hover:border-[#00D4FF]'
                                : allyUnlock
                                  ? 'border-[#10B981]/80 bg-[#1E293B] text-[#6EE7B7] hover:border-[#FACC15]'
                                  : enemyUnlock
                                    ? 'border-[#00D4FF]/65 bg-[#1E293B] text-[#00D4FF] hover:border-[#FACC15]'
                                    : 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] hover:border-[#00D4FF]'
                      }`}
                    >
                      {unlocked ? stageNum : <Lock className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal(null);
                  }}
                  className="rounded-xl border border-[#334155] bg-[#1E293B] px-5 py-2.5 text-sm font-bold whitespace-nowrap text-white hover:bg-[#334155]"
                >
                  Confirmar Fase {selectedStage}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal(null);
                    onStart(selectedStage);
                  }}
                  className="font-display flex items-center gap-2 rounded-xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-6 py-2.5 text-sm font-bold whitespace-nowrap text-white shadow-[0_4px_0_#991B1B] active:translate-y-0.5"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Play · Fase {selectedStage}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED SUB-MODAL 4: TALENTOS DE BRASA */}
        {activeHubModal === 'talents' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-lg rounded-3xl border-2 border-[#FACC15] bg-[#0F172A] p-5 text-left shadow-[0_12px_36px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#422006] text-[#FACC15]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#FACC15]">
                      Árvore de Talentos Permanentes
                    </h3>
                    <div className="font-mono-tabular text-xs text-[#00D4FF]">
                      Almas de Brasa disponíveis: {hud.emberSouls}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal(null);
                  }}
                  className="rounded-xl border border-[#334155] bg-[#1E293B] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#334155]"
                >
                  Fechar
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {Object.entries(TALENT_SPECS).map(([talentId, spec]) => {
                  const currentLevel = hud.talents[talentId] ?? 0;
                  const isMax = currentLevel >= spec.maxLevel;
                  const cost = spec.baseCost * (currentLevel + 1);
                  const canAfford = hud.emberSouls >= cost && !isMax;

                  return (
                    <div
                      key={talentId}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[#334155] bg-[#080D1A] p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm font-bold text-white">
                            {spec.name}
                          </span>
                          <span className="font-mono-tabular text-xs text-[#00D4FF]">
                            Nv.{currentLevel}/{spec.maxLevel}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[#94A3B8]">{spec.description}</p>
                      </div>
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => {
                          soundEngine.playClick();
                          onUpgradeTalent(talentId);
                        }}
                        className="font-mono-tabular shrink-0 rounded-xl border border-[#FACC15] bg-[#422006] px-3 py-2 text-xs font-bold whitespace-nowrap text-[#FACC15] transition-transform active:translate-y-0.5 hover:bg-[#78350F] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isMax ? 'MÁX' : `Evoluir (${cost} Almas)`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED SUB-MODAL 5: LOJA DE APARÊNCIAS */}
        {activeHubModal === 'shop' && (
          <div
            data-testid="shop-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Loja de Aparências"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4"
          >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-[#10B981] bg-[#0F172A] text-left shadow-[0_14px_40px_rgba(0,0,0,0.92)]">
              <div className="flex items-center justify-between border-b border-white/10 bg-[#080D1A] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#10B981]/50 bg-[#064E3B] text-[#6EE7B7]">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#6EE7B7]">
                      Loja de Aparências
                    </h3>
                    <div className="font-mono-tabular text-xs font-bold text-[#FACC15]">
                      Almas de Brasa disponíveis: {hud.emberSouls}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="shop-close"
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveHubModal(null);
                  }}
                  className="rounded-xl border border-[#334155] bg-[#1E293B] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#334155]"
                >
                  Fechar
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                <div>
                  <h4 className="mb-2.5 text-xs font-bold tracking-wider text-[#FACC15]">
                    Skins do Anel Central
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {Object.values(RING_SKINS).map((skin) => {
                      const unlocked = hud.unlockedCosmetics.includes(`ring:${skin.id}`);
                      const equipped = hud.equippedRingSkin === skin.id;
                      const canAfford = hud.emberSouls >= skin.cost;

                      return (
                        <div
                          key={skin.id}
                          className={`flex flex-col justify-between gap-3 rounded-2xl border-2 p-3 ${
                            equipped
                              ? 'border-[#FACC15] bg-[#1E293B]'
                              : 'border-[#334155] bg-[#080D1A]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 bg-[#020617]"
                              style={{
                                borderColor: skin.primaryColor,
                                boxShadow: `0 0 14px ${skin.glowColor}`,
                              }}
                            >
                              <div
                                className="h-4 w-4 rounded-full border-2"
                                style={{
                                  borderColor: skin.secondaryColor,
                                  backgroundColor: skin.runeColor,
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-display text-sm font-bold text-white">
                                {skin.name}
                              </div>
                              <p className="mt-0.5 text-[11px] leading-snug text-[#94A3B8]">
                                {skin.description}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            data-testid={`shop-ring-${skin.id}`}
                            disabled={equipped || (!unlocked && !canAfford)}
                            onClick={() => onBuyOrEquipRingSkin(skin.id)}
                            className={`font-mono-tabular w-full rounded-xl border px-3 py-1.5 text-xs font-bold transition-transform active:translate-y-0.5 ${
                              equipped
                                ? 'border-[#FACC15] bg-[#422006] text-[#FACC15]'
                                : unlocked
                                  ? 'border-[#00D4FF] bg-[#082F49] text-[#E0F2FE] hover:bg-[#0369A1]'
                                  : canAfford
                                    ? 'border-[#10B981] bg-[#064E3B] text-[#6EE7B7] hover:bg-[#047857]'
                                    : 'cursor-not-allowed border-[#334155] bg-[#1E293B] text-[#64748B]'
                            }`}
                          >
                            {equipped
                              ? 'Equipado'
                              : unlocked
                                ? 'Equipar'
                                : `Desbloquear (${skin.cost} Almas)`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2.5 text-xs font-bold tracking-wider text-[#00D4FF]">
                    Efeitos de Disparo e Magias
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {Object.values(FX_STYLES).map((fx) => {
                      const unlocked = hud.unlockedCosmetics.includes(`fx:${fx.id}`);
                      const equipped = hud.equippedFxStyle === fx.id;
                      const canAfford = hud.emberSouls >= fx.cost;

                      return (
                        <div
                          key={fx.id}
                          className={`flex flex-col justify-between gap-3 rounded-2xl border-2 p-3 ${
                            equipped
                              ? 'border-[#00D4FF] bg-[#1E293B]'
                              : 'border-[#334155] bg-[#080D1A]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 bg-[#020617]"
                              style={{ borderColor: fx.projectileTint }}
                            >
                              <div className="flex items-center gap-1">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: fx.projectileTint }}
                                />
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: fx.slashTint }}
                                />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="font-display text-sm font-bold text-white">
                                {fx.name}
                              </div>
                              <p className="mt-0.5 text-[11px] leading-snug text-[#94A3B8]">
                                {fx.description}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            data-testid={`shop-fx-${fx.id}`}
                            disabled={equipped || (!unlocked && !canAfford)}
                            onClick={() => onBuyOrEquipFxStyle(fx.id)}
                            className={`font-mono-tabular w-full rounded-xl border px-3 py-1.5 text-xs font-bold transition-transform active:translate-y-0.5 ${
                              equipped
                                ? 'border-[#00D4FF] bg-[#082F49] text-[#00D4FF]'
                                : unlocked
                                  ? 'border-[#00D4FF] bg-[#082F49]/70 text-[#E0F2FE] hover:bg-[#0369A1]'
                                  : canAfford
                                    ? 'border-[#10B981] bg-[#064E3B] text-[#6EE7B7] hover:bg-[#047857]'
                                    : 'cursor-not-allowed border-[#334155] bg-[#1E293B] text-[#64748B]'
                            }`}
                          >
                            {equipped
                              ? 'Equipado'
                              : unlocked
                                ? 'Equipar'
                                : `Desbloquear (${fx.cost} Almas)`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (hud.phase === 'paused') {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-title"
          className="w-full max-w-sm rounded-3xl border-2 border-[#334155] bg-[#0F172A] p-6 text-center shadow-[0_10px_0_rgba(2,6,23,0.9)]"
        >
          <h2 id="pause-title" className="font-display text-3xl font-bold text-white">
            Jogo Pausado
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-[#1E293B] bg-[#080D1A] p-3">
            <div>
              <div className="text-[10px] font-bold text-[#FACC15] uppercase">Fase</div>
              <div className="font-mono-tabular text-xl font-bold text-white">{hud.stage}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#00D4FF] uppercase">Herói</div>
              <div className="font-mono-tabular text-xl font-bold text-white">Nv.{hud.heroLevel}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#FF2E4C] uppercase">Pontos</div>
              <div className="font-mono-tabular text-xl font-bold text-white">{Math.round(hud.score)}</div>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onResume();
              }}
              className="font-display flex items-center justify-center gap-2 rounded-xl border-2 border-[#020617] bg-[#00D4FF] px-5 py-3 text-lg font-bold whitespace-nowrap text-[#020617] shadow-[0_4px_0_#0369A1] transition-transform active:translate-y-0.5 hover:bg-[#38BDF8]"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>Continuar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onRestart();
              }}
              className="font-display flex items-center justify-center gap-2 rounded-xl border-2 border-[#020617] bg-[#FACC15] px-5 py-2.5 text-base font-bold whitespace-nowrap text-[#020617] shadow-[0_4px_0_#B45309] transition-transform active:translate-y-0.5 hover:bg-[#FDE047]"
            >
              <RotateCcw className="h-4.5 w-4.5" />
              <span>Jogar Novamente</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onReturnTitle();
              }}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#334155] bg-[#1E293B] px-5 py-2.5 text-sm font-bold whitespace-nowrap text-[#E2E8F0] transition-colors hover:bg-[#334155]"
            >
              <Home className="h-4 w-4" />
              <span>Menu Principal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (hud.phase === 'victory' || hud.phase === 'gameover') {
    const isVictory = hud.phase === 'victory';
    const hasNextStage = isVictory && hud.stage < TOTAL_STAGES;
    const nextEnemy = hasNextStage ? getEnemyUnlockForStage(hud.stage + 1) : undefined;
    const nextAlly = hasNextStage ? getAllyUnlockForStage(hud.stage + 1) : undefined;

    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="outcome-title"
          className="w-full max-w-sm rounded-3xl border-2 border-[#334155] bg-[#0F172A] p-6 text-center shadow-[0_10px_0_rgba(2,6,23,0.92)]"
        >
          <div
            className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${
              isVictory
                ? 'border-[#B45309] bg-[#FACC15] text-[#020617]'
                : 'border-[#7F1D1D] bg-[#FF2E4C] text-white'
            }`}
          >
            {isVictory ? <Trophy className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
          </div>

          <h2
            id="outcome-title"
            className={`font-display text-3xl font-bold leading-tight ${
              isVictory ? 'text-[#FACC15]' : 'text-[#FF2E4C]'
            }`}
          >
            {isVictory
              ? hud.stage >= TOTAL_STAGES
                ? 'Vitória Final!'
                : `Fase ${hud.stage} Concluída!`
              : 'Castelo Destruído'}
          </h2>
          <p className="mt-1 text-xs font-bold text-[#00D4FF]">
            {isVictory
              ? hasNextStage
                ? `Nova Rota Desbloqueada · Fase ${hud.stage + 1}${
                    nextAlly
                      ? ` · Aliado Liberado: ${nextAlly.name}`
                      : nextEnemy
                        ? ` · Novo Card: ${nextEnemy.name}`
                        : ''
                  }`
                : 'Todas as 150 rotas defendidas!'
              : `Fase ${hud.stage} · Onda ${hud.wave}/${hud.totalWavesInStage}`}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-2xl border border-[#1E293B] bg-[#080D1A] p-3">
            <div className="rounded-xl bg-[#0F172A] p-2.5">
              <div className="text-[10px] font-bold text-[#00D4FF] uppercase">Abates Totais</div>
              <div className="font-mono-tabular mt-0.5 text-xl font-bold text-white" data-testid="modal-kills">
                {hud.kills}
              </div>
            </div>
            <div className="rounded-xl bg-[#0F172A] p-2.5">
              <div className="text-[10px] font-bold text-[#FACC15] uppercase">Nível Mantido</div>
              <div className="font-mono-tabular mt-0.5 text-lg font-bold text-white">
                {hud.activeHeroes.length > 1
                  ? `Nv.${hud.heroRoster.archer.level}/${hud.heroRoster.swordsman.level}/${hud.heroRoster.bomber.level}`
                  : `Nv.${hud.heroLevel}`}
              </div>
            </div>
            <div className="rounded-xl bg-[#0F172A] p-2.5">
              <div className="text-[10px] font-bold text-[#00D4FF] uppercase">Tempo</div>
              <div className="font-mono-tabular mt-0.5 text-xl font-bold text-white" data-testid="modal-time">
                {formatSurvivalTime(hud.survivalSeconds)}
              </div>
            </div>
            <div className="rounded-xl bg-[#0F172A] p-2.5">
              <div className="text-[10px] font-bold text-[#FF2E4C] uppercase">Pontos</div>
              <div className="font-mono-tabular mt-0.5 text-xl font-bold text-white" data-testid="modal-score">
                {Math.round(hud.score)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {hasNextStage ? (
              <>
                <button
                  type="button"
                  data-start="true"
                  onClick={() => {
                    soundEngine.playClick();
                    onNextStage();
                  }}
                  className="font-display flex items-center justify-center gap-2 rounded-xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-5 py-3 text-lg font-bold whitespace-nowrap text-white shadow-[0_4px_0_#991B1B] transition-transform active:translate-y-0.5"
                >
                  <span>Próxima Fase</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onStart(hud.stage);
                  }}
                  className="font-display flex items-center justify-center gap-2 rounded-xl border-2 border-[#020617] bg-[#00D4FF] px-5 py-2.5 text-base font-bold whitespace-nowrap text-[#020617] shadow-[0_3px_0_#0369A1] transition-transform active:translate-y-0.5 hover:bg-[#38BDF8]"
                >
                  <RotateCcw className="h-4.5 w-4.5" />
                  <span>Jogar Novamente</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                data-start="true"
                onClick={() => {
                  soundEngine.playClick();
                  onStart(hud.stage);
                }}
                className="font-display flex items-center justify-center gap-2 rounded-xl border-2 border-[#FEF08A] bg-gradient-to-r from-[#FF2E4C] to-[#F59E0B] px-5 py-3 text-lg font-bold whitespace-nowrap text-white shadow-[0_4px_0_#991B1B] transition-transform active:translate-y-0.5"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Jogar Novamente</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onReturnTitle();
              }}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#334155] bg-[#1E293B] px-5 py-2.5 text-sm font-bold whitespace-nowrap text-[#E2E8F0] transition-colors hover:bg-[#334155]"
            >
              <Home className="h-4 w-4" />
              <span>Menu Principal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
