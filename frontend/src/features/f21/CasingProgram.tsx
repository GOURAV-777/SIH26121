import React, { useState } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, ReferenceArea
} from 'recharts';
import { Badge, Card } from '../../components/ui';
import { ChevronDown, AlertTriangle } from 'lucide-react';

// ── Deterministic synthetic casing + mud data ─────────────────────────────────
const WELLS = ['DEMO-ACTIVE-01', 'DEMO-A-01', 'DEMO-B-02', 'DEMO-C-03'];

const CASINGS: Record<string, { name: string; size: string; shoe_tvd: number; cement_top: number; hole: string }[]> = {
  'DEMO-ACTIVE-01': [
    { name: 'Conductor 30"', size: '30"', shoe_tvd: 60, cement_top: 0, hole: '36"' },
    { name: 'Surface 20"', size: '20"', shoe_tvd: 380, cement_top: 0, hole: '26"' },
    { name: 'Intermediate 13⅜"', size: '13⅜"', shoe_tvd: 1620, cement_top: 180, hole: '17½"' },
    { name: 'Production 9⅝"', size: '9⅝"', shoe_tvd: 2880, cement_top: 800, hole: '12¼"' },
  ],
  'DEMO-A-01': [
    { name: 'Conductor 30"', size: '30"', shoe_tvd: 55, cement_top: 0, hole: '36"' },
    { name: 'Surface 20"', size: '20"', shoe_tvd: 360, cement_top: 0, hole: '26"' },
    { name: 'Intermediate 13⅜"', size: '13⅜"', shoe_tvd: 1600, cement_top: 170, hole: '17½"' },
    { name: 'Production 9⅝"', size: '9⅝"', shoe_tvd: 3100, cement_top: 820, hole: '12¼"' },
  ],
};

// Pore pressure / fracture gradient / mud weight window
function makeMudWindow(well: string) {
  const pts = [];
  for (let tvd = 0; tvd <= 3200; tvd += 100) {
    const pp = 1.03 + (tvd / 3200) * 0.16 + (tvd > 2400 && tvd < 2520 ? 0.04 : 0);
    const fg = pp + 0.18 + (tvd > 2400 && tvd < 2520 ? -0.06 : 0);
    const mw = pp + 0.06 + (tvd > 2200 ? 0.02 : 0);
    const outOfWindow = mw > fg || mw < pp;
    pts.push({ tvd, pp: +pp.toFixed(3), fg: +fg.toFixed(3), mw: +mw.toFixed(3), flag: outOfWindow ? 1 : 0 });
  }
  return pts;
}

const TOOLTIP_STYLE = {
  backgroundColor: '#1a2035', border: '1px solid #2d3752',
  borderRadius: 8, color: '#e8edf7', fontSize: 11,
};

// Schematic well SVG
function WellSchematic({ casings }: { casings: typeof CASINGS['DEMO-ACTIVE-01'] }) {
  const maxDepth = Math.max(...casings.map(c => c.shoe_tvd));
  const height = 340;
  const xCenter = 120;

  return (
    <svg width="240" height={height} className="mx-auto" data-testid="f21-schematic">
      {/* Formation X band */}
      <rect x="0" y={(2440 / maxDepth) * height} width="240" height={(60 / maxDepth) * height}
        fill="#f97316" fillOpacity={0.12} />
      <text x="130" y={(2450 / maxDepth) * height + 5} fontSize="8" fill="#f97316" fontFamily="monospace">
        Formation X
      </text>

      {/* Casings */}
      {casings.map((c, i) => {
        const shoeY = (c.shoe_tvd / maxDepth) * height;
        const halfW = Math.max(4, 18 - i * 3.5);
        const cementTopY = (c.cement_top / maxDepth) * height;
        return (
          <g key={i}>
            {/* cement */}
            <rect x={xCenter - halfW - 2} y={shoeY - 8} width={halfW * 2 + 4} height={shoeY - cementTopY + 8}
              fill="#94a3b8" fillOpacity={0.3} />
            {/* pipe left */}
            <rect x={xCenter - halfW} y={2} width={2.5} height={shoeY}
              fill="#22d3c2" fillOpacity={0.7} rx={1} />
            {/* pipe right */}
            <rect x={xCenter + halfW - 2.5} y={2} width={2.5} height={shoeY}
              fill="#22d3c2" fillOpacity={0.7} rx={1} />
            {/* shoe */}
            <line x1={xCenter - halfW - 4} y1={shoeY} x2={xCenter + halfW + 4} y2={shoeY}
              stroke="#22d3c2" strokeWidth={2} />
            <text x={xCenter + halfW + 8} y={shoeY + 3} fontSize="8" fill="#7a8aab" fontFamily="monospace">
              {c.size} {c.shoe_tvd}m
            </text>
          </g>
        );
      })}

      {/* Open hole below last casing */}
      <rect x={xCenter - 5} y={(casings[casings.length - 1].shoe_tvd / maxDepth) * height}
        width={10} height={height - (casings[casings.length - 1].shoe_tvd / maxDepth) * height}
        fill="#f97316" fillOpacity={0.4} rx={2} />

      {/* Depth labels */}
      {[500, 1000, 1500, 2000, 2500, 3000].map(d => (
        d <= maxDepth ? (
          <text key={d} x={4} y={(d / maxDepth) * height + 3}
            fontSize="8" fill="#4a5a7a" fontFamily="monospace">{d}m</text>
        ) : null
      ))}

      {/* Bit symbol */}
      <polygon
        points={`${xCenter - 5},${height - 10} ${xCenter + 5},${height - 10} ${xCenter},${height}`}
        fill="#f97316"
      />
    </svg>
  );
}

export const CasingProgram: React.FC = () => {
  const [well, setWell] = useState('DEMO-ACTIVE-01');
  const casings = CASINGS[well] || CASINGS['DEMO-A-01'];
  const mudWindow = makeMudWindow(well);
  const flaggedCount = mudWindow.filter(p => p.flag).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Casing & Mud Programme Viewer</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Wellbore schematic · Pore pressure / fracture gradient window
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={well} onChange={e => setWell(e.target.value)}
              className="appearance-none bg-bg-surface border border-border text-text-primary text-xs font-mono px-3 py-1.5 pr-7 rounded-md focus:outline-none focus:border-accent-teal">
              {WELLS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2 top-2 pointer-events-none" />
          </div>
          {flaggedCount > 0 && (
            <Badge variant="red">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {flaggedCount} depth windows outside MW envelope
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schematic */}
        <Card className="p-5 bg-bg-surface">
          <div className="text-sm font-bold text-text-primary mb-4">Wellbore Schematic — {well}</div>
          <WellSchematic casings={casings} />
          {/* Legend */}
          <div className="mt-4 space-y-1.5">
            {[
              { color: '#22d3c2', label: 'Casing string' },
              { color: '#94a3b8', label: 'Cement fill' },
              { color: '#f97316', label: 'Open hole / bit' },
              { color: '#f97316', label: 'Formation X loss zone' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
                <span className="w-4 h-3 rounded-sm" style={{ background: l.color, opacity: 0.7 }} />
                {l.label}
              </div>
            ))}
          </div>
        </Card>

        {/* Mud Window Chart */}
        <div className="lg:col-span-2">
          <Card className="p-5 bg-bg-surface h-full" data-testid="f21-window-chart">
            <div className="text-sm font-bold text-text-primary mb-1">
              Pore Pressure / Fracture Gradient / Mud Weight Window
            </div>
            <div className="text-xs text-text-muted mb-4">
              Mud weight must remain between pore pressure (lower) and fracture gradient (upper).
              Formation X creates a tight window at 2,440–2,500 m.
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <ComposedChart data={mudWindow} layout="vertical"
                margin={{ top: 10, right: 20, left: 50, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3752" />
                <XAxis type="number" domain={[1.0, 1.55]}
                  tick={{ fill: '#7a8aab', fontSize: 10 }}
                  label={{ value: 'Equivalent Mud Weight (SG)', fill: '#7a8aab', fontSize: 10, position: 'insideBottom', dy: 12 }} />
                <YAxis type="number" dataKey="tvd" reversed domain={[0, 3200]}
                  tick={{ fill: '#7a8aab', fontSize: 10 }}
                  label={{ value: 'TVD (m)', angle: -90, fill: '#7a8aab', fontSize: 10, dx: -16 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE}
                  formatter={(v: any, name: string) => [`${(+v).toFixed(3)} SG`, name]} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#7a8aab' }} />
                {/* Flagged zones */}
                <ReferenceArea y1={2440} y2={2500} fill="#f97316" fillOpacity={0.1} />
                <Line type="monotone" dataKey="pp" stroke="#34d399" strokeWidth={1.5}
                  dot={false} name="Pore Pressure" />
                <Line type="monotone" dataKey="fg" stroke="#ef4444" strokeWidth={1.5}
                  dot={false} name="Fracture Gradient" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="mw" stroke="#22d3c2" strokeWidth={2}
                  dot={false} name="Planned Mud Weight" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Casing Table */}
      <Card className="bg-bg-surface overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {['Casing Name', 'Size', 'Hole Size', 'Shoe TVD (m)', 'Cement Top TVD (m)'].map(h => (
                <th key={h} className="p-3 text-left font-mono text-[10px] uppercase text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {casings.map((c, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-bg-raised/30">
                <td className="p-3 font-mono text-text-primary">{c.name}</td>
                <td className="p-3 font-mono text-accent-teal">{c.size}</td>
                <td className="p-3 font-mono text-text-secondary">{c.hole}</td>
                <td className="p-3 font-mono text-text-primary">{c.shoe_tvd.toLocaleString()} m</td>
                <td className="p-3 font-mono text-text-secondary">{c.cement_top.toLocaleString()} m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
