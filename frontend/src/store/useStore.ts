import { create } from 'zustand';
import { Well, DrillingEvent } from '../types';

// ---------------------------------------------------------------------------
// Static demo data import helpers — loaded once at module init
// ---------------------------------------------------------------------------
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function fetchJson<T>(path: string): Promise<T> {
  try {
    const r = await fetch(`${BASE}${path}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<T>;
  } catch {
    return [] as unknown as T;
  }
}

export type UserRole = 'field_engineer' | 'analyst' | 'manager';

export interface AlertItem {
  id: string;
  risk_type: string;
  severity: number;
  level: 'watch' | 'warning' | 'critical';
  title: string;
  message: string;
  tvd_depth: number;
  confidence: number;
  created_at: string;
  status: 'new' | 'acknowledged' | 'snoozed' | 'resolved';
  evidence_wells: { well_id: string; distance_km: number; event_type: string; similarity_pct: number; source: string }[];
  shap_features: { name: string; contribution: number }[];
  actions: { text: string; done: boolean }[];
}

interface AppState {
  // Navigation & View
  currentRoute: string;
  setCurrentRoute: (route: string) => void;

  // Data
  wells: Well[];
  events: DrillingEvent[];
  setWells: (w: Well[]) => void;
  setEvents: (e: DrillingEvent[]) => void;
  loadStaticData: () => Promise<void>;

  // Well & Radius
  selectedWellId: string | null;
  setSelectedWellId: (id: string | null) => void;
  radiusKm: number;
  setRadiusKm: (r: number) => void;
  activeSectionLine: string[];
  setActiveSectionLine: (wellIds: string[]) => void;
  autoSection: () => void;

  // Roles & Settings
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  unit: 'm' | 'ft';
  setUnit: (u: 'm' | 'ft') => void;
  alertSensitivity: number;
  setAlertSensitivity: (s: number) => void;
  googleMapsApiKey: string;
  setGoogleMapsApiKey: (k: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (k: string) => void;
  soundAlerts: boolean;
  setSoundAlerts: (enabled: boolean) => void;

  // Cross-Section Controls (F02)
  verticalExaggeration: number;
  setVerticalExaggeration: (ve: number) => void;
  isDayMode: boolean;
  toggleDayMode: () => void;
  layerToggles: {
    lithology: boolean;
    events: boolean;
    casing: boolean;
    pressure: boolean;
    groundwater: boolean;
    faults: boolean;
  };
  toggleLayer: (layer: keyof AppState['layerToggles']) => void;

  // Area Map Controls (F01)
  basemapType: 'street' | 'satellite' | 'hybrid';
  setBasemapType: (type: 'street' | 'satellite' | 'hybrid') => void;
  showHeatLayer: boolean;
  toggleHeatLayer: () => void;

  // Live Simulator (F13 - F16)
  liveScenario: 'A' | 'B' | 'C';
  setLiveScenario: (sc: 'A' | 'B' | 'C') => void;
  simPlaying: boolean;
  setSimPlaying: (p: boolean) => void;
  simSec: number;
  setSimSec: (s: number) => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  resetSim: () => void;

  // Alerts (F14)
  alerts: AlertItem[];
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  toggleActionItem: (alertId: string, actionIndex: number) => void;
  applyFeedback: (alertId: string, feedbackType: 'useful' | 'false_alarm' | 'known') => void;

  // Guided Demo Mode (F23)
  isDemoPlaying: boolean;
  demoStep: number;
  startDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  exitDemo: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentRoute: 'command-center',
  setCurrentRoute: (route) => set({ currentRoute: route }),

  wells: [],
  events: [],
  setWells: (wells) => set({ wells }),
  setEvents: (events) => set({ events }),
  loadStaticData: async () => {
    const [wells, events] = await Promise.all([
      fetchJson<Well[]>('/demo-data/wells.json'),
      fetchJson<DrillingEvent[]>('/demo-data/events.json'),
    ]);
    set({ wells, events });
  },

  selectedWellId: null,
  setSelectedWellId: (id) => set({ selectedWellId: id }),
  radiusKm: 5.0,
  setRadiusKm: (r) => set({ radiusKm: r }),
  activeSectionLine: ['DEMO-ACTIVE-01', 'DEMO-A-01', 'DEMO-B-02', 'DEMO-C-03'],
  setActiveSectionLine: (wellIds) => set({ activeSectionLine: wellIds }),
  autoSection: () => set({ activeSectionLine: ['DEMO-ACTIVE-01', 'DEMO-A-01', 'DEMO-B-02', 'DEMO-C-03'] }),

  role: 'field_engineer',
  setRole: (role) => set({ role }),
  theme: 'light',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    set({ theme });
  },
  unit: 'm',
  setUnit: (unit) => set({ unit }),
  alertSensitivity: 0.55,
  setAlertSensitivity: (s) => set({ alertSensitivity: s }),
  googleMapsApiKey: typeof window !== 'undefined' ? localStorage.getItem('nwis_gmaps_key') || '' : '',
  setGoogleMapsApiKey: (k: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('nwis_gmaps_key', k);
    set({ googleMapsApiKey: k });
  },
  geminiApiKey: typeof window !== 'undefined' ? localStorage.getItem('nwis_gemini_key') || '' : '',
  setGeminiApiKey: (k: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('nwis_gemini_key', k);
    set({ geminiApiKey: k });
  },
  soundAlerts: typeof window !== 'undefined' ? localStorage.getItem('nwis_sound_alerts') !== 'false' : true,
  setSoundAlerts: (enabled: boolean) => {
    if (typeof window !== 'undefined') localStorage.setItem('nwis_sound_alerts', String(enabled));
    set({ soundAlerts: enabled });
  },

  verticalExaggeration: 1.0,
  setVerticalExaggeration: (ve) => set({ verticalExaggeration: ve }),
  isDayMode: false,
  toggleDayMode: () => set((state) => ({ isDayMode: !state.isDayMode })),
  layerToggles: {
    lithology: true,
    events: true,
    casing: true,
    pressure: true,
    groundwater: true,
    faults: true,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layerToggles: {
        ...state.layerToggles,
        [layer]: !state.layerToggles[layer],
      },
    })),

  basemapType: 'street',
  setBasemapType: (basemapType) => set({ basemapType }),
  showHeatLayer: false,
  toggleHeatLayer: () => set((state) => ({ showHeatLayer: !state.showHeatLayer })),

  liveScenario: 'A',
  setLiveScenario: (sc) => set({ liveScenario: sc, simSec: 0, simPlaying: false }),
  simPlaying: false,
  setSimPlaying: (simPlaying) => set({ simPlaying }),
  simSec: 0,
  setSimSec: (simSec) => set({ simSec }),
  simSpeed: 1,
  setSimSpeed: (simSpeed) => set({ simSpeed }),
  resetSim: () => set({ simSec: 0, simPlaying: false }),

  alerts: [
    {
      id: 'ALT-LIVE-01',
      risk_type: 'mud_loss',
      severity: 4,
      level: 'critical',
      title: 'High Mud Loss Risk Ahead in Formation X',
      message: 'Approaching Barail Coal-Sand loss zone (2,440–2,500 m TVD). 3 of 4 nearest offset wells suffered severe/total lost circulation.',
      tvd_depth: 2442.0,
      confidence: 0.88,
      created_at: '2026-09-30 21:05:00',
      status: 'new',
      evidence_wells: [
        { well_id: 'DEMO-A-01', distance_km: 1.3, event_type: 'mud_loss', similarity_pct: 94, source: 'DDR-DEMO-A-01-BUNDLE.pdf (p.8)' },
        { well_id: 'DEMO-B-02', distance_km: 1.6, event_type: 'mud_loss', similarity_pct: 91, source: 'DDR-DEMO-B-02-BUNDLE.pdf (p.12)' },
        { well_id: 'DEMO-C-03', distance_km: 1.9, event_type: 'mud_loss', similarity_pct: 88, source: 'DDR-DEMO-C-03-BUNDLE.pdf (p.7)' },
      ],
      shap_features: [
        { name: 'Formation X Proximity (<15m)', contribution: 0.38 },
        { name: 'Offset Event Density in 2.5km', contribution: 0.32 },
        { name: 'Mud Weight Differential (1.34 vs 1.28)', contribution: 0.16 },
        { name: 'ROP Spurt Precursor', contribution: 0.12 },
      ],
      actions: [
        { text: 'Verify 40 ppb coarse LCM pill (NutPlug + Mica) mixed and ready in reserve pit', done: false },
        { text: 'Reduce controlled ROP to maximum 6 m/hr ahead of coal top', done: false },
        { text: 'Review pore-pressure vs fracture margin for 0.03 SG mud weight drop', done: false },
        { text: 'Alert Mud Logging Unit to monitor 10-second flow-out delta', done: false },
      ],
    },
  ],
  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a)),
    })),
  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a)),
    })),
  toggleActionItem: (alertId, actionIndex) =>
    set((state) => ({
      alerts: state.alerts.map((a) => {
        if (a.id !== alertId) return a;
        const newActions = [...a.actions];
        newActions[actionIndex].done = !newActions[actionIndex].done;
        return { ...a, actions: newActions };
      }),
    })),
  applyFeedback: (alertId, feedbackType) => {
    const shift = feedbackType === 'false_alarm' ? 0.03 : -0.01;
    set((state) => ({
      alertSensitivity: Math.max(0.40, Math.min(0.70, state.alertSensitivity + shift)),
    }));
  },

  isDemoPlaying: false,
  demoStep: 0,
  startDemo: () => set({ isDemoPlaying: true, demoStep: 0, currentRoute: 'command-center' }),
  nextDemoStep: () => {
    const next = get().demoStep + 1;
    const routes = ['command-center', 'map', 'section', 'ingest', 'chat', 'live', 'brief', 'analytics'];
    if (next < routes.length) {
      set({ demoStep: next, currentRoute: routes[next] });
    } else {
      set({ isDemoPlaying: false, demoStep: 0 });
    }
  },
  prevDemoStep: () => {
    const prev = Math.max(0, get().demoStep - 1);
    const routes = ['command-center', 'map', 'section', 'ingest', 'chat', 'live', 'brief', 'analytics'];
    set({ demoStep: prev, currentRoute: routes[prev] });
  },
  exitDemo: () => set({ isDemoPlaying: false, demoStep: 0 }),
}));
