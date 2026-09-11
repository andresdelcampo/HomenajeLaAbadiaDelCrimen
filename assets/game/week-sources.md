# Seven-day explorer: evidence and scope

This is an editorial reading of the reconstructed VigasocoSDL game logic, not a replay or an emulator. It does not claim that all versions behave identically. Spanish and English dialogue is exported verbatim from that port's phrase tables; the English text is not presented as a verified extraction of the English DOS disk. Spelling in quotations is intentionally preserved.

Local source base: `Fuentes/VigasocoSDL-master/VigasocoSDL-master/core/abadia/`.

- `Logica.cpp`, initialization: starts at day 1, NONA.
- `Marcador.cpp`, `avanzaMomentoDia`: COMPLETAS rolls over to NOCHE and increments the day. The night of day III precedes its prima.
- `AccionesDia.cpp`, `AccionesNoche`: night V places spectacles in the illuminated room and key I on the altar; night VI places key II on Malachi's table and activates Jorge behind the mirror.
- `AccionesDia.cpp`, `AccionesPrima`: day II removes spectacles; day III hides the book, activates Jorge near the monks' cells and relocates the scroll if William does not carry it. Day V removes key I if not collected.
- `AccionesDia.cpp`, `AccionesSexta`: Bernard appears at the stairs on day IV. His announcement and physical arrival are distinct triggers.
- `Abad.cpp`, `piensa`, `frasesIglesiaEnPrima`: welcome, offices, escort, daily announcements, day V discovery of Severinus at nona, and day VII failure at terce.
- `Berengario.cpp`, `piensa`: day III night journey via the scriptorium stairs to the book, then Severinus's cell; death occurs after arrival with the book. Earlier scroll warnings depend on possession, proximity and elapsed time.
- `Severino.cpp`, `piensa`: introduction from day II at terce/nona, conditional on proximity and other dialogue; day IV terce report; day V prime warning, then waiting in his cell.
- `Malaquias.cpp`, `piensa`: library guard; vespers closure through west wing and kitchen; day V terce murder only when both characters reach Severinus's cell; day V vespers death at church. No universal sext meal route is assigned to him here: his routine can retain the library desk destination.
- `Bernardo.cpp`, `piensa`: manuscript pursuit on day IV, random destinations after delivery, departure on day V subject to office/night branches and current state.
- `Jorge.cpp`, `piensa`: day III introduction, return to shared cell at sext and deactivation; final dialogue, gloves and flight to the illuminated room.
- `Adso.cpp`: following William and destinations for offices, meal and sleep.
- `GestorFrases.cpp`, Spanish and English arrays: exported by `tools/export-week-dialogue.py` with original phrase IDs.

Map: existing Retro Gamer España 41 composite already credited on the game page. Pins identify approximate rooms, not engine coordinates. Arrows connect a character's destination in the immediately preceding chronological phase to the destination in the selected phase, when both are known and different. Explicit scene journeys take precedence. These are expected routine transitions, not a claim that a save has completed every journey; player-dependent and random origins are not guessed. Stationary, dead and absent characters have no movement arrows. Jorge's conditional final flight does not imply a return to the mirror at the next prime.

All known journeys are visible, with the selected character highlighted. Portraits and both arrow endpoints use the same positioning function, including individual desk offsets, cell shifts, and the occupants of the origin phase. Church and refectory origins are the exception: their hollow ends share the exact room anchor instead of the preceding portraits' spread. Arrowheads stop just outside the destination portrait. Geometry refreshes when the map loads, is revealed, or resizes. Shared-room pins are spread around the room to remain selectable. A destination does not imply that a character is already there. Conditional deaths are shown as narrative outcomes with the trigger stated, not a claim about every possible save.

The Strings/Decoder.py utility was inspected but not used as authority: its own documentation describes incomplete lookup tables and a simplified decoding model.

Labyrinth route: the night VI and VII clues show a detail of the annotated Micromanía first-series 33 plan preserved by CPC-Power, https://www.cpc-power.com/index.php?page=detail&onglet=plan&num=222. Source image: https://www.cpc-power.com/extra_lire_fichier.php?extra=plan&fiche=222&slot=1&part=A&type=.gif (1215 × 851). `assets/maps/library-route-micromania.png` extracts the rectangle (870, 475)–(1215, 839), without redrawing or recolouring. The red annotations already occur in that archived scan; their author and date are not identified, so the public caption describes an annotated copy, not an original published solution. This is a historical route reference, independent of the explorer's NPC movement arrows.
