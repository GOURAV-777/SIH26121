import React from 'react';
import { useStore } from '../../store/useStore';
import {
  Compass,
  AlertTriangle,
  Activity,
  Layers,
  BookOpen,
  FileText,
  BarChart2,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';

export const CommandCenter: React.FC = () => {
  const { wells, events, alerts, setCurrentRoute, setSelectedWellId, radiusKm } = useStore();

  const activeWell = wells.find(w => w.id === 'DEMO-ACTIVE-01') || wells[0];
  const nearbyWells = wells.filter(w => (w.distance_km ?? 99) <= radiusKm);
  const activeAlert = alerts[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8" data-testid="command-center-view">
      {/* Top Banner: Active Well Status Header */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <h1 className="text-lg font-semibold text-zinc-900">
                DEMO-ACTIVE-01 · Oil India Limited (eRTMAC)
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono border border-zinc-200">
                2,442 m TVD
              </span>
              <span className="text-xs text-zinc-500 font-normal">
                Duliajan Block
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Drilling assembly approaching <strong>Formation X (Barail Coal-Sand)</strong> at 2,440–2,500 m TVD. 3 of 4 nearest offset wells experienced fluid loss in this interval.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentRoute('live')}
              className="gap-2 text-xs font-medium"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Telemetry</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentRoute('section')}
              className="gap-2 text-xs font-medium"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cross-Section</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <div className="text-xs text-zinc-500 font-medium">Offset Wells Monitored</div>
          <div className="text-2xl font-semibold text-zinc-900 mt-2">{wells.length} wells</div>
          <div className="text-xs text-zinc-500 mt-1">{nearbyWells.length} within {radiusKm} km radius</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <div className="text-xs text-zinc-500 font-medium">High-Risk Formation Interval</div>
          <div className="text-2xl font-semibold text-zinc-900 mt-2">2,440 – 2,500 m</div>
          <div className="text-xs text-zinc-500 mt-1">Barail Coal-Sand</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <div className="text-xs text-zinc-500 font-medium">Historical Offset Losses</div>
          <div className="text-2xl font-semibold text-zinc-900 mt-2">3 of 4 Offsets</div>
          <div className="text-xs text-zinc-500 mt-1">Average 18.5 hrs NPT per loss</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <div className="text-xs text-zinc-500 font-medium">Validated Mitigation</div>
          <div className="text-2xl font-semibold text-zinc-900 mt-2">40 ppb LCM Pill</div>
          <div className="text-xs text-zinc-500 mt-1">NutPlug + Mica pre-treatment</div>
        </div>
      </div>

      {/* Main Grid: Look-Ahead Alert + Offset Wells Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Look-Ahead Alert */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span className="font-semibold text-sm text-zinc-900">
                  Look-Ahead Hazard: Potential Loss Zone at 2,450 m TVD
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                88% Probability
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="bg-zinc-50 p-3.5 rounded border border-zinc-100">
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">Distance Ahead</div>
                <div className="text-lg font-semibold text-zinc-900 mt-0.5">8.0 m TVD</div>
                <div className="text-xs text-zinc-500 mt-0.5">Expected top at 2,450 m</div>
              </div>
              <div className="bg-zinc-50 p-3.5 rounded border border-zinc-100">
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">Top Offset Evidence</div>
                <div className="text-lg font-semibold text-zinc-900 mt-0.5">DEMO-A-01 (1.3 km)</div>
                <div className="text-xs text-zinc-500 mt-0.5">Loss of 22 m³/hr @ 2,448 m</div>
              </div>
              <div className="bg-zinc-50 p-3.5 rounded border border-zinc-100">
                <div className="text-[11px] text-zinc-500 uppercase tracking-wide">Action Checklist</div>
                <div className="text-lg font-semibold text-zinc-900 mt-0.5">Pre-mix Coarse LCM</div>
                <div className="text-xs text-zinc-500 mt-0.5">Ready on suction pit</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-zinc-500">
              <span>Evidence corroborated across DEMO-A-01, DEMO-B-02, and DEMO-C-03 Daily Drilling Reports</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentRoute('live')}
                className="gap-1 text-xs"
              >
                <span>Live Telemetry & SHAP</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Quick Launch Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentRoute('map')}
              className="p-5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 transition-colors text-left"
            >
              <Compass className="w-5 h-5 text-zinc-700 mb-3" />
              <div className="text-sm font-semibold text-zinc-900">Area Map</div>
              <div className="text-xs text-zinc-500 mt-1">GIS view of 14 Duliajan block wells and infrastructure</div>
            </button>

            <button
              onClick={() => setCurrentRoute('chat')}
              className="p-5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 transition-colors text-left"
            >
              <BookOpen className="w-5 h-5 text-zinc-700 mb-3" />
              <div className="text-sm font-semibold text-zinc-900">Ask the Wells (RAG)</div>
              <div className="text-xs text-zinc-500 mt-1">Query offset historical DDRs and mitigation playbooks</div>
            </button>

            <button
              onClick={() => setCurrentRoute('brief')}
              className="p-5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 transition-colors text-left"
            >
              <FileText className="w-5 h-5 text-zinc-700 mb-3" />
              <div className="text-sm font-semibold text-zinc-900">Pre-Drill Brief</div>
              <div className="text-xs text-zinc-500 mt-1">Generate 6-section pre-drill intelligence dossier</div>
            </button>
          </div>
        </div>

        {/* Right Col: Nearest Offset Wells Table */}
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Nearest Offsets ({nearbyWells.length})
              </span>
              <button
                onClick={() => setCurrentRoute('map')}
                className="text-xs text-zinc-600 hover:text-zinc-900 font-medium"
              >
                View Map &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {nearbyWells.slice(0, 5).map((w) => (
                <div
                  key={w.id}
                  onClick={() => setSelectedWellId(w.id)}
                  className="p-3 rounded-md bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900">{w.name}</span>
                    <span className="text-[11px] font-mono text-zinc-500">{w.distance_km} km</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
                    <span>{w.target_depth_tvd} m TVD</span>
                    <span className="text-[11px] text-zinc-600">{w.event_count} incidents</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
