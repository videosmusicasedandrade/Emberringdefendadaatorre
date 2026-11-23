import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Crosshair, Lock, Search, Shield, Skull, Sparkles, Trophy, X } from 'lucide-react';
import { soundEngine } from '../game/audio';
import {
  ALLY_ALBUM,
  ENEMY_ALBUM,
  isAllyUnlocked,
  isEnemyUnlocked,
} from '../game/bestiaryData';
import {
  ACHIEVEMENT_CATALOG,
  AllyCatalogEntry,
  EnemyCatalogEntry,
  UNIT_SPECS,
} from '../game/types';
import { AllyPortraitSvg, EnemyPortraitSvg } from './AlbumArtwork';

export type AlbumTab = 'enemies' | 'allies' | 'achievements';
type FilterMode = 'all' | 'unlocked' | 'locked' | 'bosses';

interface AlbumModalProps {
  isOpen: boolean;
  initialTab: AlbumTab;
  highestUnlockedStage: number;
  enemyKillsByCatalogId?: Record<number, number>;
  discoveredEnemyIds?: number[];
  unlockedAchievements?: string[];
  achievementProgress?: Record<string, number>;
  emberSouls?: number;
  onClose: () => void;
}

export const AlbumModal: React.FC<AlbumModalProps> = ({
  isOpen,
  initialTab,
  highestUnlockedStage,
  enemyKillsByCatalogId = {},
  discoveredEnemyIds = [],
  unlockedAchievements = [],
  achievementProgress = {},
  emberSouls = 0,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<AlbumTab>(initialTab);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyCatalogEntry | null>(null);
  const [selectedAlly, setSelectedAlly] = useState<AllyCatalogEntry | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFilterMode('all');
      setSearchQuery('');
      setSelectedEnemy(null);
      setSelectedAlly(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedEnemy || selectedAlly) {
          setSelectedEnemy(null);
          setSelectedAlly(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, selectedEnemy, selectedAlly, onClose]);

  const discoveredSet = useMemo(() => new Set(discoveredEnemyIds), [discoveredEnemyIds]);

  const unlockedEnemyCount = useMemo(
    () =>
      ENEMY_ALBUM.filter(
        (e) => isEnemyUnlocked(e, highestUnlockedStage) || discoveredSet.has(e.id)
      ).length,
    [highestUnlockedStage, discoveredSet]
  );

  const unlockedAllyCount = useMemo(
    () => ALLY_ALBUM.filter((a) => isAllyUnlocked(a, highestUnlockedStage)).length,
    [highestUnlockedStage]
  );

  const filteredEnemies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ENEMY_ALBUM.filter((enemy) => {
      const unlocked = isEnemyUnlocked(enemy, highestUnlockedStage) || discoveredSet.has(enemy.id);
      if (filterMode === 'unlocked' && !unlocked) return false;
      if (filterMode === 'locked' && unlocked) return false;
      if (filterMode === 'bosses' && !enemy.isBoss) return false;
      if (!q) return true;
      return (
        enemy.code.toLowerCase().includes(q) ||
        (unlocked &&
          (enemy.name.toLowerCase().includes(q) ||
            enemy.specialty.toLowerCase().includes(q))) ||
        (!unlocked && `fase ${enemy.unlockStage}`.includes(q))
      );
    });
  }, [filterMode, highestUnlockedStage, discoveredSet, searchQuery]);

  const filteredAllies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALLY_ALBUM.filter((ally) => {
      const unlocked = isAllyUnlocked(ally, highestUnlockedStage);
      if (filterMode === 'unlocked' && !unlocked) return false;
      if (filterMode === 'locked' && unlocked) return false;
      if (!q) return true;
      return (
        ally.code.toLowerCase().includes(q) ||
        (unlocked &&
          (ally.name.toLowerCase().includes(q) ||
            ally.title.toLowerCase().includes(q) ||
            ally.colorName.toLowerCase().includes(q))) ||
        (!unlocked && `fase ${ally.unlockStage}`.includes(q))
      );
    });
  }, [filterMode, highestUnlockedStage, searchQuery]);

  const filteredAchievements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ACHIEVEMENT_CATALOG.filter((ach) => {
      const done = unlockedAchievements.includes(ach.id);
      if (filterMode === 'unlocked' && !done) return false;
      if (filterMode === 'locked' && done) return false;
      if (!q) return true;
      return (
        ach.title.toLowerCase().includes(q) ||
        ach.description.toLowerCase().includes(q)
      );
    });
  }, [filterMode, unlockedAchievements, searchQuery]);

  if (!isOpen) return null;

  const currentCount =
    activeTab === 'enemies'
      ? unlockedEnemyCount
      : activeTab === 'allies'
        ? unlockedAllyCount
        : unlockedAchievements.length;
  const currentTotal =
    activeTab === 'enemies'
      ? ENEMY_ALBUM.length
      : activeTab === 'allies'
        ? ALLY_ALBUM.length
        : ACHIEVEMENT_CATALOG.length;
  const completionPct = Math.round((currentCount / Math.max(1, currentTotal)) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#040812]/88 p-2 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-modal-title"
      data-testid="album-modal"
    >
      <div className="relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border-2 border-[#334155] bg-[#0B1222] shadow-[0_14px_40px_rgba(0,0,0,0.85)]">
        {/* Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] bg-[#0F172A] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FACC15]/50 bg-[#1E293B] text-[#FACC15]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="album-modal-title"
                className="font-display text-lg font-bold text-white sm:text-xl"
              >
                Códice de Brasa ·{' '}
                {activeTab === 'enemies'
                  ? 'Bestiário'
                  : activeTab === 'allies'
                    ? 'Aliados'
                    : 'Conquistas'}
              </h2>
              <p className="font-mono-tabular text-xs font-semibold text-[#94A3B8]">
                Fase: {highestUnlockedStage}/150 · Progresso: {currentCount}/{currentTotal} ({completionPct}%) · Almas: {emberSouls}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="album-tab-enemies"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('enemies');
                setFilterMode('all');
                setSelectedEnemy(null);
                setSelectedAlly(null);
              }}
              className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors sm:text-sm ${
                activeTab === 'enemies'
                  ? 'border-[#FF2E4C] bg-[#450A0A] text-[#FEF08A]'
                  : 'border-[#334155] bg-[#1E293B] text-[#CBD5E1] hover:border-[#FF2E4C]/70'
              }`}
            >
              <Skull className="h-4 w-4" />
              <span>Inimigos ({unlockedEnemyCount}/50)</span>
            </button>
            <button
              type="button"
              data-testid="album-tab-allies"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('allies');
                if (filterMode === 'bosses') setFilterMode('all');
                setSelectedEnemy(null);
                setSelectedAlly(null);
              }}
              className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors sm:text-sm ${
                activeTab === 'allies'
                  ? 'border-[#00D4FF] bg-[#082F49] text-[#E0F2FE]'
                  : 'border-[#334155] bg-[#1E293B] text-[#CBD5E1] hover:border-[#00D4FF]/70'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Aliados ({unlockedAllyCount}/10)</span>
            </button>
            <button
              type="button"
              data-testid="album-tab-achievements"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('achievements');
                if (filterMode === 'bosses') setFilterMode('all');
                setSelectedEnemy(null);
                setSelectedAlly(null);
              }}
              className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors sm:text-sm ${
                activeTab === 'achievements'
                  ? 'border-[#FACC15] bg-[#422006] text-[#FEF08A]'
                  : 'border-[#334155] bg-[#1E293B] text-[#CBD5E1] hover:border-[#FACC15]/70'
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Conquistas ({unlockedAchievements.length}/{ACHIEVEMENT_CATALOG.length})</span>
            </button>
            <button
              type="button"
              data-testid="album-close"
              aria-label="Fechar códice"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#334155] bg-[#1E293B] text-[#E2E8F0] transition-colors hover:border-[#FACC15] hover:text-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Progress + Search & Filter Toolbar */}
        <div className="flex flex-col gap-2.5 border-b border-[#1E293B] bg-[#0D1526] px-4 py-3 sm:px-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#060A14]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                activeTab === 'enemies'
                  ? 'bg-gradient-to-r from-[#FF2E4C] to-[#FACC15]'
                  : activeTab === 'allies'
                    ? 'bg-gradient-to-r from-[#00D4FF] to-[#10B981]'
                    : 'bg-gradient-to-r from-[#FACC15] to-[#10B981]'
              }`}
              style={{ width: `${completionPct}%` }}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  {
                    id: 'unlocked',
                    label: activeTab === 'achievements' ? 'Concluídas' : 'Desbloqueados',
                  },
                  {
                    id: 'locked',
                    label: activeTab === 'achievements' ? 'Em progresso' : 'Bloqueados',
                  },
                  ...(activeTab === 'enemies' ? [{ id: 'bosses', label: 'Chefes' }] : []),
                ] as Array<{ id: FilterMode; label: string }>
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setFilterMode(f.id);
                  }}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-bold whitespace-nowrap transition-colors ${
                    filterMode === f.id
                      ? 'border-[#FACC15] bg-[#422006] text-[#FEF08A]'
                      : 'border-[#334155] bg-[#162033] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'enemies'
                    ? 'Buscar #001 ou inimigo...'
                    : activeTab === 'allies'
                      ? 'Buscar #001 ou aliado...'
                      : 'Buscar conquista...'
                }
                className="w-full rounded-xl border border-[#334155] bg-[#080D1A] py-1.5 pl-8 pr-3 text-xs font-medium text-white placeholder-[#64748B] focus:border-[#00D4FF] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'enemies' ? (
            filteredEnemies.length === 0 ? (
              <div className="py-12 text-center text-sm font-semibold text-[#94A3B8]">
                Nenhum inimigo encontrado para este filtro.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEnemies.map((enemy) => {
                  const unlocked = isEnemyUnlocked(enemy, highestUnlockedStage) || discoveredSet.has(enemy.id);
                  const kills = enemyKillsByCatalogId[enemy.id] ?? 0;
                  const counterAlly = ALLY_ALBUM.find((a) => a.id === enemy.counterAllyId);
                  return (
                    <button
                      key={enemy.id}
                      type="button"
                      data-testid={`enemy-card-${enemy.id}`}
                      data-unlocked={unlocked ? 'true' : 'false'}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedEnemy(enemy);
                      }}
                      className={`group flex flex-col gap-2.5 rounded-2xl border-2 p-3 text-left transition-transform hover:-translate-y-0.5 ${
                        unlocked
                          ? enemy.isBoss
                            ? 'border-[#FACC15]/80 bg-[#1A1328] hover:border-[#FACC15]'
                            : 'border-[#334155] bg-[#111B30] hover:border-[#00D4FF]'
                          : 'border-[#1E293B] bg-[#090E1A] opacity-85 hover:border-[#475569]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <EnemyPortraitSvg enemy={enemy} unlocked={unlocked} className="h-18 w-18" />
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#475569] bg-[#020617]/90 text-[#CBD5E1]">
                                <Lock className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono-tabular text-xs font-bold text-[#94A3B8]">
                              {enemy.code}
                            </span>
                            {unlocked ? (
                              <span
                                className="font-mono-tabular text-xs font-bold"
                                style={{ color: enemy.isBoss ? '#FACC15' : '#FF2E4C' }}
                              >
                                HP: {enemy.hp.toLocaleString('pt-BR')}
                              </span>
                            ) : (
                              <span className="font-mono-tabular flex items-center gap-1 text-[11px] font-bold text-[#64748B]">
                                <Lock className="h-3 w-3" />
                                Fase {enemy.unlockStage}
                              </span>
                            )}
                          </div>

                          <h3
                            className={`mt-0.5 truncate font-display text-base font-bold ${
                              unlocked ? 'text-white' : 'text-[#94A3B8]'
                            }`}
                          >
                            {unlocked ? enemy.name : 'Inimigo Bloqueado'}
                          </h3>

                          {!unlocked ? (
                            <div className="mt-1 text-[11px] font-semibold">
                              <span className="font-mono-tabular text-[#64748B]">
                                HP: ??? · Atributos ocultos
                              </span>
                            </div>
                          ) : (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                              {enemy.isBoss && (
                                <span className="rounded bg-[#422006] px-1.5 py-0.5 text-[10px] text-[#FACC15]">
                                  Chefe
                                </span>
                              )}
                              <span className="font-mono-tabular text-[#00D4FF]">
                                Abates: {kills.toLocaleString('pt-BR')}
                              </span>
                              {counterAlly && (
                                <span className="truncate text-[#10B981]">
                                  · Fraqueza: {counterAlly.name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <p
                        className={`text-xs leading-relaxed ${
                          unlocked ? 'text-[#CBD5E1]' : 'italic text-[#64748B]'
                        }`}
                      >
                        {unlocked ? enemy.story : enemy.mysteryPreview}
                      </p>
                    </button>
                  );
                })}
              </div>
            )
          ) : activeTab === 'achievements' ? (
            filteredAchievements.length === 0 ? (
              <div className="py-12 text-center text-sm font-semibold text-[#94A3B8]">
                Nenhuma conquista encontrada para este filtro.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filteredAchievements.map((ach) => {
                  const done = unlockedAchievements.includes(ach.id);
                  const prog = Math.min(ach.target, achievementProgress[ach.id] ?? (done ? ach.target : 0));
                  const pct = Math.round((prog / Math.max(1, ach.target)) * 100);
                  const categoryLabel =
                    ach.category === 'combat'
                      ? 'Combate'
                      : ach.category === 'mastery'
                        ? 'Maestria'
                        : 'Progressão';

                  return (
                    <div
                      key={ach.id}
                      data-testid={`achievement-card-${ach.id}`}
                      data-unlocked={done ? 'true' : 'false'}
                      className={`flex flex-col justify-between gap-3 rounded-2xl border-2 p-4 ${
                        done
                          ? 'border-[#FACC15] bg-[#1E293B]/95 shadow-[0_4px_16px_rgba(250,204,21,0.18)]'
                          : 'border-[#334155] bg-[#111B30]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                              done
                                ? 'border-[#FACC15] bg-[#422006] text-[#FACC15]'
                                : 'border-[#334155] bg-[#080D1A] text-[#64748B]'
                            }`}
                          >
                            {done ? <CheckCircle2 className="h-6 w-6" /> : <Trophy className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="rounded bg-[#080D1A] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00D4FF]">
                                {categoryLabel}
                              </span>
                              <span className="font-mono-tabular text-[11px] font-bold text-[#FACC15]">
                                +{ach.rewardSouls} Almas de Brasa
                              </span>
                            </div>
                            <h3 className="mt-1 font-display text-base font-bold text-white">
                              {ach.title}
                            </h3>
                            <p className="mt-0.5 text-xs leading-relaxed text-[#CBD5E1]">
                              {ach.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                          <span className={done ? 'text-[#4ADE80]' : 'text-[#94A3B8]'}>
                            {done ? 'Concluída' : 'Em andamento'}
                          </span>
                          <span className="font-mono-tabular text-white">
                            {prog}/{ach.target} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#060A14]">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              done
                                ? 'bg-gradient-to-r from-[#22C55E] to-[#FACC15]'
                                : 'bg-gradient-to-r from-[#00D4FF] to-[#38BDF8]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : filteredAllies.length === 0 ? (
            <div className="py-12 text-center text-sm font-semibold text-[#94A3B8]">
              Nenhum aliado encontrado para este filtro.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredAllies.map((ally) => {
                const unlocked = isAllyUnlocked(ally, highestUnlockedStage);
                const spec = UNIT_SPECS[ally.unitKind];
                return (
                  <button
                    key={ally.id}
                    type="button"
                    data-testid={`ally-card-${ally.id}`}
                    data-unlocked={unlocked ? 'true' : 'false'}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedAlly(ally);
                    }}
                    className={`flex flex-col gap-3 rounded-2xl border-2 p-3.5 text-left transition-transform hover:-translate-y-0.5 ${
                      unlocked
                        ? 'border-[#334155] bg-[#111B30] hover:border-[#FACC15]'
                        : 'border-[#1E293B] bg-[#090E1A] opacity-85 hover:border-[#475569]'
                    }`}
                    style={
                      unlocked
                        ? { boxShadow: `inset 0 0 0 1px ${ally.colorHex}33` }
                        : undefined
                    }
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        <AllyPortraitSvg ally={ally} unlocked={unlocked} className="h-20 w-20" />
                        {!unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#475569] bg-[#020617]/90 text-[#CBD5E1]">
                              <Lock className="h-4.5 w-4.5" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-tabular text-xs font-bold text-[#94A3B8]">
                            {ally.code} · Tecla [{ally.hotkey}]
                          </span>
                          {unlocked ? (
                            <span
                              className="flex items-center gap-1.5 text-xs font-bold"
                              style={{ color: ally.colorHex }}
                            >
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full border border-black/40"
                                style={{ backgroundColor: ally.colorHex }}
                              />
                              {ally.colorName}
                            </span>
                          ) : (
                            <span className="font-mono-tabular flex items-center gap-1 text-xs font-bold text-[#64748B]">
                              <Lock className="h-3.5 w-3.5" />
                              Fase {ally.unlockStage}
                            </span>
                          )}
                        </div>

                        <h3
                          className={`mt-0.5 font-display text-lg font-bold ${
                            unlocked ? 'text-white' : 'text-[#94A3B8]'
                          }`}
                        >
                          {unlocked ? `${ally.name} — ${ally.title}` : 'Aliado Bloqueado'}
                        </h3>

                        {unlocked ? (
                          <div className="font-mono-tabular mt-1 text-xs font-semibold text-[#FACC15]">
                            Custo: {spec.cost} ess. · Dano: {spec.damage} · Alcance: {spec.range}
                          </div>
                        ) : (
                          <div className="font-mono-tabular mt-1 text-xs font-semibold text-[#64748B]">
                            Cor: ??? · Especialidade oculta
                          </div>
                        )}
                      </div>
                    </div>

                    {unlocked ? (
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[#00D4FF]">
                          Especialidade: {ally.specialty}
                        </div>
                        <p className="text-xs leading-relaxed text-[#CBD5E1]">{ally.story}</p>
                      </div>
                    ) : (
                      <p className="text-xs italic leading-relaxed text-[#64748B]">
                        {ally.mysteryPreview}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Modal for Selected Enemy */}
        {selectedEnemy && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#040812]/82 p-4"
            onClick={() => setSelectedEnemy(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border-2 border-[#334155] bg-[#0F172A] p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const unlocked =
                  isEnemyUnlocked(selectedEnemy, highestUnlockedStage) ||
                  discoveredSet.has(selectedEnemy.id);
                const kills = enemyKillsByCatalogId[selectedEnemy.id] ?? 0;
                const counterAlly = ALLY_ALBUM.find((a) => a.id === selectedEnemy.counterAllyId);
                return (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <EnemyPortraitSvg
                            enemy={selectedEnemy}
                            unlocked={unlocked}
                            className="h-22 w-22"
                          />
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="h-7 w-7 text-[#CBD5E1]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-mono-tabular text-xs font-bold text-[#94A3B8]">
                            {selectedEnemy.code} · Libera na Fase {selectedEnemy.unlockStage}
                          </div>
                          <h3 className="mt-0.5 font-display text-xl font-bold text-white">
                            {unlocked ? selectedEnemy.name : 'Registro Bloqueado'}
                          </h3>
                          <div className="font-mono-tabular mt-1 text-sm font-bold text-[#FF2E4C]">
                            {unlocked
                              ? `HP Base: ${selectedEnemy.hp.toLocaleString('pt-BR')} · Vel: ${selectedEnemy.baseSpeed}`
                              : 'HP: ??? · Atributos bloqueados'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedEnemy(null)}
                        className="rounded-lg border border-[#334155] bg-[#1E293B] p-1.5 text-[#CBD5E1] hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {unlocked ? (
                      <div className="mt-4 space-y-3 border-t border-[#1E293B] pt-3.5 text-sm">
                        <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#1E293B] bg-[#080D1A] p-2.5">
                          <div>
                            <div className="text-[10px] font-bold uppercase text-[#00D4FF]">Abates Registrados</div>
                            <div className="font-mono-tabular text-base font-bold text-white">
                              {kills.toLocaleString('pt-BR')}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase text-[#10B981]">Fraqueza Tática</div>
                            <div className="flex items-center gap-1 text-xs font-bold text-[#6EE7B7]">
                              <Crosshair className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{counterAlly?.name ?? 'Ataque Misto'}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#00D4FF]">
                            Comportamento & Traço
                          </div>
                          <p className="mt-1 text-xs font-semibold text-[#CBD5E1]">
                            {selectedEnemy.specialty}
                          </p>
                          {counterAlly && (
                            <p className="mt-1 text-xs text-[#6EE7B7]">
                              Contra-ataque ideal: {counterAlly.name} ({counterAlly.specialty})
                            </p>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#FACC15]">
                            História
                          </div>
                          <p className="mt-1 leading-relaxed text-[#E2E8F0]">
                            {selectedEnemy.story}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-[#1E293B] bg-[#080D1A] p-4 text-center">
                        <Lock className="mx-auto h-6 w-6 text-[#64748B]" />
                        <p className="mt-2 text-xs italic text-[#94A3B8]">
                          "{selectedEnemy.mysteryPreview}"
                        </p>
                        <p className="mt-2 font-mono-tabular text-xs font-bold text-[#FACC15]">
                          Alcance a Fase {selectedEnemy.unlockStage} para revelar este card colorido.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Detail Modal for Selected Ally */}
        {selectedAlly && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#040812]/82 p-4"
            onClick={() => setSelectedAlly(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border-2 border-[#334155] bg-[#0F172A] p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const unlocked = isAllyUnlocked(selectedAlly, highestUnlockedStage);
                const spec = UNIT_SPECS[selectedAlly.unitKind];
                return (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <AllyPortraitSvg
                            ally={selectedAlly}
                            unlocked={unlocked}
                            className="h-22 w-22"
                          />
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="h-7 w-7 text-[#CBD5E1]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-mono-tabular text-xs font-bold text-[#94A3B8]">
                            {selectedAlly.code} · Libera na Fase {selectedAlly.unlockStage}
                          </div>
                          <h3 className="mt-0.5 font-display text-xl font-bold text-white">
                            {unlocked ? selectedAlly.name : 'Aliado Bloqueado'}
                          </h3>
                          <div className="mt-0.5 text-xs font-bold text-[#00D4FF]">
                            {unlocked ? `${selectedAlly.title} · Cor: ${selectedAlly.colorName}` : 'Identidade oculta'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedAlly(null)}
                        className="rounded-lg border border-[#334155] bg-[#1E293B] p-1.5 text-[#CBD5E1] hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {unlocked ? (
                      <div className="mt-4 space-y-3 border-t border-[#1E293B] pt-3.5 text-sm">
                        <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#1E293B] bg-[#080D1A] p-2.5 text-center">
                          <div>
                            <div className="text-[10px] font-bold uppercase text-[#FACC15]">Custo</div>
                            <div className="font-mono-tabular text-base font-bold text-white">{spec.cost}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase text-[#FF2E4C]">Dano</div>
                            <div className="font-mono-tabular text-base font-bold text-white">{spec.damage}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase text-[#00D4FF]">HP</div>
                            <div className="font-mono-tabular text-base font-bold text-white">{spec.maxHp}</div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FACC15]">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Especialidade</span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-[#E2E8F0]">
                            {selectedAlly.specialty}
                          </p>
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#00D4FF]">
                            História
                          </div>
                          <p className="mt-1 leading-relaxed text-[#CBD5E1]">
                            {selectedAlly.story}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-[#1E293B] bg-[#080D1A] p-4 text-center">
                        <Lock className="mx-auto h-6 w-6 text-[#64748B]" />
                        <p className="mt-2 text-xs italic text-[#94A3B8]">
                          "{selectedAlly.mysteryPreview}"
                        </p>
                        <p className="mt-2 font-mono-tabular text-xs font-bold text-[#00D4FF]">
                          Alcance a Fase {selectedAlly.unlockStage} para desbloquear esta tropa.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
