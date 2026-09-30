import React, { useEffect } from 'react';
import { useStore, UserRole } from '../../store/useStore';
import {
  LayoutDashboard,
  Map as MapIcon,
  Layers,
  Activity,
  BookOpen,
  Upload,
  BarChart2,
  FileText,
  Settings,
  Bell,
  Play,
  Sun,
  Moon,
  Search,
  Compass,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Badge, Button } from '../ui';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  roleFilter?: UserRole[];
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentRoute,
    setCurrentRoute,
    role,
    setRole,
    theme,
    setTheme,
    radiusKm,
    setRadiusKm,
    alerts,
    startDemo,
    isDemoPlaying,
    demoStep,
    nextDemoStep,
    exitDemo,
  } = useStore();

  const navItems: NavItem[] = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'map', label: 'Area Map', icon: MapIcon },
    { id: 'section', label: 'Subsurface Section', icon: Layers },
    { id: 'live', label: 'Live Drilling', icon: Activity, badge: 'Active' },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'ingest', label: 'Document Ingestion', icon: Upload },
    { id: 'chat', label: 'Ask the Wells', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'brief', label: 'Pre-Drill Brief', icon: FileText },
    { id: 'settings', label: 'Settings & Audit', icon: Settings },
  ];

  // Hotkey listener (D for demo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'd' || e.key === 'D') && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        if (!isDemoPlaying) startDemo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDemoPlaying, startDemo]);

  const activeAlertsCount = alerts.filter(a => a.status === 'new').length;

  const demoTourSteps = [
    { title: '1. Command Center', desc: 'Central mission control monitoring DEMO-ACTIVE-01, active risk timeline, and key performance metrics across 14 synthetic block wells.' },
    { title: '2. Area Map & Offset Wells', desc: 'Top-down GIS view showing 14 block wells near Duliajan. Interactive radius circle filters offset wells and auto-generates cross-section line.' },
    { title: '3. Subsurface Cross-Section', desc: 'Signature geoscience illustration rendering 10 formation strata, deviated trajectories, casing shoes, and the Formation X loss zone hazard.' },
    { title: '4. Document Ingestion & Extraction', desc: 'Ingestion pipeline with live OCR stepper extracting events from Daily Drilling Reports and routing low-confidence items to human review.' },
    { title: '5. Ask the Wells (RAG Intelligence)', desc: 'Natural language querying across offset records with citations [DEMO-B-03, p.7] and historical mitigation synthesis.' },
    { title: '6. Live Drilling Simulator', desc: 'Real-time 1 Hz telemetry stream detecting flow-out drop and pit volume loss in Formation X with explainable SHAP feature attribution.' },
    { title: '7. Pre-Drill Risk Brief Builder', desc: 'Automated 6-section pre-drill intelligence brief with casing recommendations and printable report export.' },
    { title: '8. Drilling Analytics & Lessons', desc: 'Comprehensive NPT distribution by lithology, formation correlation matrix, and audited playbook lessons.' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa] text-zinc-900">
      {/* LEFT RAIL NAVIGATION */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col justify-between z-20">
        <div>
          {/* Logo & Product Brand */}
          <div className="p-5 border-b border-zinc-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-zinc-900 flex items-center gap-2">
                NWIS <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">eRTMAC</span>
              </div>
              <div className="text-[11px] text-zinc-500">Oil India Limited · Duliajan</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentRoute(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Well Status Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50/50">
          <div className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider mb-1 flex items-center justify-between">
            <span>Active Well</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900">DEMO-ACTIVE-01</span>
            <span className="text-[11px] font-mono text-zinc-500">2,442 m TVD</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Formation X (Barail Coal)</div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 z-10">
          {/* Left search & radius chip */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-md w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400 flex-1">Search well intelligence...</span>
              <kbd className="text-[10px] font-mono bg-white border border-zinc-200 px-1 rounded text-zinc-400">Ctrl+K</kbd>
            </div>

            {/* Radius Control */}
            <div className="flex items-center gap-2.5 px-3 py-1 bg-white border border-zinc-200 rounded-md text-xs">
              <span className="text-zinc-500">Radius:</span>
              <span className="font-semibold text-zinc-900 font-mono">{radiusKm} km</span>
              <input
                data-testid="f03-radius-slider"
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                className="w-16 h-1 accent-zinc-800 cursor-pointer"
              />
            </div>
          </div>

          {/* Right chips, alerts, role switch, theme */}
          <div className="flex items-center gap-3">
            {/* Synthetic data label */}
            <div className="flex items-center gap-1.5 bg-zinc-50 text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-md text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
              <span>Synthetic demo data</span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-md p-0.5 text-xs" data-testid="f22-role-switch">
              {(['field_engineer', 'analyst', 'manager'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-all ${
                    role === r ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Alert Bell */}
            <button
              onClick={() => setCurrentRoute('live')}
              className="relative p-2 rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors"
              title="View Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-zinc-600" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>

            {/* Guided Demo Button */}
            <Button
              size="sm"
              variant="primary"
              onClick={startDemo}
              className="gap-2 text-xs font-medium"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Demo Tour (D)</span>
            </Button>
          </div>
        </header>

        {/* GUIDED DEMO OVERLAY (F23) */}
        {isDemoPlaying && (
          <div className="bg-white border-b border-zinc-200 p-4 px-6 flex items-center justify-between shadow-xs z-30" data-testid="f23-demo-controls">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-white">
                STEP {demoStep + 1}/8
              </span>
              <div>
                <div className="font-semibold text-sm text-zinc-900" data-testid="f23-demo-caption">{demoTourSteps[demoStep]?.title}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{demoTourSteps[demoStep]?.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={exitDemo}>Exit</Button>
              <Button size="sm" variant="primary" onClick={nextDemoStep} className="gap-1">
                <span>{demoStep === 7 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* MAIN BODY VIEW */}
        <main className="flex-1 overflow-auto bg-[#fafafa] relative p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
