```User

Please review a batch of refactoring/bug-fix work done this afternoon on
the ConceptBook Graph-IDE app (repo: cb-chemistry-ide). All changes have
already been manually tested end-to-end by me in the running app — this
review is for code quality, correctness, security, and anything I might
have missed, not for re-doing functional QA.

Start by reading docs/Graph-IDE/readme-plan.md — it has a running changelog
with a dated "Build status" entry for every change below, including root
causes and how each was verified. Then review the actual diffs.

## Scope (today's changes only — ignore the earlier Graph-IDE consolidation
## further up in the same changelog, that's from a prior session)

**Files changed:**
- api/app.py, api/config.py, api/routers/pdf.py, api/routers/settings.py,
  api/services/executor.py, api/services/pdf_svc.py
- spl/build_concept_book.spl, spl/tools.py
- src/components/GraphViewer.js, src/components/ContentPanel.js
  src/pages/Settings.js, src/style.css
- Bulk sed edits across ~616 already-generated HTML files under
  public/domains/**/output/**/*.html (footer text/link only — skip these,
  just spot check one or two)
- Separately: SPL.py's spl3/cli.py got a new `spl3 util clean-port`
  subcommand (different repo — mention if you want it reviewed
  I'll send that separately)

**What changed, roughly in order:**
1. Fixed Export PDF (was resolving the wrong file path — missin
   {model} folder segment, and looking for book_*.html instead of
   concept_*.html, which is what's actually displayed/generated
2. Fixed a real bug: the "payoff" capstone section was never cached, so
   every Generate re-ran one uncached LLM call even when all ot
   sections were 100% cache hits
3. Wired the "Skip cache" checkbox through to the .spl workflow
   silently a no-op before (param was sent but never declared/read)
4. Payoff generation now only runs for kind="application" targe
   for concept/primitive targets — it was previously always generated but
   never even displayed for non-application targets, pure waste
5. Primitives now get full content generation (Generate button, PDF, real
   generated pages) — previously hard-restricted to a one-line
   Generate disabled, even though the backend always supported it
6. TOC now tags application (🎯) and primitive (⚛️) nodes; prim
   previously excluded from the TOC entirely
7. Fixed a vis.js graph tooltip bug: node hover tooltips were r
   raw HTML tags as literal text instead of formatted content
8. Added Zoom In/Zoom Out buttons to the graph view (for tablet
   users), and fixed a related dead-code bug in Search's "focus on node"
   call
9. Settings page: added Anthropic/OpenAI/Gemini adapters (each with a
   password-type API Key field — value is never echoed back to
   browser, only a boolean "is it set" flag), alongside existing
   Ollama/OpenRouter/Claude CLI
10. Settings page: removed the "AI Semantic Compare Cache" section, and
    fully deleted the underlying compare feature (api/routers/c
    api/services/compare_svc.py, its router registration) since it's no
    longer supported and had zero other callers in the frontend
11. Footer credit text/link changes (cosmetic + target="_blank" fix) —
    low-risk, skim only

## What I most want checked

- **Security**: the API-key handling in api/config.py /
  api/routers/settings.py / api/services/executor.py — confirm keys are
  genuinely never leaked back to the client, and that the env-v
  injection in executor.py (_ADAPTER_ENV_VAR / _ADAPTER_SETTINGS_FIELD)
  can't leak one adapter's key to a different adapter's subproc
- **The "google" vs "gemini" adapter naming split** — SPL.py's own adapter
  registry calls it "google", but the UI/config field says "gem
  the user-facing label. Check executor.py's mapping is airtight and there's
  no place a raw "gemini:" string could sneak through unresolve
- **spl/build_concept_book.spl's kind-gating logic** (target_kind ==
  "application") — check the skip_cache branches and the payoff
  branch don't leave any dangling/uninitialized @capstone state in an edge
  case I didn't test.
- **ContentPanel.js's removal of the primitive-kind early return** — make
  sure nothing else in that file (or GraphViewer.js) still assu
  primitives can't have real content.
- General: anything that looks like leftover dead code, inconsi
  error handling, or a case where my "fix" only covers the specific
  scenario I tested rather than the general one.

Report findings ranked by severity; I'll triage from there.
```
---

# Opus 5 — Code Review (2026-09-13)

Reviewed the working-tree diffs for all 11 items, plus adjacent code they
touch. Verified claims against the actual files rather than the changelog.

**Verdict:** the 11 changes do what they claim, and several are genuinely
good root-cause fixes (the payoff cache, the PDF path, the vis.js tooltip
DOM-element fix, the `network` exposure that also repaired a silently-dead
Search call). Nothing in the new code is *wrong* in the narrow sense.

The problems are all at the edges: one security posture issue that today's
API-key work makes materially worse, one caching bug that today's payoff
work silently inherits and amplifies, and a catalog write path that
violates the project's own documented invariant. Details below.

## Direct answers to your four questions

**1. Are API keys ever leaked back to the client? — No. Confirmed clean.**
`SettingsResponse` (api/routers/settings.py:11-20) carries only
`*_api_key_set: bool`; there is no code path that serialises
`settings.*_api_key` into a response. The form input is `type="password"`,
`autocomplete="off"`, and is never populated from server data —
`updateApiKeyVisibility()` hard-clears it to `''` on every call. Round-trip
behaviour is correct: omitted key ⇒ stored key untouched.

**Can one adapter's key leak into another adapter's subprocess? — Not from
settings.** `_ADAPTER_ENV_VAR` and `_ADAPTER_SETTINGS_FIELD` are keyed off
the *same* `adapter` string derived from the resolved `llm`
(executor.py:117-121), so only the matching key is ever injected. One
caveat worth naming: `spl_env = {**os.environ, ...}` means every key the
*user's own shell* exported is inherited by every spl3 subprocess
regardless of adapter. That's normal subprocess behaviour, not a defect,
but it does mean "no key configured in the UI" ≠ "no key available to the
subprocess" (see M4).

**2. "google" vs "gemini" split — airtight, but expressed in four places.**
Traced end to end and it is consistent: Settings.js uses `google` as the
adapter key with label `Gemini` ⇒ `llm = "google:…"` ⇒
`_ADAPTER_ENV_VAR["google"] = GOOGLE_API_KEY` ⇒
`_ADAPTER_SETTINGS_FIELD["google"] = gemini_api_key`, and both the save
path (Settings.js:246) and the load path (Settings.js:221-226) translate
correctly. A stray `gemini:` prefix cannot silently use the wrong key — it
falls out of `_ADAPTER_ENV_VAR.get()` as `None`, no key is injected, and
SPL's own registry then rejects `gemini` as an unknown adapter. It fails
loudly, which is the right failure. See L3 for the maintainability wrinkle.

**3. `@capstone` state in the kind-gating / skip_cache branches — no
dangling state.** Every path assigns `@capstone` before use: the
application branch assigns via `cache_get` or `GENERATE`, the non-
application branch assigns `""` (line 272), and the `skip_cache=yes` path
assigns the `"miss"` sentinel (line 257) which the following `EVALUATE`
handles. The `@textbook` append is correctly guarded on `!= ""`. One real
(cosmetic) consequence at M5, and one brittleness note at L1.

**4. Does anything still assume primitives lack content? — No.** Grepped
ContentPanel.js, GraphViewer.js and Domain.js: the only remaining
`primitive` references are the TOC tag map and comments. The early return
is gone and nothing downstream branches on `kind`. But removing it dropped
something worth keeping — see M6.

---

## HIGH

### H1 — The API server is reachable from the LAN and from any website, and it now holds API keys
`scripts/start-api.sh:17` binds `--host 0.0.0.0`, and `api/app.py:15-20`
sets `allow_origins=["*"]` with `allow_methods=["*"]`. Both
side-effecting endpoints are **GET** (`/api/generate`, `/api/pdf`), and
`PUT /api/settings` is permitted cross-origin by that CORS config.

Before today this was a local tool that could burn some tokens. As of
today it stores third-party API keys. The combination means:

- any site the user browses while the backend is running can fire
  `GET /api/generate?…` and spend their Anthropic/OpenAI credits, or
  `PUT /api/settings` to repoint `llm` at an adapter of the attacker's
  choosing;
- anyone on the same network (coffee shop, office WiFi) can do the same
  directly.

The keys themselves can't be read back (that part is solid), but they can
be *spent*, and they can be silently replaced.

**Fix:** bind `127.0.0.1` in start-api.sh, and narrow CORS to the actual
dev origin (`http://localhost:${DEV_PORT}`). Making generate/pdf `POST`
would additionally stop trivial `<img>`/`<script>`-style cross-origin
triggering. All three are small changes.

### H2 — Unvalidated user input is concatenated into filesystem paths
`domain_id`, `target`, `level`, `language` and the newly-added `model` flow
straight from query parameters into path construction with no validation:

- `api/services/pdf_svc.py:14-22` — `variant_dir / model / "html"`,
  `html_dir / f"concept_{target}.html"`, and `pdf_dir.mkdir(parents=True)`
- `api/services/executor.py:84` — `… / domain_id / "output" / … / model /
  "html"` followed by `output_dir.mkdir(parents=True, exist_ok=True)`

Two distinct pathlib behaviours make this worse than it looks (both
verified):

```
Path('/a/b') / '/etc/passwd'     -> '/etc/passwd'   # absolute REPLACES the base
Path('/a/b') / '../../etc'       -> '/a/b/../../etc' # traversal is preserved
```

So `?model=/tmp/anything` escapes the domains tree entirely, and
`?domain_id=../../..` traverses out of it. `executor.py:81` calls
`unquote(domain_id)` *before* using it, which actively decodes `%2e%2e%2f`
into `../` — that widens the hole rather than narrowing it.

Reachable impact today: create directories at arbitrary paths, write PDFs
to arbitrary paths, and render any readable `.html` on the host to PDF.
Combined with H1 this is remotely reachable.

Most of this predates today (`domain_id`/`level`/`language` were already
interpolated); today added `model` as a *new* user-controlled segment in
two files and routed `target` into two filename slots, so it's in scope.

**Fix:** validate once, centrally — e.g. reject any of these values that
aren't `^[A-Za-z0-9_.-]+$`, and assert the resolved path is
`.is_relative_to(settings.public_domains)` before any `mkdir`/read/write.
A five-line guard covers every endpoint.

---

## MEDIUM

### M1 — The Level selector does not affect generated content, and the cache key can't tell levels apart
This is the "fix only covers the scenario I tested" case you asked about,
and it directly undercuts today's payoff-cache work.

`build_concept_book.spl` has **no `@lvl` input** — it has `@style`. The
cache key is built from `@language` + `@style` only (lines 152-154).
`api/services/executor.py:103` passes `--param lvl={level}` and never
passes `style=`, so from the web app `@style` is *always* its default
`'textbook'`, for every level.

`scripts/batch_generate.py` already fixed exactly this and documents it at
lines 105-109:

> build_concept_book.spl has no @lvl input parameter — only @style — so
> passing --param lvl=… (the prior behavior) was silently ignored by spl3
> and every job generated at the hardcoded @style DEFAULT 'textbook'
> regardless of the requested level.

It then maps level→style via `_LEVEL_TO_STYLE`
(intro→feynman, core→core, college→college, research→research) plus a
tag-aware `research`→`research_applied` fallback. The API path never got
that fix.

Consequences:
1. Choosing intro vs research in the UI changes only the *output
   directory*, not the prompt — all four levels get `textbook` styling.
2. Because level isn't in the cache key, content generated at `college` is
   served as a cache HIT for `intro` and written verbatim into the intro
   directory. The changelog's own comment describes this exact symptom
   ("byte-identical across all four levels") as already-fixed; it is fixed
   for batch_generate, not for the app.
3. **The model isn't in the cache key either.** Generate `atom` with
   sonnet, switch the Model dropdown to gemma3, regenerate ⇒ cache HIT ⇒
   the sonnet text is copied into the gemma3 folder and recorded in the
   catalog as gemma3 output. The model folder split is therefore not
   trustworthy as provenance.
4. Today's `{target}__payoff` entry uses the same `@_params_json`, so the
   payoff inherits all three problems.

**Fix:** mirror batch_generate — import/duplicate `_LEVEL_TO_STYLE`, pass
`--param style={resolved_style}`, drop the inert `lvl=`. Separately, add
the model (or the full `llm` string) to `@_params_json` so the content
cache key matches the directory layout the app actually uses. Worth doing
before generating much more content, since existing cache entries are
already cross-contaminated.

### M2 — `_mark_pdf_generated` bypasses the catalog lock
`api/services/pdf_svc.py:52-63` does a raw `json.loads(...)` →
mutate → `catalog_path.write_text(...)`. CLAUDE.md is explicit that
`api/services/catalog_lock.py`'s `update_catalog()` is the single write
path, precisely so "a generation task and a batch script running at the
same time can't silently drop each other's updates."
`catalog_svc.mark_book_generated` does it correctly with a `mutate`
closure; the PDF path does not.

This isn't theoretical — a lost catalog.json write was observed during
this session's own testing (an edit applied, then silently reverted by a
concurrent writer).

Today's change altered this function's signature, so it's fair game.
**Fix:** route it through `update_catalog()` like its sibling.

### M3 — PDF catalog entries are deduplicated by `target` alone
`pdf_svc.py:60`: `if not any(p["target"] == target for p in pdfs)`. The
level/language arguments were dropped from `_mark_pdf_generated` in this
refactor (they were unused before, so this is a faithful simplification —
but it locks in the bug). The first PDF ever produced for a target wins
permanently: export at `college.en/sonnet`, then at `intro.zh/gemma4`, and
the catalog still points at the first file. Now that `model` is part of
`rel_path`, the collision is more likely.

**Fix:** key the dedup on the full tuple (target, level, language, model)
or simply on `rel_path`, and update-in-place rather than skip-if-present.

### M4 — `*_api_key_set` reports false negatives for shell-exported keys
`CB_` is the env prefix, so `settings.anthropic_api_key` is populated from
`CB_ANTHROPIC_API_KEY` — *not* from the conventional `ANTHROPIC_API_KEY`
that most users already export. A user with `ANTHROPIC_API_KEY` set in
their shell will see "no key saved" in Settings even though generation
works fine (the key arrives via `{**os.environ}`). Conversely the hint
"A key is already saved" is absent exactly when the user least expects it.

**Fix:** fall back to the bare env var when computing the `_set` flags
(`bool(settings.anthropic_api_key or os.environ.get("ANTHROPIC_API_KEY"))`),
and ideally distinguish the two states in the hint text ("using
ANTHROPIC_API_KEY from environment").

### M5 — Keys (and every other setting) are wiped by `--reload`
Settings live only on the in-memory `settings` singleton, and the API runs
under `uvicorn --reload`. Any file save restarts the worker and silently
discards a key the user just typed. That was tolerable for `llm` and two
integers; for credentials it's a genuine papercut, and it interacts badly
with M4 (the UI will then claim no key is set).

**Fix:** either persist to `.env`/a gitignored JSON on write, or state the
volatility in the UI hint. Given `.env` is already gitignored and already
documents these four `CB_*_API_KEY` vars, persisting there is cheap.

### M6 — The `defines` one-liner is now never shown anywhere
Removing the primitive early return was right, but it also deleted the
only consumer of `node.defines`. A primitive with no generated content now
shows just "Not generated yet … Click Generate to create it", where it
used to show the human-written definition that's already sitting in
graph.yaml for free. The graph's own explain panel is hidden by
`_injectLayout`, so there is no longer *any* surface for that text.

**Fix:** render `displayNode.defines` inside the `.cb-ide-empty` block
(ContentPanel.js:268) — a two-line change that restores the information
without reinstating the restriction.

### M7 — `resolveContent()` has no request-cancellation guard
`resolveContent` is `async` and awaits `checkExists(url)`
(ContentPanel.js:252) after having already written "Loading…" into the
DOM. Two rapid selections (graph click → TOC click, or fast TOC clicking)
can interleave so the *earlier* request resolves last and overwrites the
newer node's content. Pre-existing, but the removed early return used to
short-circuit the primitive case synchronously, so the window is now
slightly wider.

**Fix:** capture a monotonically increasing token at entry and bail after
the await if `displayNodeId` changed.

### M8 — `catalog_svc` writes double-slash paths when `model` is empty
`api/services/catalog_svc.py:31,42` build
`f"output/{variant}/{model}/html/…"`. With the "— default —" model
(`model=""`) that yields `output/college.en//html/concept_x.html`, which
is what actually landed in catalog.json during testing. pathlib collapses
the empty segment on the filesystem side, so the file is written to the
right place, but the *catalog string* is malformed and the frontend turns
it straight into a URL (`${BASE_URL}domains/${id}/${known.file}`). Static
hosts don't reliably normalise `//` in a path.

Today's `pdf_svc.py:46-47` gets this right with
`model_seg = f"{model}/" if model else ""` — the same guard is missing in
catalog_svc.

---

## LOW / NITS

### L1 — `@skip_cache` only recognises the exact string `"yes"`
`EVALUATE @skip_cache WHEN = "yes"`. The API path is safe (FastAPI coerces
to bool, executor emits `'yes'`/`'no'`), but any direct
`spl3 run … --param skip_cache=true` silently takes the ELSE branch and
uses the cache anyway — the same class of silent no-op you just fixed.
Accept `yes|true|1`, or normalise in a tool.

### L2 — Empty payoff still renders an empty bordered `<section>`
For a non-application target `@capstone` is `""`, which reaches
`build_book_index(…, @capstone)` (line 295) and is rendered via
`_md_to_html("")` inside `<section>{payoff}</section>`. The template's
`section{border-top:…;padding-top:40px}` leaves a stray empty ruled box at
the bottom of `book_{target}.html`. Skip the section when payoff is empty.

### L3 — The adapter↔field mapping is duplicated in four places
`API_KEY_ADAPTERS`, the `keysSet` literal in the load path, the `keysSet`
literal in the save path (identical, Settings.js:221 and :257), and the
two dicts in executor.py. Adding a fifth adapter means touching all of
them, and the `google`→`gemini_api_key` special case is spelled out twice
in Settings.js. Collapse to one table (`{adapter: {label, field, envVar}}`).

### L4 — `PUT /api/settings` accepts any `llm` string unvalidated
`settings.llm = body.llm` with no shape check. `"ollama:"` (which is what
you get if the Ollama model list fails to load and `modelSel.value` is
empty) saves happily and fails later at generate time. A regex check
against the known adapter set would fail fast with a clear message.

### L5 — "HTML not found" is a 500
`api/routers/pdf.py:12` raises `HTTPException(500)` for the
"not generated yet" case, which is a 404 condition. Minor, but it also
means the frontend can't distinguish "generate it first" from a real
server fault.

### L6 — Error strings leak absolute server paths to the browser
`pdf_svc.py:29-32` interpolates the full `concept_html` path into the
error, and the non-zero-exit branch returns raw subprocess stdout. Fine on
localhost; not fine if H1 is ever resolved by exposing this beyond it.

### L7 — `_ADAPTER_SETTINGS_FIELD[adapter]` is an unguarded index
executor.py:120 indexes with `[]` while the sibling lookup used `.get()`.
If the two dicts ever drift, this raises `KeyError` mid-stream — an
uncaught exception inside the SSE generator, which is exactly the failure
shape that produced the "stuck on Generating…" bug. Use `.get(adapter, "")`
or merge the two dicts into one.

### L8 — Stale TOC empty-state copy
"No generatable concepts on this path" (ContentPanel.js:182) predates
primitives being listed and generatable. It's now nearly unreachable and
inaccurate when it isn't.

### L9 — Zoom has no clamp
`_zoom()` multiplies `getScale()` by 1.25/0.8 without bounds, so held
clicks can drive the graph to unusable extremes with no way back except
Re-Center. `Math.min(Math.max(scale, 0.05), 4)` would cost one line.

---

## Things I checked and found correct

- API-key round trip: never echoed, blank-means-keep, `type="password"`.
- `google`/`gemini` mapping: consistent across all four touch points.
- `@capstone` initialisation: every branch assigns before use.
- Primitive removal: no leftover assumptions anywhere in the frontend.
- `_nodeTooltip`: returning a real DOM element is the correct vis.js fix;
  string titles are inserted as text by design.
- `win.__cb_network` exposure: correct, and it genuinely repairs the
  Search focus call that was silently no-oping on `win.network`
  (undefined, because `network` is a top-level `const` in a classic
  script and never lands on `window`).
- `pdf_svc` concept-before-book preference matches what the panel
  actually displays; the `model_seg` guard is correct.
- Compare-feature removal is complete: no dangling imports, no frontend
  callers, `/api/compare` returns 404.
- Footer bulk edit: spot-checked, `target="_blank"` carries
  `rel="noopener"` as it should.

## Suggested triage order

1. **H1** (bind + CORS) — three-line change, removes the remote exposure.
2. **H2** (path validation) — small central guard, closes the traversal.
3. **M1** (level→style + model in cache key) — do this before generating
   more content; existing cache entries are already cross-level.
4. **M2/M3** (catalog lock + PDF dedup key) — data-integrity, cheap.
5. Everything else at leisure.

