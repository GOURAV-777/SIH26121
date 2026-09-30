import React from 'react';
import { useStore } from '../../store/useStore';
import { Badge, Button, Card } from '../../components/ui';
import { Bell, Check, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AlertCenter: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert } = useStore();

  return (
    <Card className="p-4 space-y-3" data-testid="f14-alert-center">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="font-bold text-xs uppercase font-mono text-text-primary flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent-orange" /> Real-Time Alert Center
        </h3>
        <Badge variant="red" size="sm">
          {alerts.filter(a => a.status !== 'resolved').length} Active Alerts
        </Badge>
      </div>

      <div className="space-y-2">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            data-testid="f14-alert-row"
            className="p-3 bg-bg-base border border-border rounded-lg space-y-2 font-mono text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-red animate-ping" />
                <span className="font-bold text-text-primary">{alt.title}</span>
              </div>
              <Badge variant={alt.status === 'new' ? 'red' : 'teal'} size="sm">
                {alt.status.toUpperCase()}
              </Badge>
            </div>

            <p className="text-[11px] font-sans text-text-secondary">
              {alt.message}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-border text-[10px]">
              <span className="text-text-muted">Detected at {alt.tvd_depth} m TVD · {alt.created_at}</span>
              <div className="flex items-center gap-1.5">
                {alt.status === 'new' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => acknowledgeAlert(alt.id)}
                    className="text-[10px] py-0.5 px-2"
                  >
                    Acknowledge
                  </Button>
                )}
                {alt.status !== 'resolved' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => resolveAlert(alt.id)}
                    className="text-[10px] py-0.5 px-2"
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
