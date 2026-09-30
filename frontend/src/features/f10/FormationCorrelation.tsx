import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Well, Formation } from '../../types';
import { Badge, Button, Card } from '../../components/ui';
import { Layers, Sliders, RefreshCw, Eye } from 'lucide-react';

export const FormationCorrelation: React.FC = () => {
  const [wells, setWells] = useState<Well[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [flattenTop, setFlattenTop] = useState<string>('NONE'); // NONE or formation name

  useEffect(() => {
    api.getWells().then(data => setWells(data.slice(0, 5)));
    api.getFormations().then(data => setFormations(data));
  }, []);

  const svgWidth = 900;
  const svgHeight = 650;
  const colWidth = svgWidth / (wells.length || 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4" data-testid="f10-correlation-panel">
      {/* Header & Controls */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-teal" /> Multi-Well Stratigraphic Correlation Panel
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Cross-well correlation strip logs connecting geological formation tops and loss zones across offset wells.
          </p>
        </div>

        {/* Flatten on Top Selector */}
        <div className="flex items-center gap-2 bg-bg-surface border border-border p-1.5 rounded-lg text-xs font-mono">
          <span className="text-text-secondary">Datum Reference:</span>
          <select
            value={flattenTop}
            onChange={(e) => setFlattenTop(e.target.value)}
            className="bg-bg-base border border-border rounded px-2 py-1 text-xs font-mono text-accent-teal focus:outline-none"
          >
            <option value="NONE">True Vertical Depth (TVD ASL)</option>
            {formations.map(f => (
              <option key={f.id} value={f.name}>Flatten on {f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-Track SVG Strip Log */}
      <Card className="p-2 bg-bg-base overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-[580px] min-w-[800px] select-none">
          {/* Well Columns */}
          {wells.map((w, wIdx) => {
            const colX = wIdx * colWidth;
            const centerTrackX = colX + colWidth / 2;

            return (
              <g key={w.id}>
                {/* Track Column Header */}
                <rect x={colX + 10} y={10} width={colWidth - 20} height={36} rx={4} fill="#181d2a" stroke="#2c3548" />
                <text x={centerTrackX} y={28} fill={w.status === 'active' ? '#f97316' : '#22d3c2'} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                  {w.name}
                </text>
                <text x={centerTrackX} y={40} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
                  TD: {w.target_depth_tvd}m
                </text>

                {/* Track Background Strip */}
                <rect x={centerTrackX - 25} y={55} width={50} height={svgHeight - 75} fill="#111520" stroke="#1e293b" />

                {/* Formation Top Markers on well */}
                {w.formations?.map((f) => {
                  let yPos = 55 + (f.top_tvd / 3800) * (svgHeight - 85);
                  if (flattenTop !== 'NONE') {
                    const datumForm = w.formations?.find(fm => fm.formation_name === flattenTop);
                    const datumTVD = datumForm ? datumForm.top_tvd : 0;
                    yPos = 300 + ((f.top_tvd - datumTVD) / 3800) * (svgHeight - 85);
                  }

                  return (
                    <g key={f.id}>
                      <line
                        x1={centerTrackX - 25}
                        y1={yPos}
                        x2={centerTrackX + 25}
                        y2={yPos}
                        stroke={f.is_loss_zone ? '#ef4444' : '#64748b'}
                        strokeWidth={f.is_loss_zone ? 2.5 : 1}
                      />
                      {f.is_loss_zone === 1 && (
                        <rect x={centerTrackX - 25} y={yPos} width={50} height={18} fill="rgba(239, 68, 68, 0.25)" />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Inter-Well Stratigraphic Correlation Lines (F10 acceptance: >=4 correlation lines per top) */}
          {formations.map((f) => {
            const points: { x: number; y: number }[] = [];
            wells.forEach((w, wIdx) => {
              const formObj = w.formations?.find(wf => wf.formation_id === f.id);
              if (formObj) {
                const colX = wIdx * colWidth;
                const centerTrackX = colX + colWidth / 2;
                let yPos = 55 + (formObj.top_tvd / 3800) * (svgHeight - 85);
                if (flattenTop !== 'NONE') {
                  const datumForm = w.formations?.find(fm => fm.formation_name === flattenTop);
                  const datumTVD = datumForm ? datumForm.top_tvd : 0;
                  yPos = 300 + ((formObj.top_tvd - datumTVD) / 3800) * (svgHeight - 85);
                }
                points.push({ x: centerTrackX, y: yPos });
              }
            });

            if (points.length < 2) return null;

            const pathD = points.reduce((acc, pt, idx) => {
              return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
            }, '');

            return (
              <g key={f.id} data-testid="f10-corr-line">
                <path
                  d={pathD}
                  stroke={f.is_loss_zone ? '#ef4444' : '#38bdf8'}
                  strokeWidth={f.is_loss_zone ? 2.5 : 1.2}
                  strokeDasharray={f.is_loss_zone ? 'none' : '4 3'}
                  fill="none"
                  opacity={f.is_loss_zone ? 0.9 : 0.6}
                />
                <text
                  x={points[0].x - 30}
                  y={points[0].y - 4}
                  fill={f.is_loss_zone ? '#ef4444' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  {f.name.replace(' (demo)', '')}
                </text>
              </g>
            );
          })}
        </svg>
      </Card>
    </div>
  );
};
