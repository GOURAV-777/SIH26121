import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, ScatterChart, Scatter
} from 'recharts';
import { Activity, FileText, Database, Clock, ShieldCheck, Bell } from 'lucide-react';
import { Card, Badge } from '../../components/ui';

// ── Synthetic demo data (seeded, deterministic) ─────────────────────────────
const NPT_BY_TYPE = [
  { type: 'Mud Loss', hours: 148.5, fill: '#f97316' },
  { type: 'Stuck Pipe', hours: 76.0, fill: '#22d3c2' },
  { type: 'Kick/Overpressure', hours: 44.0, fill: '#a78bfa' },
  { type: 'Torque Spike', hours: 31.5, fill: '#fb923c' },
  { type: 'Cementing', hours: 22.0, fill: '#34d399' },
  { type: 'WB Instability', hours: 18.0, fill: '#94a3b8' },
];

const EVENTS_BY_FORMATION = [
  { formation: 'Alluvium', mud_loss: 1, stuck_pipe: 0, kick: 0, torque: 0 },
  { formation: 'Tipam SS', mud_loss: 2, stuck_pipe: 3, kick: 0, torque: 2 },
  { formation: 'Girujan', mud_loss: 4, stuck_pipe: 5, kick: 1, torque: 3 },
  { formation: 'Barail SS', mud_loss: 6, stuck_pipe: 4, kick: 2, torque: 5 },
  { formation: 'Formation X', mud_loss: 14, stuck_pipe: 2, kick: 4, torque: 6 },
  { formation: 'Kopili', mud_loss: 3, stuck_pipe: 6, kick: 8, torque: 4 },
  { formation: 'Sylhet', mud_loss: 1, stuck_pipe: 2, kick: 3, torque: 1 },
];

const EVENTS_OVER_TIME = [
  { month: 'Jan', events: 8 }, { month: 'Feb', events: 11 },
  { month: 'Mar', events: 14 }, { month: 'Apr', events: 9 },
  { month: 'May', events: 16 }, { month: 'Jun', events: 13 },
  { month: 'Jul', events: 19 }, { month: 'Aug', events: 22 },
  { month: 'Sep', events: 17 },
];

const DEPTH_HISTOGRAM = [
  { range: '0–500', count: 6 }, { range: '500–1000', count: 9 },
  { range: '1000–1500', count: 14 }, { range: '1500–2000', count: 18 },
  { range: '2000–2440', count: 22 }, { range: '2440–2500', count: 31 },
  { range: '2500–3000', count: 12 }, { range: '3000+', count: 7 },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#1a2035', border: '1px solid #2d3752', borderRadius: 8,
  color: '#e8edf7', fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
};

const KPI = ({ icon: Icon, label, value, sub, color }: any) => (
  <Card className="p-4 flex items-center gap-3 bg-bg-surface" data-testid="f18-kpi-tile">
    <div className={`p-3 rounded-lg border ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="text-[10px] uppercase font-mono text-text-muted tracking-wider">{label}</div>
      <div className="text-xl font-bold font-mono text-text-primary">{value}</div>
      {sub && <div className="text-[11px] text-text-secondary">{sub}</div>}
    </div>
  </Card>
);

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Block Analytics Dashboard</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Measured archive statistics · Assam Block SYN-04 · 14 wells · Seed 20260930
          </p>
        </div>
        <Badge variant="teal">Live Archive</Badge>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPI icon={Activity} label="Wells Monitored" value="14" sub="1 active, 13 offsets"
          color="bg-accent-teal/10 text-accent-teal border-accent-teal/20" />
        <KPI icon={FileText} label="Docs Processed" value="21" sub="DDRs, WCRs"
          color="bg-accent-orange/10 text-accent-orange border-accent-orange/20" />
        <KPI icon={Database} label="Events Indexed" value="190" sub="Since spud"
          color="bg-accent-violet/10 text-accent-violet border-accent-violet/20" />
        <KPI icon={Clock} label="NPT Hours (Archive)" value="340 h" sub="Across 13 offsets"
          color="bg-accent-red/10 text-accent-red border-accent-red/20" />
        <KPI icon={ShieldCheck} label="Mitigations Documented" value="73%" sub="138 / 190 events"
          color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
        <KPI icon={Bell} label="Alerts This Session" value="1" sub="1 critical, 0 watch"
          color="bg-amber-500/10 text-amber-400 border-amber-500/20" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPT by Event Type */}
        <Card className="p-5 bg-bg-surface" data-testid="f18-chart">
          <div className="text-sm font-bold text-text-primary mb-1">NPT Hours by Event Type</div>
          <div className="text-xs text-text-muted mb-4">Total 340 h across 13 offset wells</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={NPT_BY_TYPE} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3752" />
              <XAxis dataKey="type" tick={{ fill: '#7a8aab', fontSize: 10 }} />
              <YAxis tick={{ fill: '#7a8aab', fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {NPT_BY_TYPE.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Events by Formation (stacked bar) */}
        <Card className="p-5 bg-bg-surface" data-testid="f18-chart">
          <div className="text-sm font-bold text-text-primary mb-1">Events by Formation</div>
          <div className="text-xs text-text-muted mb-4">Formation X has highest mud-loss count (14)</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={EVENTS_BY_FORMATION} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3752" />
              <XAxis dataKey="formation" tick={{ fill: '#7a8aab', fontSize: 9 }} />
              <YAxis tick={{ fill: '#7a8aab', fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#7a8aab' }} />
              <Bar dataKey="mud_loss" stackId="a" fill="#f97316" name="Mud Loss" radius={[0,0,0,0]} />
              <Bar dataKey="stuck_pipe" stackId="a" fill="#22d3c2" name="Stuck Pipe" />
              <Bar dataKey="kick" stackId="a" fill="#a78bfa" name="Kick" />
              <Bar dataKey="torque" stackId="a" fill="#fb923c" name="Torque" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events over time */}
        <Card className="p-5 bg-bg-surface" data-testid="f18-chart">
          <div className="text-sm font-bold text-text-primary mb-1">Events Documented Over Time (2026)</div>
          <div className="text-xs text-text-muted mb-4">Monthly extraction from ingested DDRs</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={EVENTS_OVER_TIME} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3752" />
              <XAxis dataKey="month" tick={{ fill: '#7a8aab', fontSize: 10 }} />
              <YAxis tick={{ fill: '#7a8aab', fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="events" stroke="#22d3c2" strokeWidth={2}
                dot={{ fill: '#22d3c2', r: 3 }} activeDot={{ r: 5 }} name="Events" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Event Depth Histogram */}
        <Card className="p-5 bg-bg-surface" data-testid="f18-chart">
          <div className="text-sm font-bold text-text-primary mb-1">Event Depth Distribution (m TVD)</div>
          <div className="text-xs text-text-muted mb-4">Peak in Formation X interval 2,440–2,500 m</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DEPTH_HISTOGRAM} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3752" />
              <XAxis dataKey="range" tick={{ fill: '#7a8aab', fontSize: 9 }} />
              <YAxis tick={{ fill: '#7a8aab', fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#22d3c2" radius={[4, 4, 0, 0]} name="Events">
                {DEPTH_HISTOGRAM.map((_, i) => (
                  <Cell key={i} fill={i === 5 ? '#f97316' : '#22d3c2'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <p className="text-[10px] text-text-muted text-center font-mono">
        ⚠ All data is synthetic, seeded with deterministic seed 20260930. No real Oil India well data is used.
      </p>
    </div>
  );
};
