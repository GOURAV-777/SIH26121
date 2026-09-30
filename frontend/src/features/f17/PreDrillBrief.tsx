import React, { useState } from 'react';
import { Badge, Button, Card } from '../../components/ui';
import { FileText, Download, Printer, ShieldAlert, CheckCircle2, Compass, AlertTriangle } from 'lucide-react';

export const PreDrillBrief: React.FC = () => {
  const [targetCoords, setTargetCoords] = useState({ lat: 27.3650, lon: 95.3050, td: 3450 });

  const handlePrintOrDownload = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" data-testid="f17-predrill-brief">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-teal" /> Automated Pre-Drill Risk Brief Builder
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Offset-derived pre-spud intelligence package with formation top uncertainty and hazard playbooks.
          </p>
        </div>

        {/* Download / Print PDF button (F17 acceptance) */}
        <Button
          data-testid="f17-download-pdf"
          variant="primary"
          size="sm"
          onClick={handlePrintOrDownload}
          className="gap-2 font-bold"
        >
          <Download className="w-4 h-4" />
          <span>Export Pre-Drill Brief (PDF / Print)</span>
        </Button>
      </div>

      {/* Target Well Coordinates Input */}
      <Card className="p-4 bg-bg-surface flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-text-muted text-[10px] block">PROPOSED LOCATION:</span>
            <span className="font-bold text-text-primary">27.3650° N, 95.3050° E</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">TARGET TD:</span>
            <span className="font-bold text-accent-teal">3,450 m TVD</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] block">OFFSET RADIUS ANALYZED:</span>
            <span className="font-bold text-accent-orange">5.0 km (9 Offset Wells)</span>
          </div>
        </div>
        <Badge variant="teal">Brief Ready</Badge>
      </Card>

      {/* Printable 6-Section Intelligence Brief Container */}
      <div className="bg-bg-surface border border-border rounded-xl p-6 space-y-6 shadow-md font-sans text-xs">
        {/* Section 1: Nearby Offset Wells Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold font-mono text-accent-teal uppercase border-b border-border pb-1">
            1. Offset Well Proximity & Geological Context
          </h2>
          <p className="text-text-secondary leading-relaxed">
            The proposed trajectory is surrounded by 4 immediate offset wells within 2.5 km (DEMO-A-01, DEMO-B-02, DEMO-C-03, DEMO-D-04). A total of 61 historical operations logs and 190 events were analyzed across the Upper Assam Duliajan structural trend.
          </p>
        </div>

        {/* Section 2: Expected Formation Tops with Uncertainty */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold font-mono text-accent-teal uppercase border-b border-border pb-1">
            2. Stratigraphic Prognosis & Formation Tops (± Depth Uncertainty)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono text-left border border-border">
              <thead className="bg-bg-base uppercase text-[10px] text-text-secondary">
                <tr>
                  <th className="p-2">Formation</th>
                  <th className="p-2">Lithology</th>
                  <th className="p-2">Expected TVD (m)</th>
                  <th className="p-2">Uncertainty</th>
                  <th className="p-2">Hazard Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2 font-bold">Alluvium & Topsoil</td>
                  <td className="p-2">Sand/Silt</td>
                  <td className="p-2">0 m</td>
                  <td className="p-2 text-text-muted">±0 m</td>
                  <td className="p-2 text-accent-green">Low (Aquifer protect)</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Tipam Sandstone</td>
                  <td className="p-2">Sandstone</td>
                  <td className="p-2">900 m</td>
                  <td className="p-2 text-text-muted">±15 m</td>
                  <td className="p-2 text-accent-amber">Moderate (Seepage loss)</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Girujan Clay</td>
                  <td className="p-2">Reactive Shale</td>
                  <td className="p-2">1,700 m</td>
                  <td className="p-2 text-text-muted">±20 m</td>
                  <td className="p-2 text-accent-orange">High (Tight hole / Overpull)</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Surma Group</td>
                  <td className="p-2">Sand/Shale</td>
                  <td className="p-2">2,150 m</td>
                  <td className="p-2 text-text-muted">±22 m</td>
                  <td className="p-2 text-accent-orange">High (Torque spikes @ 2,360m)</td>
                </tr>
                <tr className="bg-accent-red/10 border-l-4 border-accent-red">
                  <td className="p-2 font-bold text-accent-red">Formation X (Barail Coal)</td>
                  <td className="p-2 text-accent-red">Coal / Sand</td>
                  <td className="p-2 font-bold text-accent-red">2,440 m</td>
                  <td className="p-2 font-bold text-accent-red">±18 m</td>
                  <td className="p-2 font-bold text-accent-red">CRITICAL (3/4 Offset Total Loss)</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Kopili Shale</td>
                  <td className="p-2">Overpressured Shale</td>
                  <td className="p-2">2,900 m</td>
                  <td className="p-2 text-text-muted">±25 m</td>
                  <td className="p-2 text-accent-red">CRITICAL (Overpressure @ 3,100m)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Risk Summary Table by Depth */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold font-mono text-accent-teal uppercase border-b border-border pb-1">
            3. Depth-Interval Risk Table & Key Precursors
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-bg-base rounded border border-border space-y-1">
              <span className="font-bold text-accent-red text-xs">2,440–2,500 m TVD (Formation X):</span>
              <p className="text-text-secondary text-[11px] font-sans">
                Severe mud losses (18–50 m³/hr) occurred in 3 offset wells. Precursor: Sudden ROP spurt and 10-second flow-out drop.
              </p>
            </div>
            <div className="p-3 bg-bg-base rounded border border-border space-y-1">
              <span className="font-bold text-accent-orange text-xs">3,100–3,150 m TVD (Kopili Overpressure):</span>
              <p className="text-text-secondary text-[11px] font-sans">
                Pore pressure ramp from 1.15 SG to 1.52 SG EMW. Precursor: High connection gas &gt;1,000 units and pit volume gain.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Recommended Casing & Mud Programs */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold font-mono text-accent-teal uppercase border-b border-border pb-1">
            4. Engineered Casing & Mud Programme Recommendations
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-bg-base rounded border border-border font-mono space-y-1">
              <span className="font-bold text-text-primary text-[11px]">Casing Setting Depths:</span>
              <ul className="text-[11px] text-text-secondary space-y-1 list-disc pl-4 font-sans">
                <li><b>20″ Conductor:</b> 60 m (Isolate surface aquifers)</li>
                <li><b>13-⅜″ Surface:</b> 940 m in Tipam Sandstone</li>
                <li><b>9-⅝″ Intermediate:</b> 2,900 m (Case off Formation X loss zone before Kopili overpressure)</li>
                <li><b>7″ Production Liner:</b> 3,450 m TD</li>
              </ul>
            </div>
            <div className="p-3 bg-bg-base rounded border border-border font-mono space-y-1">
              <span className="font-bold text-text-primary text-[11px]">Mud Weight Window:</span>
              <ul className="text-[11px] text-text-secondary space-y-1 list-disc pl-4 font-sans">
                <li>0–940 m: 1.08–1.15 SG WBM KCl-Polymer</li>
                <li>940–2,400 m: 1.25–1.28 SG KCl-Glycol</li>
                <li><b>2,440–2,500 m: Drop to 1.31 SG with 40 ppb LCM</b></li>
                <li>2,900–3,450 m: Weight up to 1.55–1.58 SG kill mud</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 5: Top Lessons Learned */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold font-mono text-accent-teal uppercase border-b border-border pb-1">
            5. Mandatory Operational Mitigation Checklist
          </h2>
          <ul className="space-y-1 text-xs text-text-secondary list-disc pl-5">
            <li>Pre-mix 40 ppb coarse multi-modal LCM pill (NutPlug + Mica + CaCO₃) before reaching 2,420 m TVD.</li>
            <li>Maintain KCl inhibitor &ge; 7% through Girujan Clay to eliminate swelling overpull.</li>
            <li>Conduct flow checks at every connection past 3,050 m TVD ahead of the Kopili transition.</li>
          </ul>
        </div>

        {/* Section 6: Data Quality & Certification */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted font-mono">
          <span>Data Sources: 14 Offset Well Logs & 20 DDR Bundles</span>
          <span className="text-amber-400 font-bold">OIL INDIA LIMITED · eRTMAC SYNTHETIC DEMO</span>
        </div>
      </div>
    </div>
  );
};
