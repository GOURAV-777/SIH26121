import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import { SimTick } from '../../types';
import { Badge, Button, Card } from '../../components/ui';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { LiveParameterCharts } from '../f15/LiveParameterCharts';
import { AlertCenter } from '../f14/AlertCenter';
import { RecommendedActions } from '../f16/RecommendedActions';
import { ExplainableAlerts } from '../f12/ExplainableAlerts';

export const LiveSimulator: React.FC = () => {
  const {
    liveScenario,
    setLiveScenario,
    simPlaying,
    setSimPlaying,
    simSec,
    setSimSec,
    simSpeed,
    setSimSpeed,
    resetSim,
    alerts
  } = useStore();

  const [scenarioData, setScenarioData] = useState<Record<string, { id: string; name: string; loss_start_tvd: number; timeline: SimTick[] }>>({});

  useEffect(() => {
    api.getSimScenarios().then(data => setScenarioData(data));
  }, []);

  const currentTimeline = scenarioData[liveScenario]?.timeline || [];
  const currentTick: SimTick = currentTimeline[simSec] || currentTimeline[0] || {
    sec: 0, tvd: 2410, md: 2458, rop: 14.2, wob: 16.5, rpm: 110, torque: 8.5,
    spp: 2750, flow_in: 520, flow_out: 520, pit_volume: 42.0, mud_weight: 1.34, gas_units: 35, alert_level: 'watch'
  };

  // Sim Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (simPlaying) {
      interval = setInterval(() => {
        setSimSec(Math.min((currentTimeline.length || 240) - 1, simSec + 1));
      }, 1000 / simSpeed);
    }
    return () => clearInterval(interval);
  }, [simPlaying, simSec, simSpeed, currentTimeline.length, setSimSec]);

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="f13-live-drilling">
      {/* Simulator Control Header */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-zinc-900 text-white flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900">Live Telemetry Stream</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                DEMO-ACTIVE-01
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              1 Hz parameter feed synchronized with offset predictive hazard models
            </p>
          </div>
        </div>

        {/* Playback Controls (F13) */}
        <div className="flex items-center gap-3">
          {/* Scenario Selector */}
          <select
            data-testid="f13-scenario"
            value={liveScenario}
            onChange={(e) => setLiveScenario(e.target.value as 'A' | 'B' | 'C')}
            className="bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 font-medium"
          >
            <option value="A">Scenario A: Formation X Mud Loss (Default)</option>
            <option value="B">Scenario B: Kopili Overpressure Kick</option>
            <option value="C">Scenario C: Surma Reactive Torque / Stuck</option>
          </select>

          {/* Speed Buttons */}
          <div className="flex bg-zinc-100 border border-zinc-200 rounded-md p-0.5 text-xs font-mono" data-testid="f13-speed">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  simSpeed === spd ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {spd}×
              </button>
            ))}
          </div>

          {/* Play / Pause / Reset */}
          <div className="flex items-center gap-2">
            {simPlaying ? (
              <Button
                data-testid="f13-pause"
                variant="secondary"
                size="sm"
                onClick={() => setSimPlaying(false)}
                className="gap-1.5 text-xs"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </Button>
            ) : (
              <Button
                data-testid="f13-play"
                variant="primary"
                size="sm"
                onClick={() => setSimPlaying(true)}
                className="gap-1.5 text-xs"
              >
                <Play className="w-3 h-3 fill-current" /> Stream
              </Button>
            )}

            <Button
              data-testid="f13-reset"
              variant="outline"
              size="sm"
              onClick={resetSim}
              className="p-2"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrub Timeline Slider (F13) */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2 shadow-xs">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Timeline ({simSec}s / 240s):</span>
          <span className="font-semibold text-zinc-900 font-mono">Bit TVD: {currentTick.tvd} m · MD: {currentTick.md} m</span>
        </div>
        <input
          data-testid="f13-scrub"
          type="range"
          min="0"
          max={(currentTimeline.length || 240) - 1}
          value={simSec}
          onChange={(e) => setSimSec(parseInt(e.target.value))}
          className="w-full h-1.5 accent-zinc-800 cursor-pointer"
        />
      </div>

      {/* Real-time telemetry gauge cards */}
      <div className="grid grid-cols-6 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-xs">
          <span className="text-[11px] text-zinc-500 block">ROP</span>
          <span className="text-lg font-semibold text-zinc-900 mt-1 block">{currentTick.rop}</span>
          <span className="text-[10px] text-zinc-400">m/hr</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-xs">
          <span className="text-[11px] text-zinc-500 block">WOB / RPM</span>
          <span className="text-lg font-semibold text-zinc-900 mt-1 block">{currentTick.wob} / {currentTick.rpm}</span>
          <span className="text-[10px] text-zinc-400">klb / rpm</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-xs">
          <span className="text-[11px] text-zinc-500 block">TORQUE</span>
          <span className={`text-lg font-semibold mt-1 block ${currentTick.torque > 12 ? 'text-red-700' : 'text-zinc-900'}`}>
            {currentTick.torque}
          </span>
          <span className="text-[10px] text-zinc-400">kft-lb</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-xs">
          <span className="text-[11px] text-zinc-500 block">STANDPIPE PRES.</span>
          <span className="text-lg font-semibold text-zinc-900 mt-1 block">{currentTick.spp}</span>
          <span className="text-[10px] text-zinc-400">psi</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-xs">
          <span className="text-[11px] text-zinc-500 block">FLOW IN / OUT</span>
          <span className={`text-lg font-semibold mt-1 block ${currentTick.flow_out < currentTick.flow_in * 0.9 ? 'text-red-700 font-bold' : 'text-zinc-900'}`}>
            {currentTick.flow_in} / {currentTick.flow_out}
          </span>
          <span className="text-[10px] text-zinc-400">gpm</span>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-zinc-200 shadow-xs">
          <span className="text-[11px] text-zinc-500 block">PIT VOLUME</span>
          <span className={`text-lg font-semibold mt-1 block ${currentTick.pit_volume < 38 ? 'text-red-700 font-bold' : 'text-zinc-900'}`}>
            {currentTick.pit_volume}
          </span>
          <span className="text-[10px] text-zinc-400">m³</span>
        </div>
      </div>

      {/* 6 Synchronized Parameter Charts (F15) */}
      <LiveParameterCharts timeline={currentTimeline.slice(0, simSec + 1)} currentTick={currentTick} />

      {/* Lower Row: Explainable Alert + Mitigation Feedback (F14, F12, F16) */}
      <div className="grid grid-cols-2 gap-6">
        <ExplainableAlerts alert={alerts[0]} />
        <div className="space-y-4">
          <AlertCenter />
          <RecommendedActions alert={alerts[0]} />
        </div>
      </div>
    </div>
  );
};
