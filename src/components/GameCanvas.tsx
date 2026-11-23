import React, { useEffect, useRef } from 'react';
import { computeViewportTransform } from '../game/engineMath';
import { ArenaRenderer } from '../game/renderer';
import { GameSimulation } from '../game/simulation';
import { HudSnapshot } from '../game/types';

interface GameCanvasProps {
  simRef: React.MutableRefObject<GameSimulation>;
  screenToWorldRef: React.MutableRefObject<(clientX: number, clientY: number) => { x: number; y: number }>;
  onHudSync: (snapshot: HudSnapshot) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  simRef,
  screenToWorldRef,
  onHudSync,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onHudSyncRef = useRef(onHudSync);
  onHudSyncRef.current = onHudSync;

  const transformRef = useRef({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    dpr: 1,
  });

  useEffect(() => {
    screenToWorldRef.current = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const { scale, offsetX, offsetY } = transformRef.current;
      return {
        x: (clientX - rect.left - offsetX) / scale,
        y: (clientY - rect.top - offsetY) / scale,
      };
    };
  }, [screenToWorldRef]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new ArenaRenderer();

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.max(280, Math.floor(rect.width));
      const cssH = Math.max(280, Math.floor(rect.height));

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);

      const { scale, offsetX, offsetY } = computeViewportTransform(
        cssW,
        cssH,
        simRef.current.arena
      );

      transformRef.current = { scale, offsetX, offsetY, dpr };
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    let rafId = 0;
    let lastTime = performance.now();
    let lastHudKey = '';

    const frame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      const sim = simRef.current;
      sim.update(rawDt);

      const { scale, offsetX, offsetY, dpr } = transformRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = '#080D1A';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      renderer.render(ctx, sim);
      ctx.restore();

      const snap = sim.getHudSnapshot();
      const cdKey = `${Math.ceil(snap.spellCooldowns.blade * 2)}|${Math.ceil(snap.spellCooldowns.shockwave * 2)}|${Math.ceil(snap.spellCooldowns.overcharge * 2)}|${snap.targetingSpell ?? ''}|${Math.ceil(snap.overchargeTimer * 2)}`;
      const bannerId = snap.activeBanner ? snap.activeBanner.id : 0;
      const heroesKey = snap.activeHeroes
        .map((h) => `${h.heroClass}:${h.level}:${h.xp}:${Math.round(h.x)},${Math.round(h.y)}`)
        .join(';');
      const hudKey = `${snap.phase}|${snap.stage}|${snap.highestUnlockedStage}|${snap.isConvergenceStage}|${snap.routeLevel}|${snap.maxRouteLevel}|${snap.openGatesCount}|${snap.baseHp}|${snap.baseMaxHp}|${snap.baseLevel}|${snap.essence}|${snap.evolutionPoints}|${snap.score}|${snap.wave}|${snap.kills}|${snap.selectedHeroClass}|${snap.activeHeroIndex}|${heroesKey}|${snap.heroRepositionMode}|${snap.selectedUnit}|${snap.unitCount}|${snap.mergesPerformed}|${snap.maxUnitLevelReached}|${snap.comboCount}|${bannerId}|${snap.pendingUpgradeMilestoneLevel ?? 0}|${snap.pendingUpgradeHeroClass ?? ''}|${snap.heroUpgradesCount}|${snap.mutedMusic}|${snap.mutedSfx}|${snap.bossActive}|${cdKey}`;
      if (hudKey !== lastHudKey) {
        lastHudKey = hudKey;
        onHudSyncRef.current(snap);
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    const onWindowPointerMove = (e: PointerEvent) => {
      const pt = screenToWorldRef.current(e.clientX, e.clientY);
      simRef.current.handlePointerMove(pt.x, pt.y);
    };

    const onWindowPointerUp = (e: PointerEvent) => {
      if (!simRef.current.dragState) return;
      const pt = screenToWorldRef.current(e.clientX, e.clientY);
      const acted = simRef.current.handlePointerUp(pt.x, pt.y);
      if (acted) {
        onHudSyncRef.current(simRef.current.getHudSnapshot());
      }
    };

    const onWindowPointerCancel = () => {
      if (simRef.current.dragState) {
        simRef.current.dragState = null;
      }
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerCancel);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerCancel);
    };
  }, [simRef, screenToWorldRef]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = screenToWorldRef.current(e.clientX, e.clientY);
    const acted = simRef.current.handlePointerDown(pt.x, pt.y);
    if (acted) {
      onHudSyncRef.current(simRef.current.getHudSnapshot());
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-[#080D1A] touch-none select-none">
      <canvas
        ref={canvasRef}
        data-testid="arena-canvas"
        onPointerDown={handlePointerDown}
        onContextMenu={(e) => e.preventDefault()}
        className="block h-full w-full cursor-grab active:cursor-grabbing touch-none select-none"
      />
    </div>
  );
};
