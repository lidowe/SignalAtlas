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

/** Average position of a set of measured circles */
function centroid(pts: PointRect[]): { x: number; y: number } | null {
  if (pts.length === 0) return null;
  return {
    x: pts.reduce((s, p) => s + p.cx, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.cy, 0) / pts.length,
  };
}

// ── Default monitor path row order (always visible) ──
const MONITOR_ROWS = ['row-api-mix', 'row-pueblo', 'row-ad-daw'];
const TRACKING_ROWS = ['row-mic-ties', 'row-preamp-in', 'row-dynamics', 'row-eq', 'row-ad-daw'];
const MIXING_ROWS = ['row-preamp-out', 'row-insert-send', 'row-api-mix', 'row-pueblo', 'row-ad-daw'];

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
      ? '#fb7185'
      : '#f59e0b';

  // ── 1. Always-visible monitor path (bottom rows) ──
  const monitorWaypoints: Array<{ x: number; y: number }> = [];
  for (const rowId of MONITOR_ROWS) {
    const row = rows.get(rowId);
    if (row) monitorWaypoints.push({ x: row.centerX, y: row.centerY });
  }
  const monitorPathD = buildBezier(monitorWaypoints);

  // ── 2. Active selection line (from user's circles and mode defaults) ──
  const selectionWaypoints: Array<{ x: number; y: number }> = [];
  const activeRows = mode === 'mixing' ? MIXING_ROWS : TRACKING_ROWS;

  if (mode === 'mixing') {
    activeRows.forEach((rowId) => {
      const row = rows.get(rowId);
      if (row) selectionWaypoints.push({ x: row.centerX, y: row.centerY });
    });
  } else {
    const micPts = points.filter(p => p.rowId === 'row-mic-ties' && p.position === 'top');
    const mic = centroid(micPts);
    if (mic) selectionWaypoints.push(mic);

    const preampBottom = points.filter(p => p.rowId === 'row-mic-ties' && p.position === 'bottom');
    const preBot = centroid(preampBottom);
    if (preBot) selectionWaypoints.push(preBot);

    const preampTop = points.filter(p => p.rowId === 'row-preamp-in' && p.position === 'top');
    const preTop = centroid(preampTop);
    if (preTop) selectionWaypoints.push(preTop);

    const dynPts = points.filter(p => p.rowId === 'row-dynamics');
    const dyn = centroid(dynPts);
    if (dyn) selectionWaypoints.push(dyn);

    const eqPts = points.filter(p => p.rowId === 'row-eq');
    const eq = centroid(eqPts);
    if (eq) selectionWaypoints.push(eq);
  }

  const selectionPathD = buildBezier(selectionWaypoints);

  // ── 3. Continuation: from last selection through remaining default rows to end ──
  const lastSel = selectionWaypoints[selectionWaypoints.length - 1];
  let continuationD: string | null = null;

  if (lastSel && selectionWaypoints.length >= 1) {
    const contPts: Array<{ x: number; y: number }> = [lastSel];
    // Walk the active mode rows that come after the last selected Y position
    for (const rowId of activeRows) {
      const row = rows.get(rowId);
      if (row && row.centerY > lastSel.y + 10) {
        contPts.push({ x: row.centerX, y: row.centerY });
      }
    }
    if (contPts.length >= 2) {
      continuationD = buildBezier(contPts);
    }
  }

  // ── Arrow marker ──
  const arrowId = 'signal-arrow';

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
        <marker id="monitor-arrow" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#a1a1aa" fillOpacity="0.4" />
        </marker>
      </defs>

      {/* Monitor path — always visible, muted */}
      {monitorPathD && (
        <g>
          <path d={monitorPathD} fill="none" stroke="#a1a1aa" strokeWidth={5} strokeOpacity={0.06} strokeLinecap="round" />
          <path d={monitorPathD} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeOpacity={0.22} strokeDasharray="6 4" strokeLinecap="round" markerEnd="url(#monitor-arrow)" />
        </g>
      )}

      {/* Continuation from last selection to end — dashed default path */}
      {continuationD && (
        <g>
          <path d={continuationD} fill="none" stroke="#a1a1aa" strokeWidth={4} strokeOpacity={0.06} strokeDasharray="6 4" strokeLinecap="round" />
          <path d={continuationD} fill="none" stroke="#a1a1aa" strokeWidth={1.5} strokeOpacity={0.28} strokeDasharray="6 4" strokeLinecap="round" markerEnd="url(#monitor-arrow)" />
        </g>
      )}

      {/* Active selection line — solid, directional, bright */}
      {selectionPathD && (
        <g>
          <path d={selectionPathD} fill="none" stroke={lensAccent} strokeWidth={6} strokeOpacity={0.12} strokeLinecap="round" />
          <path d={selectionPathD} fill="none" stroke={lensAccent} strokeWidth={2.5} strokeOpacity={0.92} strokeLinecap="round" markerEnd={`url(#${arrowId})`} />
        </g>
      )}

      {/* Selection point dots */}
      {selectionWaypoints.map((pt, i) => (
        <circle key={`sel-${i}`} cx={pt.x} cy={pt.y} r={4} fill={lensAccent} fillOpacity={0.9} stroke={lensAccent} strokeWidth={1} strokeOpacity={0.3} />
      ))}
    </svg>
  );
}
