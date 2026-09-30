import { Well, Formation, DrillingEvent, Lesson, ReviewQueueItem, AuditLog, SectionData, SimTick, RiskWindow } from '../types';

const IS_STATIC = import.meta.env.VITE_STATIC_DEMO === 'true' || true; // default to static data for robust offline demo

// In-memory cache
let wellsCache: Well[] | null = null;
let eventsCache: DrillingEvent[] | null = null;
let formationsCache: Formation[] | null = null;
let lessonsCache: Lesson[] | null = null;
let reviewCache: ReviewQueueItem[] | null = null;
let auditCache: AuditLog[] | null = null;
let riskProfileCache: RiskWindow[] | null = null;
let sectionDefaultCache: SectionData | null = null;
let simScenariosCache: Record<string, { id: string; name: string; loss_start_tvd: number; timeline: SimTick[] }> | null = null;
let analyticsCache: any = null;
let modelCardCache: any = null;

export const api = {
  async getWells(params?: { lat?: number; lon?: number; radius_km?: number }): Promise<Well[]> {
    if (!wellsCache) {
      const res = await fetch('/demo-data/wells.json');
      wellsCache = await res.json();
    }
    let list = [...(wellsCache || [])];
    if (params?.radius_km !== undefined) {
      list = list.filter(w => (w.distance_km ?? 0) <= params.radius_km!);
    }
    return list;
  },

  async getWellById(id: string): Promise<Well | undefined> {
    const wells = await this.getWells();
    return wells.find(w => w.id === id);
  },

  async getFormations(): Promise<Formation[]> {
    if (!formationsCache) {
      const res = await fetch('/demo-data/formations.json');
      formationsCache = await res.json();
    }
    return formationsCache || [];
  },

  async getEvents(filters?: {
    well_id?: string;
    formation?: string;
    type?: string;
    severity?: number;
    search?: string;
  }): Promise<DrillingEvent[]> {
    if (!eventsCache) {
      const res = await fetch('/demo-data/events.json');
      eventsCache = await res.json();
    }
    let list = [...(eventsCache || [])];
    if (filters?.well_id) list = list.filter(e => e.well_id === filters.well_id);
    if (filters?.formation) list = list.filter(e => e.formation_name.includes(filters.formation!));
    if (filters?.type) list = list.filter(e => e.type === filters.type);
    if (filters?.severity) list = list.filter(e => e.severity === filters.severity);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(e =>
        e.well_id.toLowerCase().includes(q) ||
        e.formation_name.toLowerCase().includes(q) ||
        e.cause.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.excerpt.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getLessons(): Promise<Lesson[]> {
    if (!lessonsCache) {
      const res = await fetch('/demo-data/lessons.json');
      lessonsCache = await res.json();
    }
    return lessonsCache || [];
  },

  async getReviewQueue(): Promise<ReviewQueueItem[]> {
    if (!reviewCache) {
      const res = await fetch('/demo-data/review_queue.json');
      reviewCache = await res.json();
    }
    return reviewCache || [];
  },

  async approveReviewItem(id: string): Promise<boolean> {
    const queue = await this.getReviewQueue();
    const item = queue.find(q => q.id === id);
    if (item) {
      item.status = 'approved';
      await this.addAuditLog('APPROVE_EXTRACTION', id, `Approved extracted event from ${item.doc_id}`);
      return true;
    }
    return false;
  },

  async rejectReviewItem(id: string): Promise<boolean> {
    const queue = await this.getReviewQueue();
    const item = queue.find(q => q.id === id);
    if (item) {
      item.status = 'rejected';
      await this.addAuditLog('REJECT_EXTRACTION', id, `Rejected extraction candidate from ${item.doc_id}`);
      return true;
    }
    return false;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    if (!auditCache) {
      const res = await fetch('/demo-data/audit_logs.json');
      auditCache = await res.json();
    }
    return auditCache || [];
  },

  async addAuditLog(action: string, target: string, details: string): Promise<void> {
    const logs = await this.getAuditLogs();
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user_name: 'Current User',
      user_role: 'Lead Engineer',
      action,
      target,
      details,
    };
    logs.unshift(newLog);
  },

  async getSectionData(wellIds?: string[]): Promise<SectionData> {
    if (!sectionDefaultCache) {
      const res = await fetch('/demo-data/section_default.json');
      sectionDefaultCache = await res.json();
    }
    const allWells = await this.getWells();
    const strata = await this.getFormations();
    
    // Select wells on the section line
    const targetWells = wellIds && wellIds.length > 0
      ? allWells.filter(w => wellIds.includes(w.id))
      : allWells.filter(w => ['DEMO-ACTIVE-01', 'DEMO-A-01', 'DEMO-B-02', 'DEMO-C-03'].includes(w.id));

    return {
      ...sectionDefaultCache!,
      wells: targetWells,
      strata: strata,
    };
  },

  async getRiskProfile(): Promise<RiskWindow[]> {
    if (!riskProfileCache) {
      const res = await fetch('/demo-data/risk_profile.json');
      riskProfileCache = await res.json();
    }
    return riskProfileCache || [];
  },

  async getSimScenarios(): Promise<Record<string, { id: string; name: string; loss_start_tvd: number; timeline: SimTick[] }>> {
    if (!simScenariosCache) {
      const res = await fetch('/demo-data/sim_scenarios.json');
      simScenariosCache = await res.json();
    }
    return simScenariosCache || {};
  },

  async getAnalytics(): Promise<any> {
    if (!analyticsCache) {
      const res = await fetch('/demo-data/analytics.json');
      analyticsCache = await res.json();
    }
    return analyticsCache;
  },

  async getModelCard(): Promise<any> {
    if (!modelCardCache) {
      const res = await fetch('/demo-data/model_card.json');
      modelCardCache = await res.json();
    }
    return modelCardCache;
  },

  // Deterministic Ask the Wells RAG Chat (F08)
  async queryChat(question: string): Promise<{
    answer: string;
    citations: { well_id: string; doc: string; page: number; excerpt: string }[];
    records: DrillingEvent[];
  }> {
    const q = question.toLowerCase();
    const events = await this.getEvents();

    if (q.includes('formation x') || q.includes('loss') || q.includes('mud loss') || q.includes('barail')) {
      const matchEvents = events.filter(e => e.formation_name.includes('Formation X') && e.type === 'mud_loss').slice(0, 4);
      return {
        answer: `In **Formation X (Barail Coal-Sand, 2,440–2,500 m TVD)**, **3 of the 4 nearest offset wells** (DEMO-A-01, DEMO-B-02, DEMO-C-03) experienced severe to total lost circulation due to micro-fractured coal cleats. The documented effective mitigation across offsets was pumping **35–40 ppb coarse LCM pills (NutPlug + Mica)**, reducing ROP to <8 m/hr, and pre-emptively lowering mud weight by 0.03 SG.`,
        citations: [
          { well_id: 'DEMO-A-01', doc: 'DDR-DEMO-A-01-BUNDLE.pdf', page: 8, excerpt: 'At 2510m MD (2448m TVD) experienced abrupt mud loss of 18 m3/hr into Barail coal seam. Mixed and spotted 40 ppb LCM pill.' },
          { well_id: 'DEMO-B-02', doc: 'DDR-DEMO-B-02-BUNDLE.pdf', page: 12, excerpt: 'Total loss encountered at 2470m TVD. Pit volume dropped 22 m3 in 25 mins. Spot 50 ppb LCM squeeze.' },
          { well_id: 'DEMO-C-03', doc: 'DDR-DEMO-C-03-BUNDLE.pdf', page: 7, excerpt: 'Loss rate 12 m3/hr at 2455m TVD in Formation X Barail Coal. Pumped fiber LCM pill. Drilled ahead.' }
        ],
        records: matchEvents
      };
    } else if (q.includes('stuck') || q.includes('2360') || q.includes('surma') || q.includes('torque')) {
      const matchEvents = events.filter(e => e.formation_name.includes('Surma') && (e.type === 'stuck_pipe' || e.type === 'torque_spike')).slice(0, 3);
      return {
        answer: `Near **2,360 m TVD in the Surma Group**, reactive interbedded sandstones and shales caused differential sticking in DEMO-A-01 and severe torque oscillations in DEMO-E-05. Immediate jarring with **80 klbs force combined with spotting pipe-freeing surfactant pills** and glycol sweeps successfully resolved the sticking within 9 hours.`,
        citations: [
          { well_id: 'DEMO-A-01', doc: 'DDR-DEMO-A-01-BUNDLE.pdf', page: 5, excerpt: 'String differentially stuck at 2362m TVD in Surma interbedded sand. Jarred string free after spotting freeing pill.' },
          { well_id: 'DEMO-E-05', doc: 'DDR-DEMO-E-05-BUNDLE.pdf', page: 6, excerpt: 'Severe torque spikes observed near 2358m TVD. Swept hole with glycol pill, reduced string drag.' }
        ],
        records: matchEvents
      };
    } else if (q.includes('kick') || q.includes('kopili') || q.includes('overpressure') || q.includes('3000') || q.includes('3100')) {
      const matchEvents = events.filter(e => e.formation_name.includes('Kopili') && (e.type === 'kick' || e.type === 'overpressure')).slice(0, 3);
      return {
        answer: `In the **Kopili Shale transition zone (3,080–3,150 m TVD)**, offset wells DEMO-B-02 and DEMO-G-07 recorded pore pressure ramps up to 1.52 SG EMW. DEMO-B-02 experienced a 2.8 m³ pit gain kick and was successfully controlled using the **Driller's Method with 1.58 SG kill mud** with zero casing shoe breakdown.`,
        citations: [
          { well_id: 'DEMO-B-02', doc: 'DDR-DEMO-B-02-BUNDLE.pdf', page: 16, excerpt: 'Pit gain of 2.8 m3 observed at 3125m TVD in Kopili. Shut in well, killed with 1.58 SG mud.' },
          { well_id: 'DEMO-G-07', doc: 'DDR-DEMO-G-07-BUNDLE.pdf', page: 11, excerpt: 'High background gas and overpressure indicator at 3110m TVD. Weighted mud up to 1.54 SG.' }
        ],
        records: matchEvents
      };
    } else {
      return {
        answer: `Searched 190 events across 13 offset wells in the block. Found relevant operational records matching keywords in the active formation window. Please refine query by specifying formation name (e.g. Formation X, Surma, Kopili) or depth interval.`,
        citations: [
          { well_id: 'DEMO-A-01', doc: 'DDR-DEMO-A-01-BUNDLE.pdf', page: 8, excerpt: 'Routine and event logs indexed for DEMO-A-01.' }
        ],
        records: events.slice(0, 3)
      };
    }
  }
};
