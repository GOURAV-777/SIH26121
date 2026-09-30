import React from 'react';
import { SimTick } from '../../types';
import { Card } from '../../components/ui';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

interface Props {
  timeline: SimTick[];
  currentTick: SimTick;
}

export const LiveParameterCharts: React.FC<Props> = ({ timeline, currentTick }) => {
  const chartConfigs = [
    { title: 'Rate of Penetration (ROP)', dataKey: 'rop', color: '#18181b', unit: 'm/hr', domain: [0, 30] },
    { title: 'Weight on Bit (WOB)', dataKey: 'wob', color: '#52525b', unit: 'klb', domain: [10, 25] },
    { title: 'Surface Torque', dataKey: 'torque', color: '#71717a', unit: 'kft-lb', domain: [5, 22] },
    { title: 'Standpipe Pressure (SPP)', dataKey: 'spp', color: '#3f3f46', unit: 'psi', domain: [2200, 3100] },
    { title: 'Flow Out vs Flow In', dataKey: 'flow_out', color: '#b91c1c', unit: 'gpm', domain: [350, 600] },
    { title: 'Active Pit Volume', dataKey: 'pit_volume', color: '#15803d', unit: 'm³', domain: [30, 48] },
  ];

  return (
    <div className="grid grid-cols-3 gap-4" data-testid="f15-parameter-charts">
      {chartConfigs.map((cfg, idx) => (
        <Card key={idx} data-testid="f15-chart" className="p-4 bg-white border border-zinc-200 rounded-lg space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-zinc-800">{cfg.title}</span>
            <span className="font-bold text-zinc-900">
              {currentTick[cfg.dataKey as keyof SimTick]} {cfg.unit}
            </span>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline.length > 0 ? timeline : [{ sec: 0, [cfg.dataKey]: 0 }]}>
                <XAxis dataKey="sec" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis domain={cfg.domain} stroke="#94a3b8" fontSize={10} tickLine={false} width={32} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', fontFamily: 'monospace', borderRadius: '6px' }}
                />
                {/* Anomaly band during loss interval (sec 90-180) */}
                <ReferenceArea x1={90} x2={180} fill="rgba(185, 28, 28, 0.08)" stroke="none" />
                <Line
                  type="monotone"
                  dataKey={cfg.dataKey}
                  stroke={cfg.color}
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ))}
    </div>
  );
};
