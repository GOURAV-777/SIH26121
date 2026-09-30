import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Lesson } from '../../types';
import { Badge, Button, Card } from '../../components/ui';
import { BookOpen, ShieldCheck, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const LessonsPlaybook: React.FC = () => {
  const { setSelectedWellId } = useStore();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    api.getLessons().then(data => setLessons(data));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="f09-lessons-playbook">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-teal" /> Drilling Lessons Learned & Playbook Library
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Engineered operational playbooks, symptom diagnostics, and verified field mitigations derived from offset wells.
          </p>
        </div>
        <Badge variant="teal" size="md">
          {lessons.length} Standard Operating Playbooks
        </Badge>
      </div>

      {/* 8+ Playbook Cards Grid (F09 acceptance: >= 8 cards) */}
      <div className="grid grid-cols-2 gap-4">
        {lessons.map((lesson) => (
          <Card
            key={lesson.id}
            data-testid="f09-lesson-card"
            className="p-4 space-y-3 hover:border-accent-teal/60 transition-all shadow-sm"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-accent-teal">{lesson.id}</span>
                <h3 className="font-bold text-sm text-text-primary">{lesson.title}</h3>
              </div>
              <Badge variant={lesson.event_type === 'mud_loss' || lesson.event_type === 'kick' ? 'red' : 'orange'} size="sm">
                {lesson.event_type.replace('_', ' ')}
              </Badge>
            </div>

            {/* Symptoms & Causes */}
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-bg-base p-2.5 rounded border border-border">
                <span className="text-accent-amber font-bold block text-[10px] uppercase mb-0.5">Telemetry Symptoms:</span>
                <p className="text-text-secondary font-sans text-xs">{lesson.symptoms}</p>
              </div>

              <div className="bg-bg-base p-2.5 rounded border border-border">
                <span className="text-text-muted font-bold block text-[10px] uppercase mb-0.5">Root Cause:</span>
                <p className="text-text-secondary font-sans text-xs">{lesson.typical_causes}</p>
              </div>
            </div>

            {/* Recommended Action Checklist */}
            <div className="bg-accent-teal/10 border border-accent-teal/30 p-2.5 rounded text-xs">
              <span className="text-accent-teal font-bold block text-[10px] uppercase mb-0.5 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> Recommended Mitigation:
              </span>
              <p className="text-text-primary text-xs leading-relaxed font-sans">{lesson.recommended_actions}</p>
            </div>

            {/* Historical Statistics & Case Wells */}
            <div className="flex items-center justify-between pt-1 border-t border-border text-[11px] font-mono">
              <div className="text-text-muted text-[10px] max-w-xs">
                <b>Outcome:</b> {lesson.historical_stats}
              </div>
              <div className="flex items-center gap-1">
                {lesson.case_well_ids.split(',').map((wid) => (
                  <button
                    key={wid}
                    onClick={() => setSelectedWellId(wid)}
                    className="px-1.5 py-0.5 rounded bg-bg-base border border-border text-accent-teal hover:bg-accent-teal hover:text-bg-base text-[10px] font-bold"
                  >
                    {wid}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
