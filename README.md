# ✍️ Handwriting Practice Sheet Generator

A zero-dependency static HTML app that generates printable handwriting practice
sheets with selectable fonts. Deployable directly to GitHub Pages — no build step,
no bundler, no backend.

---

## Project Goals

- Choose a **primary font** (humanist sans, for prose practice)
- Choose a **secondary font** (monospaced, for technical/code practice)
- Preview the character set and practice rows live in the browser
- Print to PDF using the browser's native print dialog (no server needed)
- Works offline after first load (fonts permitting)

---

## Tech Stack Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Fonts | Google Fonts API | Free, no hosting cost, wide selection |
| Styling | Plain CSS (no framework) | Zero deps, GitHub Pages friendly |
| Logic | Vanilla JS (ES modules) | No bundler needed, native browser APIs |
| PDF output | `window.print()` + print CSS | No library needed for basic PDF export |
| Hosting | GitHub Pages | Free static hosting, no CI needed |
| Build | None | Files served as-is from `main` branch |

> **Why no build step?** GitHub Pages can serve raw HTML/CSS/JS directly from the
> repository root or a `/docs` folder. Keeping zero build tooling means Claude Code
> can iterate faster and the project is easier to understand and modify.

---

## Suggested Project Structure

```
handwriting-practice/
├── index.html          # Main app shell
├── style.css           # App UI styles
├── print.css           # Print-specific styles (loaded via media="print")
├── app.js              # Main JS module (font loader, sheet renderer, controls)
├── fonts.js            # Curated font list with metadata
├── sheet.js            # Practice sheet DOM generator (rows, guide lines, ref text)
└── README.md           # This file
```

Keep all files flat — no subdirectories. GitHub Pages serves `index.html` from the
root by default.

---

## Key Features to Implement

### 1. Font Selector Panel

Two dropdowns (or a searchable list):

- **Primary font** — humanist sans, for prose rows
  - Suggested defaults: IBM Plex Sans, Inter, Source Sans 3, Nunito, Lato
- **Secondary font** — monospaced, for technical rows
  - Suggested defaults: JetBrains Mono, IBM Plex Mono, Fira Code, Source Code Pro

Each selection should dynamically load the font via the Google Fonts API:

```js
// Pattern for dynamic font loading
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`;
document.head.appendChild(link);
```

### 2. Sheet Configuration Panel

Expose these options:

| Option | Type | Default | Notes |
|---|---|---|---|
| x-height (mm) | number input | 5 | Controls all row proportions |
| Practice rows per block | number (1–5) | 3 | Rows below each reference row |
| Paper size | select | A4 | A4 / Letter |
| Sheet type | select | Alphabet | Alphabet / Word Drills / Free Composition |
| Show color guide lines | checkbox | true | Toggle ascender/baseline etc. |
| Custom word list | textarea | — | For custom word drill sheet |

### 3. Four-Line Guide System

Each row must have five horizontal rules (rendered as thin `<div>` or `<hr>` elements
or SVG lines), color-coded:

| Line | Color | Position relative to baseline |
|---|---|---|
| Ascender | `#B8D4F0` (light blue) | +150% x-height |
| Cap height | `#C8E6C9` (light green) | +130% x-height |
| x-height | `#FFE0B2` (light orange) | +100% x-height |
| Baseline | `#EF9A9A` (light red) | 0 |
| Descender | `#E1BEE7` (light purple) | −50% x-height |

The spacing ratios above are starting points. Calculate all positions from the
configured x-height in mm, convert to px for rendering:

```js
const MM_TO_PX = 96 / 25.4;  // at 96dpi screen
const xHeightPx = xHeightMm * MM_TO_PX;
```

### 4. Reference Row Content

**Alphabet sheet** — pre-defined rows:
- Lowercase: `a b c d e f g h i j k l m` / `n o p q r s t u v w x y z`
- Uppercase: `A B C D E F G H I J K L M` / `N O P Q R S T U V W X Y Z`
- Digits: `0 1 2 3 4 5 6 7 8 9`
- Disambiguation: `0 O  1 l I  5 S  8 B  2 Z  6 G` (use secondary/mono font)

**Word drill sheet** — default word list (editable):
```
minimum officious quickly adjacent
0xFF 127.0.0.1 if (x == null) return;
```

**Free composition** — no reference row, just ruled rows across the full page.

### 5. Print to PDF

Use `window.print()`. All print layout is controlled by `print.css`.

Key print CSS rules to include:

```css
@media print {
  /* Hide all UI controls */
  .controls, .toolbar, header { display: none !important; }

  /* Remove margins — let the browser margin dialog control this */
  body { margin: 0; }

  /* Force page size */
  @page {
    size: A4 portrait;   /* or Letter — driven by JS class on <body> */
    margin: 15mm;
  }

  /* Prevent rows from splitting across pages */
  .practice-block { break-inside: avoid; }

  /* Force color printing of guide lines */
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

Add a "Print / Save PDF" button that calls `window.print()`. Instruct the user (via
tooltip or helper text) to set "Destination: Save as PDF" and disable headers/footers
in the browser print dialog for cleanest output.

---

## Claude Code Bootstrap Prompts

Use these prompts in sequence when starting the project with Claude Code.

### Prompt 1 — Scaffold

```
Create a static HTML project for a handwriting practice sheet generator.
Structure: index.html, style.css, print.css, app.js, fonts.js, sheet.js
No build tools, no frameworks, no npm. Plain HTML/CSS/ES module JS only.
GitHub Pages ready — index.html at repo root.

Start with index.html: a two-column layout with a left control panel and
a right live preview area. The preview area should look like an A4 page
(white, shadowed, centered). Wire up app.js as a module.
```

### Prompt 2 — Font Selector

```
In fonts.js, create a curated FONTS object with two arrays:
- sans: IBM Plex Sans, Inter, Source Sans 3, Nunito, Lato, Gill Sans Nova
- mono: JetBrains Mono, IBM Plex Mono, Fira Code, Source Code Pro, DejaVu Sans Mono

Each entry: { name, googleFamily, category, notes }
(DejaVu Sans Mono is a system font fallback — no Google Fonts URL)

In app.js, populate two <select> elements from this list.
On change, dynamically inject a <link> tag to load the selected font from
Google Fonts, then re-render the sheet preview.
```

### Prompt 3 — Sheet Renderer

```
In sheet.js, implement generateSheet(config) where config = {
  primaryFont, secondaryFont, xHeightMm, practiceRows,
  sheetType, paperSize, showGuideLines
}.

Render the sheet as DOM elements inside #preview.
Each practice block = one reference row (colored background, ref text in
chosen font) + N plain practice rows.

Guide lines: 5 horizontal rules per row, absolutely positioned, colored
per the four-line system (ascender #B8D4F0, cap-height #C8E6C9,
x-height #FFE0B2, baseline #EF9A9A, descender #E1BEE7).

Calculate all heights from xHeightMm, converted to px.
Use 96dpi: 1mm = 3.7795px.
```

### Prompt 4 — Print CSS

```
Create print.css:
- Hide .controls, .toolbar, nav, header, footer, #print-btn
- Remove box-shadow and border-radius from .page
- @page rule: size A4 portrait, margin 15mm
- .practice-block: break-inside avoid
- Force color output: print-color-adjust: exact on all elements
- Page numbers in footer via @page margin box if possible

Wire it in index.html as <link rel="stylesheet" href="print.css" media="print">
Add a "🖨 Print / Save as PDF" button that calls window.print()
Add helper text: "In browser dialog: set margins to None, disable Headers & Footers"
```

### Prompt 5 — GitHub Pages Deployment

```
Add a GitHub Actions workflow at .github/workflows/pages.yml that deploys
the repo root to GitHub Pages on push to main.
Use actions/upload-pages-artifact and actions/deploy-pages.
No build step — just deploy the root directory as-is.
```

---

## GitHub Pages Setup (Manual)

If you prefer not to use GitHub Actions:

1. Push the project to a GitHub repository
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main`, folder: `/ (root)`
5. Save — the site will be live at `https://<username>.github.io/<repo-name>/`

---

## Recommended Workflow with Claude Code

```bash
# 1. Create repo and clone
gh repo create handwriting-practice --public
git clone https://github.com/<you>/handwriting-practice
cd handwriting-practice

# 2. Start Claude Code
claude

# 3. Run the bootstrap prompts above in sequence (Prompt 1 → 5)

# 4. Preview locally (no server needed for basic use)
open index.html
# OR use a local server to avoid ES module CORS issues:
python3 -m http.server 8080
```

> **ES module note:** If using `type="module"` in `<script>`, browsers block
> local `file://` imports. Use a local server (`python3 -m http.server`) or
> ask Claude Code to bundle everything into a single `<script>` tag in
> `index.html` to avoid the issue entirely during development.

---

## Future Enhancements (post-MVP)

- **Custom text input** — type any text to generate a practice row from it
- **Zettelkasten mode** — alternating prose/mono rows to mimic real note-taking
- **Multiple pages** — add a second A4 page to the preview
- **Dark mode UI** — keep the sheet itself white/light, darken the surrounding UI
- **PWA / offline** — cache fonts with a service worker for offline use
- **Export as PNG** — use `html2canvas` to export individual rows as images
- **Presets** — save/load named configurations (stored in `localStorage`)

---

## License

MIT — do whatever you want with it.
