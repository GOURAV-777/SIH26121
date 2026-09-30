import json
import math
import os
import sqlite3
from pathlib import Path
import numpy as np

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DB_PATH = DATA_DIR / "nwis.db"
STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "demo-data"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_bearing(lat1, lon1, lat2, lon2):
    dlon = math.radians(lon2 - lon1)
    lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
    x = math.sin(dlon) * math.cos(lat2_r)
    y = math.cos(lat1_r) * math.sin(lat2_r) - (math.sin(lat1_r) * math.cos(lat2_r) * math.cos(dlon))
    initial_bearing = math.atan2(x, y)
    initial_bearing = math.degrees(initial_bearing)
    return (initial_bearing + 360) % 360

def export_all():
    print("Exporting static JSON bundle to frontend/public/demo-data/...")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # 1. Wells list with distances from DEMO-ACTIVE-01
    cur.execute("SELECT * FROM wells")
    wells = [dict(r) for r in cur.fetchall()]
    active_well = next(w for w in wells if w["id"] == "DEMO-ACTIVE-01")

    for w in wells:
        if w["id"] == active_well["id"]:
            w["distance_km"] = 0.0
            w["bearing_deg"] = 0.0
            w["bearing_compass"] = "-"
        else:
            d = haversine(active_well["lat"], active_well["lon"], w["lat"], w["lon"])
            b = calculate_bearing(active_well["lat"], active_well["lon"], w["lat"], w["lon"])
            w["distance_km"] = round(d, 2)
            w["bearing_deg"] = round(b, 1)
            dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
            w["bearing_compass"] = dirs[round(b / (360. / len(dirs))) % len(dirs)]

        # Fetch formations for well
        cur.execute("""
            SELECT wf.*, f.name as formation_name, f.lithology, f.color, f.is_loss_zone, f.is_overpressure
            FROM well_formations wf
            JOIN formations f ON wf.formation_id = f.id
            WHERE wf.well_id = ?
            ORDER BY wf.top_tvd ASC
        """, (w["id"],))
        w["formations"] = [dict(r) for r in cur.fetchall()]

        # Fetch casings
        cur.execute("SELECT * FROM well_casings WHERE well_id = ? ORDER BY shoe_tvd ASC", (w["id"],))
        w["casings"] = [dict(r) for r in cur.fetchall()]

        # Fetch mud programs
        cur.execute("SELECT * FROM well_mud_programs WHERE well_id = ? ORDER BY interval_top_tvd ASC", (w["id"],))
        w["mud_programs"] = [dict(r) for r in cur.fetchall()]

        # Fetch trajectories
        cur.execute("SELECT md, tvd, inclination, azimuth, north_south, east_west, dogleg_severity FROM well_trajectories WHERE well_id = ? ORDER BY md ASC", (w["id"],))
        w["trajectories"] = [dict(r) for r in cur.fetchall()]

        # Fetch events count & top event
        cur.execute("SELECT COUNT(*), MAX(severity) FROM events WHERE well_id = ?", (w["id"],))
        ev_count, max_sev = cur.fetchone()
        w["event_count"] = ev_count or 0
        w["max_severity"] = max_sev or 0

        # Fetch linked documents
        cur.execute("SELECT * FROM documents WHERE well_id = ?", (w["id"],))
        w["documents"] = [dict(r) for r in cur.fetchall()]

    (STATIC_DIR / "wells.json").write_text(json.dumps(wells, indent=2), encoding="utf-8")

    # 2. Formations master list
    cur.execute("SELECT * FROM formations ORDER BY base_top_tvd ASC")
    formations = [dict(r) for r in cur.fetchall()]
    (STATIC_DIR / "formations.json").write_text(json.dumps(formations, indent=2), encoding="utf-8")

    # 3. Events list
    cur.execute("SELECT * FROM events ORDER BY date DESC")
    events = [dict(r) for r in cur.fetchall()]
    (STATIC_DIR / "events.json").write_text(json.dumps(events, indent=2), encoding="utf-8")

    # 4. Lessons playbook
    cur.execute("SELECT * FROM lessons")
    lessons = [dict(r) for r in cur.fetchall()]
    (STATIC_DIR / "lessons.json").write_text(json.dumps(lessons, indent=2), encoding="utf-8")

    # 5. Review queue
    cur.execute("SELECT * FROM review_queue")
    review_queue = [dict(r) for r in cur.fetchall()]
    (STATIC_DIR / "review_queue.json").write_text(json.dumps(review_queue, indent=2), encoding="utf-8")

    # 6. Audit logs
    cur.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC")
    audit_logs = [dict(r) for r in cur.fetchall()]
    (STATIC_DIR / "audit_logs.json").write_text(json.dumps(audit_logs, indent=2), encoding="utf-8")

    # 7. Model Card & Risk data
    model_card = json.loads((DATA_DIR / "models" / "model_card.json").read_text(encoding="utf-8"))
    (STATIC_DIR / "model_card.json").write_text(json.dumps(model_card, indent=2), encoding="utf-8")

    # Risk strip by 20m depth window for DEMO-ACTIVE-01
    risk_windows = []
    for tvd in range(100, 3450, 20):
        # Mud loss risk spikes in Formation X (2440 to 2500)
        p_loss = 0.88 if 2430 <= tvd <= 2500 else (0.15 if 1000 <= tvd <= 1200 else 0.04)
        p_kick = 0.82 if 3080 <= tvd <= 3160 else 0.03
        p_stuck = 0.74 if 2340 <= tvd <= 2380 else 0.05
        p_torque = 0.65 if 2250 <= tvd <= 2380 else 0.06
        p_cement = 0.45 if 900 <= tvd <= 980 else 0.02
        p_instability = 0.58 if 1700 <= tvd <= 1950 else 0.05

        max_risk_val = max(p_loss, p_kick, p_stuck, p_torque, p_cement, p_instability)
        risk_windows.append({
            "tvd": tvd,
            "mud_loss": round(p_loss, 3),
            "kick": round(p_kick, 3),
            "stuck_pipe": round(p_stuck, 3),
            "torque_spike": round(p_torque, 3),
            "cementing_issue": round(p_cement, 3),
            "wellbore_instability": round(p_instability, 3),
            "max_risk": round(max_risk_val, 3),
            "top_risk_type": "mud_loss" if max_risk_val == p_loss else ("kick" if max_risk_val == p_kick else "stuck_pipe")
        })
    (STATIC_DIR / "risk_profile.json").write_text(json.dumps(risk_windows, indent=2), encoding="utf-8")

    # 8. Cross-Section Profile for default auto-section
    # Default line goes through DEMO-ACTIVE-01 and 3 nearest offsets (DEMO-A-01, DEMO-B-02, DEMO-C-03)
    section_wells = [w for w in wells if w["id"] in ["DEMO-ACTIVE-01", "DEMO-A-01", "DEMO-B-02", "DEMO-C-03"]]
    section_data = {
        "line_coords": [[active_well["lon"] - 0.02, active_well["lat"] - 0.015], [active_well["lon"] + 0.02, active_well["lat"] + 0.015]],
        "total_distance_km": 5.4,
        "terrain_profile": [
            {"dist_km": 0.0, "elevation_asl": 115.0},
            {"dist_km": 1.2, "elevation_asl": 118.0},
            {"dist_km": 2.4, "elevation_asl": 108.0}, # river dip
            {"dist_km": 3.8, "elevation_asl": 122.0},
            {"dist_km": 5.4, "elevation_asl": 114.0},
        ],
        "wells": section_wells,
        "strata": formations,
        "faults": [{"x_km": 2.1, "dip_deg": 65, "offset_m": 28.0, "name": "Fault F-1 (Synthetic)"}],
        "groundwater_depth_m": 12.0
    }
    (STATIC_DIR / "section_default.json").write_text(json.dumps(section_data, indent=2), encoding="utf-8")

    # 9. Live Drilling Simulator Timelines (Scenarios A, B, C)
    # 1 Hz second-by-second data for 300 seconds
    sim_scenarios = {}
    
    # Scenario A: Formation X Mud Loss
    timeline_a = []
    curr_tvd = 2410.0
    curr_pit = 42.0
    curr_rop = 14.5
    for sec in range(240):
        # bit advances
        curr_tvd += 0.35 # ~20 m/hr
        flow_in = 520.0
        
        # Loss event starts around sec 90 (tvd ~ 2442 - 2452)
        is_in_loss = (sec >= 90 and sec <= 180)
        flow_out = (flow_in * 0.82) if is_in_loss else (flow_in + np.random.uniform(-4, 4))
        if is_in_loss:
            curr_pit = max(34.0, curr_pit - 0.08) # loses ~6 m3
            spp = 2550.0 + np.random.uniform(-30, 30) # slight pressure drop
            torque = 9.8 + np.random.uniform(-0.5, 0.5)
            rop = 22.0 if sec < 110 else 6.0 # drillers slow down after loss
        else:
            spp = 2750.0 + np.random.uniform(-25, 25)
            torque = 8.5 + np.random.uniform(-0.4, 0.4)
            rop = 14.0 + np.random.uniform(-1.5, 1.5)

        timeline_a.append({
            "sec": sec,
            "tvd": round(curr_tvd, 2),
            "md": round(curr_tvd * 1.02, 2),
            "rop": round(rop, 1),
            "wob": round(16.5 + np.random.uniform(-1, 1), 1),
            "rpm": 110,
            "torque": round(torque, 1),
            "spp": round(spp, 0),
            "flow_in": flow_in,
            "flow_out": round(flow_out, 1),
            "pit_volume": round(curr_pit, 2),
            "mud_weight": 1.34 if sec < 130 else 1.31, # MW reduced per mitigation
            "gas_units": round(35 + np.random.uniform(-5, 8), 1),
            "alert_level": "critical" if sec >= 90 else ("warning" if sec >= 40 else "watch")
        })
    sim_scenarios["A"] = {
        "id": "A",
        "name": "Formation X Mud Loss (Default)",
        "loss_start_tvd": 2452.0,
        "timeline": timeline_a
    }

    # Scenario B: Kopili Kick
    timeline_b = []
    curr_tvd_b = 3090.0
    curr_pit_b = 40.0
    for sec in range(240):
        curr_tvd_b += 0.25
        flow_in = 480.0
        is_kick = (sec >= 80 and sec <= 170)
        flow_out = (flow_in * 1.14) if is_kick else (flow_in + np.random.uniform(-3, 3))
        if is_kick:
            curr_pit_b = min(44.5, curr_pit_b + 0.05) # pit gain
            gas = 1200.0 + np.random.uniform(-50, 100)
            spp = 2950.0 + np.random.uniform(-40, 40)
        else:
            gas = 45.0 + np.random.uniform(-5, 5)
            spp = 2800.0 + np.random.uniform(-20, 20)

        timeline_b.append({
            "sec": sec,
            "tvd": round(curr_tvd_b, 2),
            "md": round(curr_tvd_b * 1.03, 2),
            "rop": round(9.0 + np.random.uniform(-1, 1), 1),
            "wob": 18.0,
            "rpm": 95,
            "torque": round(10.2 + np.random.uniform(-0.5, 0.5), 1),
            "spp": round(spp, 0),
            "flow_in": flow_in,
            "flow_out": round(flow_out, 1),
            "pit_volume": round(curr_pit_b, 2),
            "mud_weight": 1.52 if sec < 120 else 1.58,
            "gas_units": round(gas, 1),
            "alert_level": "critical" if sec >= 80 else ("warning" if sec >= 35 else "watch")
        })
    sim_scenarios["B"] = {
        "id": "B",
        "name": "Kopili Shale Overpressure & Kick",
        "loss_start_tvd": 3120.0,
        "timeline": timeline_b
    }

    # Scenario C: Surma Torque & Stuck Precursor
    timeline_c = []
    curr_tvd_c = 2330.0
    for sec in range(240):
        curr_tvd_c += 0.30
        is_stuck = (sec >= 75 and sec <= 160)
        torque = (18.5 + np.random.uniform(-2, 4)) if is_stuck else (8.5 + np.random.uniform(-0.5, 0.5))
        rop = 3.0 if is_stuck else (12.0 + np.random.uniform(-1, 1))

        timeline_c.append({
            "sec": sec,
            "tvd": round(curr_tvd_c, 2),
            "md": round(curr_tvd_c * 1.02, 2),
            "rop": round(rop, 1),
            "wob": 19.0,
            "rpm": 120 if is_stuck else 105,
            "torque": round(torque, 1),
            "spp": round(2650.0 + np.random.uniform(-30, 30), 0),
            "flow_in": 510.0,
            "flow_out": 510.0 + np.random.uniform(-2, 2),
            "pit_volume": 41.5,
            "mud_weight": 1.28,
            "gas_units": round(28 + np.random.uniform(-4, 4), 1),
            "alert_level": "critical" if sec >= 75 else ("warning" if sec >= 30 else "watch")
        })
    sim_scenarios["C"] = {
        "id": "C",
        "name": "Surma Reactive Torque & Stuck Precursor",
        "loss_start_tvd": 2360.0,
        "timeline": timeline_c
    }

    (STATIC_DIR / "sim_scenarios.json").write_text(json.dumps(sim_scenarios, indent=2), encoding="utf-8")

    # 10. Analytics Summary (F18)
    cur.execute("SELECT COUNT(*) FROM wells")
    total_wells = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM documents")
    total_docs = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*), SUM(npt_hours) FROM events")
    total_evs, total_npt = cur.fetchone()

    # NPT by event type
    cur.execute("SELECT type, COUNT(*), SUM(npt_hours), AVG(severity) FROM events GROUP BY type ORDER BY SUM(npt_hours) DESC")
    npt_by_type = [{"type": r[0], "count": r[1], "npt_hours": round(r[2], 1), "avg_severity": round(r[3], 2)} for r in cur.fetchall()]

    # Events by formation
    cur.execute("SELECT formation_name, COUNT(*), SUM(npt_hours) FROM events GROUP BY formation_name ORDER BY COUNT(*) DESC")
    events_by_formation = [{"formation": r[0], "count": r[1], "npt_hours": round(r[2], 1)} for r in cur.fetchall()]

    analytics = {
        "kpis": {
            "total_wells": total_wells,
            "total_docs_processed": total_docs,
            "total_events_indexed": total_evs,
            "total_npt_hours": round(total_npt, 1),
            "mitigation_documented_pct": 84.5,
            "extraction_accuracy_pct": 93.8,
            "active_alerts_count": 1
        },
        "npt_by_type": npt_by_type,
        "events_by_formation": events_by_formation,
        "depth_distribution": [
            {"depth_range": "0 - 500m", "count": 12},
            {"depth_range": "500 - 1000m", "count": 24},
            {"depth_range": "1000 - 1500m", "count": 28},
            {"depth_range": "1500 - 2000m", "count": 35},
            {"depth_range": "2000 - 2500m", "count": 52}, # peak in Surma & Formation X!
            {"depth_range": "2500 - 3000m", "count": 22},
            {"depth_range": "3000 - 3500m", "count": 17},
        ]
    }
    (STATIC_DIR / "analytics.json").write_text(json.dumps(analytics, indent=2), encoding="utf-8")

    conn.close()
    print("Static export successfully written to frontend/public/demo-data/")

if __name__ == "__main__":
    export_all()
