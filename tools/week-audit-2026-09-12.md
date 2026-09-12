# Seven-day chronology audit, 12 September 2026

Scope: all 41 selectable phases in Spanish and English, the seven overview cards, the eight-row object spoiler reference, dialogue assignments and character destinations. This is a source and website audit, not an emulator playthrough or proof that every port behaves identically.

## Sources examined

- Micromanía first series 33, six preserved pages, inspected visually: `assets/magazines/mm33-guide-intro.webp`, `mm33-guide-1.webp`, `mm33-guide-2.webp`, `mm33-guide-3.webp`, `mm33-map-1.webp`, `mm33-map-2.webp`. The filenames are misleading: `guide-2` and `guide-3` are the map spread; `map-1` and `map-2` contain the continuation of the walkthrough (printed pp. 78-79).
- Local reconstructed logic: `Fuentes/VigasocoSDL-master/VigasocoSDL-master/core/abadia/AccionesDia.cpp`, `Logica.cpp`, `Abad.cpp`, `Berengario.cpp`, `Malaquias.cpp`, `Severino.cpp`, `Bernardo.cpp`, `Jorge.cpp`; exported dialogue in `assets/game/week-dialogue.js`.
- Public Java conversion, daily actions: <https://github.com/ibaca/la-abadia-del-crimen/blob/master/src/main/java/com/lavacablasa/ladc/abadia/AccionesDia.java>.
- Existing reference notes: `assets/game/week-sources.md`, `tools/game-guide-sources.md`.

## Corrections

1. Distinguish initial object placement, access and recommended collection. Gloves exist inside Severinus's cell from initialization; key II becomes available on night VI. Micromanía collects the gloves at terce VI. Neither a new glove spawn at terce VI nor unavoidable death on night VI is accurate. Book death depends on lacking gloves, including before the finale.
2. Berengar's scroll warning escalates when the wait expires **or** William leaves the scriptorium screen, not only after both. The existing character card already used the correct alternative; the hourly advice did not.
3. Explicitly collect and retain the scroll during night III, using Adso's key III for the church/kitchen passage. Prime III hides it behind the mirror unless William carries it. Bernard does not rescue a scroll already hidden there (`pergaminoGuardado`); the later recovery from the Abbot requires the earlier pickup. Berengar reaching Severinus with the book advances the hour, so the excursion is time-sensitive.
4. Do not send the player into the dark labyrinth on night III: the kitchen lamp first appears at prime III. Repeat its collection at none III, Micromanía's preparation for the first labyrinth excursion on night IV. Used lamps return to the kitchen at prime even when oil remains; reminders occur at prime IV-VI. The final night explicitly requires the lamp collected after prime VI. Prime VII advice stays focused on the deadline.
5. Key I must remain in William's inventory at prime V. Its removal is not restricted to the altar if the player has moved it. Carrying it can wake the Abbot that night. The later scroll retrieval explicitly requires keeping this key.
6. All recommended nocturnal library trips name Adso's key III and lamp. Night VI is the magazine's key-II/spectacles/practice trip; terce VI obtains the gloves; none VI retrieves the scroll if needed; night VII completes the final encounter.
7. Reading the scroll with the spectacles generates the valid mirror stair (`numeroRomano` starts at zero). Guessing Q/R at a stair before reading does not work. The final visit requires the clue already read; carrying both reading objects forever is not a separate mirror-mechanism requirement.
8. The ending is not complete merely when Jorge flees: William must follow him to the illuminated room. `Jorge::piensa`, state `0x10`, requires Jorge's arrival and William in screen `0x67` at the appropriate height.
9. Remove the generic vespers warning about Malachi from day VI, after his day-V death. Retain it as protected advice through day IV; day V has its specific death scene. Keep the public vespers routine independent of character survival.
10. Remove the unsupported gloss that the opening nona is "dusk". Keep the verified canonical hour.

## Differences from Micromanía deliberately retained

- Day II prime: the magazine calls the victim Berengar. The phrase table says Venantius (original Spanish spelling `VENACIO`); Berengar's disappearance is announced on day III and his death on day IV. Keep the game's names and timing.
- Bernard: the magazine narrates his arrival under day IV nona, after mentioning the meal. The daily action places him at sext; manuscript pursuit follows. The Abbot's earlier "has arrived" dialogue is preserved as a quotation and distinguished from the physical spawn.
- Spectacles: the magazine finds them on night VI and narrates their loss during Malachi's final journey. The reconstructed daily action actually places them in the illuminated room on night V; no subsequent scheduled dawn removal applies. Night VI remains the recommended collection visit, with "if still there" wording.
- Day VI departure warning: the magazine places the warning under prime, after prayer. In the reconstructed logic, prime handles the service; the summons is handled at terce. The site keeps the source-backed terce entry.
- Mirror: the magazine uses the centre stair. The reconstruction selects IXX/left, XIX/centre or XXI/right when the scroll is read with the spectacles. Keep the generated clue instead of making the centre universally correct.
- Gloves and finale: Micromanía's sequence is advice, not a hard lock that prevents a properly equipped earlier final encounter from day VI. The table and chronology now say this consistently.

## Complete phase checklist

Ordinary offices/meals/retirement remain conditional on attendance, proximity and prior NPC actions. Character destinations describe expected routines, not instantaneous positions in every save. "Routine" below includes the corresponding advice, default dialogue and roster.

| Phase | Checked event / action |
| --- | --- |
| I none | Welcome, escort, rules; game starts here. |
| I vespers | Church; living librarian's closure warning. |
| I compline | Escort into cell; transition to night II. |
| II night | First night; spectacles removed at the following prime. |
| II prime | Venantius announcement; compulsory spectacle removal. |
| II terce | Library prohibition; conditional tour/introduction; Adso takes key III. |
| II sext | Meal routine. |
| II none | Scroll warning uses OR; early book is poisonous without gloves. |
| II vespers | Closure warning; Berengar's conditional delay at desk. |
| II compline | Retirement before the scroll excursion. |
| III night | Berengar's book journey/death; collect scroll before prime; no lamp yet. |
| III prime | Disappearance announced; book hidden; Jorge placed; lamp first available. |
| III terce | Abbot introduces Jorge; dialogue advances to sext. |
| III sext | Meal; Jorge returns to shared cell and deactivates on arrival. |
| III none | Jorge removed; collect kitchen lamp for night IV. |
| III vespers | Church and closure routine. |
| III compline | Retirement routine. |
| IV night | First recommended labyrinth practice with key III and lamp. |
| IV prime | Berengar's death announced; replace used lamp after service. |
| IV terce | Abbot stops enquiry; Severinus reports black tongue/fingers. |
| IV sext | Bernard spawns at stairs and goes to meal. |
| IV none | Conditional scroll surrender and delivery to Abbot; prior pickup required. |
| IV vespers | Closure waits for Bernard; living librarian warning. |
| IV compline | Retirement routine; Bernard in shared cell. |
| V night | Key I at altar; spectacles in illuminated room; keep key and avoid Abbot. |
| V prime | Conditional Severinus warning; remove uncarried key I; lamp replacement. |
| V terce | Malachi kills Severinus on arrival; Bernard's conditional departure. |
| V sext | Meal without Severinus if the murder completed. |
| V none | Abbot discovers locked cell/body; advances to vespers. |
| V vespers | Malachi's last words and death in church. |
| V compline | Retirement; Malachi remains dead. |
| VI night | Key II and Jorge become available; recommended spectacles/practice visit. |
| VI prime | Service; replace used lamp for the final night. |
| VI terce | Departure warning; use key II for gloves. |
| VI sext | Meal routine. |
| VI none | Recover scroll with retained key I if needed; read it with spectacles. |
| VI vespers | Church routine; no warning from dead Malachi. |
| VI compline | Retirement before final visit. |
| VII night | Gloves, read clue, key III and lamp; mirror, book, pursuit to lit room. |
| VII prime | Final service before deadline; no new library excursion suggested. |
| VII terce | Investigation failure/departure deadline; no later selectable stages. |

## Verification

Passed: `node --check week.js`, `python tools/verify-site.py` (`MISSING_LOCAL: None`), `git diff --check`.

In-app browser: traversed all 41 Spanish and all 41 English phases through the next-hour controls after the final content pass. Both navigation counters agreed on every phase; the final next buttons were disabled. No undefined/empty dialogue or non-finite map paths. Both languages had matching quote counts and route/mirror visibility: the historical route appears on nights VI/VII and the detailed mirror instruction on night VII. Confirmed the late day-VI vespers advice no longer refers to Malachi acting. Spoiler disclosures remained closed on initial load; the object table opens normally with all eight rows. The expanded English night-VI advice and route image were visually checked at the existing desktop viewport. Browser warning/error log was empty. No emulator playthrough was performed.
