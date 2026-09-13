# Route expansion handoff — start here

Upper-floor registration now uses the exact accepted comparison, without the later trial nudges. Canonical inputs: `tools/map-registration.json`; conversion: `tools/map_registration.py`; rebuild: `python tools/build-world-map.py`. Cache: `20260913-map9`.

- Scriptorium: printed rotation 2.5 degrees, X/Y 106.7%, offsets (41,-9.7), pivot (792,285).
- Labyrinth: printed rotation 2 degrees, X 111.7%, Y 97.3%, offsets (65.9,21.4), pivot (1089,279.5). The legacy uniform 108% control is NOT another multiplier.

The comparison moves the print onto reference geometry; the site keeps the complete print's ground-floor adjustment. Let A be the accepted print transform, G the reference geometry matrix (already rotated 180 degrees), and P the site print transform. Correct site geometry = **P * inverse(A) * G**. SVG generation, routes, and portraits share that matrix. Never replace it with a uniform scale or restore discarded nudges. World coordinates and all 95 reviewed routes remain unchanged.

The comparison tool intentionally restores G to reproduce the accepted overlay. Export distinguishes reference and site matrices. Slider edits remain previews; both site map styles remain available.

Updated 2026-09-13. This document replaces the long exploratory chat. Work directly in this local checkout; no new task, server, deployment, or publication is needed to calculate routes.

## User intent and accepted decisions

The seven-day explorer route audit is complete for all eight character classes. Future route additions still require a fresh source review and must not be inferred from chronology. Do not redesign the site or revisit the alignment experiment.

- Keep Spanish and English equivalent, with the existing spoiler disclosure, dialogue, chronology, portrait selection, and mobile scrolling.
- Approved printed-map adjustment: **2.5 degrees clockwise, scale 1.08, horizontal offset −4, vertical offset 0**, pivot **(350,500)** in the original **1323×982** image. Offsets are source-image pixels, not CSS pixels at the displayed size.
- Keep the reconstructed/ornamented geometry map. The site always shows the **Printed map / Reconstructed map** switch, independently of the selected phase. Printed means the complete magazine map with the approved rotation; reconstructed means the complete generated plan. Selection lasts for the current page session and carries between phases.
- The seven files in `tools/routes/` remain the immutable installed Abbot sources: **day I Nona entrance → first stop → Guillermo's cell door** (201 positions) and the six repeated Prime routes. The Day I Nona source is not replaced or truncated.
- Eight reviewed Abbot extracts are now integrated at build time. The post-welcome continuation is a distinct second leg joined at Guillermo's cell door; shared Compline and night extracts expand through `appliesTo`; Day III and Day V scene routes remain explicitly conditional. The generated catalog contains 24 Abbot phase records without duplicating source JSON.
- Seven reviewed Malaquías extracts now expand to 19 phase records, including two ordered Vespers legs with their door-mask change and the Day V scene split at Severino's cell between Terce and Sext. Eight reviewed Berengario extracts expand to 10 explicitly conditional phase records; Night III retains its ordered stops and ends at Severino's cell.
- Five reviewed Severino extracts now expand to 16 phase records: the initialized-position walk on Day I None; cell to church at Prime on Days II-V; church to cell at Terce on Days II-V; refectory to cell at None on Days II-IV; and church to cell at Compline on Days I-IV. Day V Prime and Terce are explicitly conditional. Day IV Terce ends at the cell before the dynamic pursuit. The indefinite Terce/None loop, variable-start Sext and Vespers alternatives, Night repeats, and all post-death phases remain unintegrated.
- Two reviewed Adso extracts now expand to 12 phase records. Compline church → cell is fixed on Days I-IV and VI because the Abbot's Vespers attendance mask includes Adso and the service cannot advance before his arrival; Day V remains explicitly conditional because its special Vespers branch waits on Malachi's death instead. Prime cell → church on Days II-VII is conditional on the successful sleep branch having established the cell origin. No Vespers approach, reminder, sleep question/answer/wait, phase transition, or ordinary following of Guillermo is drawn.
- Two reviewed Jorge extracts now expand to 10 phase records. Day III Sext is only the fixed scripted-position → monks' cell walk and stops before deactivation. The final mirror → illuminated-room flight is conditional in every viable candidate from Night VI through Prime VII: masks are 0x1f for Night VI, Compline VI, and Night VII, and 0x2f for the daytime phases. Day VII Terce is an explicit excluded `phaseDecision` because the Abbot's deadline ends the investigation. Placement, dialogue, waiting, book state, death, completion, disappearance, and coordinate resets are not geometry; the escape is not labelled as always occurring on Night VII.
- Four reviewed Bernardo extracts now expand to four phase records. Day IV Sext is only the fixed stairs-placement → refectory arrival. Day IV Compline is fixed because Bernardo is included in the Vespers attendance gate. Day V Prime cell → church remains conditional on having completed the preceding retreat. Day V Terce church → exit is fixed because Bernardo is included in the Prime attendance gate, and it ends before deactivation/reset. Day IV None manuscript pursuit/random wandering and Day IV Vespers' dynamic approach remain schematic fallbacks.
- No Guillermo extract has been added or integrated. Source review found no automatic walked leg independent of player input, so all 41 worklist slots are resolved as `intentionally-unintegrated`; the existing bilingual player/no-fixed-position presentation remains unchanged.
- Preservation regressions pin the seven installed Abbot source records (`a32fea78377f9adfd9365226b231a3ac2553cc8bc02afe4de4b1b38845e20ece` combined), the earlier Abbot/Malaquías/Berengario/Severino subset (`44250102fb5b5d3b6e2cf3ee6bf5e9a9ad56d4f9a73736f9a7f7a94b47d7f71a` combined), all 36 integrated extracts across Abbot, Malaquías, Berengario, Severino, Adso, Jorge, and Bernardo (`c5e6385e21f9da039fed4cd89cc85b1e46e180313363927d799562001e8bc3f4` combined), the earlier 69 generated entries (`dbfc6ecb87717a2361eb6cea2f3fbf41a31746030082889306923c9440cfd354`), and the complete 95-record catalog (`8c52245ed782ec0bbeb5191df671f3c10132b2718f551b4199d7b21533f3a0fa`).
- Other movements remain dashed schematic arrows until a reviewed route replaces them. Do not present unresolved/player-dependent movement as an exact trace.
- No remaining character paths have been approved merely because a destination appears in the chronology. Do not bulk-connect table entries in declaration order.

## Final Guillermo source audit

The final untouched class was reviewed without running the route solver because the prerequisites for a fixed journey were not established.

- `Guillermo::run` delegates to `mueve`, and `Guillermo::ejecutaMovimiento` turns or advances only in response to player controls while Guillermo is alive. If the camera is following another character, the method returns instead of moving him automatically.
- `Logica::iniciaPersonajes` supplies a fixed new-game position and door permissions, but this is initialization before the explorer chronology, not a walked phase leg. The phase actions in `AccionesDia.cpp` change palettes, doors, objects, Jorge, and Bernardo; none places or walks Guillermo.
- The Abbot's church and refectory handlers inspect Guillermo's player-chosen position and facing. The phase machinery advances time only after its event conditions are satisfied; it does not move Guillermo to the required place. Day VII Terce sets failure and starts no journey.
- Reading the poisoned book and failing the mirror puzzle set death animation/state; camera selection changes only the viewpoint; the spiral redraw, forced facing checks, object pickup/drop, dialogue, and editorial chronology destinations likewise establish no world-coordinate path.
- Consequently no phase has the required combination of fixed start, ordered fixed destination(s), phase applicability, and door mask. There are zero Guillermo route records, extracts, solver outputs, or schematic arrows. The 40 live phases retain `Su posición depende del jugador.` / `Player controlled; no fixed position.`; Day VII Terce retains the bilingual investigation-ended message.

## Workspace and short starting procedure

Workspace: `D:\Downloads\Retro\DOS\Abadia`; site Git repository: its `Homenaje` subdirectory. Preserved source root: `Fuentes/VigasocoSDL-master/VigasocoSDL-master/core/abadia/` relative to the workspace. Commands below run from `Homenaje` unless stated otherwise.

```powershell
git status --short
node tools/test-week-routes.cjs
node tools/route-worklist.cjs 2 abad
```

Read only this file, the relevant character's source and event handlers, and the small selected worklist batch. Avoid loading `week.js`, all source files, or the full worklist into context unless needed. The current checkout contains uncommitted work from the original experiment and this preparation; preserve it. Do not reset to HEAD or assume untracked files are disposable.

## Files and responsibilities

| File | Purpose |
| --- | --- |
| `tools/routes/1-4-abad.json` | Reviewed source record and worked example. Canonical route points for the existing welcome walk. |
| `tools/routes/*.json` | Add one reviewed character/phase record here. No drafts or placeholder JSON in this directory. |
| `tools/route-extracts/*.json` | Reviewed reusable route legs not yet injected into the site. `appliesTo` lists candidate phases; an `integrationStatus` marks any phase-boundary decision still required. These replace repetitive prose batch notes during extraction-first work. |
| `tools/build-week-routes.py` | Validates source records, expands extracts whose `integrationStatus` is resolved, applies generic per-phase decisions for shared candidate lists, joins declared reusable legs, slices reviewed source traces at declared phase boundaries, and generates the data asset. No engine compilation needed. |
| `assets/game/week-routes.js` | Generated `window.WEEK_ROUTES`, keyed `day-hour:character`. Do not hand-edit. |
| `week.js` | Generic renderer: applies matching records, projects floor segments, highlights all segments, handles endpoints, preserves schematic fallback. No new per-character branch is needed to add a route. |
| `assets/game/abbot-welcome-route.js` | Legacy-named geometry/config bootstrap: image size, floor panels, print alignment, desk anchors, and original welcome points. Loaded before the catalog. Do not delete until these shared settings are migrated. The renderer takes reviewed paths from `WEEK_ROUTES`, not from this bootstrap's point list. |
| `tools/trace-abbot-welcome.py` | Original engine pathfinder harness, now also accepts arbitrary start, stops, combined door mask, and output. Name retained for reproducibility. |
| `tools/route-record.py` | Converts solver JSON into an unpublished draft and splits at floor changes. Requires manual source references and bilingual notes. |
| `tools/build-world-map.py` | Rebuilds both exact geometry maps, the retained comparison maps, and the geometry/config bootstrap. The live explorer switches only between the complete print and complete geometry maps. |
| `tools/test-week-routes.cjs` | Model regressions: fallback, endpoints, generic injection, multi-floor data, same-room journeys, deaths/deadline, language parity. Synthetic fixture is never a game route. |
| `tools/week-route-model.cjs` | Loads the pure part of `week.js` in a Node VM; no browser. Used by worklist and tests. |
| `tools/route-worklist.cjs` | Inventory of all 41×8 character/phase slots; supports small day/character queries. |
| `tools/route-worklist.json` | Generated inventory, not source authority or a list of 328 necessary movements. |
| `tools/route-source-index.py`, `.json` | Regenerable destination-table index, door mask assignments, and hashes. Tables are not itineraries. |
| `assets/game/week-sources.md` | Existing chronological/source audit, limitations, and source links. |
| `tools/map-overlay.html` | Preserved alignment experiment; not the main site or the preferred continuation surface. |

`en/game.html` and `es/juego.html` load shared geometry config, route catalog, then `week.js`. Current route-catalog cache suffix: `20260913-routes6`. Bump the route catalog query on **both pages** when delivering new data so browsers reload it.

## Derive one journey from code

1. Query the small batch, e.g. `node tools/route-worklist.cjs 2 malaquias`. Candidate origins/destinations are **editorial hints**. A previous phase's destination is not proof of the actual engine start state.
2. Inspect that character's `piensa`, `posicionesPredef`, constructor and `mascarasPuertasBusqueda` changes. Use `tools/route-source-index.json` to locate coordinates quickly, then verify the relevant current source branch.
3. Read `AccionesDia.cpp` for resets/repositioning at the relevant day/hour. **`AccionesNoche::ejecutar` is implemented inside `AccionesDia.cpp`; there is no separate AccionesNoche.cpp in this checkout.** Check `Logica::iniciaPersonajes` for initial positions and state.
4. Establish ordered legs and conditions: `estado`, `aDondeVa`, `aDondeHaLlegado`, phrase completion, player proximity, inventory, active/dead flags, room-door access. Intermediate scripted stops must be included even if the destination room is unchanged.
5. Establish the actual start orientation, x, y and height, and the global/character door mask. Standing on a slope additionally involves movement flags: the simple CLI initializes those flags to false. Prefer a source-defined level-ground leg boundary, or extend the harness for explicitly established slope state.
6. Run the original route finder on those legs. A failure is not permission to draw a straight segment or substitute generic A*. Investigate the state, door access, reachability and omitted engine behavior.
7. Review the positions against the floor grid and map. Record assumptions and source references. Only then move the completed JSON into `tools/routes/` and rebuild.

If the code gives no single route (Guillermo is player controlled; Adso follows him; actors may seek Guillermo, wander, react to theft, or arrive from a variable point), retain a schematic or unknown state and record the reason in a small batch note under `tools/route-notes/`. A documented conditional journey can be included with its condition clearly stated in both notes. Do not invent canonical destinations or starts to fill every slot.

### Character identifiers and chronology

Site IDs: `guillermo`, `adso`, **`abad`**, `malaquias`, `berengario`, `severino`, `jorge`, `bernardo`. The prose “Abbot” is not a data ID. Site order differs from engine character indexing: site index 2 is Abad; engine `personajes[2]` is Malaquias and `[3]` is Abad. Do not confuse them.

Hours: `0=NOCHE`, `1=PRIMA`, `2=TERCIA`, `3=SEXTA`, `4=NONA`, `5=VISPERAS`, `6=COMPLETAS`. Night starts the numbered day. Valid phases: day 1 hours 4–6; days 2–6 hours 0–6; day 7 hours 0–2. Terce VII is the deadline, with no subsequent movement.

Source starting points: `Abad.cpp` welcome/rules/guiding; `Malaquias.cpp` library guard, door changes, Severino murder and death; `Berengario.cpp` theft/book/Severino itinerary; `Severino.cpp` notices and player approach; `Jorge.cpp` presentation and conditional final flight; `Bernardo.cpp` arrival, manuscript pursuit, departure; `Adso.cpp` following and sleep; `Logica.cpp` initial state/phase management; `AccionesDia.cpp` timed changes. Existing chronology documents include conditional deaths; do not simplify them into unconditional paths.

## Solver commands and exact coordinate conventions

Requirements on this machine: `python` is Python 3.10; compiler `C:/msys64/mingw64/bin/g++.exe`. The harness adds its directory to the child PATH. No Python packages are required. It uses the sibling DSK and source checkout. Each invocation recompiles the small harness; do not run simultaneous invocations because they share scratch files.

Orientation values: `DERECHA=0`, `ABAJO=1`, `IZQUIERDA=2`, `ARRIBA=3`. Every `--start` and `--stop` is **orientation x y height**, in decimal or `0x` hex. This is different from the output point order **[x,y,height]**.

Reproduce the accepted route and regenerate map assets:

```powershell
python tools/trace-abbot-welcome.py
```

Use arbitrary source-derived legs without overwriting the baseline or reviewed catalog:

```powershell
python tools/trace-abbot-welcome.py --start 3 0x88 0x84 2 --stop 1 0xa4 0x58 0 --stop 0 0xa5 0x21 2 --door-mask 0x3f --output ../tmp/routes/welcome-check.json
python tools/route-record.py ../tmp/routes/welcome-check.json --day 1 --hour 4 --character abad --from entrance --to cell --output ../tmp/routes/welcome-draft.json
```

These example commands reproduce the existing journey, not a new route. Do not install the duplicate draft. The draft starts with empty `source` and bilingual `note` fields; validation rejects it until reviewed.

Use a fresh custom output filename: the solver and draft converter refuse to overwrite an existing output, preventing a failed rerun from leaving a stale result that looks successful.

`--door-mask` is the already combined **character search mask AND current global door mask**, in 0..63. It modifies the original room-connectivity table through `modificaPuertasRuta`. It does not insert the physical door leaf into the local height grid. Omitting it preserves the source table as loaded; do not assume that is correct for every character. A mask can change during a multi-leg scene: split calculations at the change and join the verified traces, removing only identical boundary duplicates.

The default welcome run and the explicit 0x3f mask run both reproduce 201 positions. Original start `(88h,84h,02h)`; intermediate stop `(A4h,58h)`; final `(A5h,21h,02h)`. The intermediate destination table stores height 0, but its actual terrain height is 2. Arrival checks floor membership and x/y, not exact destination height. Do not rewrite the terrain height to match the table.

### What the harness does and does not simulate

It compiles preserved `BuscadorRutas`, `RejillaPantalla`, `FijarOrientacion`, and `PersonajeConIA::avanzaPosicion`. The source's own room search, local 24×24 search, reconstruction and stair advancement generate the points. Reconstruction normally simulates then restores the character; this harness retains and records the simulated positions instead.

Graphics, phrase timing, high-level AI decisions, alternate target generation, other actors, and physical door-leaf collisions are omitted. The script supplies stops established by source analysis. It is an unobstructed source-based reconstruction, not an emulator replay or a promise of the same steps in every save. The welcome approach to a player who has moved can vary.

The solver has a bounded iteration count and 60-second execution timeout, reports its last failed coordinate, and writes no output JSON on failure. A direct desk-to-library smoke attempt is not proof of an actual scripted journey; arbitrary targets can fail. Multi-floor rendering is independently supported and tested, but a real multi-floor itinerary must be validated with its proper stops/state before publication.

Specific unresolved smoke attempt: start `(orientation=0,x=55,y=56,h=15)`, direct target `(0,25,43,26)`, combined door mask 63 failed with `Failed 0 at 31,35`. No route was installed. This was a plumbing probe, not a source-derived itinerary; do not repeat it as an approved route or claim the solver handles every library state. Inspect the relevant stairs/stops and original high-level alternatives when calculating a real journey.

### ROM extraction trap — do not rediscover this

DSK: `Fuentes/VigasocoSDL-master/VigasocoSDL-master/VigasocoSDL/roms/abadia/abadia.dsk` relative to the workspace. Each output includes its SHA-256. The extended CPC DSK track extraction and byte reversal match `AbadiaDriver`/`DskReader`: tracks 0x12–0x16, first 0x4000 bytes, reversed.

**Juego advances its ROM pointer by 0x4000.** Driver bank 7 loaded at 0x1c000 supplies game-relative 0x18000. Height streams are at **0x18a00, 0x18f00, 0x19080**, not in the earlier bank. The generated `../tmp/abbot-welcome/heights.bin` is the correctly aligned scratch input. The scratch directory can be rebuilt; never depend on an unexplained old `trace.exe`.

## Route record contract

Read `tools/routes/1-4-abad.json` for the real complete example. The required shape is:

```json
{
  "day": 2,
  "hour": 4,
  "character": "malaquias",
  "from": "desk",
  "to": "church",
  "source": ["File.cpp: Class::method, specific branch and destination indices"],
  "conditions": "Established start, door access, conditional trigger, omitted collisions",
  "note": {"es": "Texto revisado.", "en": "Reviewed text."},
  "segments": [{"floor": 0, "worldPoints": [[136,132,2],[135,132,2]]}]
}
```

**The coordinates above illustrate the schema only; they are not a Malachi route. Never install that example.** Keep the solver's `dskSha256`, start/stops, and door-mask metadata when available. All route text is plain text, not HTML. Valid place IDs: `church`, `cell`, `desk`, `refectory`, `mirror`, `abbot`, `severinus`, `light`, `entrance`, `shared`, `corridor`.

Each segment contains at least two integer [x,y,height] positions. Floor classification follows engine boundaries: heights **<13 ground**, **13–23 scriptorium**, **>=24 library**; base heights are 0,11,22. Do not divide height by a constant or use the destination's nominal height as the entire path's floor. Within a segment the largest x/y Manhattan step is 2 at stairs. The builder rejects larger unexplained jumps, invalid phases, missing notes/sources, and duplicate character/phase keys. It does not prove narrative correctness or replay collisions: that remains the source review.

Segments are chronological and are drawn with separate SVG paths, each with an arrowhead. They never connect across the paper between floor panels. The origin and destination portrait come from the first/last actual route points for **any** character/place. Same-room excursions are supported. Dead/absent characters and the deadline do not gain movements from injected data. Conditional multiple alternatives in one phase should not be silently merged: choose/document the applicable illustrative scenario, or extend the UI deliberately if the user later requests alternatives.

World positions must remain continuous across segment boundaries as well (at most two x/y units, no skipped storey). A scripted teleport/reposition is not a walked route; document it separately rather than connecting it as if it were traversed.

## Map projection — ready for all three floors

All original coordinates remain intact. Ground retains `(666 - 3.65*y, 73 + 3.65*x)`. Upper floors use generated `panel.matrix=[a,b,c,d,e,f]`: `(a*x+c*y+e, b*x+d*y+f)`. Divide by `(1323,982)` and multiply by 100 for display percentages. SVG floor groups and every path/portrait share these matrices. Validate with `python tools/test-map-registration.py` and `node tools/test-week-routes.cjs`.

The print is transformed to the ground-floor route; **never apply its 2.5°/1.08 adjustment to the route points again**. Renderer behavior:

- Ground-floor reviewed paths: approved transformed original JPEG.
- A reviewed path uses an upper floor: keep its segments separate, but project them through the same registered panel coordinates on both complete map choices. The generated upper floors use the printed map's rotated scale and horizontal positions; do not substitute a phase-specific hybrid map.
- User chooses Reconstructed map: full exact geometry plan for all three floors (`abbey-world-map-*.svg`). Paths use the same projections and do not change.
- No reviewed paths in a phase: the same complete transformed print or reconstructed map remains selected; schematic anchors keep their shared registered positions and the map-style picker stays visible.

Upper-floor desk markers use the known source positions in config. Jorge's mirror/light-room anchors use AccionesNoche and Jorge's destination table. Ground-floor untraced portraits are still approximate printed-map anchors. Do not claim these schematic portraits are engine coordinates.

The SVG plans represent floor-height/collision geometry, not a complete architectural reconstruction. Large blocked rectangles and square garden masks can differ from the printed artwork. That distinction is expected and is why both map options are retained.

## Build, validate, inspect, hand off

```powershell
python tools/build-week-routes.py
node tools/test-week-routes.cjs
python tools/test-route-records.py
node --check week.js
node --check assets/game/week-routes.js
python tools/verify-site.py
git diff --check
node tools/route-worklist.cjs
```

If source changes, refresh `python tools/route-source-index.py`. If map geometry/config changes, run the baseline trace generator, then the route builder. Regenerating the welcome baseline does not overwrite the reviewed JSON record; compare and explicitly review changes to that record.

Serve the site from this directory on port 8765 if necessary (`python -m http.server 8765 --bind 127.0.0.1`; a server may already be running). Main pages are `/en/game.html` and `/es/juego.html`. Use the browser skill/runtime for UI verification, not a new browser automation stack. Open the seven-day explorer's spoiler panel, select the phase/character, check both map styles, verify the route through doors/stairs, check segment breaks, then switch to a pending phase and back. Test a narrow viewport for clipping/scrolling. Browser file:// navigation is blocked by the tool; this does not affect site testing through localhost.

For each completed small batch, record the actual source-derived starts/stops, conditions, output paths, checks, and any unresolved cases in `tools/route-notes/`. Regenerate the worklist. Update this handoff only when the workflow or assumptions change. Do not copy the entire chat into it.

When working extraction-first, keep that information inside validated JSON under `tools/route-extracts/` instead of creating a separate Markdown note. Do not copy extracts into `tools/routes/`. The builder includes only extracts with a resolved integration status. A shared extract whose `appliesTo` list mixes included and fallback candidates uses ordered `phaseDecisions`; each excluded candidate retains its reason without duplicating geometry. Leave unresolved extracts untouched until phase applicability, conditional alternatives, and any leg joins have been reviewed for presentation. `tools/test-route-records.py` validates both installed records and reusable extracts.

### Audit completion state

All eight character classes have now received source review. The catalog remains at 95 reviewed phase records, Guillermo has no geometry, and the generated worklist contains no pending source-review slots after the explicit exclusion closeout below. No publication or commit has been made. Any future route expansion must begin from new source evidence rather than treating this completed audit as permission to fill remaining schematic slots.

### Worklist classification closeout

The 192 non-Guillermo slots that previously remained `needs-source-review` are now explicitly classified as `intentionally-unintegrated`; together with Guillermo's 41 slots, the worklist has 233 documented exclusions, 95 reviewed routes, and zero pending source reviews. `tools/route-worklist.cjs` is deliberately fail-closed: a future non-route phase that matches none of the rules below returns to `needs-source-review` instead of being silently excluded.

Rules are applied in this order so phase boundaries remain unambiguous:

1. A catalog route is `reviewed`.
2. Day VII Terce is `beyond-deadline`, even when the character is also absent or dead.
3. Guillermo is `player-dependent` in all earlier phases; no geometry is created.
4. Explicit `absent` and `dead` presence states become `absent` and `post-death`; disappearance and zero-coordinate resets are not routes.
5. Remaining live, untraced phases use the character rules below.

| Character | Resolved exclusions | Classification rules |
| --- | ---: | --- |
| Bernardo | 37 | Before Day IV Sext and after Day V Terce he is absent. Day IV None is a reactive manuscript/holder/Abbot pursuit followed by possible random wandering. Day IV Vespers has a variable start because the office overrides that pursuit. Night V merely reaffirms the monks' cell destination established by the reviewed Compline retreat. His four fixed reviewed legs remain untouched. |
| Adso | 29 | Outside the reviewed Compline and conditional post-sleep Prime legs, his movement follows Guillermo from player-chosen positions. Vespers therefore has a variable approach; Night is sleep dialogue, waiting, or a phase transition rather than a walked leg. |
| Abbot | 17 | The remaining phases either inherit an unresolved prior position or can divert toward Guillermo or another monk's report. Chronology destinations do not establish a single start and ordered route. |
| Malaquías | 22 | Nights merely reaffirm the cell destination reached by the reviewed Compline leg. Remaining live gaps are library-guard periods that may be stationary or react to Guillermo. All phases from his Day V Vespers death onward are post-death. |
| Berengario | 31 | Night II merely reaffirms the cell destination reached by the reviewed Compline leg. Every phase after the reviewed Night III book journey is post-death. |
| Severino | 25 | Nights merely reaffirm the cell destination reached by reviewed Compline routes. Sext and Vespers can start at the cell, corridor, an intermediate point in the indefinite Terce/None loop, or a player-dependent pursuit position. Phases after the conditional Day V murder boundary are post-death. |
| Jorge | 31 | He is absent except for his Day III scripted placement/dialogue scene and the later conditional escape window. Day III Prime and Terce contain placement, waiting, and dialogue only; Day III Sext and the viable final escape candidates remain the reviewed geometry. |

This classification adds no extracts, solver outputs, catalog records, routes, schematic arrows, or site copy. The generated catalog and its page cache suffix therefore remain unchanged.
