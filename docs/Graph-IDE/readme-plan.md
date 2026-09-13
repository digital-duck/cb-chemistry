```User
I like to simplify UX design for conceptbook by prototyping
at /home/gongai/projects/digital-duck/cb-chemistry-ide, 
let me convey my design thinking below.

currently conceptbook UI displays Graph and Content 
in 2 separate pages, 

Graph page renders concept-graph, see /home/gongai/projects/digital-duck/cb-chemistry-ide/docs/Graph-IDE/conceptbook-graph-page.png;

Content page displays generated content (maybe missing if a node's content has not been generated yet by LLM calls), 
see /home/gongai/projects/digital-duck/cb-chemistry-ide/docs/Graph-IDE/conceptbook-content-page.png;

navigating between Graph and Content pages is not a good UX design.

In another codebase at /home/gongai/projects/digital-duck/graph-code, I have a Graph-IDE design for building apps driven by graph structure, see this screenshot at /home/gongai/projects/digital-duck/cb-chemistry-ide/docs/Graph-IDE/graph-code-graph-IDE-1.png, 
where left panel renders graph visually, the right panel displays properties associated with the selected node.


The desired future state should be:

(1) one page to display both graph diagram at left and generated content at right.
(2) left graph diagram shows the concept graph , but remove the current left and right sidebars
(3) right content panel will display generated content, at the top, it should keep 3 dropdowns for model, level, language, the refresh button, then add a new "Generate" button, when one select a node from left graph panel, if pre-generated content exists, right panel will display it, else, one should click "Generate" button to generate the content on the fly for user-selected model/level/language combination, the right content panel should still keep the table of content (TOC) menu

At the top of consolidated Graph-Content page, it should have a dropdown for domains (or chapters), "Load" button will load the selected graph.yaml and associated content

What do you think?
```

---

# Consolidated Graph-IDE page for ConceptBook — Implementation Plan

## Context

ConceptBook currently splits the Graph view (`/domain/:id`, `Domain.js` +
`GraphViewer.js`) and the Content view (`/book?domain=&file=`, `BookPage.js`)
into two separate pages joined only by header nav links, which the user finds
to be poor UX. The user wants a single page modeled on their `graph-code`
Graph-IDE prototype: graph on the left, generated content (with its own TOC)
on the right, driven by one set of model/level/language controls plus a new
"Generate" button. This is a clean-slate redesign — the old two-page UX is
retired outright (this repo is a fresh clone with no external users to keep
compatibility for).

Clarified requirements from the user:
- Replace `/domain/:id` entirely; retire `/book` and the old iframe-injected
  sidebars (`#path-sidebar` learning-path/generate/notes, `#notes-sidebar`).
- Left panel: just the graph (`graph.html` iframe), no sidebars.
- Right panel top bar: Model / Level / Language dropdowns + Refresh (🔄) +
  new **Generate** button + **Export PDF** button (reuses the existing PDF
  generation logic from the old Graph-page sidebar).
- The old Graph page's **Notes** sidebar (per-node, auto-saved to
  `localStorage`) is valuable for a learning app and must be kept — see
  layout decision below.
- Right panel body: TOC on the left, content iframe on the right. The TOC is
  **always present** (even for primitive nodes) and is a **flattened,
  alphabetically-sorted list of concept/application nodes** drawn from the
  selected node's prerequisite path (i.e. what `graph.html`'s own
  `getAncestors()`/BFS path already computes) — not the HTML page's own
  `nav.toc`.
- Node → content resolution: each concept/application node maps 1:1 to
  `concept_{node_id}.html` under `output/{level}.{lang}/{model}/html/`. If it
  exists, show it; if not, show an inline "not generated yet" state and let
  Generate build it for the current model/level/lang. Primitive nodes have no
  generated content (consistent with them already being excluded from the
  Generate target list) — selecting one shows its `defines` text only, no
  Generate action.
- Top-of-page domain dropdown: auto-loads on change (existing behavior) but
  keeps a visible **Load** button for explicit use, matching the graph-code
  reference.

## Architecture

### Routing / nav (`src/main.js`, `src/router.js`, `src/components/Header.js`)
- Keep `/domain/:id` as the single route, now rendering the new consolidated
  page. Remove the `/book` route and `BookPage.js` import/registration.
  `/graph` alias can be dropped too (Home page and `DomainCard` already link
  to `/domain/:id`).
- `Header.js`: remove the `nav.graph` / `nav.content` links (their pages no
  longer exist); keep Settings/Language/About. Add/keep `nav.graph` and
  `nav.content` i18n keys removed from `i18n.js` since unused.
- Delete `src/pages/BookPage.js` (its logic is absorbed/rewritten into the new
  page, see below) and `src/components/ConceptPanel.js` (superseded by the
  new content panel; currently unused by `Domain.js` already).

### Shared path helpers — new `src/lib/paths.js`
CLAUDE.md already documents this module's intended existence but it was never
created; the level/lang/model → file path logic is duplicated 3× today
(`BookPage.js` `buildUrl`/`parseLevelLang`/`parseModel`, `GraphViewer.js`
`_localizePath`). Consolidate into one module:
- `conceptUrl(domain, level, lang, model, nodeId)` →
  `domains/{domain}/output/{level}.{lang}/{model?}/html/concept_{nodeId}.html`
  (BASE_URL-prefixed, omitting the model segment when empty, matching
  existing `buildUrl`/`_localizePath` conventions).
- `bookUrl(domain, level, lang, model, target)` → same but `book_{target}.html`
  (kept for potential reuse by the PDF button / future book view).
- `parseLevelLangModel(file)` — merges `parseLevelLang` + `parseModel` from
  `BookPage.js`.

New `src/lib/contentExists.js`: lift `_checkExists`/`_existsCache`/
`_markKnownUrls`/`_clearExistsCache` out of `BookPage.js` verbatim (same
"fetch + check for `spl-credit`/`Generated by` marker" logic, since dev/prod
static hosting 200s unknown paths with the SPA shell). Exported as
`checkExists(url)`, `markKnownUrls(domain, files)`, `clearExistsCache()`.

### `GraphViewer.js` — strip to graph-only, keep Notes as a bottom drawer
- Remove `_injectConceptBooksSection` and `_injectGenerateSection` in full
  (~340 lines) — that logic's replacement lives in the new content panel now.
- **Notes placement decision**: keep Notes in the *left* graph panel, not the
  right content panel — the user's own instinct, and the graph canvas has
  much more idle vertical space (per the reference screenshots, nodes
  cluster near the top) whereas the right panel's reading area is already
  tight (controls + TOC + content). Concretely, `graph.html`'s existing
  `.app` grid is `230px 1fr 210px` columns × `60vh 40vh` rows, with
  `#path-sidebar` (learning path — being removed), `#graph-panel` (top-centre),
  `#explain-panel` (bottom-centre — a definition/prereqs panel that's now
  redundant with our right ContentPanel), and `#notes-sidebar` (right column).
  Inject CSS (same technique as today's `_injectSidebarTheme`) that:
  - `display:none`s `#path-sidebar` and `#explain-panel` (both superseded).
  - Reflows `.app` to `grid-template-columns:1fr; grid-template-rows:1fr auto`,
    with `#graph-panel` in row 1 and `#notes-sidebar` moved to row 2 spanning
    full width, styled as a **collapsible bottom drawer, collapsed by
    default** — showing just a thin header bar (title + current node's label
    + Clear/Export buttons) so the graph keeps most of the vertical space;
    clicking the header (or a small ▾/▸ toggle in it) expands the drawer
    upward to reveal the textarea + saved-notes list, and collapses it again
    on a second click.
  - Inject one small toggle button into `#notes-header-top` (`insertAdjacentElement`,
    same pattern already used for the Node Types legend) wired to toggle an
    `expanded` class controlling `#notes-sidebar`'s height/overflow.
  This reuses all of `graph.html`'s existing note-taking JS untouched
  (`saveNote`/`loadNote`/`switchNotes`/`clearNote`/`exportNotes`/
  `renderNotesList`, all keyed by `localStorage` per node) — zero changes to
  `scripts/concept_graph.py`, purely a CSS/DOM relayout injected from the
  parent, consistent with how the sidebar theme is already applied today.
- Keep the existing `cb:graphLoaded` / `cb:nodeSelected` event bridge
  (`window.dispatchEvent`), since the new content panel will listen to these
  the same way `ConceptPanel.js` did.
- Expose one new capability on the returned `el`: `el.getPath(nodeId)` →
  calls into the iframe (`frame.contentWindow.getAncestors(nodeId)`, already
  defined inside `graph.html`, same-origin) and returns
  `{ nodeId, node, path: [...ancestorIds] }` using `frame.contentWindow.nodeIndex`
  for lookups. This reuses `graph.html`'s existing BFS/`getAncestors()`
  instead of reimplementing prerequisite-walking in the parent app.

### New `src/components/ContentPanel.js` (replaces `ConceptPanel.js` + the
`BookPage.js`/iframe-sidebar generate logic)
Signature: `ContentPanel(domain, { level, lang, signal })` → `<aside>` element
with:
- **Controls row** (reuse `.cb-book-pane__controls`/`__select`/`__refresh`
  styling from `BookPage.js`/`style.css`): Model select (`MODELS` list moved
  into this file, copied from `BookPage.js`), Level select, Language select
  (via `LanguagePicker.js`'s `LANGUAGES`), Refresh button (clears
  `contentExists` cache + re-resolves current node), and a new **Generate**
  button (disabled until a non-primitive node is selected).
- **Body row**: `flex` with a left TOC list and a right content `<iframe>`.
- On `cb:nodeSelected` (dispatched by `GraphViewer.js`):
  1. Ask `graphViewerEl.getPath(nodeId)` for the flattened path.
  2. Build TOC = `[...path, nodeId]` nodes filtered to `kind !== 'primitive'`,
     de-duplicated, sorted alphabetically by `label`, rendered as a simple
     list (current node highlighted); clicking an entry re-selects that node
     via `graphViewerEl.selectNode(entryId)` (already exists) so the graph
     stays in sync.
  3. If selected node is `primitive`: show its `defines` text in the content
     pane (no iframe, no Generate).
  4. Else: resolve `conceptUrl(...)` via `lib/paths.js`, `checkExists` via
     `lib/contentExists.js`. If it exists, set `iframe.src`. If not, show an
     inline "Not generated yet for {model}/{level}/{lang}" message in place
     of the iframe and enable the Generate button for this node.
- **Generate button** click: reuses the exact SSE flow from
  `GraphViewer.js`'s old `_injectGenerateSection` (`new EventSource('/api/generate?...')`,
  `log`/`done`/`gen_error` handlers) but targets the currently selected node
  id, and on `done` re-resolves/reloads the iframe in place (no full page
  reload needed, unlike the old sidebar version, since we're not re-mounting
  the whole graph). Show the streamed log in a small collapsible panel like
  today's `#cb-gen-log`.
- **Export PDF** button placed immediately after Generate (same visual
  weight, not a secondary icon button per the user's request): reuses the
  existing `/api/pdf?domain=&target=&level=&language=` fetch logic from
  `GraphViewer.js`'s old `pdfBtn` handler verbatim, targeting the current
  node and current model/level/lang, then offering Download/Open links for
  the returned PDF path — same behavior as today, just relocated. Keep the
  skip-cache checkbox as a small secondary control next to Generate (existing
  capability, low-cost to keep).

### Rewritten `src/pages/Domain.js` — the consolidated IDE page
- Keep the existing top domain-picker bar (`.cb-domain-picker-bar`) — already
  auto-loads on `<select>` change via `window.location.hash`. Add a visible
  **Load** button next to it that does the same navigation explicitly (so
  both interactions work, per the user's answer).
- Below the picker/attribution: a new flex row `.cb-ide-layout` containing:
  - `.cb-ide-left`: the `GraphViewer(domain, { level, lang, hideChrome: true })`.
  - `.cb-ide-right`: the new `ContentPanel(domain, { level, lang })`.
- `level`/`lang` state lives in `Domain.js` (currently `level = domain.default_level`,
  `lang = getContentLang()`) and is passed down; `ContentPanel`'s own
  Model/Level/Language selects are the source of truth once mounted (mirrors
  today's `BookPage.js` pattern where the page passes initial values and the
  panel owns subsequent changes).
- No node is auto-selected on load — matches today's empty-state behavior
  (`ConceptPanel`'s `renderEmpty()` equivalent) until the user clicks a node.

### Cleanup
- Remove `nav.graph`/`nav.content` i18n keys if unused elsewhere (`grep` for
  `t('nav.graph')`/`t('nav.content')` first — only `Header.js` uses them).
- `src/components/BookViewer.js` — check for remaining references; if it was
  only used by `BookPage.js`, delete it too.
- `style.css`: retire `.cb-book-page`/`.cb-book-nav*`/`.cb-book-pane__frame`
  rules that no longer apply once `BookPage.js` is gone (keep
  `.cb-book-pane__controls/__select/__refresh` since `ContentPanel.js` reuses
  them), add new `.cb-ide-layout/.cb-ide-left/.cb-ide-right/.cb-ide-toc`
  rules.

## Files touched
- `src/main.js` — drop `/book` (and `/graph`) route registration.
- `src/router.js` — no change expected (generic `?query` matcher already
  handles this; only registrations move).
- `src/components/Header.js`, `src/i18n.js` — drop unused nav links/keys.
- `src/pages/Domain.js` — rewritten as the consolidated page.
- `src/components/GraphViewer.js` — trimmed to graph + `getPath()`/hide-chrome.
- `src/components/ContentPanel.js` — new file.
- `src/lib/paths.js`, `src/lib/contentExists.js` — new shared modules.
- `src/style.css` — new `.cb-ide-*` rules; retire book-page-only rules.
- Deleted: `src/pages/BookPage.js`, `src/components/ConceptPanel.js`,
  `src/components/BookViewer.js` (pending the grep check above).

## Verification
- `npm run dev`, open `http://localhost:5174/<base>/#/domain/<some-domain>`:
  - Graph renders left, no learning-path/notes sidebars inside the iframe.
  - Clicking a concept/application node populates the TOC (flattened,
    alphabetical) and either shows existing content or the "not generated"
    state with Generate enabled.
  - Clicking a primitive node shows its `defines` text, no Generate/TOC entry
    for itself but TOC still shows for surrounding concept/app ancestors if
    any.
  - Change Model/Level/Language → content re-resolves; Refresh re-checks
    existence after an out-of-band generation.
  - Click Generate on a missing concept → SSE log streams, iframe loads on
    done (requires `spl123` conda env + `bash scripts/start-api.sh` running,
    per `CLAUDE.md`).
  - Domain dropdown: selecting a different domain auto-navigates; Load button
    does the same explicitly.
  - Confirm `#/book` and `#/graph` no longer resolve to old pages (fall
    through to whatever the router does for unregistered paths — currently a
    no-op, matching existing behavior for any unregistered hash).

---

# Build Status — implemented 2026-09-13

The plan above has been fully implemented and verified end-to-end with a
headless browser (Playwright + system Chrome, since Claude-in-Chrome wasn't
connected in this session) — `npm run dev` and `npx vite build` both run
clean, and clicking through domain-switch, node-select, and the empty-state
Generate prompt all work as designed. Screenshots below.

**Bug found and fixed during verification:** the CSS grid override injected
into `graph.html` (`GraphViewer.js`'s `_injectLayout`) used
`grid-template-rows: 1fr auto`. A bare `1fr` track doesn't shrink below its
content's intrinsic size — classic CSS Grid "blowout" — so the graph row was
computing to ~1484px inside a ~627px-tall iframe, pushing vis-network's
node layout off-screen (this is why the graph looked completely blank in
every scenario: initial load, domain-switch auto-load, and the Load
button — it was never about the loading mechanism itself, the graph was
always fetching and rendering, just entirely out of the visible area).
Fixed with `grid-template-rows: minmax(0, 1fr) auto` in
`src/components/GraphViewer.js`.

**Second bug found and fixed:** `ContentPanel.js` originally resolved a
node's content purely by guessing `concept_{node}.html` under the *currently
selected* Model dropdown value — so a node generated only under a specific
model (e.g. `sonnet`) showed "not generated yet" whenever the Model dropdown
was left at "— default —", even though the file existed. Fixed by having
`resolveContent()` first check `domain.generated_concepts` (from
`catalog.json`, which records the exact model each file was generated with)
for a matching node at the current level/lang — preferring the
currently-selected model, else a model-less entry, else whichever's first —
and auto-syncing the Model dropdown to match when it finds one under a
different model. The guessed-path + `checkExists` fetch is now only a
fallback for content generated in the current session (via the in-app
Generate button) that catalog.json doesn't know about yet.

**Third round of fixes (from a screenshot review):**
1. **Notes drawer too short when collapsed** — the collapsed bar's
   `max-height` (42px) clipped the header + current-node label. Bumped to
   60px in `GraphViewer.js`'s injected CSS.
2. **No resizable split between graph and content panels** — added a
   draggable `.cb-ide-gutter` divider between `.cb-ide-left` and
   `.cb-ide-right` (`src/pages/Domain.js`'s `_wireResize()`, cleaned up via
   the existing `AbortController` signal), so the graph/content split can be
   dragged to taste.
3. **TOC only ever showed the selected node itself** — root cause:
   `GraphViewer.js`'s `getPath()` read `win.nodeIndex`/`win.getAncestors()`
   ancestor lookups off `win.nodeIndex`, but `nodeIndex` is a top-level
   `const` inside `graph.html`'s inline script, which (unlike a `function`
   declaration) never becomes a property of `window` — so `win.nodeIndex` was
   always `undefined` and the ancestor path silently came back empty. Fixed
   to read `win.__cb_nodeIndex` (the copy explicitly attached via `eval` in
   the frame's `load` handler) instead. TOC now correctly lists every
   concept/application node on the selected node's full prerequisite path.

**Fourth fix — gutter drag broke when crossing the graph iframe:** the
resize drag listened for `mousemove`/`mouseup` on `window`, but the left
panel contains a cross-document `<iframe>` (the graph). The instant the
cursor moved over that iframe mid-drag, those events stopped reaching the
parent window (delivered to the iframe's own document instead) — so
dragging left (which moves the cursor over the graph) silently "lost" the
drag, and releasing while still over the iframe dropped the `mouseup` too,
leaving stale state. Fixed by switching to Pointer Events with
`gutter.setPointerCapture(e.pointerId)`, which redirects all pointer events
for that pointer to the gutter element regardless of what's visually
underneath — verified with a drag that crosses deep into the iframe area in
both directions, tracks correctly throughout, and settles cleanly on
release.

**Fifth round (UX refinements):**
1. **Default split ratio set to 40/60** — `.cb-ide-left` now defaults to
   `flex: 0 0 40%` in `style.css` (was an implicit ~55/45 via `flex: 1.2`);
   the drag gutter still overrides this with an explicit inline `%` once
   used.
2. **TOC no longer recomputes on every click** — previously, clicking a TOC
   entry called `graphViewer.selectNode()`, which re-triggered the graph's
   own selection → `cb:nodeSelected` → `renderToc()`, so the TOC kept
   reshaping itself to whatever node you'd just clicked *inside* the TOC
   (a shallower node has a shorter prerequisite path, so the list would
   shrink/reorder mid-browsing). Fixed by splitting `ContentPanel.js`'s
   selection into two independent pieces of state: `anchorNodeId` (the node
   actually clicked in the *graph* — this is what the TOC is computed from,
   via `renderToc()`) and `displayNodeId`/`displayNode` (whichever node's
   content is currently shown, which a TOC click updates directly along
   with its own highlight, without ever calling back into the graph or
   rebuilding the list). The TOC is now stable for the whole time you're
   reading through a given node's prerequisite chain, and only re-anchors
   when you click a fresh node in the graph itself. Verified: selecting
   "density calculation" builds a 10-entry TOC; clicking "volume" within it
   (whose own path is much shorter) keeps the same 10 entries, just moves
   the highlight and loads volume's content.

**Sixth round (graph panel top bar, Notes as a fixed resizable pane, and a
Generate reliability fix):**
1. **Search + Re-Center moved to a top bar** — `GraphViewer.js` now builds
   its own top bar (outside the iframe) with a search input + Search button
   (left) and a Re-Center button (right). Search matches node label/id
   (case-insensitive substring) against `win.__cb_RAW.nodes`, then calls the
   iframe's own `selectNode()` + `network.focus()`; Re-Center calls the
   iframe's existing `reCenterGraph()`. The original in-iframe Re-Center
   button is hidden (`display:none`) since it's now duplicated outside.
2. **Notes is now a fixed, always-expanded, resizable pane** — replaced the
   collapsible bottom drawer with a real Graph/Notes split (default 80/20),
   draggable via a `.cb-notes-gutter` divider. This drag happens *within*
   the iframe's own document (both panes and the gutter are in the same
   document as the graph canvas), so — unlike the outer graph/content
   gutter — no cross-document pointer-capture concern applies; still used
   `setPointerCapture` for consistency and robustness. Removed the
   collapse/expand arrow and related CSS entirely.
3. **Generate button could get stuck on "Generating…" forever** — traced to
   a real bug on both ends:
   - **Backend** (`api/services/executor.py`): `asyncio.create_subprocess_exec("spl3", ...)`
     was called with no try/except. When `spl3` isn't on PATH (API server
     not started inside the `spl123` conda env), this raises
     `FileNotFoundError` *before* any SSE event is sent, crashing the stream
     with an unhandled exception instead of a clean `gen_error`.
   - **Frontend** (`ContentPanel.js`): when an SSE connection drops without
     a `gen_error`/`done` ever arriving, the browser's `EventSource` auto-
     reconnects by default — and the old `onerror` handler only reset the UI
     when `readyState === CLOSED`, which never happens during that silent
     auto-retry loop, so the button stayed on "Generating…" indefinitely
     (repeatedly hitting the same backend failure with no visible feedback).
   - Fixed both: the backend now catches `FileNotFoundError` around the
     subprocess spawn and yields a proper `gen_error` event explaining the
     conda-env requirement; the frontend's `onerror` now unconditionally
     closes the connection and resets the button on *any* error, rather than
     waiting for a `CLOSED` state that a silent retry loop never reaches.

**Follow-up:** the user confirmed the API *was* being run inside the
`spl123` conda env — the `spl3 not found on PATH` `gen_error` still fired.
This means simple PATH inheritance is the actual failure mode: `uvicorn
--reload` runs the app inside a supervisor/worker process pair, and
however that reload machinery spawns the worker, the shell's
conda-activated `PATH` doesn't reliably survive into `os.environ` of the
worker process — even though the worker's own Python interpreter is
unambiguously `spl123`'s (confirmed by the traceback's own
`spl123/lib/python3.11/site-packages` paths, and independently verified by
running `/home/gongai/anaconda3/envs/spl123/bin/python -c "..._resolve_spl3()"`
directly). Fixed `executor.py`'s `_resolve_spl3()` to stop trusting `PATH`
at all: it now looks for `spl3` as a sibling file of `sys.executable`
first (same env, guaranteed present, no PATH involved) and only falls back
to a `PATH` search — sidestepping the inheritance question entirely. Also
made the `gen_error` message include which path was tried and what
`sys.executable` actually is, for faster diagnosis if this ever recurs for
a different reason.

**Actual root cause, found on the next round:** the `sys.executable`-sibling
fix *did* resolve to the real, executable `spl3` binary (verified directly:
`.../spl123/bin/spl3 --help` runs fine) — yet the same `gen_error` still
fired, now explicitly naming that resolved absolute path as the one that
"wasn't found". That's the tell: `asyncio.create_subprocess_exec(...,
cwd=str(spl_dir), ...)` raises the exact same `FileNotFoundError` when
`cwd` doesn't exist as when the executable doesn't — and `settings.spl_dir`
turned out to be bogus. `api/config.py`'s `spl_dir` field defaults to
`Path.home() / "projects/digital-duck/SPL.py"` (properly expanded), but
this repo's `.env` sets `CB_SPL_DIR=~/projects/digital-duck/SPL.py`, and
pydantic-settings does **not** expand `~` when populating a `Path` field
from an env var — it lands as a literal `Path("~/projects/digital-duck/SPL.py")`,
which (since it doesn't start with `/`) resolves relative to the process's
cwd, not `$HOME`, and silently doesn't exist. Confirmed with
`settings.spl_dir.exists()` → `False` before the fix, `True` after. Fixed
by adding a `field_validator` on `spl_dir`/`public_domains` in
`api/config.py` that calls `.expanduser()` after pydantic parses them —
verified end-to-end by spawning `spl3 --help` with the corrected `cwd`
exactly as `executor.py` does, which now returns exit code 0.

**Also:** the Generate log header now shows level and language alongside
model (`▶ target: … model: … level: … language: …`), not just model.

**Real root cause, found on the third round:** even with the `cwd` fix,
generation still failed — but this time with a *different, more useful*
traceback from `spl3` itself (not `executor.py`): `setup_domain` raised
`FileNotFoundError` for `.../cb-chemistry-ide/spl/chemistry_ch01_graph.yaml`.
That file has never existed — `executor.py` was passing
`--param domain_yaml={domain_id}_graph.yaml` as a **bare filename**, which
`SPL.py`'s `graph_lib.load_domain()` resolves relative to the `spl/`
directory it ships with (`tools.py`'s own folder), expecting every domain to
also have a hand-copied `{domain}_graph.yaml` sitting there — cookbook-recipe
style. This app's actual domain data lives at
`public/domains/{domain}/input/graph.yaml`, a completely different
location. `scripts/batch_generate.py` already had the fix and a comment
explaining exactly this (`_run_spl3()`'s `domain_yaml_path = DOMAINS_DIR /
domain_id / "input" / "graph.yaml"`, passed as an absolute path — absolute
paths are honored as-is, bypassing the relative-lookup fallback entirely);
`executor.py` (the live API's generate endpoint) never got the same fix.
Applied it: `domain_yaml_path = settings.public_domains / domain_id /
"input" / "graph.yaml"`, passed as `--param domain_yaml={domain_yaml_path}`.

This also surfaced a second, more consequential latent bug in the same
family as the `spl_dir` tilde issue: `settings.public_domains` was *also*
relative (`.env`: `CB_PUBLIC_DOMAINS=./public/domains`), so `output_dir` —
where generated HTML actually gets written — had been relative too, evaluated
against whatever `cwd` happened to be at the time (the spl3 subprocess's
`cwd` is `spl_dir`, a *different repo*, so a relative `public_domains` would
resolve there instead, silently). `batch_generate.py` was immune since it
computes its own always-absolute `DOMAINS_DIR`; only the live API path was
exposed. Fixed `api/config.py`'s validator to anchor any relative path to
the repo root (`_REPO_ROOT`, same base as `public_domains`'s own default)
in addition to expanding `~`, rather than trusting either `~` or a bare
relative string to resolve correctly against whatever `cwd` a given
subprocess happens to run with.

Verified for real this time: ran the exact fixed command directly via
`spl3 run …` — `setup_domain` succeeded, cache hits worked (0 LLM calls for
an already-generated section), and a fresh section generated correctly with
a real LLM call. Then verified through the actual browser end-to-end: started
the real API server (inside the spl123 env, exactly as the user runs it,
including `uvicorn --reload`) and the real Vite dev server, clicked Generate
in the running UI, and confirmed the button returns to "Generate" (not
stuck), the log streams the real spl3 output, and the content iframe reloads
with the freshly generated section.

**Also added:** a **Copy** button on the Generate log panel (top-right,
absolute-positioned) that copies the full log text to the clipboard —
verified via a real clipboard read in the browser test above.

## What changed

**New:**
- `src/lib/paths.js` — `conceptUrl()`, `bookUrl()`, `parseLevelLangModel()`.
- `src/lib/contentExists.js` — `checkExists()`, `markKnownUrls()`,
  `clearExistsCache()`.
- `src/components/ContentPanel.js` — the new right panel: Model / Level /
  Language / Refresh / **Generate** / **Export PDF** controls, a flattened
  alphabetical TOC (concept/application nodes on the selected node's
  prerequisite path), and content resolution (`concept_{node}.html` if it
  exists, else a "not generated yet" prompt).

**Rewritten:**
- `src/pages/Domain.js` — now the single consolidated IDE page at
  `/domain/:id`: top domain picker + **Load** button (auto-loads on change,
  explicit Load also works), graph on the left, `ContentPanel` on the right.
- `src/components/GraphViewer.js` — trimmed to the graph iframe + a
  `getPath(nodeId)` / `selectNode(nodeId)` bridge. CSS-only relayout hides
  the old learning-path/explanation panels and turns the **Notes** sidebar
  into a collapsible bottom drawer under the graph (collapsed by default;
  click to expand) — its `localStorage` note-taking JS is untouched.

**Removed:**
- `/book` and `/graph` routes, `src/pages/BookPage.js`,
  `src/components/ConceptPanel.js`, `src/components/BookViewer.js`, and the
  header's Graph/Content nav links (`nav.graph`/`nav.content` i18n keys too).

**Incidental fix:**
- `.gitignore` had a generic `lib/` rule (leftover Python boilerplate) that
  was silently swallowing `src/lib/` — added `!src/lib/` so the new shared
  modules are actually tracked.

## Build status: Opus 5 code review response (2026-09-13)

**Request:** Opus 5 reviewed the day's refactoring work (see
`docs/Graph-IDE/readme-opus-review.md`) and found 19 issues (2 HIGH, 8
MEDIUM, 9 LOW). Asked to address every finding before the next manual test
pass.

**HIGH:**
- Backend was bound to `0.0.0.0` with wildcard CORS, but now holds
  user-supplied LLM API keys (Settings page) and has side-effecting GET
  endpoints (`/api/generate`, `/api/pdf`) — any device on the LAN, or any
  website the browser visits, could reach it. Fixed: `start-api.sh` binds
  `127.0.0.1`; `api/app.py`'s CORS narrows to the `DEV_PORT`-derived
  localhost origin(s) with restricted methods/headers.
- `domain`/`target`/`level`/`language`/`model` query params flowed straight
  into filesystem paths with no validation — `..` or an absolute path could
  escape `public/domains/`. Fixed: new `api/services/path_safety.py`
  (`safe_segment`/`safe_optional_segment`/`assert_within`), wired into
  `generate.py`/`pdf.py`'s routers and as a belt-and-suspenders check inside
  `pdf_svc.py`. Also removed a redundant `unquote()` call in `executor.py`
  that would have re-decoded already-validated strings.

**MEDIUM:**
- Level selector didn't affect generated content: `build_concept_book.spl`
  has no `@lvl` input, only `@style`, so `--param lvl=...` was a silent
  no-op and every request generated at the hardcoded `@style` default
  regardless of the requested level. New `scripts/level_style.py` (the
  level→style map + math-tag research/research_applied fallback, extracted
  from `scripts/batch_generate.py` which already had this logic — both now
  import the same module instead of duplicating it) is used by
  `executor.py` to resolve and pass the correct `--param style=`. Also
  added `@model` to the workflow's cache-key params (`@_params_json`) —
  the content cache is keyed only by concept+params, not by `output_dir`,
  so two models could otherwise silently share one cache slot.
- `pdf_svc.py`'s catalog write bypassed the locked `update_catalog()` path
  and its PDF dedup only keyed on `target` (a second export at a different
  level/language/model silently overwrote the first's catalog entry).
  Rewrote to route through `catalog_lock.update_catalog()` and dedup on the
  full `(target, level, language, model)` tuple, update-in-place.
- API key "is it set" flags on the Settings page ignored bare
  (non-`CB_`-prefixed) env vars like `ANTHROPIC_API_KEY`, even though
  generation already picks those up (the subprocess env starts from a full
  `os.environ` copy) — the page would wrongly claim no key was configured.
  `settings.py` now falls back to checking the bare var.
- Settings (including API keys) are in-memory only and wiped by `--reload`
  or any restart. Documented this in `update_settings()`'s docstring rather
  than persisting keys to disk — that's a bigger decision than this page's
  scope; a key can be pre-seeded durably via `.env`'s `CB_*_API_KEY` vars.
- `ContentPanel.js`'s "not generated yet" empty state lost the node's
  `defines` blurb when the primitive-only restriction was removed earlier —
  restored it.
- Added a resolve-token guard in `ContentPanel.js`'s `resolveContent()` so
  a slow lookup for a node the user has since clicked away from can't
  clobber the currently-displayed content with stale content.
- `catalog_svc.py`'s `mark_book_generated()` had the same double-slash bug
  (`output/variant//html/...` when `model=""`) that `pdf_svc.py` already
  guarded against — applied the same `model_seg` fix.
- Collapsed the adapter↔env-var↔settings-field mapping (previously
  duplicated across `executor.py` and `settings.py`) into one shared
  `api/services/adapters.py` table.

**LOW:**
- `@skip_cache` now accepts `"true"`/`"1"` as well as `"yes"` (new
  `normalize_bool()` tool in `tools.py`, called once at the top of the
  workflow).
- `build_book_index()` no longer renders an empty `<section></section>`
  for a non-application target's payoff-less book page.
- `PUT /api/settings`'s `llm` value is now validated against the known
  adapter prefixes before being saved, instead of failing deep inside a
  later `spl3` subprocess.
- Fixed stale TOC empty-state copy ("No generatable concepts" → "No
  concepts found") now that primitives get full Generate treatment too.
- Clamped `GraphViewer.js`'s zoom scale to `[0.1, 4]` so repeated
  Zoom In/Out clicks can't scale the graph to nothing or to a useless blur.

**Verification:**
- `python3 -c "from api.app import app"` under the `spl123` env loads
  clean; the already-running `--reload` dev server picked up every change
  live with no crash.
- `curl /api/settings` — key `_set` flags reflect real state.
- `curl -X PUT /api/settings -d '{"llm":"bogus:xyz"}'` → `400` with a clear
  message (L4 confirmed).
- `curl "/api/generate?domain=../../etc&target=passwd"` and the same
  against `/api/pdf` → both `400 Invalid domain` (H2 confirmed).
- Real end-to-end generate: `chemistry_ch01` / `atom` / `level=intro` /
  `model=gemma4` (local Ollama, free) with `skip_cache=true` — output was
  genuinely Feynman-style ("Picture this... LEGO bricks... Now you try?"),
  confirming the level→style fix actually changes content (M1). The
  resulting `book_atom.html` had no empty `<section>` (L2 confirmed, since
  `atom` isn't an application-kind target). Test artifacts (generated
  files, the catalog.json entries they created, the run log) were cleaned
  up afterward.
- `spl3 validate spl/build_concept_book.spl` — OK, no new errors from the
  `@model` input param or `normalize_bool` call (pre-existing WARNs are
  about custom tools the validator doesn't know about, unrelated to this
  change).
- H1's bind/CORS narrowing wasn't verified against a fresh process start —
  the dev server already running throughout this session was started
  before the fix and a bind change only takes effect on next process
  restart (unlike `--reload`, which only reloads app code). Restart
  `start-api.sh` to pick it up.

## Build status: direct-adapter API keys + drop Compare Cache (2026-09-13)

**Request:** (1) add Anthropic / Gemini / OpenAI as adapters alongside
Ollama / OpenRouter / Claude CLI, each with an API Key field the user can
enter their own key into (OpenRouter gets one too); (2) drop the "AI
Semantic Compare Cache" settings section — content-compare is no longer
supported.

**(1) New adapters + API keys:**
- `src/pages/Settings.js`: added `anthropic` / `openai` / `google` (labeled
  "Gemini" — see note below) to the `ADAPTERS` map, each with a small fixed
  model list. Added a password-type "API Key" field that shows/hides based
  on the selected adapter (`API_KEY_ADAPTERS` set — hidden for `claude_cli`
  and `ollama`, since one authenticates via local CLI login and the other
  is local, neither needs a key).
- **Adapter naming note:** SPL.py's own adapter registry
  (`spl/adapters/__init__.py`) names the Gemini adapter `"google"`, not
  `"gemini"` — so the Settings dropdown's internal value/`--llm` prefix is
  `google:...` while the user-facing label and the config field name both
  say "Gemini" (`gemini_api_key`) for clarity. `executor.py`'s
  `_ADAPTER_SETTINGS_FIELD`/`_ADAPTER_ENV_VAR` maps handle this translation.
- `api/config.py`: added `anthropic_api_key` / `gemini_api_key` /
  `openai_api_key` / `openrouter_api_key` fields (empty by default,
  overridable via `.env`, in-memory only otherwise — same lifecycle as
  every other Settings-page value here).
- `api/routers/settings.py`: `SettingsResponse` now returns
  `{adapter}_api_key_set: bool` flags instead of ever echoing a saved key
  back to the browser; `SettingsUpdate` accepts the plaintext key fields
  (only applied when explicitly sent, so a save that doesn't touch the key
  field leaves the stored one untouched).
- `api/services/executor.py`: each of SPL.py's direct adapters
  (`spl/adapters/{anthropic,openai,google,openrouter}.py`) reads its key
  from one specific env var (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
  `GOOGLE_API_KEY`, `OPENROUTER_API_KEY`) with no CLI param to pass one in
  directly — so `stream_generate()` now parses the resolved `llm` string's
  adapter prefix and injects the matching saved key into the `spl3`
  subprocess env when one is set.
- Settings.js UI: on load, shows "A key is already saved — enter a new one
  to replace it, or leave blank to keep it" per adapter, without ever
  populating the input with the actual value.

**(2) Compare Cache removed entirely** (not just the settings UI — the
whole feature, since it's fully unused elsewhere in the app):
- Deleted `api/routers/compare.py`, `api/services/compare_svc.py`; dropped
  `compare.router` from `api/app.py`.
- Removed `compare_cache_ttl` from `api/config.py` and both
  `SettingsResponse`/`SettingsUpdate` in `settings.py`.
- Removed the "AI Semantic Compare Cache" section, its `ttlHint()` helper,
  and all associated JS wiring from `Settings.js`.
- `.env`: removed the `CB_COMPARE_CACHE_TTL` block, added a documented (but
  empty-by-default) block for the four new `CB_*_API_KEY` vars as an
  optional way to pre-seed a key at boot instead of through the UI.

**Verification:** restarted the real API server — `GET /api/settings` no
longer returns `compare_cache_ttl` and now returns the four `*_api_key_set`
flags (all `false` initially); `PUT` with `anthropic_api_key` set it to
`true` without ever echoing the key back; `GET /api/compare` → `404`
(router gone). Headless browser check: API Key field hidden for Claude CLI,
shown with Gemini's 3 models populated for the Gemini adapter; full
save→reload round trip confirmed the key input stays empty after reload
while the "already saved" hint appears and the key persists functionally
(`anthropic_api_key_set: true`). Test key cleared afterward.

## Build status: footer SPL link opens in a new tab (2026-09-13)

**Reported:** clicking the footer's "SPL" link navigated inside the
Content panel's iframe (which then failed to load github.com, presumably
sandboxed/blocked from within the iframe context) instead of opening a
normal browser tab.

**Fix:** added `target="_blank" rel="noopener"` to the anchor in both
`spl/tools.py` templates (`_CONCEPT_PAGE_TEMPLATE` and
`_BOOK_INDEX_TEMPLATE`), and bulk-applied the same attribute addition to
all 616 already-generated `.html` files under `public/domains/**` (same
exact-string sed substitution pattern as the earlier footer rephrase).

**Verification:** headless browser check — clicking the link now fires a
genuine new-tab/popup navigation event while the original iframe page's URL
stays unchanged, confirmed via `context.waitForEvent('page')`.

## Build status: footer credit rephrased + hyperlinked (2026-09-13)

**Request:** rephrase the generated-page footer "Generated by SPL · Powered
by SPL.py" to "Generated and Powered by SPL", with SPL hyperlinked to
https://github.com/digital-duck/SPL.py.

**Change:** `spl/tools.py`'s `_CONCEPT_PAGE_TEMPLATE` and
`_BOOK_INDEX_TEMPLATE` both had this exact footer string — updated both to
`Generated and Powered by <a href="https://github.com/digital-duck/SPL.py">SPL</a>`.
(Left the book-index page's separate `{domain_title} · Generated by SPL`
subtitle line as-is — that's different text than the quoted footnote.) The
existing `footer.spl-credit a{color:#2563eb;text-decoration:none}` CSS rule
already styles footer links, so no CSS change was needed.

**Rollout:** since these are baked into already-generated static HTML (not
computed at view time), a template-only fix wouldn't reach any existing
page — only future generations. Bulk-updated all 614 already-generated
`.html` files under `public/domains/**` with the same exact-string
substitution (verified 0 occurrences of the old string and 614 of the new
one afterward, diffed a sample file to confirm nothing else changed).

**Verification:** loaded a regenerated page in a real browser — footer
renders as "Generated and Powered by **SPL**" with SPL as a styled link,
`href` confirmed pointing to `https://github.com/digital-duck/SPL.py`.

## Build status: primitives get full Generate treatment (2026-09-13)

**Reported:** clicking a primitive node (e.g. `atom`, `energy`) showed only
its one-line `defines` blurb from `graph.yaml`, with both Generate and
Export PDF greyed out — "for primitive concept, we should have the best
content generated."

**Root cause:** purely a frontend restriction. `ContentPanel.js`'s
`resolveContent()` special-cased `kind === 'primitive'` to short-circuit
straight to the bare `defines` text and disable both buttons, before ever
attempting to resolve or generate real content. The backend has never had
this restriction — `write_section()` in `build_concept_book.spl` is
kind-agnostic and already produces a full section (definition/worked
example/theorem/lab cell) for any target regardless of kind; primitives
already got full generated pages whenever they showed up as someone else's
*prerequisite* (e.g. `concept_matter.html`, `concept_mass.html` already had
rich content from earlier runs) — they just couldn't be generated by
clicking them *directly*.

**Fix:** removed the `kind === 'primitive'` early-return in
`resolveContent()` entirely — primitives now go through the exact same
catalog-lookup / exists-check / Generate flow as concepts and applications.
(The payoff-skip logic added earlier already handles primitives correctly
on the backend side — `target_kind` returns `"primitive"`, so payoff is
skipped same as for concepts, 0 wasted LLM calls.) Also removed the
now-dead `.cb-ide-primitive` / `.cb-kind-badge` / `.cb-kind--*` CSS rules
that only existed to style the old bare-blurb state.

**Verification:** two headless-browser runs against the real API server —
(1) clicked `atom` (which already had generated content from an earlier
session) → full page loaded immediately, Generate/PDF enabled, no code
change needed to *display* it, confirming the bug was purely about the
disabled button blocking new generation; (2) clicked `energy` (no prior
content) → showed "Not generated yet", clicked Generate → 1 LLM call,
10.6s, `✓ Done`, full Definition/Worked-example/Key-theorem page rendered.
Test-generated `energy` content and its catalog.json entries were removed
afterward to keep the working tree clean.

## Build status: graph node tooltip showed raw HTML (2026-09-13)

**Reported (screenshot):** hovering a node in the graph showed a literal
`<b>exact number</b> [concept]<br>A number derived by...` box instead of a
formatted tooltip — the markup tags rendered as visible text, not applied.

**Root cause:** `scripts/concept_graph.py` builds each vis.js node's
`title` as a plain template-literal string containing HTML (`<b>...</b>
[...]<br>...`). vis-network only interprets `title` as HTML when it's given
an actual DOM element — a plain string is inserted as literal text in the
`.vis-tooltip` box, so the tags show up raw on hover. Pre-existing bug in
the graph template, unrelated to any of the IDE consolidation work above.

**Fix:** added `_nodeTooltip(n)`, which builds a real `<div>` via
`document.createElement` + `.innerHTML` and returns that element as
`title`, instead of the raw string.

**Verification:** headless browser hover test — before the fix,
`.vis-tooltip`'s `innerHTML` was the literal escaped string; after,
`document.querySelector('.vis-tooltip').innerHTML` returns
`<div><b>exact number</b> [concept]<br>A number derived by counting or by
definition that carries no measurement uncertainty.</div>`, and the
screenshot shows a properly bolded/line-broken tooltip.

**Rollout:** since `graph.html` is generated (not hand-written) per domain,
regenerated it for all 21 `chemistry_ch*` domains via `concept_graph.py
--domain <graph.yaml> visualize --format html --output <graph.html>` — a
deterministic, local, no-LLM operation. Diffed every file afterward to
confirm only the tooltip-construction lines changed, nothing else drifted.

## Build status: TOC kind tags — 🎯 application / ⚛️ primitive (2026-09-13)

**Request:** tag application and primitive nodes in the TOC with an
icon/emoji; leave plain concept nodes (the majority) untagged.

**Change:** `ContentPanel.js`'s `renderToc()` previously filtered primitives
out of the TOC entirely (`n.kind !== 'primitive'`) per the original design —
only concept/application nodes were listed. Since primitives should now be
visible (just tagged, not hidden), that filter was dropped; a primitive
click already worked correctly via `resolveContent()`'s existing
`kind === 'primitive'` branch (shows its `defines` text, no Generate), so no
other logic changed. Each entry's label is now prefixed via a
`_TOC_KIND_TAG` map (`application: '🎯'`, `primitive: '⚛️'`); concept nodes
get no prefix.

**Verification:** headless browser check selecting `density_calculation` —
TOC showed `🎯 density calculation` (the application target) and `⚛️ mass`
/ `⚛️ matter` / `⚛️ measurement` (primitives in its prerequisite path), with
the remaining 9 concept entries unmarked.

## Build status: payoff only for application-kind targets (2026-09-13)

**User's proposal:** since `graph.yaml` already tags every node's `kind`
(`primitive`/`concept`/`application`), only generate the payoff/capstone
wrap-up when the target actually *is* an application — a true "natural
endpoint" — not for a concept or primitive the user just happened to click
directly in the IDE.

**Agreed, and it's a stronger case than it first looked:** `write_concept_html()`
writes each concept's own section only — payoff is baked exclusively into
`book_{target}.html` (the separate TOC-index artifact), never into
`concept_{target}.html`, which is what `ContentPanel.js` actually displays
for every concept click. So for a concept-kind target, the payoff LLM call
was previously being paid for on *every* Generate click with **zero
user-visible effect** on the page normally shown — pure waste, not just a
"the framing is a bit forced" issue.

**Fix:**
- `spl/tools.py`: new `target_kind(domain_yaml)` tool — reads the cached
  graph's `nodes[target]["kind"]` (`"primitive"` | `"concept"` |
  `"application"`), set by `graph_lib.build()` from which top-level YAML
  section (`primitives:`/`concepts:`/`applications:`) the node came from.
- `build_concept_book.spl`: step 3 now calls `target_kind` first and only
  runs the (cached) payoff generation when it's `"application"`; otherwise
  logs the skip and sets `@capstone := ""` — 0 LLM calls, no cache lookup
  needed at all. The final `@textbook := ... + @capstone` append is now
  guarded so an empty capstone doesn't leave a dangling `---` divider.
  `build_book_index()` already handles an empty `payoff` string gracefully
  (renders an empty section), so `book_{target}.html` for a concept target
  is unaffected beyond having no payoff paragraph.

**Verification:** ran both cases directly via `spl3 run`:
- `target=si_units` (kind=`concept`, domain `chemistry_ch01`) →
  `Target kind: concept` / `target kind is 'concept', not 'application' —
  skipping payoff (0 LLM calls)` — 0 total LLM calls (both sections were
  cached too).
- `target=density_calculation` (kind=`application`) → `Target kind:
  application`, payoff cache MISS then HIT on rerun exactly as before —
  confirms application targets are completely unaffected by this change.

## Build status: wire up the "Skip cache" checkbox (2026-09-13)

**Follow-up to the payoff-caching fix above.** `api/services/executor.py`
already sent `--param skip_cache=yes|no` to `spl3 run`, but
`build_concept_book.spl` never declared `@skip_cache` as a workflow input,
so it was silently dropped — the checkbox did nothing.

**Fix:**
- Added `@skip_cache TEXT DEFAULT 'no'` to the workflow's `INPUT:` list.
- Both cache checkpoints (per-section, and the payoff cache added above) now
  branch on it: `skip_cache="yes"` treats the lookup as an outright miss
  (skipping `cache_get` entirely) rather than calling the LLM and then
  discarding the cached answer — forcing exactly one fresh LLM call per
  section/payoff. The subsequent `cache_put` still runs, so the fresh
  content becomes the new cached entry for later non-skip runs (skip-cache
  refreshes the cache rather than bypassing it permanently).

**Verification:** ran the workflow three times back-to-back against
`si_units` (college/en/sonnet): `skip_cache=no` → all 3 cache HITs, 0 LLM
calls; `skip_cache=yes` → all 3 forced MISSes, 3 LLM calls (`skip_cache=yes
— forcing regeneration for ...` logged for each); `skip_cache=no` again →
back to all 3 HITs, confirming the skip-cache run's output became the new
cache baseline rather than a one-off throwaway.

**Note:** these verification runs regenerated `concept_measurement.html`
and `concept_si_units.html` with fresh (non-deterministic) LLM phrasing of
the same concepts — harmless content churn from testing, not a functional
change to those pages.

## Build status: Payoff section wasn't cached (2026-09-13)

**Reported:** regenerating an already-generated concept (`si_units`, college/en/
sonnet) still took ~16s even though both its sections showed `cache HIT ...
(0 LLM calls)` in the log.

**Root cause:** `spl/build_concept_book.spl` caches each *section* via
`cache_get`/`cache_put` (Layer 2 content cache), but step 3 ("Capstone: tie
target to its payoff applications") called `GENERATE write_payoff(...)`
unconditionally — no cache lookup at all. So every Generate click re-ran the
capstone LLM call regardless of whether the sections themselves were fully
cached; the pasted log's `GENERATE segment 1 (write_payoff) -> 836 tokens,
15966ms` was exactly this uncached call, accounting for the entire 16.3s.

**Fix:** wrapped the payoff step in the same `cache_get`/`cache_put` pattern
sections already use, keyed as `"{target}__payoff"` (distinct from the
target's own section cache entry, which is keyed by the bare concept id) so
the two don't collide.

**Verification:** ran `spl3 run build_concept_book.spl` directly (same
params as the reported log — `si_units` / college / en / sonnet) twice.
First run (creating the new `si_units__payoff` cache entry) still cost one
LLM call; the second run showed `cache HIT for si_units__payoff — reusing
verified payoff (0 LLM calls)` and the whole workflow completed in **0.3s**
with **0 LLM calls**, down from 16.3s.

**Related, not fixed (flagging only):** the "Skip cache" checkbox in the
Generate controls sends `skip_cache=yes/no` as a workflow param, but
`build_concept_book.spl` never declares or reads `@skip_cache` anywhere —
it's currently a no-op on the backend regardless of the checkbox state. Left
alone for now since it's a separate, pre-existing gap from what was
reported; happy to wire it up (bypass both section and payoff cache lookups
when set) if wanted.

## Build status: Zoom In/Out buttons + Skip-cache reorder (2026-09-13)

**Request:** tablet users have no mouse wheel — add explicit Zoom In/Zoom Out
buttons next to Re-Center; also move the "Skip cache" checkbox to sit next
to Generate instead of after Export PDF.

- `GraphViewer.js`: added `Zoom −`/`Zoom +` buttons in a new
  `.cb-graph-topbar__view-controls` group alongside Re-Center. Wired via a
  `_zoom(factor)` helper calling `network.moveTo({ scale: network.getScale()
  * factor, animation: {...} })` on the iframe's vis.js `Network` instance.
  `network` is a top-level `const` inside `graph.html`'s script (never
  attached to `window`), so it's exposed the same way `RAW`/`nodeIndex`
  already are — via `win.eval('... window.__cb_network = network')` in the
  iframe `load` handler. Fixed a latent related bug while here: the Search
  button's "focus matched node" call referenced `win.network` directly,
  which was always `undefined` (silently no-op'd via optional chaining) —
  now uses `win.__cb_network`.
- `style.css`: `.cb-graph-topbar__view-controls` (flex row) and
  `.cb-graph-topbar__zoom` (shares sizing with search/recenter buttons).
- `ContentPanel.js`: reordered `controls.append(...)` so `skipCacheLbl` comes
  right after `genBtn`, before `pdfBtn` — `.cb-ide-pdf-btn`'s existing
  `margin-left: auto` still pushes Export PDF to the row's right edge since
  it's now the last element.
- Verified with a headless Playwright check against the real dev server:
  `network.getScale()` went 0.173 → 0.217 after one Zoom + click, then down
  to 0.166 after two Zoom − clicks — confirms both buttons actually drive
  the graph's zoom.

## Build status: Export PDF fix + button alignment (2026-09-13)

**Reported:** "Export to PDF" does not work; also move the Export PDF button
to the right side of the content panel's controls row.

**Root causes (two, stacked):**
1. `api/services/pdf_svc.py` built `html_dir`/`pdf_dir` without the `model`
   path segment (`output/{level}.{lang}/html/`), but every concept page this
   IDE actually generates/displays lives one level deeper, under
   `output/{level}.{lang}/{model}/html/` — so the existence check always
   missed model-tagged content.
2. Even with the model segment fixed, it was looking for `book_{target}.html`.
   The IDE's content panel displays **per-node concept pages**
   (`concept_{nodeId}.html`, via `lib/paths.js`'s `conceptUrl()`), not the
   full book index — `target` sent by `ContentPanel.js`'s PDF button is
   always the currently displayed *node* id, which almost never has a
   matching `book_*.html`. `generate_pdf()` now tries `concept_{target}.html`
   first (matching what's on screen) and falls back to `book_{target}.html`
   if that exists instead (covers exporting a capstone/full-book target).

**Fix:**
- `api/services/pdf_svc.py`: `generate_pdf()` takes a new `model` param,
  includes it in `html_dir`/`pdf_dir`, and picks `concept_`/`book_`
  whichever HTML file actually exists for `target`.
- `api/routers/pdf.py`: `/api/pdf` now accepts `&model=`.
- `ContentPanel.js`: PDF fetch URL passes `&model=${state.model}` (already
  kept in sync with the catalog's recorded model via `resolveContent()`'s
  auto-sync, so this is correct even when the Model dropdown itself is still
  on "— default —").
- `style.css`: `.cb-ide-pdf-btn { margin-left: auto }` pushes Export PDF (and
  the skip-cache checkbox after it) to the right edge of the controls row.

**Verification:** direct Python call to `generate_pdf()` against a real
generated concept page (`chemistry_ch01` / `matter` / college.en / sonnet)
initially reproduced "HTML not found" with the old code, then succeeded and
produced a real PDF after the fix — needed `npx playwright install chromium`
first since `html2pdf.js`'s Playwright browser wasn't downloaded in this
environment (unrelated to the path bug, but blocked verification until
installed).

## How to run it

```bash
npm run dev
# open http://localhost:<port>/<base>/#/domain/chemistry_ch01
# (or any id from public/domains/catalog.json)
```

Full-stack (needed for Generate/Export PDF to actually work):
```bash
conda activate spl123
bash scripts/start-api.sh   # separate terminal
npm run dev
```

## Things to click through

- Graph renders left with **no** learning-path/notes sidebars visible by
  default; the Notes bar sits collapsed at the bottom of the graph panel —
  click it to expand/collapse.
- Click a **concept**/**application** node → TOC fills in (right panel,
  alphabetical, current node highlighted) and content either loads or shows
  "not generated yet" with **Generate** enabled.
- Click a **primitive** node → shows its definition text only, no
  Generate/PDF.
- Change Model/Level/Language → content re-resolves for the new combo;
  🔄 Refresh re-checks existence (useful after generating out-of-band).
- Click **Generate** on a missing concept → SSE log streams below the
  controls, content loads in place when done.
- Click **Export PDF** on an existing concept → opens the generated PDF in a
  new tab.
- Domain dropdown at the top: selecting a domain auto-navigates; **Load**
  button does the same explicitly.
- Confirm `#/book` and `#/graph` no longer resolve to anything (old routes
  are gone).
