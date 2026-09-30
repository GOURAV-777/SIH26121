import React, { useEffect, Suspense, lazy } from 'react';
import { useStore } from '../store/useStore';
import { AppLayout } from '../components/layout/AppLayout';
import { WellDetailDrawer } from '../features/f04/WellDetailDrawer';

// ── Feature components (lazy-loaded for code-splitting) ──────────────────────
const CommandCenter      = lazy(() => import('../features/f00/CommandCenter').then(m => ({ default: m.CommandCenter })));
const AreaMap            = lazy(() => import('../features/f01/AreaMap').then(m => ({ default: m.AreaMap })));
const CrossSection       = lazy(() => import('../features/f02/CrossSection').then(m => ({ default: m.CrossSection })));
const LiveSimulator      = lazy(() => import('../features/f13/LiveSimulator').then(m => ({ default: m.LiveSimulator })));
const AskWellsChat       = lazy(() => import('../features/f08/AskWellsChat').then(m => ({ default: m.AskWellsChat })));
const KnowledgeRepo      = lazy(() => import('../features/f07/KnowledgeRepo').then(m => ({ default: m.KnowledgeRepo })));
const DocumentIngest     = lazy(() => import('../features/f05/DocumentIngest').then(m => ({ default: m.DocumentIngest })));
const AnalyticsDashboard = lazy(() => import('../features/f18/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const PreDrillBrief      = lazy(() => import('../features/f17/PreDrillBrief').then(m => ({ default: m.PreDrillBrief })));
const SettingsAudit      = lazy(() => import('../features/f22/SettingsAudit').then(m => ({ default: m.SettingsAudit })));

// Also available (accessible via sub-navigation inside parent views):
// F03 RadiusSectionTool  — embedded inside AreaMap
// F06 ReviewQueue        — accessible from DocumentIngest / Knowledge nav
// F09 LessonsPlaybook    — accessible from Knowledge nav
// F10 FormationCorrelation — standalone tab (routed below)
// F11 RiskPrediction     — routed below
// F12 ExplainableAlerts  — routed below
// F14 AlertCenter        — routed below (also embedded in LiveSimulator)
// F15 LiveParameterCharts — embedded inside LiveSimulator
// F16 RecommendedActions — embedded inside LiveSimulator
// F19 WellComparison     — routed below
// F20 WellTimeline       — routed below
// F21 CasingProgram      — routed below

const ReviewQueue        = lazy(() => import('../features/f06/ReviewQueue').then(m => ({ default: m.ReviewQueue })));
const LessonsPlaybook    = lazy(() => import('../features/f09/LessonsPlaybook').then(m => ({ default: m.LessonsPlaybook })));
const FormationCorrelation = lazy(() => import('../features/f10/FormationCorrelation').then(m => ({ default: m.FormationCorrelation })));
const RiskPrediction     = lazy(() => import('../features/f11/RiskPrediction').then(m => ({ default: m.RiskPrediction })));
const ExplainableAlerts  = lazy(() => import('../features/f12/ExplainableAlerts').then(m => ({ default: m.ExplainableAlerts })));
const AlertCenter        = lazy(() => import('../features/f14/AlertCenter').then(m => ({ default: m.AlertCenter })));
const WellComparison     = lazy(() => import('../features/f19/WellComparison').then(m => ({ default: m.WellComparison })));
const WellTimeline       = lazy(() => import('../features/f20/WellTimeline').then(m => ({ default: m.WellTimeline })));
const CasingProgram      = lazy(() => import('../features/f21/CasingProgram').then(m => ({ default: m.CasingProgram })));

// ── Route map ────────────────────────────────────────────────────────────────
// This is a simple string-keyed router — no react-router needed for a demo
const ROUTES: Record<string, React.LazyExoticComponent<React.FC>> = {
  'command-center'    : CommandCenter,
  'map'               : AreaMap,
  'section'           : CrossSection,
  'live'              : LiveSimulator,
  'chat'              : AskWellsChat,
  'knowledge'         : KnowledgeRepo,
  'review-queue'      : ReviewQueue,
  'lessons'           : LessonsPlaybook,
  'correlation'       : FormationCorrelation,
  'risk'              : RiskPrediction,
  'alerts'            : AlertCenter,
  'explain'           : ExplainableAlerts,
  'ingest'            : DocumentIngest,
  'analytics'         : AnalyticsDashboard,
  'comparison'        : WellComparison,
  'timeline'          : WellTimeline,
  'casing'            : CasingProgram,
  'brief'             : PreDrillBrief,
  'settings'          : SettingsAudit,
};

// ── Fallback skeleton ─────────────────────────────────────────────────────────
const PageSkeleton: React.FC = () => (
  <div className="p-6 space-y-4 animate-pulse">
    <div className="h-8 bg-bg-raised rounded w-1/3" />
    <div className="h-4 bg-bg-raised rounded w-2/3" />
    <div className="grid grid-cols-4 gap-4 mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-bg-raised rounded-lg" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="h-64 bg-bg-raised rounded-lg" />
      <div className="h-64 bg-bg-raised rounded-lg" />
    </div>
  </div>
);

// ── Main App ─────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const { currentRoute, loadStaticData, selectedWellId, setSelectedWellId } = useStore();

  // Load static demo data on mount
  useEffect(() => {
    loadStaticData();
  }, [loadStaticData]);

  // Apply ?demo=1 URL param to auto-start demo tour
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
      useStore.getState().startDemo();
    }
  }, []);

  const PageComponent = ROUTES[currentRoute] ?? CommandCenter;

  return (
    <AppLayout>
      <Suspense fallback={<PageSkeleton />}>
        <PageComponent />
      </Suspense>

      {/* F04 Well Detail Drawer — mounted globally so it can be triggered from any view */}
      {selectedWellId && (
        <WellDetailDrawer
          wellId={selectedWellId}
          onClose={() => setSelectedWellId(null)}
        />
      )}
    </AppLayout>
  );
};
