# UI Redesign — Home Tiles + KPI Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the visual quality of the Home tile grid and KPI stats panels so they feel like a professional factory floor app, not a plain card grid.

**Architecture:** Pure CSS/HTML changes — no new JS logic. Task 1 adds two new token vars and redesigns `.tile` + `.tiles-grid` in `css/style.css`. Task 2 extracts the inline `stat-grid` styles in `js/kpi.js` into a proper `.stat-card` CSS class, replaces inline style strings with class names, and wires up semantic colour variants. No new files needed.

**Tech Stack:** Vanilla CSS (custom properties), vanilla JS DOM manipulation, no build step. Deploy: `git push origin master` → GitHub Pages auto-deploys.

---

## File Map

| File | Change |
|---|---|
| `css/tokens.css` | Add 2 new tokens: `--tile-accent-bg` and `--stat-card-border-radius` |
| `css/style.css` | Redesign `.tile`, `.tiles-grid`, `.tile-icon`, `.tile-label`; add `.stat-card`, `.stat-card--ok`, `.stat-card--warn`, `.stat-card--error`, `.stat-card--neutral` |
| `js/kpi.js` | Replace inline `style="..."` strings in `renderStats()` with class-based markup using `.stat-card` + modifier classes |
| `kpi.html` | Replace inline `style="..."` on `#stat-grid` div with class `stat-grid` |

---

## Task 1: Redesign Home Tiles

**Files:**
- Modify: `css/tokens.css:113` (after last line, before closing `}`)
- Modify: `css/style.css:115-176` (`.tiles-grid` and `.tile` block)

### What changes visually

Current: flat white card, 4px left border, icon + label stacked, no sub-text.

After: same 2-col grid but tiles are taller (112px min), icon is housed in a small orange-tinted circle badge top-left, label sits at bottom-left in all-caps condensed, and a very subtle diagonal orange gradient washes the top-right corner (CSS `::after` pseudo). Hover lifts with a stronger shadow.

- [ ] **Step 1: Add two new tokens to `css/tokens.css`**

Open `css/tokens.css`. Inside `:root { }` just before the closing `}` (line 113), add:

```css
  /* Tile accent wash */
  --tile-accent-wash: rgba(234,88,12,0.06);
  --tile-icon-bg:     rgba(234,88,12,0.10);
```

After edit, `:root` block ends with those two lines before `}`.

- [ ] **Step 2: Verify tokens.css saved**

Open `css/tokens.css` and confirm the two new lines appear just before the closing `}`.

- [ ] **Step 3: Replace the `.tiles-grid` and `.tile` blocks in `css/style.css`**

Locate the `/* ── Home Tiles Grid ──` comment at line 115. Replace from that comment through `}` closing `.tile-badge.info` (line 177) with:

```css
/* ── Home Tiles Grid ── */
.tiles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.tile {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  cursor: pointer;
  min-height: 112px;
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  text-align: left;
  transition: box-shadow var(--dur-fast) var(--ease-out),
              border-left-color var(--dur-fast) var(--ease-out),
              transform var(--dur-fast) var(--ease-out);
  position: relative;
  overflow: hidden;
}
.tile::after {
  content: '';
  position: absolute;
  top: -20px; right: -20px;
  width: 80px; height: 80px;
  background: radial-gradient(circle, var(--tile-accent-wash) 0%, transparent 70%);
  pointer-events: none;
}
.tile:hover {
  box-shadow: var(--shadow-md);
  border-left-color: var(--color-primary-dark);
  transform: translateY(-2px);
}
.tile:active { transform: translateY(0); box-shadow: none; }
.tile-icon-wrap {
  width: 36px; height: 36px;
  background: var(--tile-icon-bg);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tile-icon {
  width: 20px; height: 20px;
  color: var(--color-primary);
  display: block;
}
.tile-label {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  color: var(--color-text);
  line-height: var(--leading-tight);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.tile-badge {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  background: var(--color-error);
  color: #fff;
  font-size: 10px;
  font-weight: var(--weight-bold);
  min-width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}
.tile-badge.hidden  { display: none; }
.tile-badge.warning { background: var(--color-warning); }
.tile-badge.info    { background: var(--color-info); }
```

- [ ] **Step 4: Update `renderHome()` in `js/app.js` to wrap icon in `.tile-icon-wrap`**

In `js/app.js` line 87, change the `btn.innerHTML` template string from:

```js
btn.innerHTML = `<span class="tile-icon">${SVG[id] || SVG.kpi}</span><span class="tile-label" data-i18n="${cfg.labelKey}">${Lang.t(cfg.labelKey)}</span>`;
```

to:

```js
btn.innerHTML = `<span class="tile-icon-wrap"><span class="tile-icon">${SVG[id] || SVG.kpi}</span></span><span class="tile-label" data-i18n="${cfg.labelKey}">${Lang.t(cfg.labelKey)}</span>`;
```

- [ ] **Step 5: Commit Task 1**

```bash
git add "css/tokens.css" "css/style.css" "js/app.js"
git commit -m "feat: redesign home tiles — icon badge wrap, taller cards, accent wash"
```

Expected output: `master ... feat: redesign home tiles`

---

## Task 2: Redesign KPI Stats Cards

**Files:**
- Modify: `css/style.css` — add `.stat-grid` + `.stat-card` + modifier classes after `.kpi-card` block
- Modify: `kpi.html:35` — replace inline style on `#stat-grid`
- Modify: `js/kpi.js:43-57` — replace inline style strings in `renderStats()`

### What changes visually

Current: inline `style="background:...; border-left:4px solid ${color}"` with raw hex colours hard-coded per card.

After: semantic CSS classes — `.stat-card--ok` (green), `.stat-card--warn` (amber), `.stat-card--error` (red), `.stat-card--neutral` (orange/primary). Value is larger (2.5rem), label is all-caps with stronger tracking. Class is assigned by JS based on the zero/nonzero condition already present.

- [ ] **Step 1: Add `.stat-grid` and `.stat-card` classes to `css/style.css`**

After the `.kpi-label` block (around line 276 in the current file), add:

```css
/* ── Stat Cards (KPI Dashboard) ── */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.stat-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.stat-card--ok     { border-left-color: var(--color-success); }
.stat-card--warn   { border-left-color: var(--color-warning); }
.stat-card--error  { border-left-color: var(--color-error); }
.stat-card--neutral { border-left-color: var(--color-primary); }
.stat-card-value {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: var(--weight-bold);
  line-height: 1;
}
.stat-card--ok     .stat-card-value { color: var(--color-success); }
.stat-card--warn   .stat-card-value { color: var(--color-warning); }
.stat-card--error  .stat-card-value { color: var(--color-error); }
.stat-card--neutral .stat-card-value { color: var(--color-primary); }
.stat-card-label {
  font-size: var(--text-xs);
  font-family: var(--font-display);
  font-weight: var(--weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 2: Replace inline style on `#stat-grid` in `kpi.html`**

In `kpi.html` line 35, replace:

```html
<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);margin-bottom:var(--space-5);" id="stat-grid"></div>
```

with:

```html
<div class="stat-grid" id="stat-grid"></div>
```

- [ ] **Step 3: Replace inline style strings in `renderStats()` in `js/kpi.js`**

Replace the entire `renderStats(d)` function (lines 43–58) with:

```js
function renderStats(d) {
  const items = [
    { label: 'Active Batches',     value: d.activeBatches,      mod: 'neutral' },
    { label: 'Open Breakdowns',    value: d.openBreakdowns,     mod: d.openBreakdowns   > 0 ? 'error'  : 'ok' },
    { label: 'Open CAPAs',         value: d.openCapas,          mod: d.openCapas        > 0 ? 'warn'   : 'ok' },
    { label: 'Overdue Compliance', value: d.overdueCompliance,  mod: d.overdueCompliance > 0 ? 'error' : 'ok' },
    { label: 'Low Stock Items',    value: d.lowStockCount,      mod: d.lowStockCount    > 0 ? 'warn'   : 'ok' },
    { label: 'Overdue PMs',        value: d.overduePMs,         mod: d.overduePMs       > 0 ? 'warn'   : 'ok' },
    { label: 'Open Complaints',    value: d.openComplaints,     mod: d.openComplaints   > 0 ? 'error'  : 'ok' }
  ];
  document.getElementById('stat-grid').innerHTML = items.map(i => `
    <div class="stat-card stat-card--${i.mod}">
      <div class="stat-card-value">${i.value ?? '—'}</div>
      <div class="stat-card-label">${i.label}</div>
    </div>`).join('');
}
```

- [ ] **Step 4: Commit Task 2**

```bash
git add "css/style.css" "kpi.html" "js/kpi.js"
git commit -m "feat: KPI stats cards — semantic class system, remove inline styles"
```

Expected output: `master ... feat: KPI stats cards`

---

## Task 3: Push and Verify

- [ ] **Step 1: Push to GitHub Pages**

```bash
git push origin master
```

Expected: `master -> master` — GitHub Pages rebuilds automatically within ~60s.

- [ ] **Step 2: Smoke-check Home tiles**

Open `https://plasticypp.github.io/one/app.html`, log in as any role (e.g. QMR). Confirm:
- Tiles show icon in a small orange-bg square, not bare SVG
- Each tile is taller (~112px+)
- Hover lifts the tile by 2px with a shadow
- Badge (red dot) still appears top-right when stat > 0

- [ ] **Step 3: Smoke-check KPI stats**

Navigate to KPI Dashboard. Confirm:
- Stat cards use left-border colour (green/amber/red/orange) not hardcoded hex
- Numbers are larger (2.5rem)
- Label is all-caps with tight tracking
- No inline `style=""` attributes visible in DevTools

---

## Self-Review

**Spec coverage:**
- Home tiles visual upgrade ✅ Task 1
- KPI dashboard stat cards ✅ Task 2
- Deploy + verify ✅ Task 3

**Placeholder scan:** None found — all code blocks are complete.

**Type/name consistency:**
- `.tile-icon-wrap` introduced in Task 1 Step 3 (CSS) and used in Task 1 Step 4 (JS) ✅
- `.stat-card`, `.stat-card--ok/warn/error/neutral`, `.stat-card-value`, `.stat-card-label` defined in CSS (Task 2 Step 1) and used in JS (Task 2 Step 3) ✅
- `.stat-grid` defined in CSS and applied in HTML ✅
