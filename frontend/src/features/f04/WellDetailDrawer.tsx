import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import { Well, DrillingEvent } from '../../types';
import { Badge, Button } from '../../components/ui';
import { X, FileText, Layers, Activity, AlertTriangle, Compass, ExternalLink } from 'lucide-react';

export const WellDetailDrawer: React.FC = () => {
  const { selectedWellId, setSelectedWellId, setCurrentRoute } = useStore();
  const [well, setWell] = useState<Well | null>(null);
  const [events, setEvents] = useState<DrillingEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'trajectory' | 'formations' | 'events' | 'docs'>('overview');

  useEffect(() => {
    if (selectedWellId) {
      api.getWellById(selectedWellId).then(w => setWell(w || null));
      api.getEvents({ well_id: selectedWellId }).then(evs => setEvents(evs));
    } else {
      setWell(null);
    }
  }, [selectedWellId]);

  if (!selectedWellId || !well) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-bg-surface border-l border-border h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 border-b border-border bg-bg-raised/40 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-text-primary">{well.name}</h2>
              <Badge variant={well.status === 'active' ? 'orange' : (well.status === 'producer' ? 'teal' : 'slate')}>
                {well.status}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 font-mono">
              {well.distance_km} km from active bit · {well.rig_name}
            </p>
          </div>
          <button
            onClick={() => setSelectedWellId(null)}
            className="p-1.5 rounded-md hover:bg-bg-raised text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Tabs Header */}
        <div className="flex border-b border-border bg-bg-base text-xs font-medium">
          <button
            data-testid="f04-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
              activeTab === 'overview' ? 'border-accent-teal text-accent-teal font-bold bg-bg-surface' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Overview
          </button>
          <button
            data-testid="f04-tab-trajectory"
            onClick={() => setActiveTab('trajectory')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
              activeTab === 'trajectory' ? 'border-accent-teal text-accent-teal font-bold bg-bg-surface' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Trajectory
          </button>
          <button
            data-testid="f04-tab-formations"
            onClick={() => setActiveTab('formations')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
              activeTab === 'formations' ? 'border-accent-teal text-accent-teal font-bold bg-bg-surface' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Formations
          </button>
          <button
            data-testid="f04-tab-events"
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
              activeTab === 'events' ? 'border-accent-teal text-accent-teal font-bold bg-bg-surface' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Events ({events.length})
          </button>
          <button
            data-testid="f04-tab-docs"
            onClick={() => setActiveTab('docs')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
              activeTab === 'docs' ? 'border-accent-teal text-accent-teal font-bold bg-bg-surface' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Documents
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-base p-3 rounded-lg border border-border">
                  <div className="text-text-secondary text-[10px] uppercase font-mono">Target Depth</div>
                  <div className="text-sm font-bold font-mono text-accent-teal mt-0.5">{well.target_depth_tvd} m TVD</div>
                  <div className="text-[10px] text-text-muted font-mono">{well.target_depth_md} m MD</div>
                </div>
                <div className="bg-bg-base p-3 rounded-lg border border-border">
                  <div className="text-text-secondary text-[10px] uppercase font-mono">Total NPT Hours</div>
                  <div className="text-sm font-bold font-mono text-accent-red mt-0.5">{well.total_npt_hours} hrs</div>
                  <div className="text-[10px] text-text-muted font-mono">{events.length} recorded incidents</div>
                </div>
              </div>

              <div className="bg-bg-base p-3 rounded-lg border border-border space-y-2">
                <h4 className="font-bold text-text-primary uppercase text-[11px] font-mono border-b border-border pb-1">
                  General Metadata
                </h4>
                <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                  <span className="text-text-secondary">Operator:</span>
                  <span className="text-text-primary font-medium">{well.operator}</span>
                  <span className="text-text-secondary">Rig:</span>
                  <span className="text-text-primary font-medium">{well.rig_name}</span>
                  <span className="text-text-secondary">Spud Date:</span>
                  <span className="font-mono text-text-primary">{well.spud_date}</span>
                  <span className="text-text-secondary">KB Elevation:</span>
                  <span className="font-mono text-text-primary">{well.kb_elevation} m ASL</span>
                  <span className="text-text-secondary">Coordinates:</span>
                  <span className="font-mono text-text-primary">{well.lat.toFixed(4)}°N, {well.lon.toFixed(4)}°E</span>
                  <span className="text-text-secondary">Trajectory Type:</span>
                  <span className="text-text-primary font-medium">{well.is_deviated ? 'Deviated (S-Curve)' : 'Vertical'}</span>
                </div>
              </div>

              {/* Casings preview */}
              <div className="bg-bg-base p-3 rounded-lg border border-border space-y-2">
                <h4 className="font-bold text-text-primary uppercase text-[11px] font-mono border-b border-border pb-1">
                  Casing & Hole Programme
                </h4>
                <div className="space-y-1.5">
                  {well.casings?.map((c, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-text-secondary">{c.size_inch}″ {c.name}</span>
                      <span className="text-accent-teal font-bold">{c.shoe_tvd} m TVD (shoe)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRAJECTORY */}
          {activeTab === 'trajectory' && (
            <div className="space-y-3 text-xs">
              <div className="text-xs text-text-secondary">Directional survey computed by minimum curvature method:</div>
              <div className="max-h-96 overflow-y-auto border border-border rounded-lg">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-bg-base text-[10px] uppercase font-mono text-text-secondary sticky top-0">
                    <tr>
                      <th className="py-2 px-2">MD (m)</th>
                      <th className="py-2 px-2">TVD (m)</th>
                      <th className="py-2 px-2">Inc (°)</th>
                      <th className="py-2 px-2">Azi (°)</th>
                      <th className="py-2 px-2">DLS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    {well.trajectories?.slice(0, 30).map((t, idx) => (
                      <tr key={idx} className="hover:bg-bg-raised/40">
                        <td className="py-1.5 px-2">{t.md}</td>
                        <td className="py-1.5 px-2 font-bold text-accent-teal">{t.tvd}</td>
                        <td className="py-1.5 px-2">{t.inclination}</td>
                        <td className="py-1.5 px-2">{t.azimuth}</td>
                        <td className="py-1.5 px-2 text-text-muted">{t.dogleg_severity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FORMATIONS */}
          {activeTab === 'formations' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-2">
                {well.formations?.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-border bg-bg-base flex items-center justify-between font-mono">
                    <div>
                      <div className="font-bold text-text-primary text-xs flex items-center gap-2">
                        <span>{f.formation_name}</span>
                        {f.is_loss_zone === 1 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red border border-accent-red/40 font-bold">
                            LOSS HAZARD
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-text-secondary capitalize">{f.lithology?.replace('_', ' ')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent-teal">{f.top_tvd} m TVD</div>
                      <div className="text-[10px] text-text-muted">Δz: {f.thickness} m</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-3 text-xs">
              {events.length === 0 ? (
                <div className="text-center py-8 text-text-muted">No drilling NPT events recorded for this well.</div>
              ) : (
                events.map((e) => (
                  <div key={e.id} className="p-3 rounded-lg border border-border bg-bg-base space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-accent-orange capitalize">{e.type.replace('_', ' ')}</span>
                      <Badge variant={e.severity >= 4 ? 'red' : (e.severity >= 3 ? 'orange' : 'teal')} size="sm">
                        Severity {e.severity} · {e.npt_hours}h NPT
                      </Badge>
                    </div>
                    <div className="text-[11px] text-text-secondary font-mono">
                      Depth: <span className="text-text-primary font-bold">{e.tvd} m TVD</span> ({e.formation_name})
                    </div>
                    <p className="text-[11px] text-text-secondary italic bg-bg-surface p-2 rounded border border-border">
                      "{e.excerpt}"
                    </p>
                    <div className="text-[10px] text-text-muted">
                      <b>Mitigation:</b> {e.action}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'docs' && (
            <div className="space-y-3 text-xs">
              {well.documents?.map((d) => (
                <div key={d.id} className="p-3 rounded-lg border border-border bg-bg-base flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent-teal" />
                    <div>
                      <div className="font-bold font-mono text-text-primary">{d.filename}</div>
                      <div className="text-[10px] text-text-secondary">{d.doc_type} · {d.page_count} Pages · {d.date}</div>
                    </div>
                  </div>
                  <a
                    href={d.preview_url || `/pdfs/${d.filename}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded bg-bg-raised text-accent-teal hover:bg-accent-teal hover:text-bg-base transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 border-t border-border bg-bg-surface flex items-center justify-between">
          <Button size="sm" variant="outline" onClick={() => setCurrentRoute('section')}>
            Show on Cross-Section
          </Button>
          <Button size="sm" variant="primary" onClick={() => setSelectedWellId(null)}>
            Close Drawer
          </Button>
        </div>
      </div>
    </div>
  );
};
