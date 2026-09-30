import React from 'react';
import { useStore, AlertItem } from '../../store/useStore';
import { Badge, Button, Card } from '../../components/ui';
import { AlertTriangle, ShieldCheck, FileText, ArrowRight, ExternalLink, BarChart2 } from 'lucide-react';

export const ExplainableAlerts: React.FC<{ alert?: AlertItem; onClose?: () => void }> = ({ alert, onClose }) => {
  const { alerts, setCurrentRoute, setSelectedWellId } = useStore();
  const currentAlert = alert || alerts[0];

  if (!currentAlert) return null;

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-5 space-y-4 shadow-xl font-mono text-xs" data-testid="f12-explainable-alerts">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-red/20 text-accent-red border border-accent-red/40 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-text-primary">{currentAlert.title}</span>
              <Badge variant={currentAlert.level === 'critical' ? 'red' : 'orange'} size="sm">
                {currentAlert.level.toUpperCase()}
              </Badge>
            </div>
            <div className="text-[11px] text-text-secondary">
              Hazard at {currentAlert.tvd_depth} m TVD · AI Confidence: {(currentAlert.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {onClose && (
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <p className="text-xs font-sans text-text-secondary leading-relaxed bg-bg-base p-3 rounded-lg border border-border">
        {currentAlert.message}
      </p>

      {/* 1. "Why" Feature Contributions (SHAP) Chart (F12 acceptance: f12-why-chart >= 4 features) */}
      <div className="space-y-2 bg-bg-base p-3 rounded-lg border border-border" data-testid="f12-why-chart">
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary uppercase text-[11px] flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-accent-teal" /> Explainable AI Attribution (SHAP Feature Importances)
          </span>
          <span className="text-[10px] text-text-muted">Relative Weight %</span>
        </div>

        <div className="space-y-2 pt-1">
          {currentAlert.shap_features.map((feat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-text-secondary">{feat.name}</span>
                <span className="font-bold text-accent-teal">+{(feat.contribution * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-bg-surface rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-accent-teal to-accent-orange"
                  style={{ width: `${feat.contribution * 100 * 2}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Evidence List of Offset Events (F12 acceptance: >=3 evidence items) */}
      <div className="space-y-2 bg-bg-base p-3 rounded-lg border border-border">
        <span className="font-bold text-text-primary uppercase text-[11px] block">
          Historical Offset Well Evidence (Within 2.5 km Proximity):
        </span>

        <div className="space-y-2">
          {currentAlert.evidence_wells.map((ev, i) => (
            <div
              key={i}
              className="p-2 rounded bg-bg-surface border border-border flex items-center justify-between hover:border-accent-teal/40 transition-colors"
            >
              <div>
                <div className="font-bold text-text-primary flex items-center gap-2">
                  <span className="text-accent-teal">{ev.well_id}</span>
                  <span className="text-text-muted text-[10px]">({ev.distance_km} km away)</span>
                  <Badge variant="red" size="sm">
                    {ev.event_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-[10px] text-text-secondary mt-0.5 font-sans">
                  Source: {ev.source}
                </div>
              </div>

              <div className="text-right flex items-center gap-3">
                <div>
                  <div className="text-[9px] text-text-muted">Similarity</div>
                  <div className="text-xs font-bold text-accent-orange">{ev.similarity_pct}%</div>
                </div>
                <button
                  onClick={() => setSelectedWellId(ev.well_id)}
                  className="p-1 rounded bg-bg-raised text-accent-teal hover:bg-accent-teal hover:text-bg-base transition-colors"
                  title="View well details"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Checklist */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
        <Button size="sm" variant="outline" onClick={() => setCurrentRoute('section')} className="gap-1.5">
          <span>View on Cross-Section</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
        <span className="text-[10px] text-text-muted font-mono">Real-time alert engine active</span>
      </div>
    </div>
  );
};
