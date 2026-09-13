# Abbot Prima batch — days II–VII

- Reviewed source itinerary: destination 2, the Abbot's cell `(orientation 0, x 0x54, y 0x3c, h 0x02)`, to destination 0, the church altar `(orientation 3, x 0x88, y 0x3c, h 0x04)`.
- `AccionesPrima::ejecuta` sets the global door mask to `0xef`; combined with the Abbot's `0x3f` search mask, the solver used `0x2f`.
- The preserved pathfinder produced 64 positions on the ground floor. The same source branch applies at Prima on days II–VII, so the reviewed trace was added to all six phases.
- Scope: normal observance after the preceding night has completed with the Abbot in his cell. If Guillermo enters the forbidden left wing or the library, the Abbot seeks him and the actual start/path is player-dependent. Day V also has an early wake/pursuit after key I is taken. Those alternatives remain schematic and are not merged into the reviewed trace.
- No other Abbot phase was approved in this batch. In particular, night movement and pursuit remain unresolved/player-dependent.
- Solver output: `../tmp/routes/day2-prima-abad-solver.json`; DSK SHA-256 `282d7263c5e0129d5f88b33afe890eb6188b0c79bed9344c4b8562135d49f6f5`.
- Checks passed: route builder (7 reviewed records), route-model tests (34 untouched fallback phases), record validation, JavaScript syntax, full site verifier, and `git diff --check`. Browser review passed in English and Spanish on both printed and reconstructed maps; switching to an unreviewed phase hid the picker and returning preserved the selected style. A 390 px mobile-width check found no page-level horizontal overflow.
