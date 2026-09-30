import json
import os
import sqlite3
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PDFS_DIR = DATA_DIR / "pdfs"
PDFS_DIR.mkdir(parents=True, exist_ok=True)
OCR_DIR = DATA_DIR / "precomputed_ocr"
OCR_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "nwis.db"

def build_pdf_document(filepath, title, well_name, pages_data):
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=letter,
        rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36
    )
    styles = getSampleStyleSheet()
    header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Heading2'],
        fontSize=13,
        textColor=colors.HexColor('#181d2a'),
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#222a3a')
    )
    story = []

    for page_idx, pdata in enumerate(pages_data, start=1):
        # Header banner
        header_table = Table([
            [Paragraph(f"<b>OIL INDIA LIMITED</b> — Daily Drilling Report (Synthetic)", header_style),
             Paragraph(f"<b>Page {page_idx} of {len(pages_data)}</b>", body_style)],
            [Paragraph(f"<b>Well:</b> {well_name} | <b>Rig:</b> {pdata.get('rig', 'OIL E-1200')}", body_style),
             Paragraph(f"<b>Date:</b> {pdata.get('date', '2023-05-18')} | <b>Depth:</b> {pdata.get('depth_md', '2,450')} m MD", body_style)]
        ], colWidths=[4.0*inch, 3.0*inch])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 10))

        # Operations Table
        ops_data = [
            [Paragraph("<b>Time (hrs)</b>", body_style),
             Paragraph("<b>Depth (m MD)</b>", body_style),
             Paragraph("<b>Operation / Lithology / Remarks</b>", body_style)]
        ]
        for row in pdata.get("operations", []):
            ops_data.append([
                Paragraph(row[0], body_style),
                Paragraph(str(row[1]), body_style),
                Paragraph(row[2], body_style)
            ])
        
        ops_table = Table(ops_data, colWidths=[1.2*inch, 1.2*inch, 4.6*inch])
        ops_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(ops_table)
        story.append(Spacer(1, 10))

        # Mud & Parameter Summary
        if "params" in pdata:
            param_data = [
                [Paragraph("<b>Mud Weight:</b> " + pdata["params"].get("mw", "1.34 SG"), body_style),
                 Paragraph("<b>PV / YP:</b> " + pdata["params"].get("pv", "18 cp / 24 lb"), body_style),
                 Paragraph("<b>Flow In/Out:</b> " + pdata["params"].get("flow", "550 / 550 gpm"), body_style)],
                [Paragraph("<b>SPP:</b> " + pdata["params"].get("spp", "2,850 psi"), body_style),
                 Paragraph("<b>Torque:</b> " + pdata["params"].get("torque", "9.2 kft-lbs"), body_style),
                 Paragraph("<b>Gas Units:</b> " + pdata["params"].get("gas", "45 units"), body_style)]
            ]
            ptable = Table(param_data, colWidths=[2.3*inch, 2.3*inch, 2.4*inch])
            ptable.setStyle(TableStyle([
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ]))
            story.append(ptable)

        if page_idx < len(pages_data):
            story.append(PageBreak())

    doc.build(story)

def generate_all_pdfs():
    print("Generating synthetic drilling PDF bundle...")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Query all events mapped to source docs
    cur.execute("SELECT well_id, source_doc, source_page, excerpt, md, tvd, type, formation_name, action FROM events")
    events = cur.fetchall()
    
    # Group events by source doc
    doc_events = {}
    for wid, sdoc, spage, excerpt, md, tvd, etype, form, action in events:
        if sdoc not in doc_events:
            doc_events[sdoc] = []
        doc_events[sdoc].append({
            "well_id": wid, "page": spage, "excerpt": excerpt, "md": md, "tvd": tvd,
            "type": etype, "formation": form, "action": action
        })

    # Fetch all documents in DB
    cur.execute("SELECT id, well_id, filename, doc_type, page_count FROM documents")
    docs_db = cur.fetchall()
    conn.close()

    precomputed_ocr_all = {}

    for doc_id, wid, filename, dtype, pcount in docs_db:
        pdf_path = PDFS_DIR / filename
        pages_data = []
        doc_ocr = []

        events_this_doc = doc_events.get(filename, [])
        page_event_map = {}
        for ev in events_this_doc:
            page_event_map[ev["page"]] = ev

        for p in range(1, pcount + 1):
            depth_approx = 400 + (p * 220)
            if p in page_event_map:
                ev = page_event_map[p]
                ops = [
                    ("00:00 - 06:00", f"{int(ev['md']-15)}", f"Rotary drilling in {ev['formation']} with 45 rpm and 18 klbs WOB."),
                    ("06:00 - 12:00", f"{int(ev['md'])}", f"EVENT: {ev['excerpt']} Action taken: {ev['action']}"),
                    ("12:00 - 18:00", f"{int(ev['md'])}", f"Monitored wellbore stability and circulated pill. Flow rate stabilized."),
                    ("18:00 - 24:00", f"{int(ev['md']+5)}", f"Resumed drilling ahead slowly. Recorded surveys.")
                ]
                ptext = f"OIL INDIA LIMITED DDR {wid} Page {p}. Depth: {ev['md']}m MD ({ev['tvd']}m TVD). {ev['excerpt']} Action: {ev['action']}"
            else:
                ops = [
                    ("00:00 - 08:00", f"{depth_approx}", f"Drilling ahead with PDC bit in sandstone/shale sequence."),
                    ("08:00 - 16:00", f"{depth_approx+40}", f"Circulated hole clean, pumped 20 bbl high viscosity sweep."),
                    ("16:00 - 24:00", f"{depth_approx+80}", f"Made connection at {depth_approx+80}m. Continued drilling.")
                ]
                ptext = f"OIL INDIA LIMITED DDR {wid} Page {p}. Routine drilling operations at {depth_approx}m MD."

            pages_data.append({
                "rig": "OIL Rig E-1200",
                "date": f"2023-{(p%12)+1:02d}-15",
                "depth_md": f"{depth_approx:,}",
                "operations": ops,
                "params": {"mw": "1.32 SG", "pv": "16 cp", "flow": "520 gpm", "spp": "2,750 psi", "torque": "8.8 kft-lbs", "gas": "30 units"}
            })
            doc_ocr.append({"page": p, "text": ptext, "confidence": 0.94})

        build_pdf_document(pdf_path, filename, wid, pages_data)
        precomputed_ocr_all[filename] = doc_ocr

    # Build fresh sample PDF: SAMPLE-DDR-NEW.pdf (for Live Ingestion F05/F06)
    sample_path = PDFS_DIR / "SAMPLE-DDR-NEW.pdf"
    sample_pages = [
        {
            "rig": "OIL Rig E-1400", "date": "2026-09-25", "depth_md": "2,448",
            "operations": [
                ("00:00 - 04:00", "2440", "Drilling 8-1/2 in hole into Formation X Barail Coal-Sand."),
                ("04:00 - 08:00", "2448", "Encountered sudden mud loss of 22 m3/hr. Pit level dropped 3.5 m3. Suspended drilling."),
                ("08:00 - 16:00", "2448", "Mixed and pumped 40 ppb coarse LCM pill (NutPlug + Mica). Soaked for 2 hrs."),
                ("16:00 - 24:00", "2448", "Regained full circulation. Resumed drilling with reduced 6 m/hr ROP.")
            ],
            "params": {"mw": "1.33 SG", "pv": "19 cp", "flow": "480 gpm", "spp": "2,600 psi", "torque": "8.4 kft-lbs", "gas": "55 units"}
        },
        {
            "rig": "OIL Rig E-1400", "date": "2026-09-26", "depth_md": "2,480",
            "operations": [
                ("00:00 - 12:00", "2465", "Drilling ahead smoothly through lower Barail coal interval."),
                ("12:00 - 24:00", "2480", "Tight hole observed during connection at 2480m MD with 25 klbs overpull. Reamed connection.")
            ],
            "params": {"mw": "1.33 SG", "pv": "18 cp", "flow": "500 gpm", "spp": "2,650 psi", "torque": "9.0 kft-lbs", "gas": "40 units"}
        }
    ]
    build_pdf_document(sample_path, "SAMPLE-DDR-NEW.pdf", "DEMO-NEW-EXPLORATORY", sample_pages)
    precomputed_ocr_all["SAMPLE-DDR-NEW.pdf"] = [
        {"page": 1, "text": "OIL INDIA LIMITED DDR SAMPLE NEW. At 2448m MD mud loss of 22 m3/hr into Formation X Barail Coal-Sand. Mixed and pumped 40 ppb LCM pill. Regained circulation.", "confidence": 0.88},
        {"page": 2, "text": "OIL INDIA LIMITED DDR SAMPLE NEW. At 2480m MD tight hole observed with 25 klbs overpull in lower Barail interval.", "confidence": 0.74} # triggers human review
    ]

    # Save precomputed OCR json
    ocr_file = OCR_DIR / "ocr_index.json"
    ocr_file.write_text(json.dumps(precomputed_ocr_all, indent=2), encoding="utf-8")
    
    # Also copy to frontend public directory for static mode!
    frontend_pdf_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "pdfs"
    frontend_pdf_dir.mkdir(parents=True, exist_ok=True)
    for p in PDFS_DIR.glob("*.pdf"):
        (frontend_pdf_dir / p.name).write_bytes(p.read_bytes())
    
    print(f"Generated {len(docs_db)+1} PDFs with OCR precomputations.")

if __name__ == "__main__":
    generate_all_pdfs()
