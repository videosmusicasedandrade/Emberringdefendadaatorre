import { useCallback, useEffect, useRef, useState } from 'react';
import { AlbumModal, AlbumTab } from './components/AlbumModal';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { GameModals } from './components/GameModals';
import { MilestoneModal } from './components/MilestoneModal';
import { SimulatedAdModal } from './components/SimulatedAdModal';
import { StoreModal, StoreTab } from './components/StoreModal';
import { soundEngine } from './game/audio';
import { getUnlockedAlliesForStage } from './game/bestiaryData';
import { GameSimulation } from './game/simulation';
import { ConsumableId, PlayStoreSkuId, RelicId } from './game/storeCatalog';
import {
  FxStyleId,
  HeroClass,
  HeroUpgradeId,
  HudSnapshot,
  PetKind,
  RingSkinId,
  SpellKind,
  TOTAL_STAGES,
  UnitKind,
} from './game/types';

export default function App() {
  const simRef = useRef<GameSimulation | null>(null);
  if (!simRef.current) {
    const sim = new GameSimulation();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stageParam = Number(params.get('stage'));
      const wantsConvergence = params.get('convergence') === '1';
      let initialStage =
        Number.isFinite(stageParam) && stageParam >= 1 && stageParam <= TOTAL_STAGES
          ? stageParam
          : wantsConvergence
            ? (sim.convergenceStages[0] ?? 6)
            : 1;
      if (wantsConvergence && !sim.convergenceStages.includes(initialStage)) {
        sim.convergenceStages = [...sim.convergenceStages, initialStage].sort((a, b) => a - b);
      }
      const heroParam = params.get('hero');
      const heroOverride: HeroClass | undefined =
        heroParam === 'archer' || heroParam === 'swordsman' || heroParam === 'bomber'
          ? heroParam
          : undefined;
      if (heroOverride) {
        sim.setHeroClass(heroOverride);
      }
      if (params.get('autostart') === '1') {
        sim.resetWorld('playing', initialStage, heroOverride);
      } else if (wantsConvergence) {
        sim.resetWorld('title', initialStage, heroOverride);
      }
    }
    simRef.current = sim;
  }

  const screenToWorldRef = useRef<(clientX: number, clientY: number) => { x: number; y: number }>(() => ({
    x: 0,
    y: 0,
  }));

  const [hud, setHud] = useState<HudSnapshot>(() => simRef.current!.getHudSnapshot());
  const [selectedStage, setSelectedStage] = useState<number>(
    () => simRef.current!.currentStage
  );
  const [albumTab, setAlbumTab] = useState<AlbumTab | null>(null);
  const [storeTab, setStoreTab] = useState<StoreTab | null>(null);
  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const [simulatedAd, setSimulatedAd] = useState<{ open: boolean; targetPet: PetKind | null }>({
    open: false,
    targetPet: null,
  });
  const wasPlayingBeforeAdRef = useRef(false);

  const syncBodyDataset = useCallback((snap: HudSnapshot) => {
    document.body.dataset.state = snap.phase === 'victory' ? 'gameover' : snap.phase;
    document.body.dataset.outcome = snap.phase;
    document.body.dataset.stage = String(snap.stage);
    document.body.dataset.route = snap.routeArchetype;
    document.body.dataset.routeLevel = String(snap.routeLevel);
    document.body.dataset.openGates = String(snap.openGatesCount);
    document.body.dataset.maxRoutes = String(snap.maxRouteLevel);
    document.body.dataset.convergence = snap.isConvergenceStage ? '1' : '0';
    document.body.dataset.activeHeroes = String(snap.activeHeroes.length);
    document.body.dataset.evolutionPoints = String(snap.evolutionPoints);
    document.body.dataset.unlocked = String(snap.highestUnlockedStage);
    document.body.dataset.heroClass = snap.selectedHeroClass;
    document.body.dataset.heroLevel = String(snap.heroLevel);
    document.body.dataset.heroXp = String(snap.heroXp);
    document.body.dataset.heroUpgrades = String(snap.heroUpgradesCount);
    document.body.dataset.units = String(snap.unitCount);
    document.body.dataset.merges = String(snap.mergesPerformed);
    document.body.dataset.maxUnitLevel = String(snap.maxUnitLevelReached);
    document.body.dataset.combo = String(snap.comboCount);
    document.body.dataset.targeting = snap.targetingSpell ?? '';
    document.body.dataset.overcharge = snap.overchargeTimer > 0 ? '1' : '0';
    document.body.dataset.pet = snap.selectedPet;
    document.body.dataset.dropLuck = String(snap.petDropLuckBonus);
  }, []);

  const syncHud = useCallback(() => {
    if (simRef.current) {
      const snap = simRef.current.getHudSnapshot();
      setHud(snap);
      syncBodyDataset(snap);
    }
  }, [syncBodyDataset]);

  useEffect(() => {
    syncBodyDataset(hud);
  }, [hud, syncBodyDataset]);

  const handleSelectHero = useCallback(
    (heroClass: HeroClass) => {
      const sim = simRef.current;
      if (!sim) return;
      sim.setHeroClass(heroClass);
      syncHud();
    },
    [syncHud]
  );

  const handleSelectPet = useCallback(
    (pet: PetKind) => {
      const sim = simRef.current;
      if (!sim) return;
      sim.setSelectedPet(pet);
      syncHud();
    },
    [syncHud]
  );

  const handleRequestPetAd = useCallback(
    (targetPet?: PetKind) => {
      const sim = simRef.current;
      if (!sim) return;
      if (sim.phase === 'playing') {
        wasPlayingBeforeAdRef.current = true;
        sim.phase = 'paused';
        syncHud();
      } else {
        wasPlayingBeforeAdRef.current = false;
      }
      setSimulatedAd({ open: true, targetPet: targetPet ?? null });
    },
    [syncHud]
  );

  const handleCompleteSimulatedAd = useCallback(() => {
    const sim = simRef.current;
    const chosenPet = simulatedAd.targetPet;
    setSimulatedAd({ open: false, targetPet: null });
    if (!sim) return;
    sim.unlockPetChoiceViaAd();
    if (chosenPet) {
      sim.setSelectedPet(chosenPet);
    }
    if (wasPlayingBeforeAdRef.current && sim.phase === 'paused') {
      sim.phase = 'playing';
    }
    wasPlayingBeforeAdRef.current = false;
    syncHud();
  }, [simulatedAd.targetPet, syncHud]);

  const handlePurchasePlayStore = useCallback(
    (sku: PlayStoreSkuId) => {
      const sim = simRef.current;
      if (!sim) return { ok: false, message: 'Simulação indisponível.' };
      const res = sim.purchasePlayStoreProduct(sku);
      syncHud();
      return { ok: res.ok, message: res.message };
    },
    [syncHud]
  );

  const handleOpenRelicChest = useCallback(
    (count: 1 | 5) => {
      const sim = simRef.current;
      if (!sim) return { ok: false, pulls: [], message: 'Simulação indisponível.' };
      const res = sim.openRelicChest(count);
      syncHud();
      return res;
    },
    [syncHud]
  );

  const handleToggleEquipRelic = useCallback(
    (relicId: RelicId) => {
      const sim = simRef.current;
      if (!sim) return false;
      const ok = sim.toggleEquipRelic(relicId);
      syncHud();
      return ok;
    },
    [syncHud]
  );

  const handleBuyConsumable = useCallback(
    (id: ConsumableId) => {
      const sim = simRef.current;
      if (!sim) return false;
      const ok = sim.buyConsumableWithGems(id);
      syncHud();
      return ok;
    },
    [syncHud]
  );

  const handleBuySoulsBundle = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return false;
    const ok = sim.buySoulsBundleWithGems();
    syncHud();
    return ok;
  }, [syncHud]);

  const handleClaimDailyReward = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return { ok: false, gems: 0, souls: 0 };
    const res = sim.claimDailyStoreReward();
    syncHud();
    return res;
  }, [syncHud]);

  const handleClaimSeasonPassReward = useCallback(
    (tier: number, track: 'free' | 'premium') => {
      const sim = simRef.current;
      if (!sim) return false;
      const ok = sim.claimSeasonPassReward(tier, track);
      syncHud();
      return ok;
    },
    [syncHud]
  );

  const handleClaimDailyMission = useCallback(
    (missionId: string) => {
      const sim = simRef.current;
      if (!sim) return { ok: false, gems: 0, souls: 0, passXp: 0, title: '' };
      const res = sim.claimDailyMission(missionId);
      syncHud();
      return res;
    },
    [syncHud]
  );

  const handleTriggerSocialMission = useCallback(
    (kind: 'visit_instagram' | 'share_game') => {
      const sim = simRef.current;
      if (!sim) return { ok: false, gems: 0, souls: 0, message: 'Simulação indisponível.' };
      const res = sim.triggerSocialMission(kind);
      syncHud();
      return res;
    },
    [syncHud]
  );

  const handleClaimDailyAllCompleteBonus = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return { ok: false, gems: 0, keys: 0 };
    const res = sim.claimDailyAllCompleteBonus();
    syncHud();
    return res;
  }, [syncHud]);

  const handleClaimMilestone = useCallback(
    (level: number) => {
      const sim = simRef.current;
      if (!sim) {
        return {
          ok: false,
          title: '',
          rewardType: 'passive' as const,
          gems: 0,
          souls: 0,
        };
      }
      const res = sim.claimMilestoneReward(level);
      syncHud();
      return res;
    },
    [syncHud]
  );

  const handleUseConsumable = useCallback(
    (id: ConsumableId) => {
      const sim = simRef.current;
      if (!sim) return;
      if (sim.useConsumable(id)) {
        syncHud();
      }
    },
    [syncHud]
  );

  const handleSelectStage = useCallback(
    (stageNum: number) => {
      const sim = simRef.current;
      setSelectedStage(stageNum);
      if (sim && sim.phase === 'title') {
        sim.resetWorld('title', stageNum);
        syncHud();
      }
    },
    [syncHud]
  );

  const handleStart = useCallback(
    (stage?: number) => {
      const sim = simRef.current;
      if (!sim) return;
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      const targetStage = stage ?? selectedStage;
      setSelectedStage(targetStage);
      sim.resetWorld('playing', targetStage);
      soundEngine.startMusic();
      syncHud();
    },
    [selectedStage, syncHud]
  );

  const handleNextStage = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    const next = Math.min(TOTAL_STAGES, sim.currentStage + 1);
    setSelectedStage(next);
    sim.resetWorld('playing', next);
    soundEngine.startMusic();
    syncHud();
  }, [syncHud]);

  const handleResume = useCallback(() => {
    const sim = simRef.current;
    if (!sim || sim.phase !== 'paused') return;
    sim.phase = 'playing';
    soundEngine.startMusic();
    syncHud();
  }, [syncHud]);

  const handleTogglePause = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    if (sim.phase === 'playing') {
      sim.phase = 'paused';
      soundEngine.stopMusic();
      syncHud();
    } else if (sim.phase === 'paused') {
      sim.phase = 'playing';
      soundEngine.startMusic();
      syncHud();
    }
  }, [syncHud]);

  const handleReturnTitle = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    soundEngine.stopMusic();
    const target = Math.min(TOTAL_STAGES, sim.highestUnlockedStage);
    setSelectedStage(target);
    sim.resetWorld('title', target);
    syncHud();
  }, [syncHud]);

  const handleSelectUnit = useCallback(
    (kind: UnitKind) => {
      const sim = simRef.current;
      if (!sim) return;
      sim.selectedUnit = kind;
      syncHud();
    },
    [syncHud]
  );

  const handleQuickRecruit = useCallback(
    (kind: UnitKind) => {
      const sim = simRef.current;
      if (!sim) return;
      if (sim.quickRecruitUnit(kind)) {
        syncHud();
      }
    },
    [syncHud]
  );

  const handleStartCardDrag = useCallback((kind: UnitKind, clientX: number, clientY: number) => {
    const sim = simRef.current;
    if (!sim) return;
    const pt = screenToWorldRef.current(clientX, clientY);
    sim.startCardDrag(kind, pt.x, pt.y);
  }, []);

  const handleToggleHeroReposition = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    sim.toggleHeroRepositionMode();
    syncHud();
  }, [syncHud]);

  const handleSelectActiveHero = useCallback(
    (index: number) => {
      const sim = simRef.current;
      if (!sim) return;
      sim.selectActiveHero(index);
      syncHud();
    },
    [syncHud]
  );



  const handleSelectUpgrade = useCallback(
    (upgradeId: HeroUpgradeId) => {
      const sim = simRef.current;
      if (!sim) return;
      if (sim.applyHeroUpgradeChoice(upgradeId)) {
        syncHud();
      }
    },
    [syncHud]
  );

  const handleUpgradeTalent = useCallback(
    (talentId: string) => {
      const sim = simRef.current;
      if (!sim) return;
      if (sim.upgradeTalent(talentId)) {
        syncHud();
      }
    },
    [syncHud]
  );

  const handleSelectPact = useCallback(
    (pactId: string) => {
      const sim = simRef.current;
      if (!sim) return;
      if (sim.selectPact(pactId)) {
        syncHud();
      }
    },
    [syncHud]
  );

  const handleRotateRing = useCallback(
    (delta: number) => {
      const sim = simRef.current;
      if (!sim) return;
      sim.rotateRing(delta);
      syncHud();
    },
    [syncHud]
  );

  const handleBuyOrEquipRingSkin = useCallback(
    (skinId: RingSkinId) => {
      const sim = simRef.current;
      if (!sim) return;
      if (sim.buyOrEquipRingSkin(skinId)) {
        syncHud();
      }
    },
    [syncHud]
  );

  const handleBuyOrEquipFxStyle = useCallback(
    (fxId: FxStyleId) => {
      const sim = simRef.current;
      if (!sim) return;
      if (sim.buyOrEquipFxStyle(fxId)) {
        syncHud();
      }
    },
    [syncHud]
  );

  const handleActivateSpell = useCallback(
    (kind: SpellKind) => {
      const sim = simRef.current;
      if (!sim) return;
      if (sim.activateSpell(kind)) {
        syncHud();
      }
    },
    [syncHud]
  );

  const handleToggleMuteMusic = useCallback(() => {
    const nextMuted = !soundEngine.mutedMusic;
    soundEngine.setMutedMusic(nextMuted);
    if (!nextMuted && simRef.current?.phase === 'playing') {
      soundEngine.startMusic();
    }
    syncHud();
  }, [syncHud]);

  const handleToggleMuteSfx = useCallback(() => {
    soundEngine.setMutedSfx(!soundEngine.mutedSfx);
    syncHud();
  }, [syncHud]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const sim = simRef.current;
      if (!sim) return;

      if (
        e.key === 'Escape' &&
        sim.phase === 'playing' &&
        (sim.spells.targetingSpell || sim.heroRepositionMode)
      ) {
        sim.cancelSpellTargeting();
        syncHud();
        return;
      }

      if (e.key === 'p' || e.key === 'P' || (e.key === 'Escape' && albumTab === null)) {
        if (sim.phase === 'playing' || sim.phase === 'paused') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        handleToggleMuteSfx();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        if (
          sim.phase === 'playing' ||
          sim.phase === 'paused' ||
          sim.phase === 'gameover' ||
          sim.phase === 'victory'
        ) {
          handleStart(sim.currentStage);
        }
        return;
      }

      if (sim.phase === 'playing') {
        if (/^[0-9]$/.test(e.key)) {
          const unlocked = getUnlockedAlliesForStage(
            Math.max(sim.currentStage, sim.highestUnlockedStage)
          );
          const matchedAlly = unlocked.find((a) => a.hotkey === e.key);
          if (matchedAlly) {
            handleSelectUnit(matchedAlly.unitKind);
          }
        } else if (e.key === 'h' || e.key === 'H') handleToggleHeroReposition();
        else if (e.key === 'q' || e.key === 'Q') handleActivateSpell('blade');
        else if (e.key === 'w' || e.key === 'W') handleActivateSpell('shockwave');
        else if (e.key === 'e' || e.key === 'E') handleActivateSpell('overcharge');
        else if (e.key === 'z' || e.key === 'Z') handleUseConsumable('castle_potion');
        else if (e.key === 'x' || e.key === 'X') handleUseConsumable('meteor_scroll');
        else if (e.key === 'c' || e.key === 'C') handleUseConsumable('frenzy_flask');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    albumTab,
    handleActivateSpell,
    handleSelectUnit,
    handleStart,
    handleToggleHeroReposition,
    handleToggleMuteSfx,
    handleTogglePause,
    handleUseConsumable,
    selectedStage,
    syncHud,
  ]);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <GameCanvas
        simRef={simRef as React.MutableRefObject<GameSimulation>}
        screenToWorldRef={screenToWorldRef}
        onHudSync={setHud}
      />
      <GameHUD
        hud={hud}
        onSelectUnit={handleSelectUnit}
        onQuickRecruit={handleQuickRecruit}
        onStartCardDrag={handleStartCardDrag}
        onToggleHeroReposition={handleToggleHeroReposition}
        onSelectActiveHero={handleSelectActiveHero}
        onSelectPet={handleSelectPet}
        onRequestPetAd={handleRequestPetAd}
        onActivateSpell={handleActivateSpell}
        onUseConsumable={handleUseConsumable}
        onTogglePause={handleTogglePause}
        onToggleMuteMusic={handleToggleMuteMusic}
        onToggleMuteSfx={handleToggleMuteSfx}
        onRotateRing={handleRotateRing}
        onRestart={() => handleStart(hud.stage)}
      />
      <GameModals
        hud={hud}
        selectedStage={selectedStage}
        convergenceStages={simRef.current!.convergenceStages}
        onSelectHero={handleSelectHero}
        onSelectPet={handleSelectPet}
        onRequestPetAd={handleRequestPetAd}
        onSelectStage={handleSelectStage}
        onSelectUpgrade={handleSelectUpgrade}
        onUpgradeTalent={handleUpgradeTalent}
        onSelectPact={handleSelectPact}
        onBuyOrEquipRingSkin={handleBuyOrEquipRingSkin}
        onBuyOrEquipFxStyle={handleBuyOrEquipFxStyle}
        onStart={handleStart}
        onNextStage={handleNextStage}
        onResume={handleResume}
        onRestart={() => handleStart(hud.stage)}
        onReturnTitle={handleReturnTitle}
        onOpenAlbum={(tab) => setAlbumTab(tab)}
        onOpenStore={(tab) => setStoreTab(tab ?? 'featured')}
        onOpenMilestones={() => setMilestonesOpen(true)}
      />
      <MilestoneModal
        isOpen={milestonesOpen}
        hud={hud}
        onClose={() => setMilestonesOpen(false)}
        onClaimMilestone={handleClaimMilestone}
        onEquipRingSkin={handleBuyOrEquipRingSkin}
        onEquipFxStyle={handleBuyOrEquipFxStyle}
      />
      <StoreModal
        isOpen={storeTab !== null}
        initialTab={storeTab ?? 'featured'}
        hud={hud}
        onClose={() => setStoreTab(null)}
        onPurchasePlayStore={handlePurchasePlayStore}
        onOpenRelicChest={handleOpenRelicChest}
        onToggleEquipRelic={handleToggleEquipRelic}
        onBuyConsumable={handleBuyConsumable}
        onBuySoulsBundle={handleBuySoulsBundle}
        onClaimDailyReward={handleClaimDailyReward}
        onClaimSeasonPassReward={handleClaimSeasonPassReward}
        onBuyOrEquipRingSkin={handleBuyOrEquipRingSkin}
        onBuyOrEquipFxStyle={handleBuyOrEquipFxStyle}
        onClaimDailyMission={handleClaimDailyMission}
        onTriggerSocialMission={handleTriggerSocialMission}
        onClaimDailyAllCompleteBonus={handleClaimDailyAllCompleteBonus}
      />
      <AlbumModal
        isOpen={albumTab !== null}
        initialTab={albumTab ?? 'enemies'}
        highestUnlockedStage={hud.highestUnlockedStage}
        enemyKillsByCatalogId={hud.enemyKillsByCatalogId}
        discoveredEnemyIds={hud.discoveredEnemyIds}
        unlockedAchievements={hud.unlockedAchievements}
        achievementProgress={hud.achievementProgress}
        emberSouls={hud.emberSouls}
        onClose={() => setAlbumTab(null)}
      />
      <SimulatedAdModal
        isOpen={simulatedAd.open}
        targetPet={simulatedAd.targetPet}
        onCompleteAndClose={handleCompleteSimulatedAd}
      />
    </main>
  );
}
