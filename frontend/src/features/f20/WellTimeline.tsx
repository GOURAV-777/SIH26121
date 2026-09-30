import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts';
import { Badge, Button, Card } from '../../components/ui';
import { ChevronDown } from 'lucide-react';

// ── Deterministic demo data ───────────────────────────────────────────────────
const WELLS_AVAIL = ['DEMO-A-01', 'DEMO-B-02', 'DEMO-C-03', 'DEMO-D-04'];

// Time-depth data (days vs TVD) per well
function makeTimeCurve(seed: number, maxDays: number, maxTvd: number) {
  const pts = [];
  for (let d = 0; d <= maxDays; d += 2) {
    const rawTvd = (d / maxDays) * maxTvd;
    // NPT at Formation X (days 28–32)
    const nptPenalty = (d >= 28 && d <= 32) ? (d - 28) * 0.8 : 0;
    pts.push({
      day: d,
      tvd: Math.round(rawTvd - nptPenalty * seed * 0.1),
      npt: (d >= 28 && d <= 32) ? 1 : 0,
    });
  }
  return pts;
}

const CURVES: Record<string, ReturnType<typeof makeTimeCurve>> = {
  'DEMO-A-01': makeTimeCurve(1.0, 61, 3100),
  'DEMO-B-02': makeTimeCurve(0.9, 55, 2980),
  'DEMO-C-03': makeTimeCurve(0.85, 58, 3050),
  'DEMO-D-04': makeTimeCurve(1.1, 64, 3020),
};

// Operations Gantt (simplified)
const GANTT_OPS: Record<string, { op: string; start: number; end: number; color: string }[]> = {
  'DEMO-A-01': [
    { op: 'Drilling', start: 0, end: 27, color: '#22d3c2' },
    { op: 'NPT – Mud Loss', start: 28, end: 32, color: '#f97316' },
    { op: 'LCM Treatment', start: 32, end: 35, color: '#fbbf24' },
    { op: 'Drilling', start: 35, end: 52, color: '#22d3c2' },
    { op: 'Casing Run', start: 52, end: 55, color: '#a78bfa' },
    { op: 'Cementing', start: 55, end: 58, color: '#34d399' },
    { op: 'Tripping', start: 58, end: 61, color: '#94a3b8' },
  ],
  'DEMO-B-02': [
    { op: 'Drilling', start: 0, end: 26, color: '#22d3c2' },
    { op: 'NPT – Mud Loss', start: 26, end: 29, color: '#f97316' },
    { op: 'Drilling', start: 29, end: 47, color: '#22d3c2' },
    { op: 'Casing Run', start: 47, end: 50, color: '#a78bfa' },
    { op: 'Cementing', start: 50, end: 53, color: '#34d399' },
    { op: 'Tripping', start: 53, end: 55, color: '#94a3b8' },
  ],
  'DEMO-C-03': [
    { op: 'Drilling', start: 0, end: 27, color: '#22d3c2' },
    { op: 'NPT – Mud Loss', start: 27, end: 30, color: '#f97316' },
    { op: 'Drilling', start: 30, end: 48, color: '#22d3c2' },
    { op: 'Casing Run', start: 48, end: 52, color: '#a78bfa' },
    { op: 'Cementing', start: 52, end: 55, color: '#34d399' },
    { op: 'Tripping', start: 55, end: 58, color: '#94a3b8' },
  ],
  'DEMO-D-04': [
    { op: 'Drilling', start: 0, end: 29, color: '#22d3c2' },
    { op: 'NPT – Stuck Pipe', start: 29, end: 34, color: '#ef4444' },
    { op: 'Fishing', start: 34, end: 38, color: '#f59e0b' },
    { op: 'Drilling', start: 38, end: 55, color: '#22d3c2' },
    { op: 'Casing Run', start: 55, end: 59, color: '#a78bfa' },
    { op: 'Cementing', start: 59, end: 61, color: '#34d399' },
    { op: 'Tripping', start: 61, end: 64, color: '#94a3b8' },
  ],
};

const TOOLTIP_STYLE = {
  backgroundColor: '#1a2035', border: '1px solid #2d3752',
  borderRadius: 8, color: '#e8edf7', fontSize: 11,
};

export const WellTimeline: React.FC = () => {
  const [well, setWell] = useState('DEMO-A-01');
  const curve = CURVES[well] || [];
  const gantt = GANTT_OPS[well] || [];
  const maxDay = Math.max(...curve.map(p => p.day));
  const nptTotal = gantt.filter(g => g.op.startsWith('NPT')).reduce((s, g) => s + (g.end - g.start) * 24, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Well Timeline</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Time-depth curve · Operations Gantt · NPT accounting
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Well selector */}
          <div className="relative">
            <select
              value={well}
              onChange={e => setWell(e.target.value)}
              className="appearance-none bg-bg-surface border border-border text-text-primary text-xs font-mono px-3 py-1.5 pr-7 rounded-md focus:outline-none focus:border-accent-teal"
            >
              {WELLS_AVAIL.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2 top-2 pointer-events-none" />
          </div>
          <Badge variant="orange">NPT {nptTotal.toFixed(1)} h total</Badge>
        </div>
      </div>

      {/* Time-Depth Curve */}
      <Card className="p-5 bg-bg-surface" data-testid="f20-time-depth-curve">
        <div className="text-sm font-bold text-text-primary mb-1">Time-Depth Curve — {well}</div>
        <div className="text-xs text-text-muted mb-4">
          Depth vs Days from Spud · NPT band visible at Formation X interval (2,440–2,500 m TVD)
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={curve} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3752" />
            <XAxis dataKey="day"
              label={{ value: 'Days from Spud', fill: '#7a8aab', fontSize: 10, position: 'insideBottom', dy: 16 }}
              tick={{ fill: '#7a8aab', fontSize: 10 }} />
            <YAxis reversed
              label={{ value: 'TVD (m)', angle: -90, fill: '#7a8aab', fontSize: 10, dx: -12 }}
              tick={{ fill: '#7a8aab', fontSize: 10 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v} m`, 'TVD']} />
            {/* NPT band */}
            <ReferenceArea x1={28} x2={32} fill="#f97316" fillOpacity={0.15} label={{ value: 'NPT', fill: '#f97316', fontSize: 9 }} />
            <ReferenceLine y={2440} stroke="#f97316" strokeDasharray="4 2"
              label={{ value: 'Fm X Top 2440 m', fill: '#f97316', fontSize: 9, position: 'right' }} />
            <ReferenceLine y={2500} stroke="#f97316" strokeDasharray="4 2"
              label={{ value: 'Fm X Base 2500 m', fill: '#f97316', fontSize: 9, position: 'right' }} />
            <Area type="monotone" dataKey="tvd" stroke="#22d3c2" fill="#22d3c2"
              fillOpacity={0.12} strokeWidth={2} name="TVD" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Operations Gantt */}
      <Card className="p-5 bg-bg-surface" data-testid="f20-gantt">
        <div className="text-sm font-bold text-text-primary mb-4">Operations Gantt — {well}</div>
        <div className="space-y-2">
          {gantt.map((op, i) => {
            const pct = ((op.end - op.start) / maxDay) * 100;
            const leftPct = (op.start / maxDay) * 100;
            return (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-32 font-mono text-text-secondary text-right flex-shrink-0">{op.op}</span>
                <div className="flex-1 h-6 bg-bg-base rounded relative overflow-hidden">
                  <div
                    className="absolute h-full rounded transition-all"
                    style={{
                      left: `${leftPct}%`, width: `${pct}%`,
                      backgroundColor: op.color, opacity: 0.85
                    }}
                  />
                </div>
                <span className="w-20 font-mono text-text-muted text-right flex-shrink-0">
                  Day {op.start}–{op.end}
                </span>
              </div>
            );
          })}
          {/* Day axis */}
          <div className="flex items-center gap-3 mt-2">
            <div className="w-32" />
            <div className="flex-1 flex justify-between">
              {Array.from({ length: 6 }, (_, i) => Math.round((maxDay / 5) * i)).map(d => (
                <span key={d} className="text-[9px] font-mono text-text-muted">Day {d}</span>
              ))}
            </div>
            <div className="w-20" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border flex-wrap">
          {[
            { label: 'Drilling', color: '#22d3c2' }, { label: 'NPT', color: '#f97316' },
            { label: 'LCM / Fishing', color: '#fbbf24' }, { label: 'Casing Run', color: '#a78bfa' },
            { label: 'Cementing', color: '#34d399' }, { label: 'Tripping', color: '#94a3b8' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
              <span className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
