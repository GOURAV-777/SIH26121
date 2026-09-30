# 05 Design System

> **Purpose:** visual and motion contract for every component. If you are unsure how something should look, this file is the authority. Deviate only when physically impossible; log the deviation in `docs/DECISIONS.md`.

---

## 1. Brand Identity

**Product name:** NWIS — Nearby Wells Intelligence System
**Sub-brand:** eRTMAC · Oil India Limited · Smart India Hackathon PS 26121
**Voice:** precise, authoritative, data-driven. Never playful or vague.
**Honest label:** the chip `Synthetic demo data` must appear in every header at all times. Colour: amber-600, pill shape, monospace font.

---

## 2. Colour Palette

Use CSS custom properties defined in `frontend/src/styles/tokens.css` (and mirrored in `tailwind.config.ts` under `theme.extend.colors`).

### 2.1 Primitive colours (HSL)

| Token | HSL | Hex approx | Usage |
|---|---|---|---|
| `--col-bg-base` | 220 18% 8% | #111520 | App background (dark theme) |
| `--col-bg-surface` | 220 16% 12% | #181d2a | Cards, panels, drawers |
| `--col-bg-raised` | 220 14% 17% | #222a3a | Hover states, selected rows |
| `--col-border` | 220 12% 22% | #2c3548 | All borders, dividers |
| `--col-text-primary` | 210 30% 94% | #eaf0f9 | Headlines, labels |
| `--col-text-secondary` | 215 18% 60% | #8c9bb5 | Captions, meta |
| `--col-text-muted` | 220 12% 40% | #566070 | Disabled, placeholder |
| `--col-accent-teal` | 183 72% 48% | #22d3c2 | Primary interactive, active well ring, links |
| `--col-accent-orange` | 28 95% 56% | #f97316 | Active well marker, high-severity alert |
| `--col-accent-amber` | 42 95% 56% | #f59e0b | Warning level, formation highlight |
| `--col-accent-red` | 4 86% 58% | #ef4444 | Critical alert, danger badge |
| `--col-accent-green` | 142 71% 45% | #22c55e | Success, resolved state |
| `--col-accent-violet` | 262 83% 68% | #a855f7 | ML probability, SHAP bars |
| `--col-accent-slate` | 220 9% 46% | #6b7280 | Plugged well, muted severity |

### 2.2 Semantic aliases

```css
--col-alert-watch:    var(--col-accent-amber);
--col-alert-warning:  var(--col-accent-orange);
--col-alert-critical: var(--col-accent-red);
--col-severity-1:     var(--col-accent-teal);
--col-severity-2:     var(--col-accent-amber);
--col-severity-3:     var(--col-accent-orange);
--col-severity-4:     var(--col-accent-red);
--col-severity-5:     hsl(340 90% 50%);
```

### 2.3 Light theme overrides (toggle via `data-theme="light"` on `<html>`)

| Token | Light value |
|---|---|
| `--col-bg-base` | hsl(210 20% 96%) |
| `--col-bg-surface` | hsl(0 0% 100%) |
| `--col-bg-raised` | hsl(210 16% 92%) |
| `--col-border` | hsl(215 14% 82%) |
| `--col-text-primary` | hsl(220 25% 12%) |
| `--col-text-secondary` | hsl(220 14% 38%) |

---

## 3. Typography

Import from Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | `'Inter', system-ui, sans-serif` | All UI text |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', monospace` | Depths, bearings, coordinates, code, citations |
| `--text-2xs` | 10px / 1.4 | Small badges, axis ticks |
| `--text-xs` | 12px / 1.5 | Meta, captions, data-table cells |
| `--text-sm` | 13px / 1.55 | Body, list items |
| `--text-base` | 14px / 1.6 | Default body |
| `--text-md` | 16px / 1.5 | Section headings, tab labels |
| `--text-lg` | 20px / 1.4 | Page headings |
| `--text-xl` | 24px / 1.35 | KPI tile numbers |
| `--text-2xl` | 32px / 1.2 | Hero numbers in the Command Center |

**Rules:**
- Always include units on numeric values: `2,452 m TVD`, `1.42 SG`, `6.3 hrs NPT`.
- Use monospace for all numeric fields in tables, tooltips and rulers.
- Heading hierarchy per page: exactly one `<h1>`, then `<h2>` for sections, `<h3>` for cards.

---

## 4. Spacing and Layout

Base unit: `4 px`. All spacing is multiples of 4.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Tight inline gaps |
| `--space-2` | 8px | Icon padding, tight rows |
| `--space-3` | 12px | Card inner padding |
| `--space-4` | 16px | Standard padding |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Large section separation |

**Left rail (nav):** 64px wide (icon-only) collapsed, 224px expanded (icon + label). Always dark.
**Top bar:** 48px tall. Sticky. Contains: logo, global search, alert bell (with badge), role chip, synthetic-data chip, Play Demo button.
**Right panel / drawers:** 480px wide (slide-over); z-index above the main view but below modal overlays.

---

## 5. Elevation and Depth

| Level | Shadow |
|---|---|
| 0 (flat) | none |
| 1 (card) | `0 1px 3px rgba(0,0,0,.35), 0 1px 1px rgba(0,0,0,.25)` |
| 2 (panel, drawer) | `0 4px 16px rgba(0,0,0,.45)` |
| 3 (modal, tooltip) | `0 8px 32px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35)` |
| Glow (active well) | `0 0 0 4px rgba(34,211,194,.20), 0 0 16px rgba(34,211,194,.15)` |

---

## 6. Motion and Animation

**Performance rule:** all transitions use `transform` and `opacity` only. Honour `prefers-reduced-motion`.

| Class / usage | Duration | Easing |
|---|---|---|
| Page transition (Framer) | 200 ms | `easeOut` |
| Drawer slide-in | 280 ms | `cubicBezier(.22,1,.36,1)` |
| Toast appear | 240 ms | `easeOut` |
| Tooltip fade | 120 ms | `easeIn` |
| Alert pulse ring | 2000 ms | `ease-in-out` infinite |
| Chart data line draw | 600 ms | `easeOut` |
| Bit position update (cross-section) | 50 ms | linear (1 Hz) |
| Skeleton shimmer | 1400 ms | linear infinite |

---

## 7. Component Library

Build Radix UI primitives with shadcn-style composition. All components in `frontend/src/components/ui/`.

### Buttons
- **primary:** `--col-accent-teal` background, `--col-bg-base` text
- **ghost:** transparent background, `--col-text-secondary` text, hover `--col-bg-raised`
- **danger:** `--col-accent-red` 10% opacity background, `--col-accent-red` text
- **icon:** transparent, hover `--col-bg-raised`
- All: `border-radius: 6px`, `font-weight: 500`, 120 ms transition

### Badges / Chips
Pill shape (`border-radius: 999px`), 12px text, 4px 10px padding.
Variants: severity (1–5), alert level (watch/warning/critical), role (violet outline), synthetic-data (amber filled).

### Data Table
- Row height 40px, alternating `--col-bg-surface` / `--col-bg-base`
- Hover: `--col-bg-raised`; Selected: left border 2px `--col-accent-teal`
- Column headers: uppercase 10px letter-spacing 0.08em `--col-text-secondary`
- Numeric columns: right-aligned, monospace
- Sticky header when table height > 60vh

### Cards
- Background `--col-bg-surface`, border 1px `--col-border`, radius 8px, padding `--space-4`
- Hover lift (lesson cards): `transform: translateY(-2px)`, shadow level 2

### Toasts (F14)
- Right-bottom anchor, 24px margin, max-width 360px
- Border-left 3px coloured by alert level
- Auto-dismiss: watch 8 s, warning 15 s, critical stays until acknowledged

---

## 8. Area Map Art Direction (F01)

- Default basemap: MapLibre with OpenStreetMap desaturated 80%, dark-tinted to match app chrome.
- Satellite: Esri World Imagery tiles.
- **Lease-block polygon:** filled `rgba(34,211,194,.06)`, stroke `--col-accent-teal` 1.5px dashed.
- **Radius circle:** stroke `--col-accent-teal` 2px, fill `rgba(34,211,194,.04)`, animated dash-offset on draw.
- **Heat layer:** low → mid → high = teal → amber → red; opacity 0.55.
- **Well markers:**
  - Active: orange (#f97316) ⌀18px circle, outer pulsing ring ⌀32px teal, rig-silhouette SVG icon.
  - Offset completed: teal ⌀14px, ring coloured by worst event severity.
  - Plugged: grey ⌀10px, no ring.
  - Outside radius: opacity 0.30.
- **Hover popup:** dark panel, well name 14px 600, status badge, TD, top event badge.
- **Offline basemap fallback:** SVG vector (grid, river ribbon, tea-estate patches, tree clusters) + "Offline basemap" amber chip.

---

## 9. Subsurface Cross-Section Art Direction (F02)

### 9.1 Vertical layout

| Zone | Proportion | Rendering |
|---|---|---|
| Sky | ~15% | Gradient `#0d1b2a` → `#1e3a5f`. Stars 30–40 dots. Day mode: `#1a6eb0` → `#87ceeb`. Sun/moon SVG. |
| Surface profile | ~8% | Undulating SVG path (terrain), river dip, well pads (grey), rig silhouettes, tree clusters. |
| Topsoil + alluvium | ~5% | Brown-tan gradient fill, dot pattern SVG. |
| Formation layers | ~60% | Filled polygons with lithology patterns (see §9.2). |
| Basement | ~12% | Cross-hatch, dark grey `#1a1a1a`. |

### 9.2 Formation colours and lithology patterns

| Formation | Fill | Pattern |
|---|---|---|
| Alluvium / topsoil | `#c8a76a` | Dots 3px, spacing 8px |
| Dihing–Namsang | `#d4956a` | Wavy lines 2px every 10px |
| Tipam Sandstone | `#e8c97a` | Dots 4px bold spacing 12px |
| Girujan Clay | `#8a7a6a` | Horizontal dashes |
| Surma Group | `#9aad8a` | Alternating sand/shale bands |
| **Formation X (loss zone)** | `#1a1a1a` (coal) + `#e8c97a` (sand) | Coal blocks + sand dots; **red hatch 45° 3px**; pulsing opacity 0.6–0.8 when live alert active |
| Barail Upper Shale | `#6a8a9a` | Dashes |
| Kopili Shale | `#5a6a8a` | Dense dashes, darker |
| Sylhet Limestone | `#a09070` | Brick pattern (rect grid) |
| Basement | `#2a2a35` | Cross-hatch |

### 9.3 Wells on section

- **Trajectory:** teal 2px (offset), orange 3px (active)
- **Casing strings:** nested concentric rectangles; shoe = small triangle
- **Open-hole:** dashed teal line
- **Event glyphs at depth:** ⚠ mud loss = cyan diamond, kick = red circle, stuck = orange square, torque = yellow lightning
- **Active well bit:** animated orange chevron with glow pulse; mud-return particle animation in live mode
- **Pressure zone:** translucent red fill in overpressure zone (3,100 m)
- **Loss zone hatching:** diagonal red 45°, fill opacity 0.18 in Formation X

### 9.4 Controls

- VE slider 1× to 5× (`f02-ve-slider`)
- Day/dusk toggle (`f02-tod-toggle`)
- Layer toggles: lithology, events, casing, pressure, groundwater, faults
- Depth ruler: left margin TVD, right margin ASL (m); ticks every 100 m, labels every 500 m; monospace
- Crosshair + tooltip: formation name, lithology, TVD, synthetic pore-pressure estimate
- Zoom/pan via d3-zoom
- Groundwater table: dashed blue line ~12 m below surface; label "Freshwater aquifer — protect"

---

## 10. Charts and Data Visualisations

- `role="img"` and `aria-label` on every chart container.
- Recharts: `dot={false}` on lines unless meaningful; grid lines `--col-border` 30% opacity; axis text `--col-text-secondary`.
- d3 / Canvas: use `devicePixelRatio` scaling for retina sharpness.
- Anomaly bands: fill `rgba(239,68,68,.12)`, stroke none.
- SHAP bar chart: positive = `--col-accent-teal`, negative = `--col-accent-red`; horizontal layout.

---

## 11. Left Rail Navigation

Icons: lucide-react, 20px, strokeWidth 1.5.

| Route | Icon | Label |
|---|---|---|
| `/` | `LayoutDashboard` | Command Center |
| `/map` | `Map` | Area Map |
| `/section` | `Layers` | Cross-Section |
| `/live` | `Activity` | Live Drilling |
| `/knowledge` | `BookOpen` | Knowledge |
| `/ingest` | `Upload` | Ingest |
| `/analytics` | `BarChart2` | Analytics |
| `/brief` | `FileText` | Brief Builder |
| `/settings` | `Settings` | Settings |

Active: left border 3px `--col-accent-teal`, background `--col-bg-raised`, icon + text `--col-accent-teal`.
Inactive: `--col-text-secondary`, hover `--col-bg-raised`, 150 ms transition.

---

## 12. Command Center (landing page)

Layout (1920×1080 reference):
- **Top row:** 4 KPI tiles (total events, active alerts, documents processed, NPT hours archived)
- **Middle-left (60%):** mini Area Map preview — click navigates to `/map`
- **Middle-right (40%):** recent alerts list + active-well status panel
- **Bottom row:** 3 sparkline panels (Risk score timeline, Drilling parameter summary, Formation X proximity bar)

Feel: mission-control room. Dark background with teal accent lines, subtle grid-dot pattern, orange animated indicator next to active well name.

---

## 13. Anti-"AI look" rules (mandatory)

The following patterns are **strictly forbidden:**

1. **No lorem ipsum** — use domain vocabulary from the data spec.
2. **No generic blue** (`#3b82f6` etc.) as primary colour — use teal-orange palette.
3. **No unstyled default cards** — always `--col-bg-surface` + border + correct shadow.
4. **No spinner-only loading** — always use skeleton loaders shaped like real content.
5. **No empty state without icon + headline + suggested action.**
6. **No placeholder images** — charts must use real seed data.
7. **No pixel-perfect alignment breaking** — snap to 4px grid.
8. **No hardcoded colour literals** in component files — always use CSS token.
9. **No truncation without tooltip** showing the full value.
10. **No unsorted / unformatted numeric data** — right-align numbers, include units.

---

## 14. Design Checklist (run before marking a feature done)

- [ ] Dark and light theme both look intentional and polished.
- [ ] All text passes WCAG AA contrast.
- [ ] All numeric values include their unit.
- [ ] The `Synthetic demo data` chip is visible in the top bar.
- [ ] No skeleton loaders visible after data loads.
- [ ] No console errors or unhandled promise rejections.
- [ ] Hover state exists on every interactive element.
- [ ] The feature is usable with keyboard only.
- [ ] Charts render with correct data (not zero or NaN).
- [ ] Transitions run at 60 fps.
- [ ] On 1280×720 viewport: no horizontal scroll, no overlapping elements.
- [ ] Empty and error states are designed (not raw "Error" text).
- [ ] The screenshot in `docs/screens/Fxx.png` would make a judge say "production-ready".
