import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import { SectionData, Well, Formation } from '../../types';
import { Badge, Button } from '../../components/ui';
import { Sun, Moon, Eye, EyeOff, Sliders, AlertTriangle, Layers, Crosshair } from 'lucide-react';

export const CrossSection: React.FC = () => {
  const {
    activeSectionLine,
    verticalExaggeration,
    setVerticalExaggeration,
    isDayMode,
    toggleDayMode,
    layerToggles,
    toggleLayer,
    setSelectedWellId,
    simPlaying,
    simSec,
  } = useStore();

  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number; tvd: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api.getSectionData(activeSectionLine).then(data => setSectionData(data));
  }, [activeSectionLine]);

  if (!sectionData) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary font-mono text-xs">
        Loading Subsurface Stratigraphy...
      </div>
    );
  }

  const { strata, terrain_profile, wells, faults, groundwater_depth_m } = sectionData;

  // Visual layout dimensions
  const svgWidth = 1100;
  const svgHeight = 780;
  const rulerWidth = 60;
  const plotWidth = svgWidth - rulerWidth * 2;
  
  // Depth scaling: 0 to 3,800 m TVD
  const maxDepthTVD = 3800;
  const skyHeight = 100;
  const surfaceY = 120;
  const depthPlotHeight = (svgHeight - surfaceY) * verticalExaggeration;

  const tvdToY = (tvd: number) => {
    return surfaceY + (tvd / maxDepthTVD) * (svgHeight - surfaceY - 30);
  };

  const yToTVD = (y: number) => {
    if (y < surfaceY) return 0;
    return Math.round(((y - surfaceY) / (svgHeight - surfaceY - 30)) * maxDepthTVD);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= rulerWidth && x <= svgWidth - rulerWidth && y >= surfaceY) {
      setCrosshairPos({ x, y, tvd: yToTVD(y) });
    } else {
      setCrosshairPos(null);
    }
  };

  // Find stratum at crosshair depth
  const activeStratum = crosshairPos ? strata.slice().reverse().find(s => crosshairPos.tvd >= s.base_top_tvd) : null;

  return (
    <div className="relative w-full h-full bg-bg-base overflow-hidden flex flex-col" data-testid="f02-cross-section">
      {/* Control Top Bar */}
      <div className="h-11 bg-bg-surface/90 border-b border-border px-4 flex items-center justify-between text-xs z-10">
        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-text-secondary font-medium mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-accent-teal" /> Layers:
          </span>
          {(Object.keys(layerToggles) as (keyof typeof layerToggles)[]).map(layer => (
            <button
              key={layer}
              onClick={() => toggleLayer(layer)}
              className={`px-2 py-1 rounded text-[11px] capitalize transition-all border ${
                layerToggles[layer]
                  ? 'bg-accent-teal/15 text-accent-teal border-accent-teal/40 font-semibold'
                  : 'bg-bg-base text-text-muted border-border hover:text-text-secondary'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>

        {/* VE Slider & Day/Dusk Controls */}
        <div className="flex items-center gap-4">
          {/* Vertical Exaggeration Slider */}
          <div className="flex items-center gap-2 bg-bg-base px-2.5 py-1 rounded border border-border">
            <span className="text-text-secondary font-mono">VE:</span>
            <span className="font-mono font-bold text-accent-teal">{verticalExaggeration.toFixed(1)}×</span>
            <input
              data-testid="f02-ve-slider"
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={verticalExaggeration}
              onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
              className="w-20 h-1 accent-accent-teal cursor-pointer"
            />
          </div>

          {/* Day / Dusk Toggle */}
          <button
            data-testid="f02-tod-toggle"
            onClick={toggleDayMode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-base border border-border text-text-secondary hover:text-text-primary transition-all"
          >
            {isDayMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-accent-violet" />}
            <span className="capitalize">{isDayMode ? 'Day Mode' : 'Dusk Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main SVG Geoscience Cross-Section */}
      <div className="flex-1 w-full h-full relative overflow-auto cursor-crosshair bg-bg-base">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full min-w-[900px] select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setCrosshairPos(null)}
        >
          <defs>
            {/* Sky Gradients */}
            <linearGradient id="skyGradDusk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1120" />
              <stop offset="60%" stopColor="#142845" />
              <stop offset="100%" stopColor="#1e3a5f" />
            </linearGradient>
            <linearGradient id="skyGradDay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e5799" />
              <stop offset="50%" stopColor="#2989d8" />
              <stop offset="100%" stopColor="#7db9e8" />
            </linearGradient>

            {/* Lithology Patterns */}
            {/* Sandstone Dots */}
            <pattern id="sandstonePat" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.2" fill="#d97706" opacity="0.6" />
              <circle cx="9" cy="9" r="1.2" fill="#d97706" opacity="0.6" />
            </pattern>
            {/* Shale Dashes */}
            <pattern id="shalePat" width="16" height="8" patternUnits="userSpaceOnUse">
              <line x1="2" y1="4" x2="10" y2="4" stroke="#64748b" strokeWidth="1.2" opacity="0.7" />
            </pattern>
            {/* Coal Block Hatch */}
            <pattern id="coalPat" width="14" height="14" patternUnits="userSpaceOnUse">
              <rect width="14" height="14" fill="#18181b" />
              <rect x="2" y="2" width="4" height="4" fill="#27272a" />
              <rect x="8" y="8" width="4" height="4" fill="#27272a" />
            </pattern>
            {/* Loss Zone Red 45deg Hatch */}
            <pattern id="lossZoneHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#ef4444" strokeWidth="2.5" opacity="0.45" />
            </pattern>
            {/* Limestone Bricks */}
            <pattern id="limestonePat" width="20" height="10" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="20" y2="0" stroke="#a1a1aa" strokeWidth="1" />
              <line x1="0" y1="5" x2="20" y2="5" stroke="#a1a1aa" strokeWidth="1" />
              <line x1="10" y1="0" x2="10" y2="5" stroke="#a1a1aa" strokeWidth="1" />
              <line x1="0" y1="5" x2="0" y2="10" stroke="#a1a1aa" strokeWidth="1" />
              <line x1="20" y1="5" x2="20" y2="10" stroke="#a1a1aa" strokeWidth="1" />
            </pattern>
            {/* Basement Crosshatch */}
            <pattern id="basementPat" width="10" height="10" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="10" y2="10" stroke="#475569" strokeWidth="1" />
              <line x1="10" y1="0" x2="0" y2="10" stroke="#475569" strokeWidth="1" />
            </pattern>
          </defs>

          {/* 1. SKY */}
          <rect
            x={rulerWidth}
            y={0}
            width={plotWidth}
            height={surfaceY}
            fill={isDayMode ? 'url(#skyGradDay)' : 'url(#skyGradDusk)'}
          />
          {/* Celestial body (Sun/Moon) */}
          {isDayMode ? (
            <circle cx={svgWidth - rulerWidth - 80} cy={45} r={18} fill="#fef08a" filter="drop-shadow(0 0 8px #facc15)" />
          ) : (
            <g transform={`translate(${svgWidth - rulerWidth - 90}, 30)`}>
              <circle cx="15" cy="15" r="14" fill="#e2e8f0" opacity="0.9" />
              <circle cx="20" cy="12" r="12" fill="#0a1120" />
            </g>
          )}

          {/* 2. FORMATION STRATA POLYGONS (F02 acceptance >=8 strata) */}
          {layerToggles.lithology && (
            <g id="strata-layers">
              {strata.map((s, idx) => {
                const topY = tvdToY(s.base_top_tvd);
                const nextTopTVD = idx < strata.length - 1 ? strata[idx + 1].base_top_tvd : maxDepthTVD;
                const botY = tvdToY(nextTopTVD);
                const layerHeight = botY - topY;

                let fillPattern = 'none';
                if (s.lithology === 'sandstone') fillPattern = 'url(#sandstonePat)';
                else if (s.lithology.includes('shale')) fillPattern = 'url(#shalePat)';
                else if (s.lithology === 'coal_sand') fillPattern = 'url(#coalPat)';
                else if (s.lithology === 'limestone') fillPattern = 'url(#limestonePat)';
                else if (s.lithology === 'crystalline') fillPattern = 'url(#basementPat)';

                return (
                  <g key={s.id} data-testid="f02-stratum">
                    {/* Base Color Fill */}
                    <rect
                      x={rulerWidth}
                      y={topY}
                      width={plotWidth}
                      height={layerHeight}
                      fill={s.color}
                      opacity={0.35}
                    />
                    {/* Texture Pattern */}
                    <rect
                      x={rulerWidth}
                      y={topY}
                      width={plotWidth}
                      height={layerHeight}
                      fill={fillPattern}
                    />
                    {/* Formation boundary stroke */}
                    <line
                      x1={rulerWidth}
                      y1={topY}
                      x2={svgWidth - rulerWidth}
                      y2={topY}
                      stroke="#475569"
                      strokeWidth={1}
                      strokeDasharray="4 2"
                    />
                    {/* Stratum Label */}
                    <text
                      x={rulerWidth + 12}
                      y={topY + 16}
                      fill="#e2e8f0"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                      className="drop-shadow"
                    >
                      {s.name} ({s.base_top_tvd} m)
                    </text>

                    {/* STORY CRITICAL: Highlight Formation X Loss Zone (2,440 - 2,500 m TVD) */}
                    {s.is_loss_zone && (
                      <g className="animate-pulse">
                        <rect
                          x={rulerWidth}
                          y={topY}
                          width={plotWidth}
                          height={layerHeight}
                          fill="url(#lossZoneHatch)"
                        />
                        <rect
                          x={rulerWidth}
                          y={topY}
                          width={plotWidth}
                          height={layerHeight}
                          fill="rgba(239, 68, 68, 0.15)"
                        />
                        {/* Hazard Banner */}
                        <g transform={`translate(${plotWidth / 2 - 120}, ${topY + layerHeight / 2 - 12})`}>
                          <rect width="240" height="24" rx="4" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                          <text x="120" y="16" fill="#fecaca" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                            ⚠ FORMATION X · CRITICAL LOSS ZONE (40 ppb LCM)
                          </text>
                        </g>
                      </g>
                    )}

                    {/* Kopili Shale Overpressure Highlight (3,100 m) */}
                    {layerToggles.pressure && s.is_overpressure && (
                      <rect
                        x={rulerWidth}
                        y={tvdToY(3100)}
                        width={plotWidth}
                        height={tvdToY(3250) - tvdToY(3100)}
                        fill="rgba(249, 115, 22, 0.15)"
                        stroke="#f97316"
                        strokeWidth="1"
                        strokeDasharray="6 3"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* 3. SURFACE PROFILE & RIGS */}
          <g id="surface-terrain">
            {/* Earth Surface Path */}
            <path
              d={`M ${rulerWidth} ${surfaceY} Q ${rulerWidth + plotWidth * 0.4} ${surfaceY - 14}, ${rulerWidth + plotWidth * 0.6} ${surfaceY + 8} T ${svgWidth - rulerWidth} ${surfaceY} L ${svgWidth - rulerWidth} ${surfaceY + 18} L ${rulerWidth} ${surfaceY + 18} Z`}
              fill="#2d4a22"
            />
            {/* Topsoil */}
            <rect x={rulerWidth} y={surfaceY + 8} width={plotWidth} height={14} fill="#c8a76a" opacity="0.6" />
            
            {/* Groundwater Aquifer Table (12m below surface) */}
            {layerToggles.groundwater && (
              <g>
                <line
                  x1={rulerWidth}
                  y1={surfaceY + 22}
                  x2={svgWidth - rulerWidth}
                  y2={surfaceY + 22}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <text x={rulerWidth + 14} y={surfaceY + 32} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono">
                  Freshwater Aquifer Table (~12 m) — Protected
                </text>
              </g>
            )}
          </g>

          {/* 4. WELL TRAJECTORIES & BIT ANIMATIONS */}
          <g id="wells-section">
            {wells.map((w, wIdx) => {
              // Position along the section width
              const wellX = rulerWidth + 140 + wIdx * (plotWidth / (wells.length + 0.8));
              const isDev = w.is_deviated === 1;
              const wellBottomY = tvdToY(w.target_depth_tvd);

              return (
                <g key={w.id} data-testid="f02-well" onClick={() => setSelectedWellId(w.id)} className="cursor-pointer">
                  {/* Rig Silhouette */}
                  <g transform={`translate(${wellX - 12}, ${surfaceY - 28})`}>
                    <polygon points="12,0 0,28 24,28" fill={w.status === 'active' ? '#f97316' : '#22d3c2'} opacity="0.9" />
                    <rect x="10" y="2" width="4" height="26" fill="#111827" />
                  </g>

                  {/* Well Label */}
                  <text
                    x={wellX}
                    y={surfaceY - 34}
                    fill={w.status === 'active' ? '#f97316' : '#22d3c2'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                  >
                    {w.name}
                  </text>

                  {/* Trajectory line */}
                  <path
                    d={isDev
                      ? `M ${wellX} ${surfaceY} L ${wellX} ${tvdToY(1200)} Q ${wellX + 30} ${tvdToY(2000)}, ${wellX + 75} ${wellBottomY}`
                      : `M ${wellX} ${surfaceY} L ${wellX} ${wellBottomY}`
                    }
                    stroke={w.status === 'active' ? '#f97316' : '#22d3c2'}
                    strokeWidth={w.status === 'active' ? 3.5 : 2}
                    fill="none"
                  />

                  {/* Casing Strings (F02 / F21) */}
                  {layerToggles.casing && (
                    <g>
                      {/* Conductor Shoe */}
                      <rect x={wellX - 4} y={surfaceY} width="8" height={tvdToY(60) - surfaceY} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                      {/* Surface Casing Shoe */}
                      <rect x={wellX - 3} y={surfaceY} width="6" height={tvdToY(940) - surfaceY} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                      <polygon points={`${wellX-5},${tvdToY(940)} ${wellX+5},${tvdToY(940)} ${wellX},${tvdToY(940)+6}`} fill="#38bdf8" />
                      {/* Intermediate Casing Shoe */}
                      <rect x={wellX - 2} y={tvdToY(940)} width="4" height={tvdToY(2900) - tvdToY(940)} fill="none" stroke="#6366f1" strokeWidth="1.5" />
                      <polygon points={`${wellX-4},${tvdToY(2900)} ${wellX+4},${tvdToY(2900)} ${wellX},${tvdToY(2900)+6}`} fill="#6366f1" />
                    </g>
                  )}

                  {/* Active Bit with Glow Pulse (DEMO-ACTIVE-01) */}
                  {w.status === 'active' && (
                    <g transform={`translate(${wellX}, ${tvdToY(2442)})`}>
                      <circle cx="0" cy="0" r="10" fill="rgba(249, 115, 22, 0.4)" className="animate-ping" />
                      <polygon points="0,6 -6,-4 6,-4" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                      {/* Upward mud return particle animation simulation */}
                      <circle cx="0" cy="-14" r="1.5" fill="#22d3c2" opacity="0.8" />
                      <circle cx="0" cy="-28" r="1.5" fill="#22d3c2" opacity="0.6" />
                      <circle cx="0" cy="-42" r="1.5" fill="#22d3c2" opacity="0.4" />
                    </g>
                  )}

                  {/* Event Glyphs at Depth (F02 / F07) */}
                  {layerToggles.events && (
                    <g>
                      {/* Mud loss glyph in Formation X */}
                      <g transform={`translate(${wellX + (isDev ? 40 : 0)}, ${tvdToY(2450)})`}>
                        <polygon points="0,-6 6,0 0,6 -6,0" fill="#22d3c2" stroke="#ffffff" strokeWidth="1" />
                      </g>
                      {/* Kick glyph in Kopili */}
                      <g transform={`translate(${wellX + (isDev ? 65 : 0)}, ${tvdToY(3120)})`}>
                        <circle cx="0" cy="0" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                      </g>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 5. FAULTS */}
          {layerToggles.faults && faults.map((f, i) => (
            <g key={i}>
              <line
                x1={rulerWidth + plotWidth * 0.45}
                y1={surfaceY}
                x2={rulerWidth + plotWidth * 0.35}
                y2={svgHeight - 40}
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
              <text
                x={rulerWidth + plotWidth * 0.38}
                y={svgHeight - 50}
                fill="#f43f5e"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                {f.name} (Δz: 28 m)
              </text>
            </g>
          ))}

          {/* 6. DEPTH RULER (F02 acceptance: TVD left, ASL right) */}
          <g id="depth-ruler" data-testid="f02-ruler">
            {/* Left Ruler (TVD) */}
            <rect x="0" y="0" width={rulerWidth} height={svgHeight} fill="#0d111c" />
            <line x1={rulerWidth} y1="0" x2={rulerWidth} y2={svgHeight} stroke="#2c3548" strokeWidth="1" />
            <text x="30" y="24" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
              m TVD
            </text>

            {/* Right Ruler (ASL Elevation) */}
            <rect x={svgWidth - rulerWidth} y="0" width={rulerWidth} height={svgHeight} fill="#0d111c" />
            <line x1={svgWidth - rulerWidth} y1="0" x2={svgWidth - rulerWidth} y2={svgHeight} stroke="#2c3548" strokeWidth="1" />
            <text x={svgWidth - 30} y="24" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
              m ASL
            </text>

            {/* Depth Ticks every 500m */}
            {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500].map(d => {
              const y = tvdToY(d);
              const asl = 115 - d;
              return (
                <g key={d}>
                  <line x1={rulerWidth - 6} y1={y} x2={rulerWidth} y2={y} stroke="#64748b" strokeWidth="1.5" />
                  <text x={rulerWidth - 10} y={y + 3} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="JetBrains Mono">
                    {d}
                  </text>
                  <line x1={svgWidth - rulerWidth} y1={y} x2={svgWidth - rulerWidth + 6} y2={y} stroke="#64748b" strokeWidth="1.5" />
                  <text x={svgWidth - rulerWidth + 10} y={y + 3} fill="#94a3b8" fontSize="9" textAnchor="start" fontFamily="JetBrains Mono">
                    {asl}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 7. INTERACTIVE CROSSHAIR & TOOLTIP */}
          {crosshairPos && (
            <g>
              <line x1={rulerWidth} y1={crosshairPos.y} x2={svgWidth - rulerWidth} y2={crosshairPos.y} stroke="#22d3c2" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={crosshairPos.x} y1={surfaceY} x2={crosshairPos.x} y2={svgHeight - 20} stroke="#22d3c2" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={crosshairPos.x} cy={crosshairPos.y} r="3" fill="#22d3c2" />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Card */}
        {crosshairPos && activeStratum && (
          <div
            className="absolute pointer-events-none bg-bg-surface/95 border border-accent-teal/50 shadow-2xl rounded-lg p-2.5 w-64 backdrop-blur text-xs z-30 font-mono"
            style={{
              left: Math.min(window.innerWidth - 300, crosshairPos.x + 20),
              top: Math.max(70, crosshairPos.y - 40)
            }}
          >
            <div className="text-accent-teal font-bold text-xs pb-1 border-b border-border flex justify-between">
              <span>{activeStratum.name}</span>
            </div>
            <div className="mt-1.5 space-y-1 text-text-secondary text-[11px]">
              <div className="flex justify-between">
                <span>Depth:</span>
                <span className="text-text-primary font-bold">{crosshairPos.tvd} m TVD</span>
              </div>
              <div className="flex justify-between">
                <span>Lithology:</span>
                <span className="text-text-primary capitalize">{activeStratum.lithology.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Pore Pressure:</span>
                <span className="text-text-primary">{(1.05 + (crosshairPos.tvd > 2900 ? 0.45 : 0.05)).toFixed(2)} SG</span>
              </div>
              {activeStratum.is_loss_zone && (
                <div className="text-accent-red font-bold text-[10px] mt-1 pt-1 border-t border-border">
                  ⚠ Loss circulation hazard detected in offset logs!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
