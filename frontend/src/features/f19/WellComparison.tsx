import React, { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Badge, Button, Card } from '../../components/ui';
import { Plus, Minus } from 'lucide-react';

// ── Deterministic demo data for 4 wells ──────────────────────────────────────
const WELLS_DATA = [
  {
    id: 'DEMO-ACTIVE-01', name: 'DEMO-ACTIVE-01', status: 'active', td: 3000, days: 42,
    npt_h: 0, rop_avg: 7.2, mud_wt: 1.34, casing: '13⅜" + 9⅝"', sim_score: 100,
    color: '#f97316',
  },
  {
    id: 'DEMO-A-01', name: 'DEMO-A-01', status: 'producer', td: 3100, days: 61, npt_h: 22.5,
    rop_avg: 6.8, mud_wt: 1.32, casing: '13⅜" + 9⅝"', sim_score: 94, color: '#22d3c2',
  },
  {
    id: 'DEMO-B-02', name: 'DEMO-B-02', status: 'producer', td: 2980, days: 55, npt_h: 18.0,
    rop_avg: 5.9, mud_wt: 1.30, casing: '13⅜" + 9⅝" + 7"', sim_score: 88, color: '#a78bfa',
  },
  {
    id: 'DEMO-C-03', name: 'DEMO-C-03', status: 'producer', td: 3050, days: 58, npt_h: 14.0,
    rop_avg: 6.4, mud_wt: 1.31, casing: '13⅜" + 9⅝"', sim_score: 82, color: '#34d399',
  },
];

// ROP vs Depth synthetic curves
const ROP_CURVES: Record<string, {tvd: number; rop: number}[]> = {
  'DEMO-ACTIVE-01': [
    { tvd: 200, rop: 12 }, { tvd: 500, rop: 10 }, { tvd: 900, rop: 9.5 },
    { tvd: 1400, rop: 8.2 }, { tvd: 1800, rop: 7.8 }, { tvd: 2200, rop: 7.5 },
    { tvd: 2440, rop: 6.8 }, { tvd: 2500, rop: 4.2 },
  ],
  'DEMO-A-01': [
    { tvd: 200, rop: 11 }, { tvd: 500, rop: 9.8 }, { tvd: 900, rop: 9.0 },
    { tvd: 1400, rop: 7.9 }, { tvd: 1800, rop: 7.2 }, { tvd: 2200, rop: 7.0 },
    { tvd: 2440, rop: 6.1 }, { tvd: 2500, rop: 3.5 }, { tvd: 3100, rop: 5.0 },
  ],
  'DEMO-B-02': [
    { tvd: 200, rop: 10 }, { tvd: 500, rop: 8.7 }, { tvd: 900, rop: 8.2 },
    { tvd: 1400, rop: 7.1 }, { tvd: 1800, rop: 6.6 }, { tvd: 2200, rop: 6.4 },
    { tvd: 2440, rop: 5.5 }, { tvd: 2500, rop: 3.0 }, { tvd: 2980, rop: 4.2 },
  ],
  'DEMO-C-03': [
    { tvd: 200, rop: 10.5 }, { tvd: 500, rop: 9.2 }, { tvd: 900, rop: 8.8 },
    { tvd: 1400, rop: 7.6 }, { tvd: 1800, rop: 7.0 }, { tvd: 2200, rop: 6.8 },
    { tvd: 2440, rop: 5.9 }, { tvd: 2500, rop: 3.3 }, { tvd: 3050, rop: 4.5 },
  ],
};

// Similarity breakdown for F19
const SIM_BREAKDOWN = [
  { attr: 'Formation tops', subject: 100, value: 96 },
  { attr: 'Event types', subject: 100, value: 90 },
  { attr: 'Mud program', subject: 100, value: 88 },
  { attr: 'Casing scheme', subject: 100, value: 85 },
  { attr: 'ROP profile', subject: 100, value: 78 },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#1a2035', border: '1px solid #2d3752',
  borderRadius: 8, color: '#e8edf7', fontSize: 11,
};

// Merge all curves to one dataset keyed by tvd
function buildOverlay(selectedIds: string[]) {
  const allTvds = new Set<number>();
  selectedIds.forEach(id => ROP_CURVES[id]?.forEach(p => allTvds.add(p.tvd)));
  const sorted = Array.from(allTvds).sort((a, b) => a - b);
  return sorted.map(tvd => {
    const row: Record<string, number | undefined> = { tvd };
    selectedIds.forEach(id => {
      const pts = ROP_CURVES[id] || [];
      const found = pts.find(p => p.tvd === tvd);
      row[id] = found?.rop;
    });
    return row;
  });
}

export const WellComparison: React.FC = () => {
  const [selected, setSelected] = useState(['DEMO-ACTIVE-01', 'DEMO-A-01', 'DEMO-B-02']);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? (prev.length > 2 ? prev.filter(x => x !== id) : prev)
        : (prev.length < 4 ? [...prev, id] : prev)
    );
  };

  const overlayData = buildOverlay(selected);
  const selectedWells = WELLS_DATA.filter(w => selected.includes(w.id));
  const primarySim = selectedWells.find(w => w.id !== 'DEMO-ACTIVE-01');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Well Comparison</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Select 2–4 wells · ROP overlay · Similarity score breakdown
          </p>
        </div>
        <Badge variant="teal">{selected.length} wells selected</Badge>
      </div>

      {/* Well Selector */}
      <div className="flex gap-3 flex-wrap">
        {WELLS_DATA.map(w => (
          <button
            key={w.id}
            onClick={() => toggle(w.id)}
            data-testid="f19-compare-row"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
              selected.includes(w.id)
                ? 'border-accent-teal bg-accent-teal/10 text-text-primary'
                : 'border-border bg-bg-surface text-text-secondary hover:border-accent-teal/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: w.color }} />
            {w.name}
            {selected.includes(w.id) ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <Card className="bg-bg-surface overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left text-text-muted font-mono uppercase text-[10px]">Attribute</th>
              {selectedWells.map(w => (
                <th key={w.id} className="p-3 text-left font-mono" style={{ color: w.color }}>
                  {w.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Status', (w: typeof WELLS_DATA[0]) => w.status],
              ['TD (m TVD)', (w: typeof WELLS_DATA[0]) => w.td.toLocaleString() + ' m'],
              ['Days to TD', (w: typeof WELLS_DATA[0]) => w.days + ' d'],
              ['Total NPT (h)', (w: typeof WELLS_DATA[0]) => w.npt_h + ' h'],
              ['Avg ROP (m/h)', (w: typeof WELLS_DATA[0]) => w.rop_avg],
              ['Mud Weight (SG)', (w: typeof WELLS_DATA[0]) => w.mud_wt],
              ['Casing Scheme', (w: typeof WELLS_DATA[0]) => w.casing],
              ['Similarity to Active', (w: typeof WELLS_DATA[0]) => w.id === 'DEMO-ACTIVE-01' ? '—' : w.sim_score + '%'],
            ].map(([label, accessor]) => (
              <tr key={label as string} className="border-b border-border/50 hover:bg-bg-raised/40">
                <td className="p-3 text-text-muted font-mono">{label as string}</td>
                {selectedWells.map(w => (
                  <td key={w.id} className="p-3 text-text-primary font-mono">
                    {(accessor as Function)(w)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROP vs Depth Overlay */}
        <Card className="p-5 bg-bg-surface">
          <div className="text-sm font-bold text-text-primary mb-1">ROP vs Depth Overlay</div>
          <div className="text-xs text-text-muted mb-4">
            Drop in ROP visible at 2,440–2,500 m TVD (Formation X)
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={overlayData} layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3752" />
              <XAxis type="number" dataKey="rop" tick={{ fill: '#7a8aab', fontSize: 10 }}
                label={{ value: 'ROP (m/h)', fill: '#7a8aab', fontSize: 10, position: 'insideBottom', dy: 10 }} />
              <YAxis type="number" dataKey="tvd" reversed
                tick={{ fill: '#7a8aab', fontSize: 10 }}
                label={{ value: 'TVD (m)', angle: -90, fill: '#7a8aab', fontSize: 10, dx: -10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7a8aab' }} />
              {selected.map(id => {
                const w = WELLS_DATA.find(x => x.id === id)!;
                return (
                  <Line key={id} type="monotone" dataKey={id} stroke={w.color}
                    strokeWidth={2} dot={false} name={id} connectNulls />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Similarity Breakdown Radar */}
        <Card className="p-5 bg-bg-surface" data-testid="f19-similarity-breakdown">
          <div className="text-sm font-bold text-text-primary mb-1">
            Similarity Breakdown — {primarySim?.name ?? 'DEMO-A-01'} vs DEMO-ACTIVE-01
          </div>
          <div className="text-xs text-text-muted mb-4">
            Composite score: <span className="text-accent-teal font-bold">{primarySim?.sim_score ?? 94}%</span> · 5 weighted dimensions
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={SIM_BREAKDOWN}>
              <PolarGrid stroke="#2d3752" />
              <PolarAngleAxis dataKey="attr" tick={{ fill: '#7a8aab', fontSize: 10 }} />
              <Radar name="Active Well" dataKey="subject" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
              <Radar name={primarySim?.name ?? 'DEMO-A-01'} dataKey="value"
                stroke="#22d3c2" fill="#22d3c2" fillOpacity={0.2} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7a8aab' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};
