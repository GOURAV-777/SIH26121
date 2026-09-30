import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { RiskWindow } from '../../types';
import { Badge, Button, Card } from '../../components/ui';
import { AlertTriangle, Activity, BarChart2, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const RiskPrediction: React.FC = () => {
  const { setCurrentRoute } = useStore();
  const [riskWindows, setRiskWindows] = useState<RiskWindow[]>([]);
  const [modelCard, setModelCard] = useState<any>(null);
  const [activeRiskType, setActiveRiskType] = useState<string>('mud_loss');
  const [showModelCard, setShowModelCard] = useState(false);

  useEffect(() => {
    api.getRiskProfile().then(data => setRiskWindows(data));
    api.getModelCard().then(data => setModelCard(data));
  }, []);

  const riskTypes = [
    { id: 'mud_loss', label: 'Mud Loss' },
    { id: 'kick', label: 'Well Kick / Gas Influx' },
    { id: 'stuck_pipe', label: 'Stuck Pipe' },
    { id: 'torque_spike', label: 'Torque Spikes' },
    { id: 'cementing_issue', label: 'Cementing Channelling' },
    { id: 'wellbore_instability', label: 'Wellbore Instability' },
  ];

  // Top 5 risk depths for active risk type
  const topRisks = [...riskWindows]
    .sort((a, b) => (b[activeRiskType as keyof RiskWindow] as number) - (a[activeRiskType as keyof RiskWindow] as number))
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="f11-risk-engine">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-teal" /> Multi-Hazard Risk Prediction Engine
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Machine learning gradient boosted hazard probability calculated every 20 m TVD ahead of the bit.
          </p>
        </div>

        <Button
          data-testid="f11-model-card"
          variant={showModelCard ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowModelCard(!showModelCard)}
          className="gap-1.5 text-xs font-mono font-bold"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{showModelCard ? 'Hide Model Card' : 'View AI Model Card'}</span>
        </Button>
      </div>

      {/* Model Card Modal / Drawer View if open */}
      {showModelCard && modelCard && (
        <Card className="p-5 border-accent-teal/40 bg-bg-surface space-y-4 font-mono text-xs animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-teal" />
              <span className="font-bold text-sm text-text-primary">{modelCard.title}</span>
              <Badge variant="teal" size="sm">{modelCard.version}</Badge>
            </div>
            <Badge variant="amber" size="sm">Leave-One-Well-Out CV</Badge>
          </div>

          <p className="text-text-secondary font-sans text-xs">
            {modelCard.caveat}
          </p>

          <div className="grid grid-cols-3 gap-4">
            {Object.entries(modelCard.models).map(([k, v]: [string, any]) => (
              <div key={k} className="p-3 bg-bg-base border border-border rounded-lg space-y-2">
                <div className="font-bold text-accent-orange capitalize text-xs">{k.replace('_', ' ')}</div>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <div>
                    <span className="text-text-muted block text-[9px]">AUC:</span>
                    <span className="font-bold text-accent-teal">{v.auc}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">PREC:</span>
                    <span className="text-text-primary font-bold">{v.precision}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[9px]">REC:</span>
                    <span className="text-text-primary font-bold">{v.recall}</span>
                  </div>
                </div>
                <div className="text-[10px] text-text-muted pt-1 border-t border-border">
                  Lead Distance: {v.lead_distance_m} m lookahead
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hazard Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {riskTypes.map((rk) => (
          <button
            key={rk.id}
            onClick={() => setActiveRiskType(rk.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeRiskType === rk.id
                ? 'bg-accent-teal text-bg-base font-bold shadow'
                : 'bg-bg-surface text-text-secondary border border-border hover:text-text-primary'
            }`}
          >
            {rk.label}
          </button>
        ))}
      </div>

      {/* Depth Risk Heat Strip (F11 acceptance: f11-risk-strip) */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold font-mono text-text-primary uppercase flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-accent-orange" />
            Depth Risk Heat Strip — {riskTypes.find(r => r.id === activeRiskType)?.label}
          </span>
          <span className="font-mono text-text-secondary">0 m to 3,450 m TVD</span>
        </div>

        {/* Heat Strip Visual */}
        <div
          data-testid="f11-risk-strip"
          className="w-full h-8 rounded-lg overflow-hidden flex border border-border bg-bg-base"
        >
          {riskWindows.map((rw) => {
            const val = (rw[activeRiskType as keyof RiskWindow] as number) || 0;
            const bgCol = val >= 0.75 ? '#ef4444' : (val >= 0.50 ? '#f97316' : (val >= 0.25 ? '#f59e0b' : '#1e293b'));
            return (
              <div
                key={rw.tvd}
                style={{ backgroundColor: bgCol, width: `${100 / riskWindows.length}%` }}
                title={`${rw.tvd} m TVD: ${(val * 100).toFixed(1)}% Risk`}
                className="h-full hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>0 m</span>
          <span>900 m (Tipam)</span>
          <span>1,700 m (Girujan)</span>
          <span className="text-accent-red font-bold">2,440 m (Formation X)</span>
          <span>2,900 m (Kopili)</span>
          <span>3,400 m (TD)</span>
        </div>
      </Card>

      {/* Top 5 Risk Depths Table */}
      <Card className="p-4 space-y-3">
        <h3 className="font-bold text-xs uppercase font-mono text-text-secondary">
          Top-5 Highest Risk Depth Windows (Planned DEMO-ACTIVE-01)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-bg-base text-[10px] uppercase font-mono text-text-secondary border-b border-border">
              <tr>
                <th className="py-2 px-3">Depth Window (TVD)</th>
                <th className="py-2 px-3">Formation</th>
                <th className="py-2 px-3">Predicted Probability</th>
                <th className="py-2 px-3">Risk Level</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {topRisks.map((rw) => {
                const prob = (rw[activeRiskType as keyof RiskWindow] as number) || 0;
                const isCritical = prob >= 0.75;
                return (
                  <tr key={rw.tvd} className="hover:bg-bg-raised/40">
                    <td className="py-2.5 px-3 font-bold text-accent-teal">
                      {rw.tvd} – {rw.tvd + 20} m TVD
                    </td>
                    <td className="py-2.5 px-3 text-text-primary">
                      {rw.tvd >= 2440 && rw.tvd <= 2500 ? 'Formation X Barail Coal-Sand' : (rw.tvd >= 3080 ? 'Kopili Shale' : 'Surma Group')}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-bg-base rounded-full overflow-hidden border border-border">
                          <div
                            className={`h-full ${isCritical ? 'bg-accent-red' : 'bg-accent-orange'}`}
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                        <span className="font-bold font-mono">{(prob * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={isCritical ? 'red' : 'orange'} size="sm">
                        {isCritical ? 'CRITICAL' : 'WARNING'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setCurrentRoute('live')}
                        className="text-[11px] gap-1"
                      >
                        <span>Explain Alert</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
