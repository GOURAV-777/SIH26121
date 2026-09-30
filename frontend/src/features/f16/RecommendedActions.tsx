import React, { useState } from 'react';
import { useStore, AlertItem } from '../../store/useStore';
import { api } from '../../lib/api';
import { Badge, Button, Card } from '../../components/ui';
import { CheckSquare, Square, ThumbsUp, ThumbsDown, CheckCircle2, ShieldCheck } from 'lucide-react';

export const RecommendedActions: React.FC<{ alert?: AlertItem }> = ({ alert }) => {
  const { alerts, toggleActionItem, applyFeedback, alertSensitivity } = useStore();
  const currentAlert = alert || alerts[0];
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);

  if (!currentAlert) return null;

  const handleFeedback = async (type: 'useful' | 'false_alarm' | 'known') => {
    applyFeedback(currentAlert.id, type);
    await api.addAuditLog('ALERT_FEEDBACK', currentAlert.id, `User marked alert as ${type}. Adjusted sensitivity to ${alertSensitivity.toFixed(2)}`);
    setFeedbackGiven(type);
  };

  return (
    <Card className="p-4 space-y-3" data-testid="f16-recommended-actions">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="font-bold text-xs uppercase font-mono text-text-primary flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent-teal" /> Actionable Mitigation Checklist
        </h3>
        <span className="text-[11px] font-mono text-text-muted">Sensitivity: {alertSensitivity.toFixed(2)}</span>
      </div>

      {/* Action Items Checklist */}
      <div className="space-y-2 font-mono text-xs">
        {currentAlert.actions.map((act, idx) => (
          <div
            key={idx}
            onClick={() => toggleActionItem(currentAlert.id, idx)}
            className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
              act.done
                ? 'bg-accent-green/10 border-accent-green/40 text-accent-green line-through'
                : 'bg-bg-base border-border text-text-primary hover:border-accent-teal/40'
            }`}
          >
            {act.done ? (
              <CheckSquare className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
            )}
            <span className="text-xs font-sans">{act.text}</span>
          </div>
        ))}
      </div>

      {/* Feedback Loop Buttons (F16 acceptance) */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono">
        <span className="text-text-secondary text-[11px]">Was this alert useful?</span>
        {feedbackGiven ? (
          <span className="text-accent-teal font-bold text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Feedback Logged
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button
              data-testid="f16-feedback-useful"
              size="sm"
              variant="secondary"
              onClick={() => handleFeedback('useful')}
              className="text-[10px] py-1 px-2 gap-1"
            >
              <ThumbsUp className="w-3 h-3 text-accent-teal" /> Useful
            </Button>
            <Button
              data-testid="f16-feedback-false-alarm"
              size="sm"
              variant="danger"
              onClick={() => handleFeedback('false_alarm')}
              className="text-[10px] py-1 px-2 gap-1"
            >
              <ThumbsDown className="w-3 h-3 text-accent-red" /> False Alarm
            </Button>
            <Button
              data-testid="f16-feedback-known"
              size="sm"
              variant="ghost"
              onClick={() => handleFeedback('known')}
              className="text-[10px] py-1 px-2"
            >
              Already Known
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
