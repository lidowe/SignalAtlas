import { useEffect, useRef, useState, useCallback } from 'react';
import type { Perspective, StudioMode, Microphone, Preamp, InsertProcessor, ParallelProcessor } from '../types/studio';

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>;
  perspective: Perspective;
  mode: StudioMode;
  selectedMic: Microphone | null;
  selectedPreamp: Preamp | null;
  insertChain: InsertProcessor[];
  parallelChain: ParallelProcessor[];
}

interface RowRect {
  id: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  centerX: number;
  centerY: number;
}

interface PointRect {
  key: string;
  cx: number;
  cy: number;
  rowId: string;
  position: string;
}

// ── Signal domain for color coding ──
type SignalLevel = 'mic' | 'line' | 'digital';

const LEVEL_COLORS: Record<SignalLevel, string> = {
  mic: '#e8724a',     // warm red-orange — mic-level signal
  line: '#34d399',    // will be overridden by lens accent
  digital: '#60a5fa', // blue-400 — digital domain
};

// ── Path geometry helpers ──

/** Build a smooth bezier path from waypoints */
function buildBezier(pts: Array<{ x: number; y: number }>): string | null {
  if (pts.length < 2) return null;
  const parts: string[] = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midY = (prev.y + curr.y) / 2;
    parts.push(`C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`);
  }
  return parts.join(' ');
}

/** First point only (for mono signals — use leftmost / first channel) */
function firstPoint(pts: PointRect[]): { x: number; y: number } | null {
  if (pts.length === 0) return null;
  const sorted = [...pts].sort((a, b) => a.cx - b.cx);
  return { x: sorted[0].cx, y: sorted[0].cy };
}

// ── Default monitor path row order (always visible) ──
const MONITOR_ROWS = ['row-api-mix-out', 'row-pueblo-in', 'row-ad-daw'];
const TRACKING_ROWS = ['row-mic-ties', 'row-preamp-in', 'row-dynamics', 'row-eq', 'row-ad-daw'];
const MIXING_ROWS = ['row-preamp-out', 'row-insert-send', 'row-api-mix-out', 'row-pueblo-in', 'row-ad-daw'];

// ── Segment: a path fragment with its own signal level + lane count ──
interface PathSegment {
  d: string;
  level: SignalLevel;
  stereo: boolean;
}

export default function SignalFlowOverlay({
  containerRef,
  perspective,
  mode,
  selectedMic,
  selectedPreamp,
  insertChain,
  parallelChain,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rows, setRows] = useState<Map<string, RowRect>>(new Map());
  const [points, setPoints] = useState<PointRect[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const scrollTop = container.scrollTop;
    const measured = new Map<string, RowRect>();

    container.querySelectorAll<HTMLElement>('[data-row-id]').forEach((el) => {
      const id = el.dataset.rowId!;
      const rect = el.getBoundingClientRect();
      measured.set(id, {
        id,
        top: rect.top - containerRect.top + scrollTop,
        bottom: rect.bottom - containerRect.top + scrollTop,
        left: rect.left - containerRect.left,
        right: rect.right - containerRect.left,
        centerX: rect.left - containerRect.left + rect.width / 2,
        centerY: rect.top - containerRect.top + scrollTop + rect.height / 2,
      });
    });

    const measuredPoints: PointRect[] = [];
    container.querySelectorAll<HTMLElement>('[data-selected-point]').forEach((el) => {
      const key = el.dataset.selectedPoint!;
      const rect = el.getBoundingClientRect();
      const parts = key.split('-');
      parts.pop(); // number
      const position = parts.pop()!;
      const rowId = parts.join('-');
      measuredPoints.push({
        key,
        cx: rect.left - containerRect.left + rect.width / 2,
        cy: rect.top - containerRect.top + scrollTop + rect.height / 2,
        rowId,
        position,
      });
    });

    setRows(measured);
    setPoints(measuredPoints);
    setSize({ width: container.scrollWidth, height: container.scrollHeight });
  }, [containerRef]);

  useEffect(() => {
    const raf = requestAnimationFrame(measure);
    const container = containerRef.current;
    if (!container) return () => cancelAnimationFrame(raf);

    const handleScroll = () => measure();
    const ro = new ResizeObserver(() => measure());
    const mo = new MutationObserver(() => requestAnimationFrame(measure));

    container.addEventListener('scroll', handleScroll, { passive: true });
    ro.observe(container);
    mo.observe(container, { childList: true, subtree: true, attributes: true });

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener('scroll', handleScroll);
      ro.disconnect();
      mo.disconnect();
    };
  }, [containerRef, measure]);

  useEffect(() => {
    requestAnimationFrame(measure);
  }, [selectedMic, selectedPreamp, insertChain.length, parallelChain.length, mode, measure]);

  if (rows.size === 0) return null;

  const lensAccent = perspective === 'musician'
    ? '#34d399'
    : perspective === 'engineer'
      ? '#f87171'
      : '#fbbf24';

  // Override line-level color with lens accent
  const levelColor = (level: SignalLevel) =>
    level === 'line' ? lensAccent : LEVEL_COLORS[level];

  // ── 1. Always-visible monitor path (bottom rows) — stereo ──
  const monitorWaypoints: Array<{ x: number; y: number }> = [];
  for (const rowId of MONITOR_ROWS) {
    const row = rows.get(rowId);
    if (row) monitorWaypoints.push({ x: row.centerX, y: row.centerY });
  }
  const monitorPathD = buildBezier(monitorWaypoints);

  // ── 2. Active selection segments (level-colored, mono/stereo aware) ──
  const segments: PathSegment[] = [];
  const selectionDots: Array<{ x: number; y: number; level: SignalLevel }> = [];

  if (mode === 'mixing') {
    // Mixing mode: full stereo line-level path through row centers
    const mixPts: Array<{ x: number; y: number }> = [];
    MIXING_ROWS.forEach((rowId) => {
      const row = rows.get(rowId);
      if (row) mixPts.push({ x: row.centerX, y: row.centerY });
    });
    const d = buildBezier(mixPts);
    if (d) segments.push({ d, level: 'line', stereo: true });
    mixPts.forEach(pt => selectionDots.push({ ...pt, level: 'line' }));
  } else {
    // ── Tracking mode: clean vertical spine through row centers ──
    // The line anchors at the mic position in the locker, then drops
    // straight through the centers of each committed row.

    const micPts = points.filter(p => p.rowId === 'row-mics');
    const micPoint = firstPoint(micPts);

    // Determine which rows are committed (have a selection)
    const hasDynamics = insertChain.some(p => p.type === 'compressor');
    const hasEq = insertChain.some(p => p.type === 'equalizer' || p.type === 'preamp-eq' || p.type === 'outboard');

    if (micPoint && selectedPreamp) {
      // ── Mic-level segment: mic → tie-line row center → preamp-input row center ──
      const tieRow = rows.get('row-mic-ties');
      const preRow = rows.get('row-preamp-in') ?? tieRow;
      const spineX = micPoint.x; // anchor X from mic position

      const micLevelPts: Array<{ x: number; y: number }> = [micPoint];
      selectionDots.push({ ...micPoint, level: 'mic' });

      if (tieRow) {
        micLevelPts.push({ x: spineX, y: tieRow.centerY });
        selectionDots.push({ x: spineX, y: tieRow.centerY, level: 'mic' });
      }
      if (preRow && preRow !== tieRow) {
        micLevelPts.push({ x: spineX, y: preRow.centerY });
        selectionDots.push({ x: spineX, y: preRow.centerY, level: 'mic' });
      }

      const micD = buildBezier(micLevelPts);
      if (micD) segments.push({ d: micD, level: 'mic', stereo: false });

      // ── Line-level segment: from preamp row center through committed inserts ──
      const lastMicPt = micLevelPts[micLevelPts.length - 1];
      const lineLevelPts: Array<{ x: number; y: number }> = [lastMicPt];

      if (hasDynamics) {
        const dynRow = rows.get('row-dynamics');
        if (dynRow) {
          lineLevelPts.push({ x: spineX, y: dynRow.centerY });
          selectionDots.push({ x: spineX, y: dynRow.centerY, level: 'line' });
        }
      }

      if (hasEq) {
        const eqRow = rows.get('row-eq');
        if (eqRow) {
          lineLevelPts.push({ x: spineX, y: eqRow.centerY });
          selectionDots.push({ x: spineX, y: eqRow.centerY, level: 'line' });
        }
      }

      if (lineLevelPts.length > 1) {
        const lineD = buildBezier(lineLevelPts);
        if (lineD) segments.push({ d: lineD, level: 'line', stereo: false });
      }

    } else if (micPoint) {
      // Mic only — dot + anticipatory continuation
      selectionDots.push({ ...micPoint, level: 'mic' });
    }
  }

  // ── 3. Continuation / anticipatory lines ──
  const lastDot = selectionDots[selectionDots.length - 1];
  let continuationD: string | null = null;
  let continuationEndDot = false;

  if (mode !== 'mixing' && selectedMic && !selectedPreamp && lastDot) {
    const micTiesRow = rows.get('row-mic-ties');
    if (micTiesRow) {
      continuationD = buildBezier([
        { x: lastDot.x, y: lastDot.y },
        { x: micTiesRow.centerX, y: micTiesRow.centerY },
        { x: micTiesRow.centerX, y: micTiesRow.bottom - 14 },
      ]);
      continuationEndDot = true;
    }
  } else if (lastDot && selectionDots.length >= 2) {
    const activeRows = mode === 'mixing' ? MIXING_ROWS : TRACKING_ROWS;
    const contPts: Array<{ x: number; y: number }> = [{ x: lastDot.x, y: lastDot.y }];
    for (const rowId of activeRows) {
      const row = rows.get(rowId);
      if (row && row.centerY > lastDot.y + 40) {
        contPts.push({ x: lastDot.x, y: row.centerY });
      }
    }
    if (contPts.length >= 2) {
      continuationD = buildBezier(contPts);
    }
  }

  // ── Arrow markers ──
  const arrowId = 'signal-arrow';

  // ── 4. Viable return-path dotted lines ──
  const hasOutboard = insertChain.length > 0 || parallelChain.length > 0;
  const showReturnPaths = mode === 'mixing' ? hasOutboard : selectedPreamp != null;
  const returnPathDefs: Array<{ d: string; key: string }> = [];

  if (showReturnPaths) {
    const branchRow = hasOutboard ? rows.get('row-eq') : rows.get('row-preamp-in');
    const returnTargets = mode === 'mixing'
      ? ['row-insert-send', 'row-api-mix-out', 'row-pueblo-in', 'row-ad-daw']
      : ['row-dynamics', 'row-eq', 'row-ad-daw'];

    if (branchRow) {
      for (const targetId of returnTargets) {
        const target = rows.get(targetId);
        if (target && target.centerY > branchRow.centerY + 10) {
          const d = buildBezier([
            { x: branchRow.centerX + 24, y: branchRow.bottom - 6 },
            { x: target.centerX + 24, y: target.centerY },
          ]);
          if (d) returnPathDefs.push({ d, key: `return-${targetId}` });
        }
      }
    }
  }

  // ── Stereo offset helper: duplicate a path slightly left and right ──
  function stereoGroup(d: string, color: string, opacity: number, width: number) {
    return (
      <g>
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeOpacity={opacity} strokeLinecap="round" transform="translate(-3, 0)" />
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeOpacity={opacity} strokeLinecap="round" transform="translate(3, 0)" />
      </g>
    );
  }

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-[2]"
      width={size.width}
      height={size.height}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <marker id={arrowId} markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill={lensAccent} fillOpacity="0.78" />
        </marker>
        <marker id="mic-arrow" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill={LEVEL_COLORS.mic} fillOpacity="0.78" />
        </marker>
        <marker id="monitor-arrow" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#a1a1aa" fillOpacity="0.4" />
        </marker>
        <marker id="return-arrow" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
          <polygon points="0 0, 5 2, 0 4" fill="#a1a1aa" fillOpacity="0.18" />
        </marker>
        <marker id="suggest-dot" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <circle cx="4" cy="4" r="3.5" fill="#a1a1aa" fillOpacity="0.45" stroke="#a1a1aa" strokeWidth="0.5" strokeOpacity="0.2" />
        </marker>
      </defs>

      {/* Return-path viability */}
      {returnPathDefs.map(({ d, key }) => (
        <path key={key} d={d} fill="none" stroke="#a1a1aa" strokeWidth={1} strokeOpacity={0.12} strokeDasharray="3 5" strokeLinecap="round" markerEnd="url(#return-arrow)" />
      ))}

      {/* Monitor path — always visible, muted, stereo */}
      {monitorPathD && (
        <g>
          {stereoGroup(monitorPathD, '#a1a1aa', 0.05, 4)}
          <path d={monitorPathD} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeOpacity={0.22} strokeDasharray="6 4" strokeLinecap="round" markerEnd="url(#monitor-arrow)" transform="translate(-3, 0)" />
          <path d={monitorPathD} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeOpacity={0.22} strokeDasharray="6 4" strokeLinecap="round" markerEnd="url(#monitor-arrow)" transform="translate(3, 0)" />
        </g>
      )}

      {/* Continuation — dashed default path */}
      {continuationD && (
        <g>
          <path d={continuationD} fill="none" stroke="#a1a1aa" strokeWidth={4} strokeOpacity={0.06} strokeDasharray="6 4" strokeLinecap="round" />
          <path d={continuationD} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeOpacity={0.28} strokeDasharray="6 4" strokeLinecap="round" markerEnd={continuationEndDot ? 'url(#suggest-dot)' : 'url(#monitor-arrow)'} />
        </g>
      )}

      {/* Active selection segments — level-colored, mono or stereo */}
      {segments.map((seg, i) => {
        const color = levelColor(seg.level);
        const markerId = seg.level === 'mic' ? 'mic-arrow' : arrowId;
        const isLast = i === segments.length - 1;

        return seg.stereo ? (
          <g key={`seg-${i}`}>
            {stereoGroup(seg.d, color, 0.1, 5)}
            <path d={seg.d} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.88} strokeLinecap="round" transform="translate(-3, 0)" markerEnd={isLast ? `url(#${markerId})` : undefined} />
            <path d={seg.d} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.88} strokeLinecap="round" transform="translate(3, 0)" markerEnd={isLast ? `url(#${markerId})` : undefined} />
          </g>
        ) : (
          <g key={`seg-${i}`}>
            <path d={seg.d} fill="none" stroke={color} strokeWidth={6} strokeOpacity={0.1} strokeLinecap="round" />
            <path d={seg.d} fill="none" stroke={color} strokeWidth={2.5} strokeOpacity={0.92} strokeLinecap="round" markerEnd={isLast ? `url(#${markerId})` : undefined} />
          </g>
        );
      })}

      {/* Selection point dots */}
      {selectionDots.map((pt, i) => {
        const color = levelColor(pt.level);
        return (
          <circle key={`dot-${i}`} cx={pt.x} cy={pt.y} r={4} fill={color} fillOpacity={0.9} stroke={color} strokeWidth={1} strokeOpacity={0.3} />
        );
      })}
    </svg>
  );
}
