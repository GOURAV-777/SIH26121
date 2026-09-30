import React from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui';
import { ChevronRight, Play } from 'lucide-react';

export const DEMO_TOUR_STEPS = [
  { title: '1. Command Center', desc: 'Central mission control monitoring DEMO-ACTIVE-01, active risk timeline, and key performance metrics across 14 synthetic block wells.' },
  { title: '2. Area Map & Offset Wells', desc: 'Top-down GIS view showing 14 block wells near Duliajan. Interactive radius circle filters offset wells and auto-generates cross-section line.' },
  { title: '3. Subsurface Cross-Section', desc: 'Signature geoscience illustration rendering 10 formation strata, deviated trajectories, casing shoes, and the Formation X loss zone hazard.' },
  { title: '4. Document Ingestion & Extraction', desc: 'Ingestion pipeline with live OCR stepper extracting events from Daily Drilling Reports and routing low-confidence items to human review.' },
  { title: '5. Ask the Wells (RAG Intelligence)', desc: 'Natural language querying across offset records with citations [DEMO-B-03, p.7] and historical mitigation synthesis.' },
  { title: '6. Live Drilling Simulator', desc: 'Real-time 1 Hz telemetry stream detecting flow-out drop and pit volume loss in Formation X with explainable SHAP feature attribution.' },
  { title: '7. Pre-Drill Risk Brief Builder', desc: 'Automated 6-section pre-drill intelligence brief with casing recommendations and printable report export.' },
  { title: '8. Drilling Analytics & Lessons', desc: 'Comprehensive NPT distribution by lithology, formation correlation matrix, and audited playbook lessons.' },
];

export const DemoGuideOverlay: React.FC = () => {
  const { isDemoPlaying, demoStep, nextDemoStep, exitDemo, startDemo } = useStore();

  if (!isDemoPlaying) {
    return (
      <Button
        size="sm"
        variant="primary"
        onClick={startDemo}
        className="gap-1.5 text-xs font-bold"
        data-testid="f23-demo-start-btn"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Play Demo (D)</span>
      </Button>
    );
  }

  const stepInfo = DEMO_TOUR_STEPS[demoStep] || DEMO_TOUR_STEPS[0];

  return (
    <div
      className="bg-gradient-to-r from-bg-surface via-bg-raised to-bg-surface border-b-2 border-accent-teal p-3 px-6 flex items-center justify-between shadow-lg z-30"
      data-testid="f23-demo-controls"
    >
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-accent-teal text-bg-base">
          DEMO TOUR · {demoStep + 1}/{DEMO_TOUR_STEPS.length}
        </span>
        <div>
          <div className="font-bold text-sm text-text-primary" data-testid="f23-demo-caption">
            {stepInfo.title}
          </div>
          <div className="text-xs text-text-secondary">{stepInfo.desc}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={exitDemo}>
          Exit Tour
        </Button>
        <Button size="sm" variant="primary" onClick={nextDemoStep} className="gap-1">
          <span>{demoStep === DEMO_TOUR_STEPS.length - 1 ? 'Finish' : 'Next Step'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
