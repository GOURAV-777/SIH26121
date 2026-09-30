export interface Well {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kb_elevation: number;
  spud_date: string;
  completion_date?: string | null;
  rig_name: string;
  operator: string;
  target_depth_md: number;
  target_depth_tvd: number;
  status: 'active' | 'producer' | 'plugged';
  is_deviated: number;
  days: number;
  total_npt_hours: number;
  distance_km?: number;
  bearing_deg?: number;
  bearing_compass?: string;
  formations?: WellFormation[];
  casings?: WellCasing[];
  mud_programs?: WellMudProgram[];
  trajectories?: WellTrajectory[];
  event_count?: number;
  events_count?: number; // alias used in some components
  max_severity?: number;
  documents?: WellDocument[];
  total_depth_m?: number; // convenience alias for target_depth_tvd
}

export interface Formation {
  id: number;
  name: string;
  lithology: string;
  base_top_tvd: number;
  color: string;
  is_loss_zone?: number;
  is_overpressure?: number;
}

export interface WellFormation {
  id: number;
  well_id: string;
  formation_id: number;
  formation_name?: string;
  lithology?: string;
  color?: string;
  top_md: number;
  top_tvd: number;
  thickness: number;
  is_loss_zone?: number;
  is_overpressure?: number;
}

export interface WellTrajectory {
  md: number;
  tvd: number;
  inclination: number;
  azimuth: number;
  north_south: number;
  east_west: number;
  dogleg_severity: number;
}

export interface WellCasing {
  id: number;
  well_id: string;
  size_inch: number;
  name: string;
  shoe_md: number;
  shoe_tvd: number;
  cement_top_tvd: number;
  hole_size_inch: number;
}

export interface WellMudProgram {
  id: number;
  well_id: string;
  interval_top_tvd: number;
  interval_bottom_tvd: number;
  mud_type: string;
  mud_weight_sg: number;
  viscosity_cp: number;
  pore_pressure_sg: number;
  fracture_gradient_sg: number;
}

export interface DrillingEvent {
  id: string;
  well_id: string;
  date: string;
  md: number;
  tvd: number;
  formation_name: string;
  type: string;
  severity: number;
  npt_hours: number;
  cause: string;
  action: string;
  outcome: string;
  source_doc: string;
  source_page: number;
  excerpt: string;
  similarity_score?: number;
}

export interface WellDocument {
  id: string;
  well_id: string;
  filename: string;
  doc_type: string;
  page_count: number;
  date: string;
  status: string;
  preview_url?: string;
}

export interface ReviewQueueItem {
  id: string;
  doc_id: string;
  well_id: string;
  event_candidate: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  created_at: string;
}

export interface Lesson {
  id: string;
  event_type: string;
  title: string;
  symptoms: string;
  typical_causes: string;
  recommended_actions: string;
  historical_stats: string;
  case_well_ids: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_name: string;
  user_role: string;
  action: string;
  target: string;
  details: string;
}

export interface SimTick {
  sec: number;
  tvd: number;
  md: number;
  rop: number;
  wob: number;
  rpm: number;
  torque: number;
  spp: number;
  flow_in: number;
  flow_out: number;
  pit_volume: number;
  mud_weight: number;
  gas_units: number;
  alert_level: 'watch' | 'warning' | 'critical' | null;
}

export interface RiskWindow {
  tvd: number;
  mud_loss: number;
  kick: number;
  stuck_pipe: number;
  torque_spike: number;
  cementing_issue: number;
  wellbore_instability: number;
  max_risk: number;
  top_risk_type: string;
}

export interface SectionData {
  line_coords: [number, number][];
  total_distance_km: number;
  terrain_profile: { dist_km: number; elevation_asl: number }[];
  wells: Well[];
  strata: Formation[];
  faults: { x_km: number; dip_deg: number; offset_m: number; name: string }[];
  groundwater_depth_m: number;
}
