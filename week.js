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
    'Guillermo y Adso son huéspedes nuevos. El primer recorrido enseña tanto la arquitectura como la autoridad que la gobierna.',
    'El trabajo de los copistas abre una nueva vía de investigación. Escuchar a los monjes importa tanto como encontrar una puerta.',
    'La abadía tiene una memoria más antigua que sus huéspedes. El Abad prepara un encuentro con uno de sus habitantes.',
    'La llegada de una autoridad exterior cambia el margen de libertad de Guillermo. Las conversaciones adquieren otro peso.',
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
    'La comunidad se retira. Adso propone dormir y las puertas limitan los recorridos. Esta noche precede a la prima del día seleccionado.',
    'Las campanas reúnen a la comunidad en la iglesia. El oficio espera a que los asistentes ocupen sus puestos.',
    'Después del oficio llegan los encargos y las conversaciones. Acercarse a quien llama puede ser necesario para que continúe la jornada.',
    'La comida reúne a los comensales en el refectorio. Estar en la sala no basta: Guillermo debe ocupar su sitio.',
    'La tarde deja un intervalo para recorrer la abadía, escuchar y orientarse antes del siguiente oficio.',
    'Las campanas llaman de nuevo a la iglesia. El cierre del ala occidental forma parte de la rutina del bibliotecario.',
    'El Abad manda retirarse y acompaña a Guillermo a su celda. El cierre de la puerta da paso a la noche del día siguiente.'
  ], [
    'The community retires. Adso suggests sleeping and doors restrict movement. This night precedes prime of the selected day.',
    'Bells gather the community in church. The service waits for the expected participants to take their places.',
    'After the service come instructions and conversations. Approaching whoever calls may be needed for the day to continue.',
    'The meal brings the diners to the refectory. Being in the room is not enough: William must take his place.',
    'The afternoon leaves an interval for walking, listening and finding your bearings before the next service.',
    'The bells call everyone back to church. Closing the west wing is part of the librarian’s routine.',
    'The Abbot orders everyone to retire and escorts William to his cell. Closing the door begins the next day’s night.'
  ]);
  const advice = t([
    'Si sales, espera a que el Abad se retire y vuelve antes de prima. Lleva a Adso con la lámpara para explorar zonas oscuras; el aceite impone otro límite.',
    'Acude a la iglesia y ocupa el lugar de Guillermo. Escucha al Abad y espera al final del oficio antes de alejarte.',
    'Responde a la llamada del Abad antes de investigar. Las conversaciones dependen de la cercanía y de que haya terminado la frase anterior.',
    'Acude al refectorio y ocupa tu puesto. La comida comprueba la presencia de los personajes previstos para ese día.',
    'Aprovecha el intervalo para investigar, sin perder el siguiente oficio. Los objetos y las denuncias pueden alterar los recorridos de los monjes.',
    'Regresa a la iglesia. Malaquías puede exigir que abandones el scriptorium y denunciarte antes de cerrar el ala occidental.',
    'Sigue al Abad, entra en la celda y deja que cierre. Salir antes de que termine la escolta provoca nuevas órdenes y castigos.'
  ], [
    'If you leave, wait for the Abbot to retire and return before prime. Bring Adso with the lamp into dark areas; its oil adds another deadline.',
    'Go to church and take William’s place. Listen to the Abbot and wait for the service to end before leaving.',
    'Answer the Abbot’s summons before investigating. Conversations depend on proximity and the previous phrase finishing.',
    'Go to the refectory and take your place. The meal checks the presence of the characters expected that day.',
    'Use the interval to investigate without missing the next service. Objects and reports can change the monks’ journeys.',
    'Return to church. Malachi may order you out of the scriptorium and report you before closing the west wing.',
    'Follow the Abbot, enter the cell and let him close up. Leaving during the escort triggers further orders and penalties.'
  ]);
  // Explicit phase events override or supplement the shared monastic routine.
  // q: [speaker index, original phrase ID]; routes are assigned separately below.
  const events = {
    '1-4': { text: t('El Abad recibe a los visitantes en la entrada, explica el crimen durante el paseo y los lleva a su celda.', 'The Abbot receives the visitors at the entrance, explains the crime during the walk and leads them to their cell.'), action: t('Sigue al Abad sin separarte. La bienvenida tiene varias paradas; el juego comienza aquí, no en prima.', 'Stay close to the Abbot. The welcome has several stops; the game begins here, not at prime.'), q: [[2,1],[2,2],[2,3],[2,7]] },
    '2-0': { text: t('Es la primera noche de la estancia. Al llegar prima desaparecen las gafas del inventario.', 'This is the first night of the stay. At prime the spectacles disappear from the inventory.'), action: t('Aprende el trayecto entre la celda y la iglesia. Dormir permite avanzar, pero no sustituye la investigación de los días siguientes.', 'Learn the route between the cell and church. Sleeping advances time, but does not replace the coming days’ investigation.') },
    '2-1': { text: t('El Abad anuncia el asesinato de Venancio. La acción de prima retira las gafas.', 'The Abbot announces Venantius’s murder. The prime action removes the spectacles.'), q: [[2,21]] },
    '2-2': { text: t('El Abad prohíbe la biblioteca. En el scriptorium, Malaquías puede ofrecer la visita de Berengario. Severino puede presentarse desde este día, en tercia o nona, si encuentra a Guillermo y no interfiere otra conversación.', 'The Abbot forbids entry to the library. In the scriptorium, Malachi can offer Berengar’s tour. From this day, Severinus can introduce himself at terce or none if he meets William and no other conversation interferes.'), action: t('Escucha la orden del Abad y visita el scriptorium. Acércate a los monjes para activar sus conversaciones; la presentación de Severino no tiene una hora garantizada.', 'Hear the Abbot’s order and visit the scriptorium. Approach the monks to trigger conversations; Severinus’s introduction has no guaranteed time.'), q: [[2,22],[3,52],[4,53],[4,54],[5,55]] },
    '2-4': { text: t('Berengario vigila el manuscrito de Venancio. Si Guillermo lo toma, la advertencia puede convertirse en una denuncia al Abad.', 'Berengar watches Venantius’s manuscript. If William takes it, the warning can become a report to the Abbot.'), action: t('Planifica cómo conservar el pergamino. La amenaza depende de llevarlo, del tiempo transcurrido y de cambiar de pantalla; no es una conversación automática de nona.', 'Plan how to keep the scroll. The threat depends on carrying it, elapsed time and changing screens; it is not an automatic none conversation.'), q: [[4,4]] },
    '3-0': { text: t('Berengario se encapucha, sale de la celda común, busca el libro y lo lleva a la celda de Severino. Muere al llegar con él; entonces avanza la hora. Esta es la noche anterior a la presentación de Jorge.', 'Berengar puts on a hood, leaves the shared cell, seeks the book and carries it to Severinus’s cell. He dies on arriving with it; the hour then advances. This is the night before Jorge’s introduction.'), action: t('Puedes observar el recorrido, pero no confundas seguir al encapuchado con tener resuelto el acceso a la biblioteca. Conserva el pergamino: al amanecer se oculta tras el espejo si Guillermo no lo lleva.', 'You can watch the journey, but following the hooded monk does not solve access to the library. Keep the scroll: at dawn it is hidden behind the mirror if William is not carrying it.'), q: [] },
    '3-1': { text: t('El Abad anuncia la desaparición de Berengario. Jorge recibe el libro y aparece al final del pasillo de las celdas; permanece quieto hasta la presentación.', 'The Abbot announces Berengar’s disappearance. Jorge receives the book and appears at the end of the cells’ corridor; he stays still until the introduction.'), q: [[2,24]] },
    '3-2': { text: t('El Abad conduce a Guillermo hasta Jorge. Tras la presentación, el anciano habla si Guillermo está cerca; terminar su frase permite avanzar a sexta.', 'The Abbot leads William to Jorge. After the introduction, the elder speaks if William is nearby; finishing his phrase allows sext to begin.'), action: t('Sigue al Abad hasta Jorge y permanece cerca hasta que termine la conversación.', 'Follow the Abbot to Jorge and stay nearby until the conversation ends.'), q: [[2,48],[2,49],[6,50]] },
    '3-3': { text: t('Jorge regresa a la celda común y se desactiva al llegar. En nona, la acción programada lo retira de la escena.', 'Jorge returns to the shared cell and becomes inactive on arrival. At none the scheduled action removes him from the scene.') },
    '4-1': { text: t('El Abad anuncia que han encontrado a Berengario asesinado.', 'The Abbot announces that Berengar has been found murdered.'), q: [[2,26]] },
    '4-2': { text: t('El Abad ordena abandonar la investigación. Severino busca a Guillermo para contarle las manchas negras de Berengario. Aunque el Abad habla de Bernardo, su aparición física está programada para sexta.', 'The Abbot orders the investigation stopped. Severinus seeks William to describe Berengar’s black stains. Although the Abbot speaks of Bernard, his physical appearance is scheduled for sext.'), action: t('Escucha a Severino cuando te alcance. Su testimonio relaciona la lengua y los dedos; la frase se activa al reunirse con Guillermo.', 'Listen to Severinus when he reaches you. His evidence connects tongue and fingers; the phrase triggers when he meets William.'), q: [[2,17],[5,38]] },
    '4-3': { text: t('Bernardo aparece en las escaleras de entrada. Durante sexta su prioridad es acudir al refectorio; la persecución del manuscrito corresponde a su rutina posterior.', 'Bernard appears at the entrance stairs. During sext his priority is the refectory; pursuing the manuscript belongs to his subsequent routine.') },
    '4-4': { text: t('Bernardo busca el pergamino o persigue a Guillermo si lo lleva. Después lo entrega al Abad, que va a guardarlo en su celda. Terminada la tarea, Bernardo puede elegir destinos aleatorios.', 'Bernard seeks the scroll or pursues William if he carries it. He then gives it to the Abbot, who stores it in his cell. Once finished, Bernard can choose random destinations.'), action: t('Ten presente dónde queda el pergamino. La exigencia de Bernardo depende de que Guillermo lo lleve y de que ambos se encuentren.', 'Keep track of the scroll. Bernard’s demand depends on William carrying it and the two meeting.'), q: [[7,5]] },
    '5-0': { text: t('La acción nocturna coloca la llave I en el altar y las gafas en la habitación iluminada del laberinto. La llave desaparece en prima si Guillermo no la ha recogido.', 'The night action places key I on the altar and the spectacles in the illuminated maze room. The key disappears at prime if William has not collected it.'), action: t('Recoge la llave del altar durante esta noche. Permite acceder a la celda del Abad; ten en cuenta su vigilancia al volver.', 'Collect the altar key during this night. It opens the Abbot’s cell; account for his watchfulness on your return.') },
    '5-1': { text: t('Severino puede buscar a Guillermo antes de ir a la iglesia para avisarle de un libro extraño en su celda. El aviso depende de la posición de Guillermo.', 'Severinus may seek William before going to church to report a strange book in his cell. The warning depends on William’s position.'), q: [[5,15]] },
    '5-2': { text: t('Malaquías se dirige a la celda de Severino y lo mata cuando ambos han llegado. Bernardo tiene prevista la salida de la abadía, condicionada por su estado y las rutinas de cada hora.', 'Malachi heads to Severinus’s cell and kills him when both have arrived. Bernard is scheduled to leave the abbey, subject to his state and the routines of each hour.'), action: t('La muerte se desencadena por la llegada de los personajes, no por seleccionar tercia. Recuerda la celda de Severino: más adelante necesitarás entrar.', 'The death is triggered by the characters arriving, not simply by reaching terce. Remember Severinus’s cell: you will need to enter later.'), q: [[2,29]] },
    '5-4': { text: t('El Abad lleva a Guillermo hasta la puerta de Severino. Tras esperar allí, anuncia que lo han asesinado y encerrado; la escena hace avanzar la hora.', 'The Abbot leads William to Severinus’s door. After waiting there, he announces that Severinus has been murdered and locked in; the scene advances the hour.'), action: t('Sigue al Abad y espera ante la puerta. No confundas el descubrimiento en nona con el asesinato de tercia.', 'Follow the Abbot and wait by the door. The discovery at none is separate from the murder at terce.'), q: [[2,27],[2,28]] },
    '5-5': { text: t('Malaquías llega a su puesto en la iglesia, pronuncia su última frase y muere. El Abad reacciona a su muerte dentro del oficio.', 'Malachi reaches his place in church, speaks his last phrase and dies. The Abbot reacts to his death during the service.'), action: t('Acude al oficio y presencia la escena. La desaparición de Malaquías cambia el acceso a su mesa y a las pistas siguientes.', 'Attend the service and witness the scene. Malachi’s disappearance changes access to his desk and the next clues.'), q: [[3,31]] },
    '6-0': { text: t('La llave II aparece en la mesa de Malaquías. Jorge se activa en la habitación de detrás del espejo y espera el encuentro final.', 'Key II appears on Malachi’s desk. Jorge becomes active in the room behind the mirror and awaits the final encounter.'), action: t('Reúne la llave de la celda de Severino y consigue los guantes. Para el laberinto necesitarás la lámpara de Adso; busca también las gafas y conserva o recupera el pergamino.', 'Collect the key to Severinus’s cell and obtain the gloves. For the maze you need Adso’s lamp; seek the spectacles too and keep or recover the scroll.') },
    '6-2': { text: t('El Abad anuncia que Guillermo deberá partir al día siguiente. Jorge sigue disponible tras el espejo si se consigue entrar.', 'The Abbot announces that William must leave the next day. Jorge remains available behind the mirror if you can enter.'), action: t('Usa la llave II para entrar en la celda de Severino y recoger los guantes. Prepara el acceso al espejo con el pergamino, las gafas y luz suficiente.', 'Use key II to enter Severinus’s cell and collect the gloves. Prepare access to the mirror with the scroll, spectacles and enough light.'), q: [[2,30]] },
    '6-4': { text: t('No hay un nuevo encuentro exclusivo de nona. El progreso depende de los objetos conservados y de los lugares que Guillermo haya logrado visitar.', 'There is no new encounter exclusive to none. Progress depends on the objects kept and the places William has managed to visit.'), action: t('Si el Abad guarda el pergamino, recuperarlo exige entrar en su celda sin ser sorprendido. Con las gafas puedes leer la instrucción del espejo.', 'If the Abbot holds the scroll, recovering it requires entering his cell unseen. With the spectacles you can read the mirror instruction.') },
    '7-0': { text: t('Jorge espera detrás del espejo desde la noche VI. El desenlace no se activa por la hora: exige llegar hasta él, recoger el libro y superar la trampa de sus páginas envenenadas.', 'Jorge has waited behind the mirror since night VI. The ending is not triggered by the hour: you must reach him, take the book and survive its poisoned pages.'), action: t('Entra con guantes y con Adso llevando luz. Tras descubrir los guantes, Jorge huye con el libro hacia la habitación iluminada; síguelo. Esta escena ya puede ocurrir desde la noche VI.', 'Enter with gloves and with Adso carrying light. On discovering the gloves, Jorge flees with the book towards the illuminated room; follow him. This scene can already occur from night VI.'), q: [[6,33],[1,35]] },
    '7-1': { text: t('Prima es el último oficio antes del límite. Si la investigación no se ha completado, tercia pone fin a la estancia.', 'Prime is the last service before the deadline. If the investigation has not been completed, terce ends the stay.'), action: t('No cuentes con otra tarde o una noche adicional: el límite es tercia de este día.', 'Do not count on another afternoon or an extra night: the deadline is terce today.') },
    '7-2': { text: t('La rutina del Abad marca el fracaso de la investigación y exige que Guillermo abandone la abadía.', 'The Abbot’s routine marks the investigation as failed and orders William to leave the abbey.'), action: t('Es el límite final, no un nuevo intervalo de exploración. El encuentro con Jorge debe haberse resuelto antes.', 'This is the final deadline, not a new exploration interval. The encounter with Jorge must have been resolved beforehand.'), q: [[2,37]] }
  };
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
    set(0, null, t('Lo mueve el jugador; sin posición fija.','Player controlled; no fixed position.'));
    set(1, h === 1 || h === 5 ? 'church' : h === 3 ? 'refectory' : h === 6 ? 'cell' : null, t('Sigue a Guillermo; acude a los oficios, comida y celda según la hora.','Follows William; attends services, the meal and the cell according to the hour.'));
    set(2, h === 1 || h === 5 ? 'church' : h === 3 ? 'refectory' : h === 6 ? 'cell' : h === 0 ? 'abbot' : null, h === 0 ? t('Se retira; puede despertar y buscar a Guillermo según su posición.','Retires; may wake and seek William depending on his position.') : t('Destino habitual; las llamadas y denuncias pueden cambiar su ruta.','Usual destination; summons and reports may change his route.'));
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
    if (d === 7 && h === 0) set(6, 'light', t('Solo si descubre los guantes durante el encuentro: huye desde detrás del espejo con el libro. Esta ruta también puede activarse desde la noche VI.','Only if he discovers the gloves during the encounter: flees from behind the mirror with the book. This route can also trigger from night VI.'), 'mirror');
    // Presence is distinct from an unknown or player-dependent map position.
    if (!rows[6].to) rows[6].presence = 'absent';
    if (d < 4 || (d === 4 && h < 3) || d > 5 || (d === 5 && h > 2)) rows[7].presence = 'absent';
    if (d > 3 || (d === 3 && h > 0)) rows[4].presence = 'dead';
    if (d > 5 || (d === 5 && h > 2)) rows[5].presence = 'dead';
    if (d > 5 || (d === 5 && h > 5)) rows[3].presence = 'dead';
    if (d === 3 && h === 0) rows[4].presence = 'dying';
    if (d === 5 && h === 2) rows[5].presence = 'dying';
    if (d === 5 && h === 5) rows[3].presence = 'dying';
    if (d === 7 && h === 2) rows.forEach(r => { r.to = null; r.from = null; r.note = t('Límite de la investigación: no hay una nueva ruta de juego.','Investigation deadline: no new gameplay route.'); });
    return rows;
  }
  const valid = (d,h) => !(d === 1 && h < 4) && !(d === 7 && h > 2);
  const phases = [];
  for (let d=1;d<=7;d++) for(let h=0;h<7;h++) if(valid(d,h)) phases.push([d,h]);
  let day = 1, hour = 4, selected = 2;
  root.innerHTML = `<div class="week-heading"><p class="eyebrow">${t('Un día, una hora, ocho vidas','One day, one hour, eight lives')}</p><h3>${t('Dentro de la semana','Inside the week')}</h3><p>${t('Elige un momento. Lee la crónica o abre las pistas para seguir a sus protagonistas.','Choose a moment. Read the chronicle or open the clues to follow its characters.')}</p><p class="caption">${t('La noche abre cada día. La partida comienza en nona del día I y el plazo termina en tercia del VII.','Night begins each day. Play starts at none on day I; the deadline is terce on day VII.')}</p></div>
    <div class="week-days" role="group" aria-label="${t('Día','Day')}"></div><div class="week-hours" role="group" aria-label="${t('Hora canónica','Canonical hour')}"></div>
    <div class="week-reading" aria-live="polite" aria-atomic="true"><p class="eyebrow" data-week-now></p><h4 data-week-title></h4><p data-week-daycopy></p><p data-week-routine></p></div>
    <div class="week-navigation"><button type="button" data-week-prev>${t('← Hora anterior','← Previous hour')}</button><span class="caption" data-week-count></span><button type="button" data-week-next>${t('Hora siguiente →','Next hour →')}</button></div>
    <details class="week-spoilers"><summary>${t('Abrir pistas, diálogos y movimientos · contiene spoilers','Open clues, dialogue and movements · contains spoilers')}</summary>
      <div class="week-secret-copy"><div><h5>${t('Lo que sucede','What happens')}</h5><p data-week-event></p><div data-week-quotes></div></div><div><h5>${t('Qué hacer','What to do')}</h5><p data-week-advice></p><p class="caption">${t('Los encuentros pueden depender de la cercanía, el inventario y las acciones anteriores.','Encounters may depend on proximity, inventory and earlier actions.')}</p></div></div>
      <div class="week-atlas"><h5>${t('Los habitantes de la abadía','The inhabitants of the abbey')}</h5><p class="week-atlas-intro">${t('Selecciona un retrato para ver su destino y, cuando está documentado, el origen. Los círculos indican estancias aproximadas; las líneas no son caminos. Las posiciones variables figuran debajo del mapa. En móvil, desliza el mapa horizontalmente.','Select a portrait to see its destination and, where documented, its origin. Circles mark approximate rooms; lines are not paths. Variable positions are listed below the map. On mobile, scroll the map sideways.')}</p>
      <div class="week-map-scroll" tabindex="0" role="region" aria-label="${t('Mapa de destinos, desplazable','Scrollable destination map')}"><div class="week-map"><img src="../assets/maps/interactive-retrogamer-map.jpg" alt="${t('Plano de la abadía y sus plantas superiores','Plan of the abbey and its upper floors')}" loading="lazy"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="week-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5" fill="#a32d27"/></marker></defs><path data-week-line fill="none" stroke="#a32d27" stroke-width=".45" stroke-dasharray="1 .6" marker-end="url(#week-arrow)"/></svg><div data-week-pins></div></div></div>
      <p class="caption">${t('Mapa: Retro Gamer España 41 · círculo vacío: origen · retrato: destino · varios retratos en una estancia se separan para poder seleccionarlos.','Map: Retro Gamer España 41 · empty circle: origin · portrait: destination · portraits sharing a room are spread out for selection.')}</p><p class="week-route" aria-live="polite" aria-atomic="true"></p><div class="week-roster" role="group" aria-label="${t('Personajes','Characters')}"></div></div>
    </details><details class="week-sources"><summary>${t('Cómo se ha reconstruido esta crónica','How this chronicle was reconstructed')}</summary><p>${t('Lectura del código de VigasocoSDL: AccionesDia, Abad, Berengario, Malaquias, Severino, Bernardo y Jorge. Las citas conservan la escritura de su tabla GestorFrases; los resúmenes y consejos son editoriales. No es una simulación de una partida ni una comprobación de todas las versiones.','A reading of VigasocoSDL code: AccionesDia, Abad, Berengario, Malaquias, Severino, Bernardo and Jorge. Quotations preserve its GestorFrases table wording; summaries and advice are editorial. This is not a game simulation or a verification of every version. The English quotations come from the port’s translation.')}</p><a href="../assets/game/week-sources.md">${t('Ver notas de fuentes y condiciones','Read source notes and conditions')}</a></details>`;
  const find = s => root.querySelector(s);
  const put = (s, value) => { find(s).textContent = value; };
  function button(label, pressed, handler) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.setAttribute('aria-pressed', String(pressed)); b.addEventListener('click', handler); return b;
  }
  roman.forEach((n,i) => { const b = button(`${t('Día','Day')} ${n}`, i === 0, () => { day=i+1; if(!valid(day,hour)) hour=day===1?4:2; render(); }); find('.week-days').append(b); });
  hours.forEach((h,i) => find('.week-hours').append(button(h, i === 4, () => {hour=i;render();})));
  function renderMap() {
    const rows = cast(day,hour), pins = find('[data-week-pins]'), roster = find('.week-roster');
    pins.replaceChildren(); roster.replaceChildren();
    const groups = {};
    rows.forEach(r => {if(r.to) (groups[r.to] ||= []).push(r);});
    for (const r of rows) {
      const i = ids.indexOf(r.id);
      const image = () => { const img=document.createElement('img'); const platform=document.documentElement.dataset.platform; img.src=`../assets/platforms/${['cpc','pc','vga','spectrum','msx'].includes(platform)?platform:'cpc'}/characters/${r.id}.png`; img.alt=''; return img; };
      const b = button('',i===selected,()=>{selected=i;renderMap();find('.week-roster').children[i].focus({preventScroll:true});});
      b.append(image()); const copy=document.createElement('span'); const name=document.createElement('b'); name.textContent=r.name; const status=document.createElement('small'); status.textContent=r.to?places[r.to][2]:r.note; copy.append(name);
      if (r.presence) {
        b.dataset.presence=r.presence;
        const badge=document.createElement('span'); badge.className='week-presence';
        badge.textContent=r.presence==='dead'?t('† Muerto','† Dead'):r.presence==='absent'?t('— Ausente','— Not present'):t('† Muere en esta escena','† Dies in this scene');
        copy.append(badge);
      }
      if (r.presence !== 'dead' && r.presence !== 'absent') copy.append(status);
      b.append(copy); roster.append(b);
      if(r.to) {
        const group=groups[r.to], slot=group.indexOf(r), p=places[r.to];
        const pin=button('',i===selected,()=>{selected=i;renderMap();find(`[data-week-pin="${r.id}"]`).focus({preventScroll:true});});
        pin.className='week-pin';pin.dataset.weekPin=r.id;pin.dataset.weekPlace=r.to;pin.setAttribute('aria-label',`${r.name}: ${p[2]}`); pin.title=`${r.name}: ${p[2]}`;
        // At William's cell, Adso stays inside and the Abbot waits outside.
        // This swaps the original pair and shifts it left by half its 38px gap.
        const roomOffset = r.to === 'corridor' ? -68 : r.to === 'desk' && r.id === 'malaquias' ? -51 : 0;
        const groupOffset = r.to === 'desk' ? 0 : (slot-(group.length-1)/2)*38;
        const offset = r.to === 'cell' ? (r.id === 'abad' ? -38 : 0) : roomOffset+groupOffset;
        const verticalOffset = r.to === 'desk' && r.id === 'berengario' ? -51 : r.to === 'mirror' && r.id === 'jorge' ? 25.5 : 0;
        pin.style.left=`calc(${p[0]}% + ${offset}px)`;pin.style.top=`calc(${p[1]}% + ${verticalOffset}px)`;pin.append(image());pins.append(pin);
      }
    }
    const r=rows[selected], line=find('[data-week-line]'); line.setAttribute('d','');
    if(r.from && r.to) {
      const a=places[r.from], map=find('.week-map').getBoundingClientRect();
      const target=find(`[data-week-pin="${r.id}"]`).getBoundingClientRect();
      const originOffsetX = r.from === 'corridor' ? -68 : r.from === 'desk' && r.id === 'malaquias' ? -51 : 0;
      const originOffsetY = r.from === 'shared' ? -25.5 : r.from === 'desk' && r.id === 'berengario' ? -51 : r.from === 'mirror' && r.id === 'jorge' ? 25.5 : 0;
      const originX=a[0]+originOffsetX/map.width*100;
      const originY=a[1]+originOffsetY/map.height*100;
      const targetX=(target.left+target.width/2-map.left)/map.width*100;
      const targetY=(target.top+target.height/2-map.top)/map.height*100;
      line.setAttribute('d',`M${originX},${originY} L${targetX},${targetY}`);
      const origin=document.createElement('span');origin.className='week-origin';origin.style.left=`calc(${a[0]}% + ${originOffsetX}px)`;origin.style.top=`calc(${a[1]}% + ${originOffsetY}px)`;origin.title=a[2];pins.append(origin);
    }
    const route=find('.week-route');route.replaceChildren();const heading=document.createElement('strong');heading.textContent=`${r.name} · ${r.from?places[r.from][2]+' → ':''}${r.to?places[r.to][2]:t('Sin posición fija en el mapa','No fixed position on the map')}`;route.append(heading,document.createTextNode(r.note));
  }
  function render() {
    [...find('.week-days').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===day-1)));
    [...find('.week-hours').children].forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===hour));b.disabled=!valid(day,i);b.title=b.disabled?t('Fuera del intervalo jugable','Outside the playable interval'):'';});
    const index=phases.findIndex(([d,h])=>d===day&&h===hour), event=events[`${day}-${hour}`];
    find('[data-week-prev]').disabled=index===0;find('[data-week-next]').disabled=index===phases.length-1;
    put('[data-week-count]',`${index+1} / ${phases.length}`);
    put('[data-week-now]',`${t('Día','Day')} ${roman[day-1]} · ${hours[hour]} · ${t('Sin spoilers','Spoiler-free')}`);
    put('[data-week-title]',titles[day-1]);put('[data-week-daycopy]',dayCopy[day-1]);
    put('[data-week-routine]',day===1&&hour===4?t('La partida comienza en la entrada. El Abad espera para dar la bienvenida y enseñar el camino.','Play begins at the entrance. The Abbot waits to welcome you and show the way.'):day===7&&hour===2?t('El plazo concedido por el Abad ha terminado.','The time granted by the Abbot has ended.'):routine[hour]);
    put('[data-week-event]',event?.text||routine[hour]);put('[data-week-advice]',event?.action||advice[hour]);
    const defaultQuotes = hour===0?[[1,18]]:hour===1||hour===5?[[2,23]]:hour===3?[[2,25]]:hour===6?[[2,13],[2,16]]:[];
    const quotes=event?.q??defaultQuotes, holder=find('[data-week-quotes]');holder.replaceChildren();
    quotes.forEach(([speaker,id])=>{const quote=document.createElement('blockquote');quote.className='week-dialogue';const p=document.createElement('p');p.textContent=window.AbbeyWeekDialogue[en?'en':'es'][id];const cite=document.createElement('cite');cite.textContent=`${names[speaker]} · ${t('frase','phrase')} 0x${id.toString(16).toUpperCase().padStart(2,'0')} · VigasocoSDL`;quote.append(p,cite);holder.append(quote);});
    if(!quotes.length){const p=document.createElement('p');p.className='caption';p.textContent=t('No se asigna una frase exclusiva a este momento.','No exclusive phrase is assigned to this moment.');holder.append(p);}
    renderMap();
  }
  function step(delta) {const i=phases.findIndex(([d,h])=>d===day&&h===hour);const next=phases[i+delta];if(next){[day,hour]=next;render();}}
  find('[data-week-prev]').addEventListener('click',()=>step(-1));find('[data-week-next]').addEventListener('click',()=>step(1));
  window.addEventListener('reportaje:platformchange', renderMap);
  render();
})();
