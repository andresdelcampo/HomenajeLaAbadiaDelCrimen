# Game reference: source notes

Checked 2026-09-11 for the Spanish and English controls, object reference and scoring additions.

## Scope and attribution

Controls follow the preserved original manual. Detailed schedules and score conditions follow Manuel Abadía's reconstruction of the Amstrad CPC game, cross-checked in the local C++ sources and the Java conversion by Pedro García-pego Catalá, adapted to GWT by Ignacio Baca Moreno-Torres. They are not a claim that Extensum or every port has identical rules.

- [Preserved original manual, page 1](https://worldofspectrum.net/pub/sinclair/games-info/a/AbadiaDelCrimen%2BSirFredLa.pdf)
- [Reconstruction and credits](https://github.com/ibaca/la-abadia-del-crimen)
- [Source directory](https://github.com/ibaca/la-abadia-del-crimen/tree/master/src/main/java/com/lavacablasa/ladc/abadia)

## Evidence pointers

Files below refer to the source directory above. Equivalent C++ files were checked under the workspace's `Fuentes/core/abadia`.

- Manual: arrows/A/K/L move and turn Guillermo, down/Z directs Adso, collection is automatic, Space drops Guillermo's leftmost inventory object. Six item types belong to Guillermo, two to Adso. Adso's inventory is not shown or manually dropped.
- `Adso.java`, night state: S advances to prime, N keeps the player awake; the unanswered prompt eventually sleeps automatically. Direction control uses Guillermo's orientation.
- `Logica.java`, `iniciaObjetos` and `iniciaPersonajes`: initial item locations and carrier masks. The book and scroll start in the scriptorium, gloves in Severino's cell, spectacles with Guillermo, key III on Malachi's desk. Keys I and II are initially absent. The lamp's initial placeholder is not the kitchen spawn.
- `AccionesDia.java`: prime II removes the spectacles; night V places them in the illuminated library room and key I on the altar; prime V removes key I unless Guillermo holds it; night VI places key II on Malachi's desk and activates Jorge behind the mirror. Prime III moves the scroll behind the mirror unless Guillermo holds it. The game's numbered day starts at night.
- `AccionesDia.java` and `Logica.java`, lamp routines: kitchen spawn at prime III, reset/replacement at prime from day III if used or held by Malachi. Burning oil and removing/replacing the lamp are different events. No further scheduled dawn removal applies to the spectacles after their night V return. `Logica::compruebaFinLampara` advances the oil counter only while Adso carries and uses the lamp in an unlit library room; it warns at `0x300` updates and expires at `0x600`. In VigasocoSDL, the 300 Hz driver advances one game loop every `0x24` interrupts, making those thresholds approximately 92.16 and 184.32 seconds of active use.
- `Malaquias.java`: key III is collected at vespers and returned when he resumes his scriptorium post; this is a routine-dependent availability window, not a new key each day.
- `Berengario.java`, `Abad.java`, `Bernardo.java`, `Jorge.java`: book and scroll transfers. Jorge removes the book from Guillermo and the world during the final escape.

## Score audit

`Logica.java`, `compruebaBonusYCambiosDeCamara`, `calculaPorcentajeMision`, `compruebaAbreEspejo`; `Jorge.java`, final encounter:

| Flag | Recorded condition |
| --- | --- |
| 0001 | Guillermo visits the left wing at night (x < 60h). It is not a test of which route he used. |
| 0002 | Adso holds key III. |
| 0004 | Guillermo holds key II. |
| 0008 | Guillermo holds key I. |
| 0010 | Guillermo reaches the library (height >= 16h). |
| 0020 | Guillermo is in the library and Adso holds the lamp. |
| 0040 | Guillermo holds the gloves. |
| 0080 | Guillermo is in the library with spectacles; no separate pickup-in-library requirement. |
| 0100 | Guillermo holds scroll and spectacles together. |
| 0200 | Camera room 72h: the mirror room. The nearby source comment calls it the room behind the mirror, but the final Jorge encounter uses 73h. |
| 0400 | At the mirror, the manuscript template reads `SECRETUM FINIS AFRICAE, MANUS SUPRA XXX IDOLUM AGE PRIMUM ET SEPTIMUM DE QUATUOR`; the generated group replaces `XXX`, and the first and seventh letters of `QUATUOR` give Q+R. Hold them together on the selected stair: IXX = left, XIX = centre, XXI = right. The bonus is recorded before testing the choice, so a wrong stair still grants it before triggering the fatal trap. |
| 0800 | Enter room 73h during Jorge's final encounter. |
| 1000 | Guillermo holds the scroll during night III. |
| 2000 | Guillermo enters the Abbot's cell carrying the scroll, with the camera following him. |

Fourteen distinct flags; each is retained and adds 4 percentage points once. The failure percentage is `7 * (day - 1) + hour + 4 * flag_count`, with hour 0..6 for night..compline, and totals below 5 displayed as 0. Obsequium is not a term. Example: day VI, prime, eight bonuses = 68; nine = 72. When the investigation-complete flag is set, the routine shows the ending manuscript instead of displaying this failure percentage.

The public explanation uses room and action names. Addresses and implementation details remain in these maintenance notes.
