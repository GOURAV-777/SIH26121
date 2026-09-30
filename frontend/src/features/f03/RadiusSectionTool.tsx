import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import { Well } from '../../types';
import { Badge, Button } from '../../components/ui';
import { Sliders, Compass, Target, ArrowRight, Layers } from 'lucide-react';

export const RadiusSectionTool: React.FC = () => {
  const { radiusKm, setRadiusKm, setSelectedWellId, activeSectionLine, setActiveSectionLine, autoSection } = useStore();
  const [wells, setWells] = useState<Well[]>([]);

  useEffect(() => {
    api.getWells().then(data => setWells(data));
  }, []);

  const sortedWells = [...wells].sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
  const insideWells = sortedWells.filter(w => (w.distance_km ?? 0) <= radiusKm);

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-4 space-y-4" data-testid="f03-radius-tool">
      {/* Header & Slider */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Sliders className="w-4 h-4 text-accent-teal" /> Offset Wells Proximity
          </h3>
          <p className="text-xs text-text-secondary">Spatial filtering around DEMO-ACTIVE-01</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-bg-base px-3 py-1.5 rounded-md border border-border">
            <span className="text-xs text-text-secondary font-mono">Radius:</span>
            <span className="text-sm font-bold font-mono text-accent-teal">{radiusKm} km</span>
            <input
              data-testid="f03-radius-slider"
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-24 h-1.5 accent-accent-teal cursor-pointer"
            />
          </div>
          <Button size="sm" variant="secondary" onClick={autoSection} data-testid="f03-auto-section" className="text-xs gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent-teal" /> Auto Section
          </Button>
        </div>
      </div>

      {/* Nearby Wells Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] uppercase font-mono text-text-secondary border-b border-border bg-bg-base">
            <tr>
              <th className="py-2 px-3">Well Name</th>
              <th className="py-2 px-3">Distance</th>
              <th className="py-2 px-3">Bearing</th>
              <th className="py-2 px-3">Total Depth</th>
              <th className="py-2 px-3">Events</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedWells.map((w) => {
              const isInside = (w.distance_km ?? 0) <= radiusKm;
              return (
                <tr
                  key={w.id}
                  data-testid="f03-nearby-row"
                  className={`transition-colors ${
                    isInside ? 'hover:bg-bg-raised/60' : 'opacity-40 bg-bg-base/30'
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-text-primary flex items-center gap-2">
                    {w.status === 'active' && <span className="w-2 h-2 rounded-full bg-accent-orange animate-ping" />}
                    <span>{w.name}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {w.distance_km === 0 ? (
                      <span className="text-accent-orange font-bold">0.0 km (Origin)</span>
                    ) : (
                      <span className={isInside ? 'text-accent-teal font-bold' : 'text-text-muted'}>{w.distance_km} km</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-text-secondary">
                    {w.bearing_deg}° ({w.bearing_compass})
                  </td>
                  <td className="py-2.5 px-3 font-mono text-text-primary">
                    {w.target_depth_tvd} m
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-bg-base font-bold border border-border">
                      {w.event_count}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={w.status === 'active' ? 'orange' : (w.status === 'producer' ? 'teal' : 'slate')} size="sm">
                      {w.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedWellId(w.id)}
                      className="text-accent-teal hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
