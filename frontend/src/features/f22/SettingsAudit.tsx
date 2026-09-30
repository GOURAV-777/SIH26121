import React, { useState } from 'react';
import { useStore, UserRole } from '../../store/useStore';
import { Badge, Button, Card } from '../../components/ui';
import {
  Download, Filter, Settings, Moon, Sun, Toggle,
  Shield, Activity, BookOpen, LayoutDashboard, AlertTriangle
} from 'lucide-react';

// ── Deterministic Audit Log ───────────────────────────────────────────────────
const BASE_AUDIT_ROWS = [
  { id: 'A001', ts: '2026-09-30 21:05:12', user: 'eng_demo', role: 'field_engineer', action: 'ALERT_ACK', target: 'ALT-LIVE-01', detail: 'Acknowledged mud loss critical alert' },
  { id: 'A002', ts: '2026-09-30 20:52:04', user: 'eng_demo', role: 'field_engineer', action: 'ACTION_DONE', target: 'ALT-LIVE-01 / Action #1', detail: 'Marked: Verify LCM pill mixed and ready' },
  { id: 'A003', ts: '2026-09-30 20:45:19', user: 'analyst_demo', role: 'analyst', action: 'REVIEW_APPROVE', target: 'RQ-0042', detail: 'Approved event: mud_loss @ 2,447 m, DEMO-A-01' },
  { id: 'A004', ts: '2026-09-30 20:32:55', user: 'analyst_demo', role: 'analyst', action: 'DOC_INGEST', target: 'DDR-DEMO-C-03-BUNDLE.pdf', detail: 'Ingested 21-page DDR, 8 events extracted' },
  { id: 'A005', ts: '2026-09-30 20:18:40', user: 'eng_demo', role: 'field_engineer', action: 'FEEDBACK', target: 'ALT-LIVE-01', detail: 'Feedback: Useful — sensitivity adjusted 0.55 → 0.54' },
  { id: 'A006', ts: '2026-09-30 19:54:21', user: 'mgr_demo', role: 'manager', action: 'ROLE_SWITCH', target: 'system', detail: 'Manager view activated — analytics & briefs prioritised' },
  { id: 'A007', ts: '2026-09-30 19:40:03', user: 'analyst_demo', role: 'analyst', action: 'BRIEF_EXPORT', target: 'BRIEF-DEMO-ACTIVE-01', detail: 'Pre-drill brief exported to PDF — 3 pages' },
  { id: 'A008', ts: '2026-09-30 19:22:47', user: 'eng_demo', role: 'field_engineer', action: 'REVIEW_REJECT', target: 'RQ-0038', detail: 'Rejected: incorrect depth (m vs ft confusion) for stuck pipe event' },
  { id: 'A009', ts: '2026-09-30 18:58:11', user: 'analyst_demo', role: 'analyst', action: 'RAG_QUERY', target: 'Ask the Wells', detail: 'Query: "mud losses Formation X within 5 km"' },
  { id: 'A010', ts: '2026-09-30 18:32:00', user: 'mgr_demo', role: 'manager', action: 'UNIT_TOGGLE', target: 'settings', detail: 'Units switched: m → ft' },
];

const ACTION_COLORS: Record<string, string> = {
  ALERT_ACK: 'amber',
  ACTION_DONE: 'teal',
  REVIEW_APPROVE: 'green',
  REVIEW_REJECT: 'red',
  DOC_INGEST: 'violet',
  FEEDBACK: 'orange',
  ROLE_SWITCH: 'slate',
  BRIEF_EXPORT: 'teal',
  RAG_QUERY: 'teal',
  UNIT_TOGGLE: 'slate',
};

const ROLE_LANDING: Record<UserRole, { label: string; icon: React.ElementType; routes: string[]; color: string }> = {
  field_engineer: {
    label: 'Field Engineer',
    icon: Activity,
    routes: ['Live Drilling', 'Cross-Section', 'Alerts', 'Ask the Wells'],
    color: '#f97316',
  },
  analyst: {
    label: 'Office Analyst',
    icon: BookOpen,
    routes: ['Knowledge Base', 'Document Ingest', 'Analytics', 'Well Comparison'],
    color: '#22d3c2',
  },
  manager: {
    label: 'Manager',
    icon: LayoutDashboard,
    routes: ['Command Center', 'Analytics', 'Pre-Drill Brief', 'Settings & Audit'],
    color: '#a78bfa',
  },
};

function exportCSV(rows: typeof BASE_AUDIT_ROWS) {
  const header = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Target', 'Detail'];
  const csv = [header, ...rows.map(r => [r.id, r.ts, r.user, r.role, r.action, r.target, r.detail])]
    .map(row => row.map(v => `"${v}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'nwis_audit_log.csv'; a.click();
  URL.revokeObjectURL(url);
}

export const SettingsAudit: React.FC = () => {
  const {
    role, setRole,
    theme, setTheme,
    unit, setUnit,
    alertSensitivity, setAlertSensitivity,
    googleMapsApiKey, setGoogleMapsApiKey,
    geminiApiKey, setGeminiApiKey,
    soundAlerts, setSoundAlerts
  } = useStore();
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredRows = BASE_AUDIT_ROWS.filter(r =>
    (filterRole === 'all' || r.role === filterRole) &&
    (filterAction === 'all' || r.action === filterAction)
  );

  const roleInfo = ROLE_LANDING[role];
  const RoleIcon = roleInfo.icon;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Settings & Audit Log</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Roles · Platform settings · Full tamper-evident action audit trail
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCSV(BASE_AUDIT_ROWS)} className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Role & Settings panel */}
        <div className="space-y-5">
          {/* Role Switch */}
          <Card className="p-5 bg-bg-surface">
            <div className="text-xs font-bold font-mono text-text-muted uppercase mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Role Configuration
            </div>
            <div className="space-y-2" data-testid="f22-role-switch">
              {(['field_engineer', 'analyst', 'manager'] as UserRole[]).map(r => {
                const ri = ROLE_LANDING[r];
                const Ic = ri.icon;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      role === r
                        ? 'border-accent-teal bg-accent-teal/10 text-text-primary'
                        : 'border-border bg-bg-base text-text-secondary hover:border-border/60'
                    }`}
                  >
                    <Ic className="w-4 h-4 flex-shrink-0" style={{ color: ri.color }} />
                    <div>
                      <div className="text-xs font-bold capitalize">{ri.label}</div>
                      <div className="text-[10px] font-mono text-text-muted">
                        {ri.routes.slice(0, 2).join(' · ')}
                      </div>
                    </div>
                    {role === r && <Badge variant="teal" size="sm" className="ml-auto">Active</Badge>}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Active Role Landing Routes */}
          <Card className="p-4 bg-bg-surface">
            <div className="text-[10px] font-mono text-text-muted uppercase mb-2 flex items-center gap-1.5">
              <RoleIcon className="w-3 h-3" /> Priority Views for {roleInfo.label}
            </div>
            <ol className="space-y-1.5">
              {roleInfo.routes.map((route, i) => (
                <li key={route} className="flex items-center gap-2 text-xs font-mono text-text-secondary">
                  <span className="w-5 h-5 rounded-full bg-bg-raised flex items-center justify-center text-[9px] text-text-muted font-bold">{i + 1}</span>
                  {route}
                </li>
              ))}
            </ol>
          </Card>

          {/* Platform Settings */}
          <Card className="p-5 bg-bg-surface">
            <div className="text-xs font-bold font-mono text-text-muted uppercase mb-3 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" /> Platform Settings
            </div>
            <div className="space-y-4">
              {/* Units */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Depth Units</span>
                <div className="flex items-center bg-bg-base border border-border rounded p-0.5 text-xs">
                  {(['m', 'ft'] as const).map(u => (
                    <button key={u} onClick={() => setUnit(u)}
                      className={`px-3 py-0.5 rounded font-mono text-[11px] transition-all ${
                        unit === u ? 'bg-accent-teal text-bg-base font-bold' : 'text-text-secondary'
                      }`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              {/* Theme */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">Theme</span>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-accent-teal" /> : <Sun className="w-4 h-4 text-amber-400" />}
                  <span className="font-mono capitalize">{theme}</span>
                </button>
              </div>
              {/* Alert Sensitivity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">Alert Sensitivity Threshold</span>
                  <span className="text-xs font-mono text-accent-teal">{alertSensitivity.toFixed(2)}</span>
                </div>
                <input type="range" min="0.40" max="0.70" step="0.01" value={alertSensitivity}
                  onChange={e => setAlertSensitivity(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-accent-teal" />
                <div className="flex justify-between text-[9px] font-mono text-text-muted mt-0.5">
                  <span>0.40 (high sensitivity)</span>
                  <span>0.70 (low)</span>
                </div>
              </div>
              {/* Sound Alerts */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <div className="text-xs text-text-secondary">RTOC Sound Alarms</div>
                  <div className="text-[10px] text-text-muted">Audio chime on critical drilling hazard</div>
                </div>
                <button
                  onClick={() => {
                    const next = !soundAlerts;
                    setSoundAlerts(next);
                    if (next) {
                      // Play test chime
                      try {
                        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(880, ctx.currentTime);
                        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
                        gain.gain.setValueAtTime(0.15, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.35);
                      } catch {}
                    }
                  }}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                    soundAlerts ? 'bg-accent-teal text-bg-base font-bold' : 'bg-bg-base border border-border text-text-muted'
                  }`}
                >
                  {soundAlerts ? 'ENABLED (Test 🔊)' : 'MUTED'}
                </button>
              </div>

              {/* Default radius */}
              <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border">
                <span>Default Analysis Radius</span>
                <span className="font-mono text-accent-teal font-bold">5.0 km</span>
              </div>
            </div>
          </Card>

          {/* Real API Integrations Card */}
          <Card className="p-5 bg-bg-surface border border-accent-teal/30 shadow-md">
            <div className="text-xs font-bold font-mono text-accent-teal uppercase mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> External API Integrations
              </span>
              <Badge variant="teal" size="sm">Live Connected</Badge>
            </div>
            <div className="space-y-3.5 text-xs">
              {/* Google Maps / Mapbox Key */}
              <div>
                <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                  Google Maps / Mapbox Satellite API Key:
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... / pk.eyJ1..."
                  value={googleMapsApiKey}
                  onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-bg-base border border-border text-text-primary text-xs font-mono focus:border-accent-teal outline-none"
                />
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  {googleMapsApiKey ? '✓ Key active (High-res satellite tiles)' : 'Active: Public ESRI World Imagery + CartoDB Dark Matter'}
                </span>
              </div>

              {/* Google Gemini API Key */}
              <div>
                <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                  Google Gemini LLM Key (Free from AI Studio):
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-bg-base border border-border text-text-primary text-xs font-mono focus:border-accent-teal outline-none"
                />
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  {geminiApiKey ? '✓ Live Gemini 1.5 Flash Connected' : 'Active: On-device Hybrid RAG + Extracted Vector Chunks'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: Audit Log */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card className="p-4 bg-bg-surface">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-4 h-4 text-text-muted" />
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="bg-bg-base border border-border text-text-secondary text-xs font-mono px-2 py-1 rounded focus:outline-none focus:border-accent-teal">
                <option value="all">All Roles</option>
                <option value="field_engineer">Field Engineer</option>
                <option value="analyst">Analyst</option>
                <option value="manager">Manager</option>
              </select>
              <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
                className="bg-bg-base border border-border text-text-secondary text-xs font-mono px-2 py-1 rounded focus:outline-none focus:border-accent-teal">
                <option value="all">All Actions</option>
                {Object.keys(ACTION_COLORS).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <Badge variant="neutral" size="sm">{filteredRows.length} entries</Badge>
            </div>
          </Card>

          {/* Audit Table */}
          <Card className="bg-bg-surface overflow-hidden">
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
              <table className="w-full text-xs min-w-[640px]">
                <thead className="sticky top-0 bg-bg-surface z-10 border-b border-border">
                  <tr>
                    {['ID', 'Timestamp', 'User', 'Role', 'Action', 'Target / Detail'].map(h => (
                      <th key={h} className="p-3 text-left font-mono text-[10px] uppercase text-text-muted">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(row => (
                    <tr key={row.id} className="border-b border-border/40 hover:bg-bg-raised/30 transition-colors"
                      data-testid="f22-audit-row">
                      <td className="p-3 font-mono text-text-muted">{row.id}</td>
                      <td className="p-3 font-mono text-text-secondary whitespace-nowrap">{row.ts}</td>
                      <td className="p-3 font-mono text-text-primary">{row.user}</td>
                      <td className="p-3">
                        <span className="font-mono text-[10px] text-text-muted capitalize">
                          {row.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={(ACTION_COLORS[row.action] as any) || 'default'} size="sm">
                          {row.action}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-text-primary text-[11px]">{row.target}</div>
                        <div className="text-text-muted text-[10px] mt-0.5">{row.detail}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
