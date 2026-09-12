/* Editorial chronology. Evidence and limitations: assets/game/week-sources.md. */
(() => {
  'use strict';
  const root = document.querySelector('[data-week-explorer]');
  if (!root) return;
  const en = document.documentElement.lang === 'en';
  const t = (es, english) => en ? english : es;
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const hours = t(['Noche', 'Prima', 'Tercia', 'Sexta', 'Nona', 'Vísperas', 'Completas'], ['Night', 'Prime', 'Terce', 'Sext', 'None', 'Vespers', 'Compline']);
  const names = t(['Guillermo', 'Adso', 'El Abad', 'Malaquías', 'Berengario', 'Severino', 'Jorge', 'Bernardo'], ['William', 'Adso', 'The Abbot', 'Malachi', 'Berengar', 'Severinus', 'Jorge', 'Bernard']);
  const ids = ['guillermo', 'adso', 'abad', 'malaquias', 'berengario', 'severino', 'jorge', 'bernardo'];
  const titles = t(['La llegada', 'El scriptorium', 'El anciano', 'La Inquisición', 'Una abadía inquieta', 'El plazo se acorta', 'Antes de tercia'], ['Arrival', 'The scriptorium', 'The elder', 'The Inquisition', 'An uneasy abbey', 'Time is running short', 'Before terce']);
  const dayCopy = t([
    'Guillermo y Adso acaban de llegar. El primer recorrido enseña la arquitectura de la abadía y las normas que rigen la vida en ella.',
    'El trabajo de los copistas abre una nueva vía de investigación. Escuchar a los monjes importa tanto como encontrar una puerta.',
    'La abadía tiene una memoria más antigua que sus huéspedes. El Abad prepara un encuentro con uno de sus habitantes.',
    'La llegada de una autoridad exterior limita aún más la libertad de Guillermo. Las conversaciones adquieren otro peso.',
    'La rutina sigue marcando las horas, pero las llamadas y las ausencias hacen que resulte cada vez menos tranquilizadora.',
    'El tiempo concedido a Guillermo está a punto de terminar. Conviene ordenar lo aprendido y medir cada desplazamiento.',
    'Queda la última noche y el amanecer. La investigación debe resolverse antes de que el Abad ponga fin a la estancia.'
  ], [
    'William and Adso are new guests. Their first walk introduces both the architecture and the authority governing it.',
    'The copyists’ work opens another line of enquiry. Listening to the monks matters as much as finding a doorway.',
    'The abbey’s memory reaches further back than its guests’. The Abbot prepares a meeting with one of its inhabitants.',
    'An outside authority’s arrival changes William’s freedom to act. Conversations take on a different weight.',
    'Routine still marks the hours, but summons and absences make it feel increasingly uneasy.',
    'William’s allotted time is nearly over. Take stock of what you have learned and plan each journey.',
    'The final night and dawn remain. The investigation must be solved before the Abbot ends your stay.'
  ]);
  const routine = t([
    'La comunidad se retira. Adso propone dormir y las puertas limitan los recorridos. Cada jornada comienza de noche y continúa con prima.',
    'Las campanas reúnen a la comunidad en la iglesia. El oficio comienza cuando los asistentes ocupan sus puestos.',
    'Después del oficio llegan los encargos y las conversaciones. Acercarse a quien llama puede ser necesario para que continúe la jornada.',
    'La comida reúne a los monjes en el refectorio. Guillermo debe estar en la sala y ocupar su sitio.',
    'La tarde deja un intervalo para recorrer la abadía, escuchar y orientarse antes del siguiente oficio.',
    'Las campanas llaman de nuevo a la iglesia. Hay que ocupar el lugar asignado y esperar a que termine el oficio.',
    'El Abad manda retirarse y acompaña a Guillermo a su celda. El cierre de la puerta da paso a la noche del día siguiente.'
  ], [
    'The community retires. Adso suggests sleeping and doors restrict movement. Each day begins at night and continues with prime.',
    'Bells gather the community in church. The service begins when those attending take their places.',
    'After the service come instructions and conversations. Approaching whoever calls may be needed for the day to continue.',
    'The meal brings the monks to the refectory. William must be in the room and take his place.',
    'The afternoon leaves an interval for walking, listening and finding your bearings before the next service.',
    'The bells call everyone back to church. Take your assigned place and wait until the service ends.',
    'The Abbot orders everyone to retire and escorts William to his cell. Closing the door begins the next day’s night.'
  ]);
  const advice = t([
    'Si sales, espera a que el Abad se retire y vuelve antes de prima. Para llegar al laberinto por el pasadizo, Adso debe llevar la llave III y la lámpara. El aceite solo se consume en las salas oscuras: Adso avisa al cabo de aproximadamente un minuto y medio y la lámpara se apaga tras unos tres minutos de uso.',
    'Acude a la iglesia y ocupa tu lugar. Escucha al Abad y espera al final del oficio antes de alejarte.',
    'Responde a la llamada del Abad antes de investigar. Las conversaciones dependen de la cercanía y de que haya terminado la frase anterior.',
    'Acude al refectorio y ocupa tu puesto. Durante la comida, el juego comprueba que estén presentes los personajes previstos para ese día.',
    'Aprovecha el intervalo para investigar, sin perder el siguiente oficio. Los objetos y las denuncias pueden alterar los recorridos de los monjes.',
    'Regresa a la iglesia, ocupa tu lugar y espera al final del oficio.',
    'Sigue al Abad, entra en la celda y deja que cierre la puerta. Salir antes de que termine la escolta provoca nuevas órdenes y castigos.'
  ], [
    'If you leave, wait for the Abbot to retire and return before prime. To reach the labyrinth through the passage, Adso must carry key III and the lamp. Oil is consumed only in dark rooms: Adso warns you after about a minute and a half, and the lamp goes out after roughly three minutes of use.',
    'Go to church and take your place. Listen to the Abbot and wait for the service to end before leaving.',
    'Answer the Abbot’s summons before investigating. Conversations depend on proximity and the previous phrase finishing.',
    'Go to the refectory and take your place. The meal checks the presence of the characters expected that day.',
    'Use the interval to investigate without missing the next service. Objects and reports can change the monks’ journeys.',
    'Return to church, take your place and wait for the service to end.',
    'Follow the Abbot, enter the cell and let him close the door. Leaving before the escort ends triggers further orders and penalties.'
  ]);
  // Explicit phase events override or supplement the shared monastic routine.
  // q: [speaker index, original phrase ID]; routes are assigned separately below.
  const events = {
    '1-4': { text: t('El Abad recibe a los visitantes en la entrada, explica el crimen durante el paseo y los lleva a su celda.', 'The Abbot receives the visitors at the entrance, explains the crime during the walk and leads them to their cell.'), action: t('Sigue al Abad sin separarte: la partida comienza en nona, con un paseo de bienvenida que tiene varias paradas.', 'Stay close to the Abbot: the game begins at none, with a welcome walk that has several stops.'), q: [[2,1],[2,2],[2,3],[2,7]] },
    '2-0': { text: t('Es la primera noche de la estancia. Al llegar prima desaparecen las gafas del inventario.', 'This is the first night of the stay. At prime the spectacles disappear from the inventory.'), action: t('Aprende el trayecto entre la celda y la iglesia. Dormir permite avanzar, pero no sustituye la investigación de los días siguientes.', 'Learn the route between the cell and church. Sleeping advances time, but does not replace the coming days’ investigation.') },
    '2-1': { text: t('El Abad anuncia el asesinato de Venancio. La acción de prima retira las gafas.', 'The Abbot announces Venantius’s murder. The prime action removes the spectacles.'), q: [[2,21]] },
    '2-2': { text: t('El Abad prohíbe la biblioteca. En el scriptorium, Malaquías puede ofrecer la visita de Berengario. Severino puede presentarse desde este día, en tercia o nona, si encuentra a Guillermo y ninguna otra conversación se interpone.', 'The Abbot forbids entry to the library. In the scriptorium, Malachi can offer Berengar’s tour. From this day, Severinus can introduce himself at terce or none if he meets William and no other conversation interferes.'), action: t('Escucha la orden del Abad y visita el scriptorium. Acércate a los monjes para iniciar sus conversaciones; Severino puede presentarse tanto en tercia como en nona.', 'Hear the Abbot’s order and visit the scriptorium. Approach the monks to trigger their conversations; Severinus can introduce himself at either terce or none.'), q: [[2,22],[3,52],[4,53],[4,54],[5,55]] },
    '2-4': { text: t('Berengario vigila el manuscrito de Venancio. Si Guillermo lo toma, la advertencia puede convertirse en una denuncia al Abad.', 'Berengar watches Venantius’s manuscript. If William takes it, the warning can become a report to the Abbot.'), action: t('No te lleves el libro sin guantes: su veneno mata también antes del desenlace. Si coges el pergamino ante Berengario, puede denunciarte al agotarse su espera o al salir de la pantalla, sin necesidad de que ocurran ambas cosas. Micromanía espera a la noche III para recoger el pergamino.', 'Do not take the book without gloves: its poison also kills before the finale. If you take the scroll in front of Berengar, he can report you when his wait expires or you leave the screen; both need not happen. Micromanía waits until night III to collect the scroll.'), q: [[4,4]] },
    '3-0': { text: t('Berengario se encapucha, sale de la celda común, busca el libro y lo lleva a la celda de Severino. Muere al llegar con él; entonces avanza la hora. Esta es la noche anterior a la presentación de Jorge.', 'Berengar puts on a hood, leaves the shared cell, seeks the book and carries it to Severinus’s cell. He dies on arriving with it; the hour then advances. This is the night before Jorge’s introduction.'), action: t('Con Adso y la llave III, usa el pasadizo entre la iglesia y la cocina para llegar al scriptorium y recoger el pergamino. Guillermo debe llevarlo al llegar prima; si no, queda oculto tras el espejo. Vuelve antes del amanecer: Berengario hace avanzar la hora al llegar con el libro a Severino. Aún no hay lámpara en la cocina; no subas al laberinto oscuro.', 'With Adso and key III, use the passage between the church and kitchen to reach the scriptorium and collect the scroll. William must carry it at prime; otherwise it is hidden behind the mirror. Return before dawn: Berengar advances the hour when he reaches Severinus with the book. The kitchen lamp is not available yet; do not climb into the dark labyrinth.'), q: [] },
    '3-1': { text: t('El Abad anuncia la desaparición de Berengario. Jorge recibe el libro y aparece al final del pasillo de las celdas; permanece quieto hasta la presentación.', 'The Abbot announces Berengar’s disappearance. Jorge receives the book and appears at the end of the cells’ corridor; he stays still until the introduction.'), q: [[2,24]] },
    '3-2': { text: t('El Abad conduce a Guillermo hasta Jorge. Tras la presentación, el anciano habla si Guillermo está cerca; la jornada avanza a sexta cuando termina de hablar.', 'The Abbot leads William to Jorge. After the introduction, the elder speaks if William is nearby; finishing his phrase allows sext to begin.'), action: t('Sigue al Abad hasta Jorge y permanece cerca hasta que termine la conversación.', 'Follow the Abbot to Jorge and stay nearby until the conversation ends.'), q: [[2,48],[2,49],[6,50]] },
    '3-3': { text: t('Jorge regresa a la celda común y permanece allí hasta que desaparece de la escena en nona.', 'Jorge returns to the shared cell and remains there until he disappears from the scene at none.') },
    '4-1': { text: t('El Abad anuncia que han encontrado a Berengario asesinado.', 'The Abbot announces that Berengar has been found murdered.'), q: [[2,26]] },
    '4-2': { text: t('El Abad ordena abandonar la investigación. Severino busca a Guillermo para contarle las manchas negras de Berengario. Aunque el Abad ya habla de Bernardo, el inquisidor no aparece en persona hasta sexta.', 'The Abbot orders the investigation stopped. Severinus seeks William to describe Berengar’s black stains. Although the Abbot already speaks of Bernard, the inquisitor does not appear in person until sext.'), action: t('Escucha a Severino cuando te alcance. Su testimonio relaciona la lengua y los dedos; el diálogo comienza cuando se encuentra con Guillermo.', 'Listen to Severinus when he reaches you. His evidence connects tongue and fingers; the dialogue begins when he meets William.'), q: [[2,17],[5,38]] },
    '4-3': { text: t('Bernardo aparece en las escaleras de entrada. Durante sexta se dirige primero al refectorio; después comenzará a perseguir el manuscrito.', 'Bernard appears at the entrance stairs. During sext he heads to the refectory first; afterwards he will begin pursuing the manuscript.') },
    '4-4': { text: t('Bernardo busca el pergamino o persigue a Guillermo si lo lleva. Después lo entrega al Abad, que va a guardarlo en su celda. Terminada la tarea, Bernardo puede elegir destinos aleatorios.', 'Bernard seeks the scroll or pursues William if he carries it. He then gives it to the Abbot, who stores it in his cell. Once finished, Bernard can choose random destinations.'), action: t('Si conservaste el pergamino en prima III, Micromanía propone entregárselo ahora a Bernardo: terminará en la celda del Abad y podrás recuperarlo con la llave I. Si quedó tras el espejo en prima III, Bernardo no lo trae de vuelta; esta ruta exige haberlo conservado aquella mañana.', 'If you kept the scroll at prime III, Micromanía has you hand it to Bernard now: it will end up in the Abbot’s cell, where you can recover it with key I. If it was hidden behind the mirror at prime III, Bernard does not bring it back; this route requires having kept it that morning.'), q: [[7,5]] },
    '5-0': { text: t('Durante la noche aparecen la llave I en el altar y las gafas en la habitación iluminada del laberinto. La llave desaparece en prima si Guillermo no la lleva.', 'During the night, key I appears on the altar and the spectacles in the illuminated maze room. The key disappears at prime unless William carries it.'), action: t('Recoge la llave I del altar durante esta noche y vuelve a tu celda: el Abad puede despertarse en cuanto la lleves. Guárdala para recuperar más adelante el pergamino de su celda. Si visitas el laberinto, Adso necesita la llave III para el pasadizo y la lámpara recogida de nuevo tras prima.', 'Collect key I from the altar tonight and return to your cell: the Abbot may wake as soon as you carry it. Keep it to recover the scroll from his cell later. If you visit the labyrinth, Adso needs key III for the passage and the lamp collected again after prime.') },
    '5-1': { text: t('Severino puede buscar a Guillermo antes de ir a la iglesia para avisarle de un libro extraño en su celda. El aviso depende de la posición de Guillermo.', 'Severinus may seek William before going to church to report a strange book in his cell. The warning depends on William’s position.'), q: [[5,15]] },
    '5-2': { text: t('Malaquías se dirige a la celda de Severino y lo mata cuando ambos han llegado. Bernardo también intenta abandonar la abadía; el momento exacto depende de su estado y de las rutinas de esa hora.', 'Malachi heads to Severinus’s cell and kills him when both have arrived. Bernard also tries to leave the abbey; the exact moment depends on his state and that hour’s routines.'), action: t('El asesinato ocurre cuando ambos personajes llegan a la celda de Severino, durante tercia. Recuerda el lugar: más adelante necesitarás entrar.', 'The murder occurs when both characters reach Severinus’s cell, during terce. Remember the location: you will need to enter later.'), q: [[2,29]] },
    '5-4': { text: t('El Abad lleva a Guillermo hasta la puerta de Severino. Tras esperar allí, anuncia que lo han asesinado y encerrado; la escena hace avanzar la hora.', 'The Abbot leads William to Severinus’s door. After waiting there, he announces that Severinus has been murdered and locked in; the scene advances the hour.'), action: t('Sigue al Abad y espera ante la puerta. El asesinato ocurre en tercia; el cuerpo se descubre en nona.', 'Follow the Abbot and wait by the door. The murder occurs at terce; the body is discovered at none.'), q: [[2,27],[2,28]] },
    '5-5': { text: t('Malaquías llega a su puesto en la iglesia, pronuncia su última frase y muere. El Abad reacciona a su muerte dentro del oficio.', 'Malachi reaches his place in church, speaks his last phrase and dies. The Abbot reacts to his death during the service.'), action: t('Acude al oficio y presencia la escena. La desaparición de Malaquías cambia el acceso a su mesa y a las pistas siguientes.', 'Attend the service and witness the scene. Malachi’s disappearance changes access to his desk and the next clues.'), q: [[3,31]] },
    '6-0': { text: t('La llave II aparece en la mesa de Malaquías. Las gafas, colocadas en la habitación iluminada desde la noche V, siguen allí si aún no las has recogido. La lógica también activa ya a Jorge detrás del espejo, pero la guía de Micromanía reserva ese encuentro para la noche VII.', 'Key II appears on Malachi’s desk. The spectacles, placed in the illuminated room on night V, remain there if you have not collected them. The game logic also activates Jorge behind the mirror now, but Micromanía’s walkthrough reserves that encounter for night VII.'), action: t('Sigue la ruta de Micromanía: con Adso llevando la llave III y la lámpara, recoge la llave II en el scriptorium y las gafas en la habitación iluminada, si aún siguen allí. Practica el recorrido y regresa antes de prima. La guía deja los guantes para tercia VI y el desenlace para la noche VII; no aceptes el libro de Jorge sin llevar los guantes.', 'Follow Micromanía’s route: with Adso carrying key III and the lamp, collect key II in the scriptorium and the spectacles in the illuminated room, if they are still there. Practise the route and return before prime. The walkthrough leaves the gloves until terce VI and the finale until night VII; do not accept Jorge’s book without carrying the gloves.') },
    '6-2': { text: t('El Abad anuncia que Guillermo deberá partir al día siguiente.', 'The Abbot announces that William must leave the next day.'), action: t('Escucha al Abad y usa la llave II, recogida durante la noche, para entrar en la celda de Severino y coger los guantes, como hace Micromanía en tercia VI. No aparecen ahora: ya estaban dentro, pero necesitas acceso a la celda. Conserva los guantes y comprueba dónde está el pergamino antes de la visita final.', 'Hear the Abbot, then use key II, collected during the night, to enter Severinus’s cell and take the gloves, as Micromanía does at terce VI. They do not appear now: they were already inside, but you need access to the cell. Keep the gloves and check where the scroll is before the final visit.'), q: [[2,30]] },
    '6-4': { text: t('En nona puedes dedicarte a investigar. El progreso depende de los objetos que conserves y de los lugares que Guillermo haya logrado visitar.', 'At none you can devote your time to investigating. Progress depends on the objects you have kept and the places William has managed to visit.'), action: t('Si el Abad guarda el pergamino, usa la llave I que conservaste desde la noche V para recuperarlo de su celda sin ser sorprendido. Si aún lo llevas, no necesitas recuperarlo. Reúne el pergamino y las gafas para leer la pista y fijar la escalera correcta antes de intentar abrir el espejo; no basta con adivinarla.', 'If the Abbot holds the scroll, use key I, kept since night V, to recover it from his cell unseen. If you still carry it, there is no need to retrieve it. Bring the scroll and spectacles together to read the clue and set the correct stair before trying to open the mirror; guessing alone is not enough.') },
    '7-0': { text: t('Jorge espera detrás del espejo desde la noche VI. Para llegar al desenlace hay que encontrarlo, recoger el libro y superar la trampa de sus páginas envenenadas.', 'Jorge has been waiting behind the mirror since night VI. To reach the ending, you must find him, take the book and survive the trap of its poisoned pages.'), action: t('Antes de salir, comprueba que Guillermo lleva los guantes y ha leído el pergamino con las gafas, y que Adso lleva la llave III y la lámpara recogida tras prima VI. Recorre el laberinto, abre el espejo según la pista y recoge el libro. Cuando Adso revela los guantes, Jorge huye; síguelo hasta la habitación iluminada. La investigación termina cuando ambos llegan allí.', 'Before leaving, check that William carries the gloves and has read the scroll with the spectacles, and that Adso carries key III and the lamp collected after prime VI. Cross the labyrinth, open the mirror according to the clue and take the book. When Adso reveals the gloves, Jorge flees; follow him to the illuminated room. The investigation ends when both arrive there.'), q: [[6,33],[1,35]] },
    '7-1': { text: t('Prima es el último oficio antes del límite. Si la investigación no se ha completado, tercia pone fin a la estancia.', 'Prime is the last service before the deadline. If the investigation has not been completed, terce ends the stay.'), action: t('El plazo vence en tercia; después ya no habrá otra tarde ni otra noche.', 'The deadline is terce; after that there will be no other afternoon or night.') },
    '7-2': { text: t('En tercia, el Abad da por fracasada la investigación y exige que Guillermo abandone la abadía.', 'At terce, the Abbot declares the investigation a failure and orders William to leave the abbey.'), action: t('La exploración termina aquí. El encuentro con Jorge debe haberse resuelto antes.', 'This is the final deadline, not a new exploration interval. The encounter with Jorge must have been resolved beforehand.'), q: [[2,37]] }
  };
  // Object reminders belong to the protected advice, never the public chronicle.
  const objectAdvice = {
    '3-4': t('Recoge ahora la lámpara en la cocina con Adso si aún no la lleva. Está disponible desde prima III; junto con la llave III, prepara la primera visita al laberinto de la noche IV que propone Micromanía.', 'Have Adso collect the kitchen lamp now if he does not already carry it. Available since prime III, it joins key III in preparing Micromanía’s first labyrinth visit on night IV.'),
    '2-2': t('Haz que Adso recoja la llave III de la mesa de Malaquías: abre el pasadizo secreto. Malaquías la recoge en vísperas y la devuelve cuando regresa a su puesto, si todavía la tiene.', 'Have Adso collect key III from Malachi’s desk: it opens the secret passage. Malachi collects it at vespers and returns it when he resumes his post, if he still holds it.'),
    '3-1': t('Desde esta prima hay una lámpara en la cocina. Tras el oficio y la presentación de Jorge, haz que Adso la recoja; Micromanía lo hace en nona III para explorar el laberinto en la noche IV.', 'From this prime, a lamp is available in the kitchen. After the service and Jorge’s introduction, have Adso collect it; Micromanía does so at none III to explore the labyrinth on night IV.'),
    '5-0': t('Guillermo debe conservar la llave I hasta prima: recogerla y dejarla no evita su desaparición. Las gafas reaparecen esta noche en la habitación iluminada del laberinto.', 'William must keep key I until prime: picking it up and dropping it does not prevent its disappearance. The spectacles reappear tonight in the illuminated room of the labyrinth.'),
    '5-1': t('La llave I desaparece si Guillermo no la lleva al llegar prima, incluso si la había dejado en otro lugar. Las gafas siguen disponibles en la habitación iluminada si aún no las has recogido.', 'Key I disappears unless William carries it at prime, even if he dropped it somewhere else. The spectacles remain available in the illuminated room if you have not collected them yet.'),
    '6-0': t('La llave II ya permite abrir la celda de Severino desde esta noche. Recoger los guantes en tercia VI es el orden recomendado por Micromanía, no una aparición programada a esa hora. No necesitas abrir aún el espejo.', 'Key II already allows access to Severinus’s cell tonight. Collecting the gloves at terce VI is Micromanía’s recommended order, not a scheduled appearance at that hour. You do not need to open the mirror yet.')
  };
  const lampReminder = t('Si has usado la lámpara, en prima Adso deja de llevarla y reaparece en la cocina, aunque aún le quedara aceite. Haz que la recoja de nuevo antes de volver al laberinto.', 'If you have used the lamp, at prime Adso no longer carries it and it reappears in the kitchen, even with oil remaining. Have him collect it again before returning to the labyrinth.');
  const mirrorManuscript = 'SECRETUM FINIS AFRICAE, MANUS SUPRA XXX IDOLUM AGE PRIMUM ET SEPTIMUM DE QUATUOR';
  const mirrorSource = t('Al llevar juntos el pergamino y las gafas, Guillermo lee en el pergamino:', 'When William carries the scroll and spectacles together, he reads this on the scroll:');
  const mirrorReminder = t('Significa: «El secreto del Finis Africae: la mano sobre el ídolo XXX; actúa sobre la primera y la séptima de QUATUOR». En lugar de XXX aparece un grupo que señala dónde situarse: IXX = escalera izquierda, XIX = central, XXI = derecha. En ella mantén pulsadas Q y R a la vez —la primera y la séptima letras de QUATUOR— para abrir el espejo; la escalera equivocada activa la trampa mortal.', 'It means: “The secret of the Finis Africae: hand above idol XXX; act upon the first and seventh of QUATUOR.” In place of XXX, a group tells you where to stand: IXX = left stair, XIX = centre, XXI = right. Hold Q and R together there—the first and seventh letters of QUATUOR—to open the mirror; the wrong stair triggers the fatal trap.');
  const places = {
    church: [32.4,57.1,t('Iglesia','Church')], cell: [43.9,66.5,t('Celda de Guillermo','William’s cell')],
    desk: [60.2,29.5,t('Scriptorium','Scriptorium')], refectory: [34.1,28.3,t('Refectorio','Refectory')],
    mirror: [89.5,35.5,t('Tras el espejo','Behind the mirror')], abbot: [34.4,40.3,t('Celda del Abad','Abbot’s cell')],
    severinus: [26.5,46.6,t('Celda de Severino','Severinus’s cell')], light: [75,39.9,t('Habitación iluminada','Illuminated room')],
    entrance: [8.1,58.8,t('Entrada','Entrance')], shared: [43.9,76,t('Celda común','Shared cell')],
    corridor: [46,71,t('Pasillo de las celdas','Cells’ corridor')]
  };
  // A null destination deliberately means that no fixed position can be inferred.
  function cast(d, h) {
    const variable = t('Posición variable','Variable position');
    const absent = t('Fuera de escena','Off scene');
    const rows = ids.map((id, i) => ({ id, name: names[i], to: null, from: null, note: variable }));
    const set = (i, to, note, from = null) => Object.assign(rows[i], {to, note, from});
    set(0, null, t('Su posición depende del jugador.','Player controlled; no fixed position.'));
    set(1, h === 1 || h === 5 ? 'church' : h === 3 ? 'refectory' : h === 6 ? 'cell' : null, t('Sigue a Guillermo; acude a los oficios, comida y celda según la hora.','Follows William; attends services, the meal and the cell according to the hour.'));
    set(2, h === 1 || h === 5 ? 'church' : h === 3 ? 'refectory' : h === 6 ? 'cell' : h === 0 ? 'abbot' : null, h === 0 ? t('Se retira; puede despertar y buscar a Guillermo según su posición.','Retires; may wake and seek William depending on his position.') : t('Sigue esta ruta salvo cuando debe buscar a Guillermo o atender la denuncia de otro monje.','He follows this route unless he must find William or respond to another monk’s report.'));
    set(3, d < 5 || (d === 5 && h <= 5) ? (h === 1 || h === 5 ? 'church' : h === 0 || h === 6 ? 'shared' : 'desk') : null, t('Vigila el acceso a la biblioteca. En vísperas cierra el ala occidental, pasa por la cocina y va a la iglesia.','Guards library access. At vespers he closes the west wing, passes through the kitchen and goes to church.'));
    if (d > 5 || (d === 5 && h > 5)) set(3, null, t('Muerto tras la escena de vísperas del día V.','Dead after the day V vespers scene.'));
    set(4, d < 3 ? (h === 1 || h === 5 ? 'church' : h === 3 ? 'refectory' : h === 0 || h === 6 ? 'shared' : 'desk') : null, d < 3 ? t('Puede abandonar su rutina para denunciar el robo del pergamino.','May leave his routine to report the scroll’s theft.') : t('Muerto tras llevar el libro a Severino en la noche III.','Dead after taking the book to Severinus on night III.'));
    set(5, d < 5 || (d === 5 && h <= 2) ? (h === 1 || h === 5 ? 'church' : h === 3 ? 'refectory' : h === 0 || h === 6 ? 'severinus' : null) : null, d < 5 ? t('En tercia y nona alterna su celda y el pasillo, o busca a Guillermo.','At terce and none alternates between his cell and the corridor, or seeks William.') : t('Muerto si Malaquías completó el encuentro en tercia del día V.','Dead if Malachi completed the encounter at terce on day V.'));
    set(6, d >= 6 ? 'mirror' : null, d >= 6 ? t('Espera aquí; si la conversación revela los guantes, huye a la habitación iluminada.','Waits here; if the conversation reveals the gloves, flees to the illuminated room.') : absent);
    set(7, null, absent);
    if (d === 4 && h >= 3) set(7, h === 3 ? 'refectory' : h === 5 ? 'church' : h === 6 ? 'shared' : null, t('Busca el pergamino; después de entregarlo, sus destinos pueden ser aleatorios.','Seeks the scroll; after delivering it, his destinations may be random.'), h === 3 ? 'entrance' : null);
    if (d === 5 && h <= 2) set(7, h === 0 ? 'shared' : h === 1 ? 'church' : 'entrance', t('La salida depende de su estado; prima y la noche tienen sus propias rutinas.','Departure depends on his state; prime and night have their own routines.'));
    if (d === 1 && h === 4) { set(2, 'cell', events['1-4'].action, 'entrance'); set(1, null, t('Acompaña a Guillermo durante la bienvenida.','Accompanies William during the welcome.')); }
    if (d === 3 && h === 0) set(4, 'severinus', t('Celda común → escaleras del scriptorium → libro → celda de Severino. Muere al llegar con el libro.','Shared cell → scriptorium stairs → book → Severinus’s cell. Dies on arrival with the book.'), 'shared');
    if (d === 3 && (h === 1 || h === 2)) set(6, 'corridor', t('Permanece quieto hasta que termina la presentación.','Stays still until the introduction ends.'));
    if (d === 3 && h === 2) set(2, 'corridor', t('Conduce a Guillermo hasta Jorge tras llamarlo.','Leads William to Jorge after summoning him.'), 'church');
    if (d === 3 && h === 3) set(6, 'shared', t('Se desactiva al llegar; desaparece en nona.','Becomes inactive on arrival; disappears at none.'), 'corridor');
    if (d === 4 && h === 2) set(5, null, events['4-2'].action);
    if (d === 5 && h === 0) set(5, 'severinus', t('Se retira a su celda.','Retires to his cell.'));
    if (d === 5 && h === 1) set(5, null, t('Busca a Guillermo para avisarlo o se dirige a la iglesia, según la posición del jugador.','Seeks William to warn him or heads to church, depending on the player’s position.'));
    if (d === 5 && h === 2) { set(3, 'severinus', events['5-2'].text, 'church'); set(5, 'severinus', t('Espera en su celda; Malaquías lo mata cuando ambos han llegado.','Waits in his cell; Malachi kills him when both have arrived.')); }
    if (d === 5 && h === 4) set(2, 'severinus', events['5-4'].text);
    if (d === 5 && h === 5) set(3, 'church', events['5-5'].text, 'desk');
    if (d === 7 && h === 0) set(6, 'light', t('Si descubre los guantes durante el encuentro, huye desde detrás del espejo con el libro. Esta ruta también puede comenzar durante la noche VI.','Only if he discovers the gloves during the encounter: flees from behind the mirror with the book. This route can also trigger from night VI.'), 'mirror');
    // Presence is distinct from an unknown or player-dependent map position.
    if (!rows[6].to) rows[6].presence = 'absent';
    if (d < 4 || (d === 4 && h < 3) || d > 5 || (d === 5 && h > 2)) rows[7].presence = 'absent';
    if (d > 3 || (d === 3 && h > 0)) rows[4].presence = 'dead';
    if (d > 5 || (d === 5 && h > 2)) rows[5].presence = 'dead';
    if (d > 5 || (d === 5 && h > 5)) rows[3].presence = 'dead';
    if (d === 3 && h === 0) rows[4].presence = 'dying';
    if (d === 5 && h === 2) rows[5].presence = 'dying';
    if (d === 5 && h === 5) rows[3].presence = 'dying';
    if (d === 7 && h === 2) rows.forEach(r => { r.to = null; r.from = null; r.note = t('La investigación ha terminado; los personajes ya no emprenden nuevos recorridos.','The investigation is over; the characters no longer begin new journeys.'); });
    return rows;
  }
  const valid = (d,h) => !(d === 1 && h < 4) && !(d === 7 && h > 2);
  const phases = [];
  for (let d=1;d<=7;d++) for(let h=0;h<7;h++) if(valid(d,h)) phases.push([d,h]);
  // Reuse the exact portrait layout for both ends of every journey.
  function markerPosition(id, place, rows) {
    const [x,y] = places[place];
    const occupants = rows.filter(row => row.to === place);
    const slot = occupants.findIndex(row => row.id === id);
    const spread = slot < 0 ? 0 : (slot-(occupants.length-1)/2)*38;
    const dx = place === 'cell' ? (id === 'abad' ? -38 : 0)
      : place === 'desk' ? (id === 'malaquias' ? -51 : 0)
      : (place === 'corridor' ? -68 : 0)+spread;
    const dy = place === 'cell' ? 8.5 : place === 'shared' ? -25.5
      : place === 'desk' && id === 'berengario' ? -51
      : place === 'mirror' && id === 'jorge' ? 25.5 : 0;
    return {x,y,dx,dy};
  }
  function movements(d,h,rows) {
    const index = phases.findIndex(([pd,ph]) => pd === d && ph === h);
    const previous = index > 0 ? cast(...phases[index-1]) : [];
    return rows.flatMap(row => {
      if (!row.to || row.presence === 'dead' || row.presence === 'absent') return [];
      const prior = previous.find(p => p.id === row.id);
      // Jorge's night VII flight is an optional ending, not his routine position
      // at the next prime. Never infer a return from the illuminated room.
      const optionalEnding = row.id === 'jorge' && prior?.from === 'mirror' && prior?.to === 'light';
      const priorPresent = prior && !['dead','absent','dying'].includes(prior.presence);
      const from = row.from || (priorPresent && !optionalEnding ? prior.to : null);
      if (!from || from === row.to) return [];
      const originRows = prior?.to === from ? previous : [{...row,to:from}];
      const origin = markerPosition(row.id,from,originRows);
      // Communal rooms share one hollow anchor, even when their portraits
      // were spread apart for selection in the preceding stage.
      if (from === 'church' || from === 'refectory') { origin.dx=0; origin.dy=0; }
      return [{id:row.id,from,to:row.to,explicit:Boolean(row.from),
        origin,
        destination:markerPosition(row.id,row.to,rows)}];
    });
  }
  let mapMovements = [];
  let day = 1, hour = 4, selected = 2;
  root.innerHTML = `<div class="week-heading"><p class="eyebrow">${t('Un día, una hora, ocho vidas','One day, one hour, eight lives')}</p><h3>${t('La semana, hora a hora','The week, hour by hour')}</h3><p>${t('Elige un momento. Lee la crónica o abre las pistas para seguir a sus protagonistas.','Choose a moment. Read the chronicle or open the clues to follow its characters.')}</p><p class="caption">${t('Cada jornada comienza de noche. La partida arranca en nona del día I y el plazo vence en tercia del VII.','Night begins each day. Play starts at none on day I; the deadline is terce on day VII.')}</p></div>
    <div class="week-days" role="group" aria-label="${t('Día','Day')}"></div><div class="week-hours" role="group" aria-label="${t('Hora canónica','Canonical hour')}"></div>
    <div class="week-reading" aria-live="polite" aria-atomic="true"><p class="eyebrow" data-week-now></p><h4 data-week-title></h4><p data-week-daycopy></p><p data-week-routine></p></div>
    <div class="week-navigation"><button type="button" data-week-prev>${t('← Hora anterior','← Previous hour')}</button><span class="caption" data-week-count></span><button type="button" data-week-next>${t('Hora siguiente →','Next hour →')}</button></div>
    <details class="week-spoilers spoiler-disclosure spoiler-disclosure--paper"><summary><span class="spoiler-kicker">${t('Spoilers','Spoilers')}</span><strong class="spoiler-action"><span class="spoiler-when-closed">${t('Mostrar pistas, diálogos y movimientos','Show clues, dialogue and movements')}</span><span class="spoiler-when-open">${t('Ocultar pistas, diálogos y movimientos','Hide clues, dialogue and movements')}</span></strong></summary>
      <div class="week-secret-copy"><div><h5>${t('Lo que sucede','What happens')}</h5><p data-week-event></p><div data-week-quotes></div></div><div><h5>${t('Qué hacer','What to do')}</h5><p data-week-advice></p><figure class="week-labyrinth-route" data-week-labyrinth hidden><a href="../assets/maps/library-route-micromania.png" data-lightbox="../assets/maps/library-route-micromania.png" data-alt="${t('Plano del laberinto con el recorrido marcado en rojo','Labyrinth plan with the route marked in red')}" data-caption="${t('Plano de Micromanía 33 con el recorrido anotado en rojo, conservado por CPC-Power.','Micromanía 33 plan with the route annotated in red, preserved by CPC-Power.')}"><img src="../assets/maps/library-route-micromania.png" alt="${t('Plano del laberinto con el recorrido marcado en rojo','Labyrinth plan with the route marked in red')}" loading="lazy"><span>${t('Ampliar el recorrido del laberinto','Enlarge the labyrinth route')}</span></a><figcaption>Micromanía 33 · ${t('copia anotada conservada en','annotated copy preserved by')} <a href="https://www.cpc-power.com/index.php?page=detail&amp;onglet=plan&amp;num=222">CPC-Power</a>.</figcaption></figure><div data-week-mirror hidden><p>${mirrorSource}</p><blockquote class="week-dialogue"><p lang="la">${mirrorManuscript}</p></blockquote><p>${mirrorReminder}</p></div><p class="caption">${t('Los encuentros pueden depender de la cercanía, el inventario y las acciones anteriores.','Encounters may depend on proximity, inventory and earlier actions.')}</p></div></div>
      <div class="week-atlas"><h5>${t('Los habitantes de la abadía','The inhabitants of the abbey')}</h5><p class="week-atlas-intro">${t('Las flechas muestran el desplazamiento entre la hora anterior y la actual, o entre el principio y el final de una escena documentada. Selecciona un retrato para destacar su recorrido. Cuando el personaje permanece en el mismo lugar o se desconoce el punto de partida, no aparece ninguna flecha. Son los desplazamientos habituales; los encuentros de cada partida pueden alterarlos. Las líneas unen dos puntos, pero no trazan el camino exacto. En móvil, desliza el mapa horizontalmente.','Arrows connect the previous hour’s destination to this hour’s, or the endpoints of a documented scene. Select a portrait to highlight its journey. No arrow is drawn for a stationary character or a variable origin. These are expected movements, subject to encounters during play; the lines do not trace paths. On mobile, scroll the map sideways.')}</p>
      <div class="week-map-scroll" tabindex="0" role="region" aria-label="${t('Mapa de destinos, desplazable','Scrollable destination map')}"><div class="week-map"><img src="../assets/maps/interactive-retrogamer-map.jpg" alt="${t('Plano de la abadía y sus plantas superiores','Plan of the abbey and its upper floors')}" loading="lazy"><svg aria-hidden="true"><defs><marker id="week-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L9,4.5 L0,9" fill="#a32d27"/></marker></defs><g data-week-routes></g></svg><div data-week-origins></div><div data-week-pins></div></div></div>
      <p class="caption week-map-caption">${t('Mapa: Retro Gamer España 41 · círculo vacío: origen · retrato: destino · rojo intenso: personaje seleccionado. Los extremos usan las posiciones ajustadas de cada personaje; varios retratos en una estancia se separan para poder seleccionarlos.','Map: Retro Gamer España 41 · empty circle: origin · portrait: destination · strong red: selected character. Endpoints use each character’s adjusted position; portraits sharing a room are spread out for selection.')}</p><p class="week-route" aria-live="polite" aria-atomic="true"></p><div class="week-roster" role="group" aria-label="${t('Personajes','Characters')}"></div></div>
    </details><details class="week-sources"><summary>${t('Cómo se ha reconstruido esta crónica','How this chronicle was reconstructed')}</summary><p>${t('Los consejos siguen la progresión de Micromanía 33 y distinguen sus visitas recomendadas de la disponibilidad de los objetos. La crónica se ha elaborado leyendo el código de VigasocoSDL: AccionesDia, Abad, Berengario, Malaquias, Severino, Bernardo y Jorge. Las citas conservan la escritura de la tabla GestorFrases; los resúmenes y consejos son editoriales. La guía describe las rutinas documentadas, pero no simula una partida ni comprueba todas las versiones.','The advice follows Micromanía 33’s progression and distinguishes its recommended visits from object availability. A reading of VigasocoSDL code: AccionesDia, Abad, Berengario, Malaquias, Severino, Bernardo and Jorge. Quotations preserve its GestorFrases table wording; summaries and advice are editorial. This is not a game simulation or a verification of every version. The English quotations come from the port’s translation.')}</p></details>`;
  const find = s => root.querySelector(s);
  const put = (s, value) => { find(s).textContent = value; };
  const summary = (d,h) => ({
    now: `${t('Día','Day')} ${roman[d-1]} · ${hours[h]} · ${t('Sin spoilers','Spoiler-free')}`,
    title: titles[d-1],
    dayCopy: dayCopy[d-1],
    routine: d===1&&h===4
      ? t('La partida comienza en la entrada. El Abad espera para dar la bienvenida y enseñar el camino.','Play begins at the entrance. The Abbot waits to welcome you and show the way.')
      : d===7&&h===2
        ? t('El plazo concedido por el Abad ha terminado.','The time granted by the Abbot has ended.')
        : routine[h]
  });
  const fillSummary = (scope,d,h) => {
    const copy = summary(d,h);
    scope.querySelector('[data-week-now]').textContent = copy.now;
    scope.querySelector('[data-week-title]').textContent = copy.title;
    scope.querySelector('[data-week-daycopy]').textContent = copy.dayCopy;
    scope.querySelector('[data-week-routine]').textContent = copy.routine;
  };
  const navigation = find('.week-navigation');
  navigation.dataset.weekNavigation = 'summary';
  const mapNavigation = navigation.cloneNode(true);
  mapNavigation.classList.add('week-navigation--local');
  mapNavigation.dataset.weekNavigation = 'map';
  mapNavigation.setAttribute('role','group');
  mapNavigation.setAttribute('aria-label',t('Cambiar hora junto al mapa','Change hour beside the map'));
  const position = document.createElement('span');
  position.className = 'week-navigation-position';
  const phase = document.createElement('span');
  phase.dataset.weekNavPhase = '';
  const count = mapNavigation.querySelector('[data-week-count]');
  count.replaceWith(position);position.append(phase,count);
  find('.week-map-scroll').after(mapNavigation);
  const mapHelp = document.createElement('details');
  mapHelp.className = 'week-map-help';
  const helpTitle = document.createElement('summary');
  helpTitle.textContent = t('Cómo leer el mapa','How to read the map');
  const mapIntro = find('.week-atlas-intro');
  const mapCaption = find('.week-map-caption');
  mapIntro.before(mapHelp);mapHelp.append(helpTitle,mapIntro,mapCaption);
  function button(label, pressed, handler) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.setAttribute('aria-pressed', String(pressed)); b.addEventListener('click', handler); return b;
  }
  roman.forEach((n,i) => {
    const label = `${t('Día','Day')} ${n}`;
    const b = button(label, i === 0, () => { day=i+1; if(!valid(day,hour)) hour=day===1?4:2; render(); });
    const labelWrap = document.createElement('span'); labelWrap.className = 'week-day-label';
    const prefix = document.createElement('span'); prefix.className = 'week-day-prefix'; prefix.textContent = t('Día','Day');
    const number = document.createElement('span'); number.textContent = n;
    labelWrap.append(prefix, document.createTextNode(' '), number);
    b.setAttribute('aria-label', label); b.replaceChildren(labelWrap);
    find('.week-days').append(b);
  });
  hours.forEach((h,i) => find('.week-hours').append(button(h, i === 4, () => {hour=i;render();})));
  const weekReading = find('.week-reading');
  function stabilizeWeekReadingHeight() {
    const probe = weekReading.cloneNode(true);
    probe.setAttribute('aria-hidden','true');
    probe.style.position='absolute';
    probe.style.visibility='hidden';
    probe.style.pointerEvents='none';
    probe.style.width=`${weekReading.getBoundingClientRect().width}px`;
    probe.style.removeProperty('min-height');
    root.append(probe);
    const probeEyebrow=probe.querySelector('[data-week-now]');
    let tallestEyebrow=0;
    phases.forEach(([d,h])=>{
      fillSummary(probe,d,h);
      tallestEyebrow=Math.max(tallestEyebrow,probeEyebrow.offsetHeight);
    });
    probeEyebrow.style.minHeight=`${tallestEyebrow}px`;
    let tallest=0;
    phases.forEach(([d,h])=>{
      fillSummary(probe,d,h);
      tallest=Math.max(tallest,probe.offsetHeight);
    });
    probe.remove();
    find('[data-week-now]').style.minHeight=`${tallestEyebrow}px`;
    weekReading.style.minHeight=`${tallest}px`;
  }
  function renderMap() {
    const rows = cast(day,hour), pins = find('[data-week-pins]'), roster = find('.week-roster');
    mapMovements = movements(day,hour,rows);
    pins.replaceChildren(); roster.replaceChildren();
    for (const r of rows) {
      const i = ids.indexOf(r.id);
      const image = () => { const img=document.createElement('img'); const platform=document.documentElement.dataset.platform; img.src=`../assets/platforms/${['cpc','pc','vga','spectrum','msx'].includes(platform)?platform:'cpc'}/characters/${r.id}.png`; img.alt=''; return img; };
      const b = button('',i===selected,()=>{selected=i;renderMap();find('.week-roster').children[i].focus({preventScroll:true});});
      const portrait=document.createElement('span'); portrait.className='week-roster-portrait'; portrait.dataset.weekPortrait=r.id; portrait.append(image()); b.append(portrait); const copy=document.createElement('span'); const name=document.createElement('b'); name.textContent=r.name; const status=document.createElement('small'); status.textContent=r.to?places[r.to][2]:r.note; copy.append(name);
      if (r.presence) {
        b.dataset.presence=r.presence;
        const badge=document.createElement('span'); badge.className='week-presence';
        badge.textContent=r.presence==='dead'?t('† Muerto','† Dead'):r.presence==='absent'?t('— Ausente','— Not present'):t('† Muere en esta escena','† Dies in this scene');
        copy.append(badge);
      }
      if (r.presence !== 'dead' && r.presence !== 'absent') copy.append(status);
      b.append(copy); roster.append(b);
      if(r.to) {
        const p=places[r.to], position=markerPosition(r.id,r.to,rows);
        const pin=button('',i===selected,()=>{selected=i;renderMap();find(`[data-week-pin="${r.id}"]`).focus({preventScroll:true});});
        pin.className='week-pin';pin.dataset.weekPin=r.id;pin.dataset.weekPlace=r.to;pin.setAttribute('aria-label',`${r.name}: ${p[2]}`); pin.title=`${r.name}: ${p[2]}`;
        pin.style.left=`calc(${position.x}% + ${position.dx}px)`;pin.style.top=`calc(${position.y}% + ${position.dy}px)`;pin.append(image());pins.append(pin);
      }
    }
    drawMovements();
    const r=rows[selected], movement=mapMovements.find(m=>m.id===r.id);
    const route=find('.week-route');route.replaceChildren();const heading=document.createElement('strong');heading.textContent=`${r.name} · ${movement?places[movement.from][2]+' → ':''}${r.to?places[r.to][2]:t('Sin posición fija en el mapa','No fixed position on the map')}`;route.append(heading,document.createTextNode(r.note));
  }
  function drawMovements() {
    const map=find('.week-map'), svg=map.querySelector('svg');
    const width=map.clientWidth, height=map.clientHeight;
    const lines=find('[data-week-routes]'), origins=find('[data-week-origins]');
    lines.replaceChildren();origins.replaceChildren();
    // A closed spoiler panel or an unloaded image has no usable geometry.
    if (!width || !height || !find('.week-spoilers').open) return;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const pixels = p => ({x:p.x*width/100+p.dx,y:p.y*height/100+p.dy});
    const sorted = [...mapMovements].sort((a,b)=>Number(a.id===ids[selected])-Number(b.id===ids[selected]));
    for (const movement of sorted) {
      const a=pixels(movement.origin), b=pixels(movement.destination);
      const distance=Math.hypot(b.x-a.x,b.y-a.y);
      if (distance < 1) continue;
      // Stop just before the portrait edge so the arrowhead remains visible.
      const inset=Math.min(20,distance/3);
      const end={x:b.x-(b.x-a.x)/distance*inset,y:b.y-(b.y-a.y)/distance*inset};
      const line=document.createElementNS('http://www.w3.org/2000/svg','path');
      line.dataset.weekLine=movement.id;
      line.dataset.from=movement.from;line.dataset.to=movement.to;
      line.setAttribute('class',`week-movement${movement.id===ids[selected]?' is-selected':''}`);
      line.setAttribute('d',`M${a.x},${a.y} L${end.x},${end.y}`);
      line.setAttribute('marker-end','url(#week-arrow)');lines.append(line);
      const origin=document.createElement('span');
      origin.className=`week-origin${movement.id===ids[selected]?' is-selected':''}`;
      origin.dataset.weekOrigin=movement.id;
      origin.style.left=`calc(${movement.origin.x}% + ${movement.origin.dx}px)`;
      origin.style.top=`calc(${movement.origin.y}% + ${movement.origin.dy}px)`;
      origin.title=`${names[ids.indexOf(movement.id)]}: ${places[movement.from][2]}`;origins.append(origin);
    }
  }
  function render() {
    [...find('.week-days').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===day-1)));
    const availableHours = hours.filter((_,i)=>valid(day,i)).length;
    find('.week-hours').style.setProperty('--week-hour-columns',availableHours);
    find('.week-hours').style.setProperty('--week-hour-mobile-columns',Math.min(availableHours,4));
    [...find('.week-hours').children].forEach((b,i)=>{
      const unavailable = !valid(day,i);
      b.setAttribute('aria-pressed',String(i===hour));
      b.disabled=unavailable;
      b.hidden=unavailable;
      b.title='';
    });
    const index=phases.findIndex(([d,h])=>d===day&&h===hour), event=events[`${day}-${hour}`];
    root.querySelectorAll('[data-week-prev]').forEach(button=>{button.disabled=index===0;});
    root.querySelectorAll('[data-week-next]').forEach(button=>{button.disabled=index===phases.length-1;});
    root.querySelectorAll('[data-week-count]').forEach(count=>{count.textContent=`${index+1} / ${phases.length}`;});
    root.querySelectorAll('[data-week-nav-phase]').forEach(phase=>{phase.textContent=`${t('Día','Day')} ${roman[day-1]} · ${hours[hour]}`;});
    fillSummary(root,day,hour);
    put('[data-week-event]',event?.text||routine[hour]);
    const closingReminder = day<=4&&hour===5 ? t('Malaquías puede exigir que abandones el scriptorium y denunciarte antes de cerrar el ala occidental.', 'Malachi may order you out of the scriptorium and report you before closing the west wing.') : '';
    const objectNotes = [objectAdvice[`${day}-${hour}`], day>=4&&day<=6&&hour===1 ? lampReminder : '', closingReminder].filter(Boolean);
    put('[data-week-advice]',[event?.action||advice[hour], ...objectNotes].join(' '));
    const showLabyrinth = (day===6||day===7)&&hour===0;
    find('[data-week-labyrinth]').hidden = !showLabyrinth;
    find('[data-week-mirror]').hidden = !(day===7&&hour===0);
    const defaultQuotes = hour===0?[[1,18]]:hour===1||hour===5?[[2,23]]:hour===3?[[2,25]]:hour===6?[[2,13],[2,16]]:[];
    const quotes=event?.q??defaultQuotes, holder=find('[data-week-quotes]');holder.replaceChildren();
    const quoteHeavy=quotes.length>=4;
    find('.week-secret-copy').classList.toggle('is-quote-heavy',quoteHeavy);
    const quoteColumns=quoteHeavy?[document.createElement('div'),document.createElement('div')]:null;
    quoteColumns?.forEach(column=>{column.className='week-quote-column';});
    quotes.forEach(([speaker,id],index)=>{const quote=document.createElement('blockquote');quote.className='week-dialogue';const p=document.createElement('p');p.textContent=window.AbbeyWeekDialogue[en?'en':'es'][id];const cite=document.createElement('cite');cite.textContent=`${names[speaker]} · ${t('frase','phrase')} 0x${id.toString(16).toUpperCase().padStart(2,'0')} · VigasocoSDL`;quote.append(p,cite);(quoteColumns?quoteColumns[index<Math.ceil(quotes.length/2)?0:1]:holder).append(quote);});
    if(quoteColumns)holder.append(...quoteColumns);
    if(!quotes.length){const p=document.createElement('p');p.className='caption';p.textContent=t('Este momento no tiene una frase propia.','No exclusive phrase is assigned to this moment.');holder.append(p);}
    renderMap();
  }
  function step(delta,button) {
    const i=phases.findIndex(([d,h])=>d===day&&h===hour), next=phases[i+delta];
    if (!next) return;
    const toolbar=button.closest('.week-navigation--local');
    const top=toolbar?.getBoundingClientRect().top;
    [day,hour]=next;render();
    // Keep the local controls in place when dialogue above changes height.
    if (toolbar) window.scrollBy({top:toolbar.getBoundingClientRect().top-top,behavior:'instant'});
  }
  root.querySelectorAll('[data-week-prev]').forEach(button=>button.addEventListener('click',()=>step(-1,button)));
  root.querySelectorAll('[data-week-next]').forEach(button=>button.addEventListener('click',()=>step(1,button)));
  window.addEventListener('reportaje:platformchange', renderMap);
  find('.week-spoilers').addEventListener('toggle',drawMovements);
  find('.week-map > img').addEventListener('load',drawMovements);
  new ResizeObserver(drawMovements).observe(find('.week-map'));
  let readingResizeFrame=0;
  window.addEventListener('resize',()=>{
    cancelAnimationFrame(readingResizeFrame);
    readingResizeFrame=requestAnimationFrame(stabilizeWeekReadingHeight);
  });
  render();
  requestAnimationFrame(stabilizeWeekReadingHeight);
  document.fonts?.ready.then(stabilizeWeekReadingHeight);
})();
