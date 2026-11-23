import {
  canMergeUnits,
  computeCastlePetPosition,
  getUnitXpBounds,
  isEliteEnemy,
  isValidFreeHeroPosition,
  pointToSegmentDistance,
} from './engineMath';
import { GameSimulation } from './simulation';
import {
  ArenaConfig,
  EnemyEntity,
  FX_STYLES,
  HERO_SPECS,
  HeroClass,
  HeroEntity,
  MAX_HERO_LEVEL,
  MAX_UNIT_LEVEL,
  PET_SPECS,
  PetKind,
  RING_SKINS,
  RouteWaypoint,
  UNIT_SPECS,
  UnitEntity,
  UnitKind,
} from './types';

export class ArenaRenderer {
  private staticCanvas: HTMLCanvasElement | null = null;
  private staticArenaKey = '';

  private ensureStaticLayer(arena: ArenaConfig): HTMLCanvasElement {
    const routeSig = arena.routes.map((r) => r.id).join(',');
    const key = `stage-${arena.stage}-${arena.worldWidth}x${arena.worldHeight}-${routeSig}-dark-v4`;
    if (this.staticCanvas && this.staticArenaKey === key) {
      return this.staticCanvas;
    }

    const canvas = document.createElement('canvas');
    canvas.width = arena.worldWidth;
    canvas.height = arena.worldHeight;
    const ctx = canvas.getContext('2d')!;
    this.drawStaticWorld(ctx, arena);
    this.staticCanvas = canvas;
    this.staticArenaKey = key;
    return canvas;
  }

  private traceBranchPath(ctx: CanvasRenderingContext2D, wps: ReadonlyArray<RouteWaypoint>) {
    if (wps.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(wps[0].x, wps[0].y);
    for (let i = 1; i < wps.length; i++) {
      ctx.lineTo(wps[i].x, wps[i].y);
    }
  }

  private minDistanceToRoute(x: number, y: number, arena: ArenaConfig): number {
    let minD = Infinity;
    for (const branch of arena.routes) {
      const wps = branch.waypoints;
      for (let i = 0; i < wps.length - 1; i++) {
        const d = pointToSegmentDistance(x, y, wps[i].x, wps[i].y, wps[i + 1].x, wps[i + 1].y);
        if (d < minD) minD = d;
      }
    }
    return minD;
  }

  private drawStaticWorld(ctx: CanvasRenderingContext2D, arena: ArenaConfig) {
    const { worldWidth: w, worldHeight: h, centerX: cx, centerY: cy } = arena;

    // 1. Deep High-Contrast Dark Obsidian & Twilight Slate Backdrop
    const bgGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 740);
    bgGrad.addColorStop(0, '#16223A');
    bgGrad.addColorStop(0.55, '#0F172A');
    bgGrad.addColorStop(1, '#080D1A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle tactical grid lines for crisp spatial readability
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.045)';
    ctx.lineWidth = 1;
    for (let gx = 40; gx < w; gx += 60) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 40; gy < h; gy += 60) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
    ctx.restore();

    // Soft ambient dark-teal/indigo contour plateaus
    const plateaus = [
      { x: 250, y: 390, rx: 170, ry: 115 },
      { x: 610, y: 400, rx: 220, ry: 155 },
      { x: 960, y: 410, rx: 150, ry: 135 },
    ];
    ctx.fillStyle = 'rgba(30, 58, 95, 0.22)';
    for (const p of plateaus) {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Dynamic Multi-Route Obsidian Stone Roads (1 to 4 Branches)
    const roadW = arena.roadHalfWidth * 2;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Layer 1: Outer ambient road shadow across all routes
    ctx.save();
    ctx.translate(0, 8);
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.65)';
    ctx.lineWidth = roadW + 18;
    for (const branch of arena.routes) {
      this.traceBranchPath(ctx, branch.waypoints);
      ctx.stroke();
    }
    ctx.restore();

    // Layer 2: Warm Amber-Gold outer border rim
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = roadW + 12;
    for (const branch of arena.routes) {
      this.traceBranchPath(ctx, branch.waypoints);
      ctx.stroke();
    }

    // Layer 3: Saturated gold inner trim
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = roadW + 6;
    for (const branch of arena.routes) {
      this.traceBranchPath(ctx, branch.waypoints);
      ctx.stroke();
    }

    // Layer 4: Dark carved slate road surface
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = roadW;
    for (const branch of arena.routes) {
      this.traceBranchPath(ctx, branch.waypoints);
      ctx.stroke();
    }

    // Layer 5: Inner worn center lane
    ctx.strokeStyle = '#273549';
    ctx.lineWidth = roadW * 0.56;
    for (const branch of arena.routes) {
      this.traceBranchPath(ctx, branch.waypoints);
      ctx.stroke();
    }

    // Layer 6: Glowing directional chevrons along each route branch
    for (const branch of arena.routes) {
      const wps = branch.waypoints;
      for (let i = 0; i < wps.length - 1; i++) {
        const a = wps[i];
        const b = wps[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const segLen = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);
        if (segLen < 32) continue;

        const steps = Math.max(1, Math.floor(segLen / 54));
        for (let s = 1; s <= steps; s++) {
          const t = s / (steps + 1);
          const px = a.x + dx * t;
          const py = a.y + dy * t;

          if (s % 2 === 1) {
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(ang);
            ctx.strokeStyle =
              branch.gateIndex === 1 ? 'rgba(250, 204, 21, 0.36)' : branch.color;
            ctx.globalAlpha = branch.gateIndex === 1 ? 1 : 0.42;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-5, -7);
            ctx.lineTo(4, 0);
            ctx.lineTo(-5, 7);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }
    ctx.restore();

    // 3. Perimeter Twilight Crystals & Dark Pines (strictly clear of the stage's route)
    const props = [
      { x: 52, y: 120, s: 0.95, type: 'tree' },
      { x: 52, y: 360, s: 0.86, type: 'tree' },
      { x: 58, y: 715, s: 1.0, type: 'tree' },
      { x: 210, y: 745, s: 0.85, type: 'crystal' },
      { x: 430, y: 735, s: 0.9, type: 'tree' },
      { x: 750, y: 740, s: 0.92, type: 'crystal' },
      { x: 1138, y: 125, s: 1.0, type: 'tree' },
      { x: 1142, y: 270, s: 0.85, type: 'crystal' },
      { x: 1136, y: 690, s: 1.02, type: 'tree' },
      { x: 1020, y: 745, s: 0.9, type: 'tree' },
      { x: 230, y: 78, s: 0.82, type: 'crystal' },
      { x: 960, y: 78, s: 0.86, type: 'tree' },
    ];
    for (const p of props) {
      if (this.minDistanceToRoute(p.x, p.y, arena) < 70) continue;
      if (p.type === 'crystal') {
        this.drawGlowCrystal(ctx, p.x, p.y, p.s);
      } else {
        this.drawTwilightPine(ctx, p.x, p.y, p.s);
      }
    }
  }

  private drawGlowCrystal(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(0, 212, 255, 0.14)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284C7';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(13, -4);
    ctx.lineTo(8, 12);
    ctx.lineTo(-8, 12);
    ctx.lineTo(-13, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(5, -4);
    ctx.lineTo(0, 10);
    ctx.lineTo(-7, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawTwilightPine(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-5, 4, 10, 15, 3);
    ctx.fill();
    ctx.stroke();

    const layers = [
      { y: 6, w: 28, h: 34, fill: '#1E3A5F' },
      { y: -13, w: 21, h: 30, fill: '#254E7B' },
    ];
    for (const l of layers) {
      ctx.fillStyle = l.fill;
      ctx.strokeStyle = '#0B1120';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, l.y - l.h);
      ctx.lineTo(l.w, l.y);
      ctx.quadraticCurveTo(0, l.y + 5, -l.w, l.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  public render(ctx: CanvasRenderingContext2D, sim: GameSimulation) {
    const { arena } = sim;
    const staticLayer = this.ensureStaticLayer(arena);

    ctx.save();

    if (sim.cameraTrauma > 0) {
      const shake = sim.cameraTrauma * sim.cameraTrauma * 11;
      ctx.translate((Math.random() - 0.5) * shake * 2, (Math.random() - 0.5) * shake * 2);
    }

    ctx.drawImage(staticLayer, 0, 0);

    // 0.5 Modular Ember Ring Visual Guide & Rare Ring Skin Arcane Circle
    const skin = RING_SKINS[sim.equippedRingSkin] ?? RING_SKINS.classic;
    const isCustomRingSkin = sim.equippedRingSkin !== 'classic';
    if (sim.ringRotation !== 0 || sim.ringHeat > 0.01 || isCustomRingSkin) {
      ctx.save();
      ctx.translate(arena.centerX, arena.centerY);
      ctx.rotate(sim.ringRotation + (isCustomRingSkin ? sim.time * 0.14 : 0));
      ctx.strokeStyle =
        sim.ringHeat > 0.75
          ? 'rgba(255, 46, 76, 0.48)'
          : skin.glowColor;
      ctx.lineWidth = isCustomRingSkin ? 3.2 : 2.8;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 210, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (isCustomRingSkin) {
        ctx.globalAlpha = 0.42;
        ctx.strokeStyle = skin.secondaryColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 196, 0, Math.PI * 2);
        ctx.stroke();

        // Subtle orbiting rune nodes for rare/milestone Ring Skins
        ctx.globalAlpha = 0.72;
        ctx.fillStyle = skin.runeColor;
        const runeCount = skin.milestoneLevel ? 8 : 6;
        for (let r = 0; r < runeCount; r++) {
          const a = (r / runeCount) * Math.PI * 2;
          const rx = Math.cos(a) * 210;
          const ry = Math.sin(a) * 210;
          ctx.beginPath();
          ctx.arc(rx, ry, skin.milestoneLevel ? 3.4 : 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    for (const bz of sim.burnZones) {
      const alpha = Math.min(0.65, (bz.life / 4.0) * 0.65);
      ctx.save();
      ctx.globalAlpha = alpha;
      const grad = ctx.createRadialGradient(bz.x, bz.y, 4, bz.x, bz.y, bz.radius);
      grad.addColorStop(0, 'rgba(250, 204, 21, 0.85)');
      grad.addColorStop(0.55, 'rgba(249, 115, 22, 0.55)');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bz.x, bz.y, bz.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const az of sim.acidStormZones) {
      const alpha = Math.min(0.75, (az.life / 4.5) * 0.75);
      ctx.save();
      ctx.globalAlpha = alpha;
      const grad = ctx.createRadialGradient(az.x, az.y, 6, az.x, az.y, az.radius);
      grad.addColorStop(0, 'rgba(190, 242, 100, 0.75)');
      grad.addColorStop(0.6, 'rgba(16, 185, 129, 0.45)');
      grad.addColorStop(1, 'rgba(6, 78, 59, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(az.x, az.y, az.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#A3E635';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 1. Tactical Defender Pad Slots
    const drag = sim.dragState;
    const draggedUnit =
      drag && drag.source === 'unit' && drag.unitId
        ? sim.units.find((u) => u.id === drag.unitId)
        : undefined;

    for (const slot of sim.slots) {
      const isHovered = sim.hoveredSlotId === slot.id && sim.phase === 'playing';
      const isEmpty = slot.unitId === null && !slot.hasHero;
      const occupant =
        slot.unitId !== null ? sim.units.find((u) => u.id === slot.unitId) : undefined;
      const isMergeCandidate = Boolean(
        drag &&
          drag.hasMoved &&
          draggedUnit &&
          occupant &&
          canMergeUnits(draggedUnit, occupant)
      );
      const isHeroMoveCandidate =
        sim.phase === 'playing' &&
        (sim.heroRepositionMode || (drag?.source === 'hero' && drag.hasMoved)) &&
        !slot.hasHero;

      ctx.save();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
      ctx.beginPath();
      ctx.ellipse(slot.x, slot.y + 4, slot.radius + 2, slot.radius * 0.88 + 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(slot.x, slot.y, slot.radius, 0, Math.PI * 2);

      if (slot.hasHero) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.18)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FACC15';
        ctx.stroke();
      } else if (isHeroMoveCandidate) {
        const pulse = 0.25 + Math.sin(sim.time * 10) * 0.12;
        ctx.fillStyle = `rgba(0, 212, 255, ${pulse})`;
        ctx.fill();
        ctx.lineWidth = isHovered ? 4 : 2.8;
        ctx.strokeStyle = '#00D4FF';
        ctx.stroke();
      } else if (isMergeCandidate) {
        const pulse = 0.34 + Math.sin(sim.time * 10) * 0.14;
        ctx.fillStyle = `rgba(250, 204, 21, ${pulse})`;
        ctx.fill();
        ctx.lineWidth = isHovered ? 4 : 3;
        ctx.strokeStyle = '#FACC15';
        ctx.stroke();
      } else {
        ctx.fillStyle = isHovered
          ? 'rgba(0, 212, 255, 0.28)'
          : isEmpty
            ? 'rgba(15, 23, 42, 0.72)'
            : 'rgba(30, 41, 59, 0.82)';
        ctx.fill();

        ctx.lineWidth = isHovered ? 3 : 2.2;
        ctx.strokeStyle = isHovered
          ? '#FACC15'
          : isEmpty
            ? 'rgba(56, 189, 248, 0.65)'
            : 'rgba(148, 163, 184, 0.55)';
        if (isEmpty && !isHovered) {
          ctx.setLineDash([6, 5]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        if (isEmpty) {
          ctx.fillStyle = 'rgba(125, 211, 252, 0.55)';
          ctx.fillRect(slot.x - 6, slot.y - 1.5, 12, 3);
          ctx.fillRect(slot.x - 1.5, slot.y - 6, 3, 12);
        }
      }

      if (isHovered && isEmpty && !drag && !sim.spells.targetingSpell && !sim.heroRepositionMode) {
        const spec = UNIT_SPECS[sim.selectedUnit];
        this.drawRangeRing(ctx, slot.x, slot.y, spec.range, 'rgba(0, 212, 255, 0.55)');
      }
      const slotHero = slot.hasHero ? sim.heroes.find((h) => h.slotId === slot.id) : undefined;
      if ((slotHero && isHovered) || (sim.heroRepositionMode && isHovered)) {
        const rangeHero = slotHero ?? sim.hero;
        this.drawRangeRing(ctx, slot.x, slot.y, rangeHero.range, 'rgba(250, 204, 21, 0.65)');
      }
      ctx.restore();
    }

    // 1.5 Free Hero Placement Tactical Reticle (anywhere outside roads/castle/gates)
    if (
      sim.phase === 'playing' &&
      !sim.hoveredSlotId &&
      ((drag?.source === 'hero' && drag.hasMoved) || sim.heroRepositionMode)
    ) {
      const targetIdx = drag?.heroIndex ?? sim.activeHeroIndex;
      const movingHero = sim.heroes[targetIdx] ?? sim.hero;
      const px = drag?.worldX ?? sim.pointerWorldX;
      const py = drag?.worldY ?? sim.pointerWorldY;
      const otherHeroes = sim.heroes.filter((_, idx) => idx !== targetIdx);
      const valid = isValidFreeHeroPosition(px, py, sim.arena, otherHeroes);
      const ringColor = valid ? 'rgba(34, 197, 94, 0.85)' : 'rgba(255, 46, 76, 0.85)';

      this.drawRangeRing(
        ctx,
        px,
        py,
        movingHero.range,
        valid ? 'rgba(250, 204, 21, 0.55)' : 'rgba(255, 46, 76, 0.45)'
      );
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 26, 0, Math.PI * 2);
      ctx.fillStyle = valid ? 'rgba(34, 197, 94, 0.16)' : 'rgba(255, 46, 76, 0.16)';
      ctx.fill();
      ctx.lineWidth = 2.6;
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = ringColor;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 2. Shockwave Ring Effects
    for (const sw of sim.shockwaves) {
      const alpha = Math.max(0, sw.life / sw.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = sw.color ?? '#00D4FF';
      ctx.lineWidth = 12 * alpha;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, Math.max(10, sw.currentRadius - 10), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2.5 Explosive AoE Blasts
    for (const exp of sim.explosions) {
      const progress = 1 - Math.max(0, exp.life / exp.maxLife);
      const alpha = Math.max(0, 1 - progress);
      const r = exp.radius * (0.45 + progress * 0.6);
      ctx.save();
      ctx.globalAlpha = alpha;
      const grad = ctx.createRadialGradient(exp.x, exp.y, 4, exp.x, exp.y, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.35, 'rgba(250, 204, 21, 0.85)');
      grad.addColorStop(0.75, 'rgba(255, 46, 76, 0.55)');
      grad.addColorStop(1, 'rgba(255, 46, 76, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 4 * alpha;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.radius * progress, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Multi-Gate Portals, Castle & Stationary Passive Guardian Pet (~80% Castle scale)
    this.drawSpawnPortals(ctx, sim);
    const petPos = computeCastlePetPosition(sim.arena);
    if (petPos.y < sim.arena.castleY) {
      this.drawCastleGuardianPet(ctx, sim, petPos.x, petPos.y);
      this.drawCastleBase(ctx, sim);
    } else {
      this.drawCastleBase(ctx, sim);
      this.drawCastleGuardianPet(ctx, sim, petPos.x, petPos.y);
    }

    // 4. Depth-sorted actors (1 or 3 Main Heroes + Units + Enemies)
    type RenderItem =
      | { kind: 'hero'; y: number; entity: HeroEntity; isSelected: boolean }
      | { kind: 'unit'; y: number; entity: UnitEntity }
      | { kind: 'enemy'; y: number; entity: EnemyEntity };

    const actors: RenderItem[] = [];
    sim.heroes.forEach((h, idx) => {
      if (drag?.source === 'hero' && drag.hasMoved && drag.heroIndex === idx) return;
      actors.push({
        kind: 'hero',
        y: h.y,
        entity: h,
        isSelected: idx === sim.activeHeroIndex && (sim.heroes.length > 1 || sim.heroRepositionMode),
      });
    });
    for (const u of sim.units) {
      if (drag?.source === 'unit' && drag.hasMoved && drag.unitId === u.id) continue;
      actors.push({ kind: 'unit', y: u.y, entity: u });
    }
    for (const e of sim.enemies) actors.push({ kind: 'enemy', y: e.y, entity: e });
    actors.sort((a, b) => a.y - b.y);

    for (const item of actors) {
      if (item.kind === 'hero') {
        this.drawHero(ctx, item.entity, sim.time, item.isSelected);
      } else if (item.kind === 'unit') {
        this.drawUnit(ctx, item.entity, sim.time);
      } else {
        this.drawEnemy(ctx, item.entity);
      }
    }

    // 5. Spinning Blade Spell Hazards
    for (const blade of sim.spinningBlades) {
      this.drawSpinningBladeHazard(ctx, blade);
    }

    // 5.5 Blade Spell Targeting Reticle
    if (sim.phase === 'playing' && sim.spells.targetingSpell === 'blade') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sim.pointerWorldX, sim.pointerWorldY, 126, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.16)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = '#00D4FF';
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 6. Dragged Hero / Unit / Card preview
    if (drag && drag.hasMoved) {
      if (drag.source === 'hero') {
        const draggedHero = sim.heroes[drag.heroIndex ?? sim.activeHeroIndex] ?? sim.hero;
        this.drawRangeRing(
          ctx,
          drag.worldX,
          drag.worldY,
          draggedHero.range,
          'rgba(250, 204, 21, 0.7)'
        );
        ctx.save();
        ctx.globalAlpha = 0.9;
        this.drawHeroSprite(
          ctx,
          draggedHero.heroClass,
          drag.worldX,
          drag.worldY - 8,
          draggedHero.level,
          draggedHero.facingAngle,
          0,
          0,
          0,
          sim.time
        );
        ctx.restore();
      } else {
        const spec = UNIT_SPECS[drag.kind];
        const range = draggedUnit ? draggedUnit.range : spec.range;
        this.drawRangeRing(ctx, drag.worldX, drag.worldY, range, 'rgba(0, 212, 255, 0.65)');

        ctx.save();
        ctx.globalAlpha = 0.88;
        this.drawUnitSprite(
          ctx,
          drag.kind,
          drag.worldX,
          drag.worldY - 8,
          drag.level,
          0,
          0,
          0,
          false,
          sim.time,
          1
        );
        ctx.restore();
      }
    }

    // 7. Crescent Slash Arcs (tinted by equipped FX Style when non-standard)
    const activeFx = FX_STYLES[sim.equippedFxStyle] ?? FX_STYLES.standard;
    const useCustomFx = sim.equippedFxStyle !== 'standard';
    for (const slash of sim.slashes) {
      const progress = 1 - slash.life / slash.maxLife;
      const alpha = Math.max(0, 1 - progress);
      ctx.save();
      ctx.translate(slash.x, slash.y);
      ctx.rotate(slash.angle);
      ctx.globalAlpha = alpha;

      ctx.strokeStyle = useCustomFx ? activeFx.slashTint : slash.color;
      ctx.lineWidth = 16 * (1 - progress * 0.45);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, slash.radius * (0.76 + progress * 0.24), -1.05, 1.05);
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 5 * (1 - progress * 0.6);
      ctx.beginPath();
      ctx.arc(0, 0, slash.radius * (0.78 + progress * 0.22), -0.9, 0.9);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Projectiles & Bombs
    for (const proj of sim.projectiles) {
      ctx.save();
      if (proj.isBomb) {
        // Ground target ring
        if (proj.targetX !== undefined && proj.targetY !== undefined) {
          ctx.strokeStyle = 'rgba(255, 46, 76, 0.55)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(proj.targetX, proj.targetY, (proj.blastRadius ?? 95) * 0.55, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Bomb sphere with glowing gold fuse spark
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FF2E4C';
        ctx.beginPath();
        ctx.arc(proj.x + 3, proj.y - 4, proj.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (proj.isShockwave) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.36)';
        ctx.strokeStyle = '#E0F2FE';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = useCustomFx ? activeFx.projectileTint : proj.trailColor;
        ctx.beginPath();
        ctx.arc(
          proj.x - proj.vx * 0.015,
          proj.y - proj.vy * 0.015,
          proj.radius * 0.78,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = proj.color;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. Pooled Typed Particles
    for (let i = 0; i < sim.particles.length; i++) {
      const p = sim.particles[i];
      if (!p.active) continue;
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = p.kind === 'smoke' ? alpha * 0.65 : alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.kind === 'grass') {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.15, p.size * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'spark') {
        ctx.beginPath();
        ctx.roundRect(-p.size * 1.25, -1.7, p.size * 2.5, 3.4, 1.5);
        ctx.fill();
      } else if (p.kind === 'smoke') {
        const grow = 1 + (1 - alpha) * 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * grow, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (0.5 + 0.5 * alpha), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 10. Route Entrance Warning Arrow
    for (const warn of sim.hordeWarnings) {
      this.drawHordeWarningArrow(
        ctx,
        warn.x + 36,
        warn.y,
        warn.angle,
        warn.timer,
        sim.time,
        Boolean(warn.isBoss)
      );
    }

    // 11. Floating Combat, Critical & XP Numbers
    for (const ft of sim.floatingTexts) {
      const alpha = Math.min(1, (ft.life / ft.maxLife) * 1.4);
      ctx.save();
      ctx.globalAlpha = alpha;
      const fontSize = ft.isCrit ? 17 : 13.5;
      ctx.font = `${ft.isCrit ? 900 : 800} ${Math.round(fontSize * ft.scale)}px "Fredoka", "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = ft.isCrit ? 5.5 : 3.5;
      ctx.strokeStyle = ft.isCrit ? '#450A0A' : '#020617';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }

  private drawHero(ctx: CanvasRenderingContext2D, hero: HeroEntity, time: number, isSelected = false) {
    if (hero.slotId === null) {
      // Tactical rune pedestal for freely positioned hero anywhere on terrain
      ctx.save();
      ctx.fillStyle = 'rgba(0, 212, 255, 0.14)';
      ctx.beginPath();
      ctx.ellipse(hero.x, hero.y + 15, 29, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    if (isSelected) {
      ctx.save();
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(hero.x, hero.y + 16, 34, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    this.drawHeroSprite(
      ctx,
      hero.heroClass,
      hero.x,
      hero.y,
      hero.level,
      hero.facingAngle,
      hero.attackAnim,
      hero.recoil,
      hero.levelUpFlash,
      time
    );
  }

  private drawHeroSprite(
    ctx: CanvasRenderingContext2D,
    heroClass: HeroClass,
    x: number,
    y: number,
    level: number,
    facingAngle: number,
    attackAnim: number,
    recoil: number,
    levelUpFlash: number,
    time: number
  ) {
    const spec = HERO_SPECS[heroClass];
    const idleBob = Math.sin(time * 4.2) * 1.8;
    // Dynamic visual size increase across Lv.1-15
    const levelScale = 1.06 + Math.min(14, Math.max(0, level - 1)) * 0.055;
    const scaleX = (1 + recoil * 0.14) * levelScale;
    const scaleY = (1 - recoil * 0.12) * levelScale;
    const faceRight = Math.cos(facingAngle) >= 0;

    ctx.save();
    ctx.translate(x, y + idleBob);

    // Shadow
    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 19 - idleBob, 22 * levelScale, 8 * levelScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic Level-Up & Evolution Glow Rings
    const pulse = 1 + Math.sin(time * 6) * 0.06;
    ctx.fillStyle = spec.glowColor;
    ctx.beginPath();
    ctx.ellipse(0, 14 - idleBob, 26 * levelScale * pulse, 11 * levelScale * pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    if (level >= 2 || levelUpFlash > 0) {
      ctx.strokeStyle = level >= MAX_HERO_LEVEL ? '#FACC15' : spec.color;
      ctx.lineWidth = level >= 4 ? 3 : 2.2;
      ctx.beginPath();
      ctx.ellipse(0, 14 - idleBob, 28 * levelScale * pulse, 12 * levelScale * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Orbiting Mastery Runes for Lv.3+
    if (level >= 3) {
      const orbCount = level >= MAX_HERO_LEVEL ? 4 : level >= 5 ? 3 : 2;
      for (let i = 0; i < orbCount; i++) {
        const ang = time * 2.6 + (i * Math.PI * 2) / orbCount;
        const ox = Math.cos(ang) * 28 * levelScale;
        const oy = Math.sin(ang) * 11 * levelScale + 4;
        ctx.fillStyle = level >= MAX_HERO_LEVEL ? '#FACC15' : '#00D4FF';
        ctx.beginPath();
        ctx.arc(ox, oy, 3.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.scale(scaleX, scaleY);

    if (heroClass === 'archer') {
      ctx.save();
      if (!faceRight) ctx.scale(-1, 1);

      // Electric Cape & Quiver
      ctx.fillStyle = '#0284C7';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-16, -8, 12, 20, 4);
      ctx.fill();
      ctx.stroke();

      // Tunic
      ctx.fillStyle = level >= 4 ? '#00D4FF' : '#0EA5E9';
      ctx.beginPath();
      ctx.roundRect(-10, -6, 20, 20, 6);
      ctx.fill();
      ctx.stroke();

      // Head & Hood
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(0, -14, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = level >= 5 ? '#FACC15' : '#0369A1';
      ctx.beginPath();
      ctx.arc(-1, -17, 11.5, Math.PI * 0.9, Math.PI * 2.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing Energy Bow
      const drawBack = attackAnim * 5;
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(9, -2, 15, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(11, -16);
      ctx.lineTo(7 - drawBack, -2);
      ctx.lineTo(11, 12);
      ctx.stroke();
      ctx.restore();
    } else if (heroClass === 'swordsman') {
      ctx.save();
      if (!faceRight) ctx.scale(-1, 1);

      // Crimson Heroic Cape
      ctx.fillStyle = '#DC2626';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(-20, 14);
      ctx.lineTo(-4, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Heavy Armored Body
      ctx.fillStyle = level >= 4 ? '#FF2E4C' : '#E11D48';
      ctx.beginPath();
      ctx.roundRect(-12, -7, 24, 22, 7);
      ctx.fill();
      ctx.stroke();

      // Gold Chest Emblem
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(2, 2, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Knight Helmet + Gold Crest Plume
      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.arc(0, -15, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(-4, -24);
      ctx.lineTo(0, -34);
      ctx.lineTo(6, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Visor
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(1, -17, 9, 4);

      // Massive Glowing Greatsword
      ctx.save();
      ctx.translate(10, 0);
      ctx.rotate(-0.6 + attackAnim * 1.45);
      ctx.fillStyle = level >= 4 ? '#FACC15' : '#F8FAFC';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-3, 2);
      ctx.lineTo(-4, -30);
      ctx.lineTo(0, -37);
      ctx.lineTo(4, -30);
      ctx.lineTo(3, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(-7, 0, 14, 4);
      ctx.restore();

      ctx.restore();
    } else {
      // Bombardeiro
      ctx.save();
      if (!faceRight) ctx.scale(-1, 1);

      // Brass Powder Backpack
      ctx.fillStyle = '#B45309';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-18, -8, 12, 20, 4);
      ctx.fill();
      ctx.stroke();

      // Amber-Gold Coat
      ctx.fillStyle = level >= 4 ? '#FACC15' : '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(-11, -6, 22, 21, 7);
      ctx.fill();
      ctx.stroke();

      // Head & Brass Goggles
      ctx.fillStyle = '#FED7AA';
      ctx.beginPath();
      ctx.arc(0, -14, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.roundRect(-10, -23, 20, 9, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00D4FF';
      ctx.beginPath();
      ctx.arc(-2, -18, 3.6, 0, Math.PI * 2);
      ctx.arc(6, -18, 3.6, 0, Math.PI * 2);
      ctx.fill();

      // Heavy Hand Cannon
      const kick = attackAnim * 4;
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(4 - kick, -6, 20, 11, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FF2E4C';
      ctx.beginPath();
      ctx.arc(23 - kick, -0.5, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Crisp Gold Level Crown Tag
    ctx.font = '800 11.5px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#020617';
    const tag = level >= MAX_HERO_LEVEL ? 'HERÓI MÁX' : `HERÓI Nv.${level}`;
    ctx.strokeText(tag, 0, -34);
    ctx.fillStyle = level >= MAX_HERO_LEVEL ? '#FACC15' : '#00D4FF';
    ctx.fillText(tag, 0, -34);

    ctx.restore();
  }

  private drawSpawnPortals(ctx: CanvasRenderingContext2D, sim: GameSimulation) {
    const totalRoutes = sim.arena.routes.length;
    for (const branch of sim.arena.routes) {
      const start = branch.waypoints[0] ?? { x: 96, y: 410 };
      const isOpen = branch.unlockRouteLevel <= sim.routeLevel;
      const pulse = Math.sin(sim.time * 4.5 + branch.gateIndex) * 2.5;

      ctx.save();
      ctx.translate(start.x, start.y);

      ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, 26, 36, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isOpen ? '#334155' : '#1E293B';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-28, -32, 56, 56, 18);
      ctx.fill();
      ctx.stroke();

      if (isOpen) {
        const riftGrad = ctx.createRadialGradient(0, -2, 4, 0, -2, 24 + pulse);
        riftGrad.addColorStop(0, '#FEF08A');
        riftGrad.addColorStop(0.55, branch.color);
        riftGrad.addColorStop(1, '#450A0A');
        ctx.fillStyle = riftGrad;
        ctx.beginPath();
        ctx.ellipse(0, -1, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#450A0A';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else {
        // Sealed Gate waiting for higher Route Level
        ctx.fillStyle = '#0B1120';
        ctx.beginPath();
        ctx.ellipse(0, -1, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = branch.color;
        ctx.lineWidth = 2.4;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Padlock glyph inside sealed gate
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, -5, 5.5, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(-7, -4, 14, 11);
      }

      ctx.font = '800 10.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#020617';
      const label = !isOpen
        ? `PORTÃO ${branch.gateIndex} · Nv.${branch.unlockRouteLevel}`
        : totalRoutes > 1
          ? `PORTÃO ${branch.gateIndex}`
          : 'HORDA';
      ctx.strokeText(label, 0, -40);
      ctx.fillStyle = isOpen ? (branch.gateIndex === 1 ? '#FCA5A5' : '#FEF08A') : '#94A3B8';
      ctx.fillText(label, 0, -40);

      ctx.restore();
    }
  }

  private drawCastleBase(ctx: CanvasRenderingContext2D, sim: GameSimulation) {
    const { castleX: cx, castleY: cy } = sim.arena;
    const hitFlash = sim.baseHitFlash > 0;
    const overcharged = sim.spells.overchargeTimer > 0;
    const waveFlag = Math.sin(sim.time * 5.2) * 3;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 40, 62, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    if (overcharged || hitFlash) {
      ctx.strokeStyle = hitFlash ? '#FF2E4C' : '#FACC15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 12, 66 + Math.sin(sim.time * 10) * 3, 52, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    const wallColor = hitFlash ? '#FCA5A5' : '#CBD5E1';
    const wallShade = hitFlash ? '#EF4444' : '#64748B';
    const roofColor = hitFlash ? '#DC2626' : '#0284C7';
    const outline = '#020617';

    ctx.fillStyle = wallShade;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-24, -46, 48, 56, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(0, -76);
    ctx.lineTo(29, -42);
    ctx.lineTo(-29, -42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -76);
    ctx.lineTo(0, -94);
    ctx.stroke();

    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#422006';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1, -93);
    ctx.quadraticCurveTo(13, -95 + waveFlag, 24, -88 + waveFlag * 0.6);
    ctx.lineTo(18, -84 + waveFlag * 0.4);
    ctx.lineTo(24, -80 + waveFlag * 0.6);
    ctx.lineTo(1, -82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = wallColor;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-42, -16, 84, 52, 8);
    ctx.fill();
    ctx.stroke();

    for (const mx of [-32, -14, 4, 22]) {
      ctx.fillStyle = wallColor;
      ctx.beginPath();
      ctx.roundRect(mx, -24, 12, 10, 2);
      ctx.fill();
      ctx.stroke();
    }

    for (const tx of [-44, 44]) {
      ctx.fillStyle = wallShade;
      ctx.beginPath();
      ctx.roundRect(tx - 13, -24, 26, 60, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(tx, -46);
      ctx.lineTo(tx + 17, -22);
      ctx.lineTo(tx - 17, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 14, 15, Math.PI, 0);
    ctx.lineTo(15, 36);
    ctx.lineTo(-15, 36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(0, -8, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#422006';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '800 13px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#020617';
    const lvlText = `Castelo Nv.${sim.baseLevel}`;
    ctx.strokeText(lvlText, 0, -104);
    ctx.fillStyle = '#FACC15';
    ctx.fillText(lvlText, 0, -104);

    ctx.restore();
  }

  private drawCharmStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x + r * 0.22, y - r * 0.22, x + r, y);
    ctx.quadraticCurveTo(x + r * 0.22, y + r * 0.22, x, y + r);
    ctx.quadraticCurveTo(x - r * 0.22, y + r * 0.22, x - r, y);
    ctx.quadraticCurveTo(x - r * 0.22, y - r * 0.22, x, y - r);
    ctx.closePath();
    ctx.fill();
  }

  private drawCastleGuardianPet(
    ctx: CanvasRenderingContext2D,
    sim: GameSimulation,
    px: number,
    py: number
  ) {
    const pet: PetKind = sim.selectedPet;
    const spec = PET_SPECS[pet];
    const t = sim.time;
    const breath = Math.sin(t * 2.8);
    const hover = Math.sin(t * 2.2) * 2.6;
    const pulse = 0.92 + Math.sin(t * 3.4) * 0.08;
    const switchPop = sim.petSwitchFlash > 0 ? 1 + Math.sin(sim.petSwitchFlash * Math.PI) * 0.12 : 1;

    // Visual scale tuned so Pet + pedestal/aura spans ~80% of Castle's visual height (~95px vs ~120px Castle)
    const petScale = 1.04 * switchPop;

    ctx.save();
    ctx.translate(px, py);

    // 1. Soft Enveloping "Amuleto da Sorte" (Lucky Charm) Outer Aura Glow
    const auraRadius = 58 * pulse;
    const outerGlow = ctx.createRadialGradient(0, -10, 8, 0, -10, auraRadius);
    outerGlow.addColorStop(0, spec.auraInner);
    outerGlow.addColorStop(0.55, spec.glowColor.replace('0.55', '0.2').replace('0.58', '0.24'));
    outerGlow.addColorStop(1, spec.auraOuter);
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, -10, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Golden warm lucky-charm core shimmer behind pet
    const charmCore = ctx.createRadialGradient(0, -14, 4, 0, -14, 34 * pulse);
    charmCore.addColorStop(0, 'rgba(254, 240, 138, 0.34)');
    charmCore.addColorStop(0.65, 'rgba(250, 204, 21, 0.1)');
    charmCore.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = charmCore;
    ctx.beginPath();
    ctx.arc(0, -14, 34 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Switch transition charm burst ring
    if (sim.petSwitchFlash > 0) {
      const burstProg = 1 - sim.petSwitchFlash;
      ctx.save();
      ctx.globalAlpha = sim.petSwitchFlash * 0.85;
      ctx.strokeStyle = spec.accentColor;
      ctx.lineWidth = 4 * sim.petSwitchFlash;
      ctx.beginPath();
      ctx.arc(0, -10, 26 + burstProg * 44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Ground Shadow & Rotating Sacred Amulet Talisman Seal
    ctx.fillStyle = 'rgba(2, 6, 23, 0.56)';
    ctx.beginPath();
    ctx.ellipse(0, 34, 42, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(0, 28);
    ctx.scale(1, 0.36);
    ctx.rotate(t * 0.48);

    ctx.strokeStyle = spec.primaryColor;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#FACC15';
    ctx.globalAlpha = 0.72;
    ctx.lineWidth = 1.8;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6 sacred rune diamonds on the amulet halo
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6;
      const rx = Math.cos(a) * 38;
      const ry = Math.sin(a) * 38;
      ctx.fillStyle = i % 2 === 0 ? '#FEF08A' : spec.primaryColor;
      ctx.beginPath();
      ctx.arc(rx, ry, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Stylized 2D Dark-Mystical Pet Body (Stationary Guardian with gentle breathing & hover)
    ctx.save();
    ctx.translate(0, hover);
    ctx.scale(petScale * (1 + breath * 0.022), petScale * (1 - breath * 0.028));

    if (pet === 'turtle') {
      this.drawTurtlePetBody(ctx, t);
    } else if (pet === 'tiger') {
      this.drawTigerPetBody(ctx, t);
    } else if (pet === 'rabbit') {
      this.drawRabbitPetBody(ctx, t);
    } else if (pet === 'owl') {
      this.drawOwlPetBody(ctx, t);
    } else {
      this.drawCatPetBody(ctx, t);
    }
    ctx.restore();

    // 4. Orbiting Lucky-Charm 4-Point Sparkles (deterministic trigonometric, 60 FPS zero-GC)
    for (let i = 0; i < 5; i++) {
      const ang = t * 1.15 + (i * Math.PI * 2) / 5;
      const sx = Math.cos(ang) * (39 + (i % 2) * 7);
      const sy = -12 + Math.sin(ang * 1.4) * 26;
      const twinkle = 0.45 + 0.55 * Math.sin(t * 4.5 + i * 1.7);
      ctx.save();
      ctx.globalAlpha = twinkle;
      this.drawCharmStar(ctx, sx, sy, 4.2 + (i % 2) * 1.8, i % 2 === 0 ? '#FEF08A' : spec.primaryColor);
      ctx.restore();
    }

    // 5. Crisp Guardian Label matching Castle typography
    ctx.font = '800 11.5px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3.8;
    ctx.strokeStyle = '#020617';
    const label = spec.name;
    ctx.strokeText(label, 0, -60);
    ctx.fillStyle = spec.accentColor;
    ctx.fillText(label, 0, -60);

    ctx.restore();
  }

  private drawTurtlePetBody(ctx: CanvasRenderingContext2D, t: number) {
    const outline = '#020617';
    const shimmer = 0.72 + Math.sin(t * 3.8) * 0.28;

    // Back & front sturdy mystical flippers
    ctx.fillStyle = '#047857';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.6;
    for (const fx of [-26, 22]) {
      ctx.beginPath();
      ctx.ellipse(fx, 18, 12, 7.5, fx < 0 ? -0.25 : 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Small pointed tail on right
    ctx.fillStyle = '#065F46';
    ctx.beginPath();
    ctx.moveTo(28, 12);
    ctx.lineTo(39, 15);
    ctx.lineTo(29, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden-bronze underside rim of the fortress shell
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.ellipse(2, 12, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Grand domed jade crystal carapace
    const shellGrad = ctx.createLinearGradient(0, -34, 0, 14);
    shellGrad.addColorStop(0, '#34D399');
    shellGrad.addColorStop(0.45, '#10B981');
    shellGrad.addColorStop(1, '#064E3B');
    ctx.fillStyle = shellGrad;
    ctx.beginPath();
    ctx.arc(2, 10, 32, Math.PI, 0);
    ctx.quadraticCurveTo(2, 18, -30, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing hexagonal runic plates on shell
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -14);
    ctx.lineTo(2, -21);
    ctx.lineTo(14, -14);
    ctx.lineTo(14, -1);
    ctx.lineTo(2, 6);
    ctx.lineTo(-10, -1);
    ctx.closePath();
    ctx.stroke();

    // Central luminous emerald-gold shield gem
    ctx.save();
    ctx.globalAlpha = shimmer;
    ctx.fillStyle = '#A7F3D0';
    ctx.beginPath();
    ctx.moveTo(2, -16);
    ctx.lineTo(9, -8);
    ctx.lineTo(2, 1);
    ctx.lineTo(-5, -8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Wise guardian head facing left toward the Castle & battlefield
    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(-28, -2, 13.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden forehead crest / amulet gem
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(-29, -15);
    ctx.lineTo(-24, -8);
    ctx.lineTo(-29, -4);
    ctx.lineTo(-34, -8);
    ctx.closePath();
    ctx.fill();

    // Luminous golden eye
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(-33, -3, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(-34, -3, 1.7, 0, Math.PI * 2);
    ctx.fill();

    // Gentle serene smile
    ctx.strokeStyle = '#022C22';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-33, 3, 4.5, 0.2, 1.3);
    ctx.stroke();
  }

  private drawTigerPetBody(ctx: CanvasRenderingContext2D, t: number) {
    const outline = '#020617';
    const tailWag = Math.sin(t * 3.2) * 5;

    // Curled fiery striped tail behind body
    ctx.strokeStyle = '#EA580C';
    ctx.lineWidth = 7.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(16, 16);
    ctx.quadraticCurveTo(36, 14 + tailWag * 0.5, 34, -6 + tailWag);
    ctx.stroke();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    // Glowing amber tail tip
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(34, -8 + tailWag, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Seated proud guardian body
    const bodyGrad = ctx.createLinearGradient(0, -18, 0, 26);
    bodyGrad.addColorStop(0, '#FB923C');
    bodyGrad.addColorStop(0.6, '#EA580C');
    bodyGrad.addColorStop(1, '#9A3412');
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(2, 8, 22, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cream-gold chest fur
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.ellipse(-4, 10, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front guardian paws
    ctx.fillStyle = '#F97316';
    for (const px of [-12, 8]) {
      ctx.beginPath();
      ctx.roundRect(px - 6, 14, 12, 14, 6);
      ctx.fill();
      ctx.stroke();
    }

    // Obsidian tiger flank stripes
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(22, 3);
    ctx.lineTo(14, 7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(11, 10);
    ctx.lineTo(21, 13);
    ctx.lineTo(13, 16);
    ctx.closePath();
    ctx.fill();

    // Blazing golden-ruby collar amulet
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-2, -6, 15, 0.35, Math.PI - 0.35);
    ctx.stroke();
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-2, 8, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FF2E4C';
    ctx.beginPath();
    ctx.arc(-2, 8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Rounded tiger ears
    ctx.fillStyle = '#EA580C';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.5;
    for (const ex of [-15, 11]) {
      ctx.beginPath();
      ctx.arc(ex, -34, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(ex, -34, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#EA580C';
    }

    // Fierce majestic tiger head
    const headGrad = ctx.createRadialGradient(-4, -22, 3, -2, -20, 21);
    headGrad.addColorStop(0, '#FDBA74');
    headGrad.addColorStop(0.55, '#F97316');
    headGrad.addColorStop(1, '#C2410C');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(-2, -20, 20, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cheek fur tufts
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.ellipse(-2, -13, 11, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Forehead王/mystic tiger stripes
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-2, -35);
    ctx.lineTo(-2, -25);
    ctx.moveTo(-9, -32);
    ctx.lineTo(-6, -26);
    ctx.moveTo(5, -32);
    ctx.lineTo(2, -26);
    ctx.stroke();

    // Glowing fierce amber-gold eyes
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.ellipse(-9.5, -21, 4.2, 3.2, 0.15, 0, Math.PI * 2);
    ctx.ellipse(5.5, -21, 4.2, 3.2, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(-10, -21, 1.8, 0, Math.PI * 2);
    ctx.arc(5, -21, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.moveTo(-5, -16);
    ctx.lineTo(1, -16);
    ctx.lineTo(-2, -12.5);
    ctx.closePath();
    ctx.fill();
  }

  private drawRabbitPetBody(ctx: CanvasRenderingContext2D, t: number) {
    const outline = '#020617';
    const earSway = Math.sin(t * 3.6) * 0.08;

    // Fluffy luminous moonlight tail
    ctx.fillStyle = '#E0F2FE';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(20, 14, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tall celestial sapphire-tipped ears
    for (const [ex, rot] of [
      [-9, -0.18 + earSway],
      [7, 0.16 - earSway],
    ] as const) {
      ctx.save();
      ctx.translate(ex, -28);
      ctx.rotate(rot);
      const earGrad = ctx.createLinearGradient(0, -26, 0, 4);
      earGrad.addColorStop(0, '#00D4FF');
      earGrad.addColorStop(0.45, '#E0F2FE');
      earGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = earGrad;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -12, 6.2, 19, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.ellipse(0, -11, 2.8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Agile seated ivory-cyan body
    const bodyGrad = ctx.createLinearGradient(0, -12, 0, 26);
    bodyGrad.addColorStop(0, '#F8FAFC');
    bodyGrad.addColorStop(0.65, '#BAE6FD');
    bodyGrad.addColorStop(1, '#0284C7');
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(0, 10, 18.5, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Front paws
    ctx.fillStyle = '#F8FAFC';
    for (const px of [-8, 7]) {
      ctx.beginPath();
      ctx.ellipse(px, 23, 6.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Arcane celestial collar ribbon & speed charm gem
    ctx.fillStyle = '#0369A1';
    ctx.beginPath();
    ctx.roundRect(-14, -4, 28, 7, 3.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(5.5, 3);
    ctx.lineTo(0, 9);
    ctx.lineTo(-5.5, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.ellipse(-1, -18, 16.5, 14.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden lunar crescent charm on forehead
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(-1, -25, 4.2, 0.25 * Math.PI, 1.35 * Math.PI);
    ctx.stroke();

    // Luminous sapphire-cyan eyes
    ctx.fillStyle = '#00D4FF';
    ctx.beginPath();
    ctx.arc(-8, -17, 3.8, 0, Math.PI * 2);
    ctx.arc(5.5, -17, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-9.2, -18.2, 1.4, 0, Math.PI * 2);
    ctx.arc(4.3, -18.2, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Delicate pink-gold nose
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(-1.5, -13, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawOwlPetBody(ctx: CanvasRenderingContext2D, t: number) {
    const outline = '#020617';
    const wingPulse = Math.sin(t * 2.5) * 1.4;

    // Arcane gilded perch pedestal
    ctx.fillStyle = '#4C1D95';
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-24, 21, 48, 7, 3.5);
    ctx.fill();
    ctx.stroke();

    // Folded royal violet scalloped wings
    ctx.fillStyle = '#5B21B6';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(-18 - wingPulse * 0.5, 4, 11, 21, 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(18 + wingPulse * 0.5, 4, 11, 21, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Main owl torso
    const bodyGrad = ctx.createLinearGradient(0, -28, 0, 24);
    bodyGrad.addColorStop(0, '#9333EA');
    bodyGrad.addColorStop(0.55, '#6D28D9');
    bodyGrad.addColorStop(1, '#2E1065');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 3, 20, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Starlight-cream feathered belly with golden chevron pattern
    ctx.fillStyle = '#EDE9FE';
    ctx.beginPath();
    ctx.ellipse(0, 8, 12.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 1.6;
    for (const fy of [3, 9, 15]) {
      ctx.beginPath();
      ctx.moveTo(-6, fy);
      ctx.lineTo(0, fy + 3);
      ctx.lineTo(6, fy);
      ctx.stroke();
    }

    // Golden talons gripping perch
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    for (const tx of [-9, 9]) {
      ctx.beginPath();
      ctx.roundRect(tx - 4.5, 18, 9, 6, 3);
      ctx.fill();
      ctx.stroke();
    }

    // Arcane golden chest talisman
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(0, -5, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#00D4FF';
    ctx.beginPath();
    ctx.arc(0, -5, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Regal horned ear tufts
    ctx.fillStyle = '#7C3AED';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-12, -28);
    ctx.lineTo(-22, -44);
    ctx.lineTo(-4, -34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(12, -28);
    ctx.lineTo(22, -44);
    ctx.lineTo(4, -34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Round wise owl head
    ctx.fillStyle = '#7E22CE';
    ctx.beginPath();
    ctx.ellipse(0, -22, 18.5, 15.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Facial disc rings
    ctx.fillStyle = '#DDD6FE';
    ctx.beginPath();
    ctx.arc(-7.5, -22, 7.5, 0, Math.PI * 2);
    ctx.arc(7.5, -22, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Luminous golden-amber arcane eyes
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-7.5, -22, 5.2, 0, Math.PI * 2);
    ctx.arc(7.5, -22, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(-7.5, -22, 2.3, 0, Math.PI * 2);
    ctx.arc(7.5, -22, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-8.8, -23.5, 1.3, 0, Math.PI * 2);
    ctx.arc(6.2, -23.5, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Golden beak
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-4, -18);
    ctx.lineTo(4, -18);
    ctx.lineTo(0, -11.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawCatPetBody(ctx: CanvasRenderingContext2D, t: number) {
    const outline = '#020617';
    const tailSway = Math.sin(t * 3.1) * 6;

    // Mystical twin-glint curving lucky tail
    ctx.strokeStyle = '#3B0764';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(14, 18);
    ctx.bezierCurveTo(36, 16, 38, -10 + tailSway, 24, -22 + tailSway);
    ctx.stroke();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Glowing golden luck star at tail tip
    this.drawCharmStar(ctx, 24, -22 + tailSway, 5.8, '#FEF08A');

    // Sleek twilight-obsidian guardian cat body
    const bodyGrad = ctx.createLinearGradient(0, -12, 0, 26);
    bodyGrad.addColorStop(0, '#4C1D95');
    bodyGrad.addColorStop(0.55, '#1E1B4B');
    bodyGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(0, 9, 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Elegant paws (one slightly raised like a mystical lucky charm cat!)
    ctx.fillStyle = '#312E81';
    ctx.beginPath();
    ctx.ellipse(-9, 23, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Raised lucky-charm paw with golden glow glint
    ctx.fillStyle = '#4C1D95';
    ctx.beginPath();
    ctx.ellipse(11, 2 + Math.sin(t * 3.5) * 1.6, 5.8, 8.5, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Radiant Gold Lucky Collar & Fortune Bell Amulet
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.arc(0, -5, 13.5, 0.35, Math.PI - 0.35);
    ctx.stroke();

    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#422006';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 8, 6.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(-1.8, 6.2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Pointed mystical cat ears with golden inner rune glow
    ctx.fillStyle = '#2E1065';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.5;
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(dir * 5, -31);
      ctx.lineTo(dir * 18, -45);
      ctx.lineTo(dir * 16, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(dir * 8, -30);
      ctx.lineTo(dir * 15, -39);
      ctx.lineTo(dir * 14, -27);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2E1065';
    }

    // Sleek mystic head
    const headGrad = ctx.createRadialGradient(-3, -23, 3, 0, -20, 19);
    headGrad.addColorStop(0, '#5B21B6');
    headGrad.addColorStop(0.6, '#2E1065');
    headGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, -20, 17.5, 14.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Forehead golden fortune star rune
    this.drawCharmStar(ctx, 0, -28.5, 4.4, '#FACC15');

    // Luminous emerald-gold fortune eyes
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.ellipse(-7, -19.5, 4.3, 3.4, 0.14, 0, Math.PI * 2);
    ctx.ellipse(7, -19.5, 4.3, 3.4, -0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(-7, -19.5, 1.3, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(7, -19.5, 1.3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle golden whiskers
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.72)';
    ctx.lineWidth = 1.4;
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(dir * 11, -16);
      ctx.lineTo(dir * 22, -18);
      ctx.moveTo(dir * 11, -13);
      ctx.lineTo(dir * 21, -12);
      ctx.stroke();
    }

    // Cute golden nose
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(-2.5, -15);
    ctx.lineTo(2.5, -15);
    ctx.lineTo(0, -12.5);
    ctx.closePath();
    ctx.fill();
  }

  private drawHordeWarningArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    timer: number,
    time: number,
    isBoss: boolean
  ) {
    const nudge = Math.sin(time * 9) * 5;
    const pulse = 0.65 + Math.sin(time * (isBoss ? 14 : 11)) * 0.35;

    ctx.save();
    ctx.translate(x + Math.cos(angle) * nudge, y + Math.sin(angle) * nudge);
    ctx.rotate(angle);
    ctx.globalAlpha = Math.min(1, pulse * Math.min(1, timer * 1.4));
    if (isBoss) ctx.scale(1.4, 1.4);

    ctx.fillStyle = '#FF2E4C';
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = isBoss ? 3 : 2.5;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-10, -13);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-10, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawSpinningBladeHazard(
    ctx: CanvasRenderingContext2D,
    blade: { x: number; y: number; radius: number; rotation: number; life: number; maxLife: number }
  ) {
    const fade = Math.min(1, blade.life * 2.5);
    ctx.save();
    ctx.translate(blade.x, blade.y);
    ctx.globalAlpha = fade;

    ctx.strokeStyle = 'rgba(0, 212, 255, 0.55)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, blade.radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(blade.rotation);

    for (let i = 0; i < 2; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI);
      ctx.fillStyle = '#00D4FF';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(blade.radius * 0.85, -14);
      ctx.lineTo(blade.radius * 0.98, 0);
      ctx.lineTo(blade.radius * 0.85, 14);
      ctx.lineTo(0, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#E0F2FE';
      ctx.fillRect(10, -4, blade.radius * 0.72, 8);
      ctx.restore();
    }

    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#422006';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawRangeRing(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    range: number,
    strokeColor = 'rgba(0, 212, 255, 0.65)'
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 212, 255, 0.08)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  private drawUnit(ctx: CanvasRenderingContext2D, unit: UnitEntity, time: number) {
    this.drawUnitSprite(
      ctx,
      unit.kind,
      unit.x,
      unit.y,
      unit.level,
      unit.facingAngle,
      unit.attackAnim,
      unit.recoil,
      unit.hitFlash > 0,
      time,
      unit.id
    );

    // Expanding level-up ring pulse when an ally levels up from kills or merge
    const flash = unit.levelUpFlash ?? 0;
    if (flash > 0) {
      const t = 1 - Math.min(1, flash);
      ctx.save();
      ctx.strokeStyle = `rgba(250, 204, 21, ${(1 - t) * 0.9})`;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y - 2, 16 + t * 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Subtle per-stage XP progress bar under allied units that have earned XP or leveled up
    const unitXp = unit.xp ?? 0;
    if (unitXp > 0 || unit.level > 1) {
      const isMax = unit.level >= MAX_UNIT_LEVEL;
      const bounds = getUnitXpBounds(unit.level);
      const span = Math.max(1, bounds.nextThreshold - bounds.currentFloor);
      const pct = isMax
        ? 1
        : Math.max(0, Math.min(1, (unitXp - bounds.currentFloor) / span));
      const barW = 28;
      const barH = 3.5;
      const bx = unit.x - barW / 2;
      const by = unit.y + 22;

      ctx.save();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.beginPath();
      ctx.roundRect(bx - 1, by - 1, barW + 2, barH + 2, 2);
      ctx.fill();

      ctx.fillStyle = isMax ? '#FACC15' : '#00D4FF';
      if (pct > 0) {
        ctx.beginPath();
        ctx.roundRect(bx, by, Math.max(2, barW * pct), barH, 1.5);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawUnitSprite(
    ctx: CanvasRenderingContext2D,
    kind: UnitKind,
    x: number,
    y: number,
    level: number,
    facingAngle: number,
    attackAnim: number,
    recoil: number,
    flash: boolean,
    time: number,
    seed: number
  ) {
    const idleBob = Math.sin(time * 3.8 + seed) * 1.4;
    const levelScale = 1 + Math.min(4, level - 1) * 0.08;
    const scaleX = (1 + recoil * 0.16) * levelScale;
    const scaleY = (1 - recoil * 0.14) * levelScale;
    const faceRight = Math.cos(facingAngle) >= 0;

    ctx.save();
    ctx.translate(x, y + idleBob);

    ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 17 - idleBob, 18 * levelScale, 7 * levelScale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (level >= 2) {
      const auraColor =
        level >= MAX_UNIT_LEVEL
          ? 'rgba(255, 46, 76, 0.36)'
          : level === 3
            ? 'rgba(250, 204, 21, 0.34)'
            : 'rgba(0, 212, 255, 0.3)';
      ctx.fillStyle = auraColor;
      ctx.beginPath();
      ctx.ellipse(0, 14 - idleBob, 24 * levelScale, 10 * levelScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = level >= 3 ? '#FACC15' : '#00D4FF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.scale(scaleX, scaleY);

    if (kind === 'scout') {
      ctx.save();
      if (!faceRight) ctx.scale(-1, 1);

      ctx.fillStyle = flash ? '#FFFFFF' : '#FF2E4C';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-16, -6, 10, 16, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = flash ? '#FFFFFF' : '#00D4FF';
      ctx.beginPath();
      ctx.roundRect(-10, -4, 20, 18, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = flash ? '#FFFFFF' : '#FED7AA';
      ctx.beginPath();
      ctx.arc(0, -13, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(4, -13, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = level >= 2 ? '#FACC15' : '#2563EB';
      ctx.beginPath();
      ctx.arc(0, -17, 11.5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(-3, -21, 16, 5, 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (kind === 'shield') {
      ctx.save();
      if (!faceRight) ctx.scale(-1, 1);

      ctx.fillStyle = flash ? '#FFFFFF' : '#1D4ED8';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-12, -8, 22, 22, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = flash ? '#FFFFFF' : level >= 2 ? '#00D4FF' : '#3B82F6';
      ctx.beginPath();
      ctx.arc(-1, -14, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const bashOffset = attackAnim * 7;
      ctx.fillStyle = flash ? '#FFFFFF' : level >= 3 ? '#00D4FF' : '#60A5FA';
      ctx.beginPath();
      ctx.roundRect(0 + bashOffset, -14, 17, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(8.5 + bashOffset, -1, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (kind === 'frog') {
      ctx.scale(1.16, 1.16);

      ctx.save();
      ctx.rotate(-0.95 - attackAnim * 0.4);
      ctx.fillStyle = level >= 2 ? '#FACC15' : '#34D399';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, -2.5);
      ctx.lineTo(34, -4.5);
      ctx.lineTo(38, 0);
      ctx.lineTo(34, 4.5);
      ctx.lineTo(10, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = flash ? '#FFFFFF' : '#10B981';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 2, 18, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      for (const side of [-1, 1]) {
        ctx.fillStyle = '#FF2E4C';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(side * 12, -13, 6.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(side * 7, -6, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(side * 7 - 1, -7.2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      const swing = attackAnim * 1.15;
      ctx.save();
      ctx.rotate(facingAngle - 0.5 + swing);
      ctx.fillStyle = level >= 2 ? '#FACC15' : '#A3E635';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(12, -3);
      ctx.lineTo(42, -5);
      ctx.lineTo(46, 0);
      ctx.lineTo(42, 5);
      ctx.lineTo(12, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (kind === 'swordsman_ally') {
      ctx.save();
      if (!faceRight) ctx.scale(-1, 1);
      ctx.fillStyle = flash ? '#FFFFFF' : '#991B1B';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-12, -6, 24, 21, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = flash ? '#FFFFFF' : '#DC2626';
      ctx.beginPath();
      ctx.arc(0, -14, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(-3, -22, 6, 6);
      ctx.save();
      ctx.translate(10, 0);
      ctx.rotate(-0.5 + attackAnim * 1.3);
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.roundRect(-2.5, -28, 5, 28, 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    } else if (kind === 'fire_mage') {
      ctx.save();
      if (!faceRight) ctx.scale(-1, 1);
      ctx.fillStyle = flash ? '#FFFFFF' : '#EA580C';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-13, 14);
      ctx.lineTo(-8, -8);
      ctx.lineTo(8, -8);
      ctx.lineTo(13, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FED7AA';
      ctx.beginPath();
      ctx.arc(0, -13, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.moveTo(-12, -16);
      ctx.lineTo(0, -32);
      ctx.lineTo(12, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(13, -6 - attackAnim * 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (kind === 'cleric') {
      ctx.save();
      ctx.fillStyle = flash ? '#FFFFFF' : '#FEF3C7';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-11, -7, 22, 22, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(-5, 0, 10, 3);
      ctx.fillRect(-1.5, -3.5, 3, 10);
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(0, -14, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -25, 8, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (kind === 'shadow_assassin') {
      ctx.save();
      if (!faceRight) ctx.scale(-1, 1);
      ctx.fillStyle = flash ? '#FFFFFF' : '#581C87';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-14, 14);
      ctx.lineTo(-9, -8);
      ctx.lineTo(9, -8);
      ctx.lineTo(14, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#3B0764';
      ctx.beginPath();
      ctx.arc(0, -14, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#E879F9';
      ctx.beginPath();
      ctx.arc(4, -14, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, 2);
      ctx.lineTo(22 + attackAnim * 6, -8);
      ctx.stroke();
      ctx.restore();
    } else if (kind === 'sniper') {
      ctx.save();
      if (!faceRight) ctx.scale(-1, 1);
      ctx.fillStyle = flash ? '#FFFFFF' : '#0891B2';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-10, -6, 20, 20, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(0, -14, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#06B6D4';
      ctx.fillRect(-10, -21, 22, 6);
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(6 - attackAnim * 3, -4, 20, 5);
      ctx.restore();
    } else if (kind === 'golem') {
      ctx.save();
      ctx.fillStyle = flash ? '#FFFFFF' : '#475569';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 26, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.roundRect(-11, -22, 22, 15, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#00D4FF';
      ctx.beginPath();
      ctx.arc(-4, -15, 2.3, 0, Math.PI * 2);
      ctx.arc(4, -15, 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (kind === 'spore_witch') {
      ctx.save();
      ctx.fillStyle = flash ? '#FFFFFF' : '#4D7C0F';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-13, 14);
      ctx.lineTo(-8, -8);
      ctx.lineTo(8, -8);
      ctx.lineTo(13, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#D9F99D';
      ctx.beginPath();
      ctx.arc(0, -13, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#65A30D';
      ctx.beginPath();
      ctx.moveTo(-15, -17);
      ctx.lineTo(0, -33);
      ctx.lineTo(15, -17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (kind === 'paladin') {
      ctx.save();
      if (!faceRight) ctx.scale(-1, 1);
      ctx.fillStyle = flash ? '#FFFFFF' : '#CA8A04';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.roundRect(-13, -7, 26, 23, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(0, -15, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#EAB308';
      ctx.beginPath();
      ctx.moveTo(-8, -24);
      ctx.lineTo(-4, -33);
      ctx.lineTo(0, -27);
      ctx.lineTo(4, -33);
      ctx.lineTo(8, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.translate(11, -1);
      ctx.rotate(-0.55 + attackAnim * 1.35);
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(-2.5, -28, 5, 28);
      ctx.restore();
      ctx.restore();
    }

    if (level > 1) {
      ctx.font = '800 12px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#020617';
      const label = `Nv.${level}`;
      ctx.strokeText(label, 0, -29);
      ctx.fillStyle = '#FACC15';
      ctx.fillText(label, 0, -29);
    }

    ctx.restore();
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, enemy: EnemyEntity) {
    const isBoss = enemy.kind === 'boss' || Boolean(enemy.isBoss);
    const isElite = isEliteEnemy(enemy);
    const isTitan = enemy.kind === 'titan';
    const isReaper = enemy.kind === 'reaper';
    const waddle = enemy.isDead ? 0 : Math.sin(enemy.walkPhase) * (isBoss ? 0.08 : 0.12);
    const bounce = enemy.isDead ? 0 : Math.abs(Math.sin(enemy.walkPhase)) * (isBoss ? 4.2 : 3.2);
    const koDuration = isBoss || isTitan || isReaper ? 0.52 : 0.32;
    const koAlpha = enemy.isDead ? Math.max(0, enemy.koTimer / koDuration) : 1;
    const koTilt = enemy.isDead ? (1 - koAlpha) * 1.1 : 0;
    const flash = enemy.hitFlash > 0;
    const biteOffset = enemy.attackAnim * 4;

    ctx.save();
    ctx.globalAlpha = koAlpha;
    ctx.translate(enemy.x, enemy.y);

    ctx.fillStyle = isBoss
      ? 'rgba(255, 46, 76, 0.38)'
      : isTitan
        ? 'rgba(168, 85, 247, 0.35)'
        : isReaper
          ? 'rgba(250, 204, 21, 0.3)'
          : isElite
            ? 'rgba(250, 204, 21, 0.25)'
            : 'rgba(2, 6, 23, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius - 2, enemy.radius * 0.9, isBoss ? 11 : 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isBoss && !enemy.isDead) {
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, enemy.radius - 4, enemy.radius * 1.08, 13, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (isElite && !enemy.isDead) {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.ellipse(0, enemy.radius - 3, enemy.radius * 1.05, 8.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (isTitan && !enemy.isDead && enemy.bracingTimer > 0) {
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -4, enemy.radius + 7, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (enemy.kind === 'brute' && enemy.lungeTimer > 0.32) {
      ctx.strokeStyle = '#FF2E4C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (enemy.kind === 'stalker' && enemy.lungeTimer > 0) {
      ctx.strokeStyle = '#E879F9';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-6, 0, enemy.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.translate(0, -bounce - biteOffset);
    ctx.rotate(waddle + koTilt);

    const cPrimary = enemy.primaryColor;
    const cSecondary = enemy.secondaryColor;
    const cAccent = enemy.accentColor;

    if ((enemy.slowTimer ?? 0) > 0 && !enemy.isDead) {
      ctx.strokeStyle = '#84CC16';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, enemy.radius - 2, enemy.radius + 5, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if ((enemy.corrosionTimer ?? 0) > 0 && !enemy.isDead) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, -4, enemy.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (enemy.kind === 'walker') {
      ctx.fillStyle = flash ? '#FFFFFF' : cSecondary ?? '#E2E8F0';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-10, -4, 20, 18, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#38BDF8';
      ctx.beginPath();
      ctx.arc(0, -12, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.drawZombieFace(ctx, 0, -12);
    } else if (enemy.kind === 'stalker') {
      ctx.fillStyle = flash ? '#FFFFFF' : cSecondary ?? '#4C1D95';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-13, 12);
      ctx.lineTo(-8, -8);
      ctx.lineTo(8, -8);
      ctx.lineTo(13, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#C026D3';
      ctx.beginPath();
      ctx.arc(0, -13, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = cAccent ?? '#FACC15';
      ctx.beginPath();
      ctx.moveTo(-8, -18);
      ctx.lineTo(-14, -27);
      ctx.lineTo(-3, -21);
      ctx.closePath();
      ctx.moveTo(8, -18);
      ctx.lineTo(14, -27);
      ctx.lineTo(3, -21);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = cAccent ?? '#00D4FF';
      ctx.beginPath();
      ctx.arc(-3.5, -13, 2.3, 0, Math.PI * 2);
      ctx.arc(3.5, -13, 2.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.kind === 'pyro') {
      ctx.fillStyle = flash ? '#FFFFFF' : cSecondary ?? '#EA580C';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-11, -5, 22, 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = cAccent ?? '#FACC15';
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(-5, -28);
      ctx.lineTo(0, -18);
      ctx.lineTo(4, -30);
      ctx.lineTo(10, -14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#FF2E4C';
      ctx.beginPath();
      ctx.arc(0, -13, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.drawZombieFace(ctx, 0, -13);
    } else if (enemy.kind === 'reaper') {
      ctx.fillStyle = flash ? '#FFFFFF' : cSecondary ?? '#1E1B4B';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-17, 16);
      ctx.lineTo(-12, -10);
      ctx.lineTo(12, -10);
      ctx.lineTo(17, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#991B1B';
      ctx.beginPath();
      ctx.arc(0, -18, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = cAccent ?? '#FACC15';
      ctx.beginPath();
      ctx.arc(-4.5, -18, 2.5, 0, Math.PI * 2);
      ctx.arc(4.5, -18, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = cAccent ?? '#FACC15';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(14, 14);
      ctx.lineTo(18, -26);
      ctx.stroke();
      ctx.fillStyle = '#FF2E4C';
      ctx.beginPath();
      ctx.moveTo(18, -26);
      ctx.quadraticCurveTo(34, -22, 30, -8);
      ctx.quadraticCurveTo(25, -18, 18, -19);
      ctx.closePath();
      ctx.fill();
    } else if (enemy.kind === 'titan') {
      ctx.fillStyle = flash ? '#FFFFFF' : cSecondary ?? '#312E81';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-20, -10, 40, 32, 8);
      ctx.fill();
      ctx.stroke();

      if (!flash) {
        ctx.fillStyle = cPrimary ?? '#A855F7';
        ctx.beginPath();
        ctx.roundRect(-24, -12, 11, 14, 4);
        ctx.roundRect(13, -12, 11, 14, 4);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#7C3AED';
      ctx.beginPath();
      ctx.arc(0, -20, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.drawZombieFace(ctx, 0, -20);

      ctx.fillStyle = cAccent ?? '#00D4FF';
      ctx.beginPath();
      ctx.arc(0, 5, 5.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.kind === 'shielded') {
      ctx.fillStyle = flash ? '#FFFFFF' : cSecondary ?? '#1E40AF';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-12, -5, 24, 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#00D4FF';
      ctx.beginPath();
      ctx.arc(0, -14, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.drawZombieFace(ctx, 0, -14);

      const shieldRaise = enemy.bracingTimer > 0 ? -4 : 0;
      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#2563EB';
      ctx.beginPath();
      ctx.roundRect(-14, -8 + shieldRaise, 16, 22, 4);
      ctx.fill();
      ctx.stroke();

      if (!flash) {
        ctx.fillStyle = cAccent ?? '#FACC15';
        ctx.fillRect(-10, 0 + shieldRaise, 8, 5);
      }
    } else if (enemy.kind === 'shield_bearer') {
      if (!enemy.isDead) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, 95, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
      ctx.fillStyle = flash ? '#FFFFFF' : cSecondary ?? '#1E3A8A';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(-15, -8, 30, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#0284C7';
      ctx.beginPath();
      ctx.arc(0, -16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.drawZombieFace(ctx, 0, -16);

      ctx.fillStyle = flash ? '#FFFFFF' : '#38BDF8';
      ctx.beginPath();
      ctx.roundRect(-18, -12, 16, 28, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(-13, -3, 6, 10);
    } else if (enemy.kind === 'corruptor') {
      if (!enemy.isDead) {
        ctx.save();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.28)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 150, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
      ctx.fillStyle = flash ? '#FFFFFF' : cSecondary ?? '#3B0764';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-14, 15);
      ctx.lineTo(-9, -9);
      ctx.lineTo(9, -9);
      ctx.lineTo(14, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#9333EA';
      ctx.beginPath();
      ctx.arc(0, -14, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = cAccent ?? '#E879F9';
      ctx.beginPath();
      ctx.arc(-3.5, -14, 2.5, 0, Math.PI * 2);
      ctx.arc(3.5, -14, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (enemy.kind === 'boss') {
      ctx.fillStyle = flash ? '#FFFFFF' : cSecondary ?? '#991B1B';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.roundRect(-24, -12, 48, 38, 10);
      ctx.fill();
      ctx.stroke();

      if (!flash) {
        ctx.fillStyle = cPrimary ?? '#FF2E4C';
        ctx.beginPath();
        ctx.roundRect(-28, -14, 14, 16, 5);
        ctx.roundRect(14, -14, 14, 16, 5);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#EF4444';
      ctx.beginPath();
      ctx.arc(0, -24, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.drawZombieFace(ctx, 0, -24);

      ctx.fillStyle = flash ? '#FFFFFF' : cAccent ?? '#FACC15';
      ctx.strokeStyle = '#422006';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-14, -39);
      ctx.lineTo(-16, -52);
      ctx.lineTo(-6, -45);
      ctx.lineTo(0, -56);
      ctx.lineTo(6, -45);
      ctx.lineTo(16, -52);
      ctx.lineTo(14, -39);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = flash ? '#FFFFFF' : cSecondary ?? '#B91C1C';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.roundRect(-14, -6, 28, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = flash ? '#FFFFFF' : cPrimary ?? '#FF2E4C';
      ctx.beginPath();
      ctx.arc(0, -15, 12.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.drawZombieFace(ctx, 0, -15);
    }

    ctx.restore();

    if (!enemy.isDead && enemy.hp > 0) {
      ctx.save();
      const yPos = enemy.y - enemy.radius - (isBoss ? 30 : 13) - bounce;

      if (isBoss) {
        const barW = 72;
        const barH = 7;
        const ratio = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.roundRect(enemy.x - barW / 2, yPos - 2, barW, barH, 3.5);
        ctx.fill();
        ctx.fillStyle = '#FF2E4C';
        ctx.beginPath();
        ctx.roundRect(enemy.x - barW / 2 + 1, yPos - 1, (barW - 2) * ratio, barH - 2, 2.5);
        ctx.fill();

        ctx.font = '800 12px "Fredoka", "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#020617';
        const bossLabel = `${enemy.displayName ?? 'CHEFE'} · ${enemy.hp}`;
        ctx.strokeText(bossLabel, enemy.x, yPos - 5);
        ctx.fillStyle = '#FACC15';
        ctx.fillText(bossLabel, enemy.x, yPos - 5);
      } else if (isElite) {
        ctx.font = '800 12px "Fredoka", "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#020617';
        const eliteText = `★ ${enemy.displayName ?? 'ELITE'} · ${enemy.hp}`;
        ctx.strokeText(eliteText, enemy.x, yPos);
        ctx.fillStyle = '#FACC15';
        ctx.fillText(eliteText, enemy.x, yPos);
      } else {
        ctx.font = '800 14px "Fredoka", "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#020617';
        const hpText = String(enemy.hp);
        ctx.strokeText(hpText, enemy.x, yPos);
        ctx.fillStyle = enemy.bracingTimer > 0 ? '#00D4FF' : '#FFFFFF';
        ctx.fillText(hpText, enemy.x, yPos);
      }
      ctx.restore();
    }
  }

  private drawZombieFace(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 3.8, cy - 1, 2.7, 0, Math.PI * 2);
    ctx.arc(cx + 3.8, cy - 1, 2.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(cx - 3.6, cy - 0.8, 1.3, 0, Math.PI * 2);
    ctx.arc(cx + 3.6, cy - 0.8, 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 5.2, 3.6, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
