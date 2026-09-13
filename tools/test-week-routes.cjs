const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {load,site}=require('./week-route-model.cjs');
const plain=load({routes:{}}),current=load(),spanish=load({language:'es'});
const comparable=value=>JSON.parse(JSON.stringify(value));
const catalogContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(site,'assets/game/week-routes.js'),'utf8'),catalogContext);
const mapContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(site,'assets/game/abbot-welcome-route.js'),'utf8'),mapContext);
const panels=mapContext.window.ABBOT_WELCOME_ROUTE.panels;
const geometryPanels=mapContext.window.ABBOT_WELCOME_ROUTE.geometryPanels;
assert.deepEqual(comparable(panels[0]),{scale:3.65,ox:666,oy:73});
assert.notDeepEqual(comparable(geometryPanels[0]),comparable(panels[0]));
let upperPoints=0;
for(const [day,hour] of current.phases)for(const row of current.cast(day,hour)) {
  if(!row.route)continue;
  row.route.segments.forEach((segment,index)=>{
    if(!segment.floor)return;
    const [a,b,c,d,e,f]=panels[segment.floor].matrix;
    segment.worldPoints.forEach(([x,y],i)=>{
      const plotted=row.pathSegments[index][i];
      assert.ok(Math.abs(plotted.x*1323/100-(a*x+c*y+e))<1e-8,'Registered path X');
      assert.ok(Math.abs(plotted.y*982/100-(b*x+d*y+f))<1e-8,'Registered path Y');
      upperPoints++;
    });
  });
}
assert.ok(upperPoints>0,'No upper-floor points checked');
current.setMapMode('geometry');
let changedUpperPoints=0, changedGroundPoints=0;
for(const [day,hour] of current.phases)for(const row of current.cast(day,hour)) {
  if(!row.route)continue;
  row.route.segments.forEach((segment,index)=>{
    const panel=geometryPanels[segment.floor];
    const matrix=panel.matrix;
    segment.worldPoints.forEach(([x,y],i)=>{
      const plotted=row.pathSegments[index][i];
      const expected=matrix
        ? {x:(matrix[0]*x+matrix[2]*y+matrix[4])*100/1323,y:(matrix[1]*x+matrix[3]*y+matrix[5])*100/982}
        : {x:(panel.ox-panel.scale*y)*100/1323,y:(panel.oy+panel.scale*x)*100/982};
      assert.ok(Math.abs(plotted.x-expected.x)<1e-8,'Selected generated-map path X');
      assert.ok(Math.abs(plotted.y-expected.y)<1e-8,'Selected generated-map path Y');
      if(segment.floor)changedUpperPoints++;
      else changedGroundPoints++;
    });
  });
}
assert.ok(changedUpperPoints>0 && changedGroundPoints>0,'Both upper and ground generated-map paths checked');
const printUpper=load().cast(6,0).find(row=>row.route?.segments.some(segment=>segment.floor));
const geometryUpper=current.cast(6,0).find(row=>row.id===printUpper.id);
assert.notDeepEqual(comparable(geometryUpper.pathSegments),comparable(printUpper.pathSegments),'Upper-floor routes change with the selected map');
current.setMapMode('print');
const preservedEntries=Object.entries(catalogContext.window.WEEK_ROUTES)
  .filter(([key])=>/(abad|malaquias|berengario|severino)$/.test(key)).sort(([a],[b])=>a.localeCompare(b));
assert.equal(preservedEntries.length,69,'Existing Abbot, Malachi, Berengario, and Severino route counts changed');
assert.equal(crypto.createHash('sha256').update(JSON.stringify(preservedEntries)).digest('hex'),'f98bd1a329f1be650c3662054c6790bf31b19ea64783fb795e1cd2e82f5fa50f','Existing generated Abbot, Malachi, Berengario, or Severino routes changed');
const catalogEntries=Object.entries(catalogContext.window.WEEK_ROUTES).sort(([a],[b])=>a.localeCompare(b));
assert.equal(catalogEntries.length,95,'The complete reviewed route catalog count changed');
assert.equal(crypto.createHash('sha256').update(JSON.stringify(catalogEntries)).digest('hex'),'52d86355415c3693de86dc4e16411216932b766a7f60361304ba48a4abf1f38f','The complete reviewed route catalog changed');
let untouched=0;
for(const [d,h] of current.phases) {
  if(current.cast(d,h).some(row=>row.route))continue;
  assert.deepEqual(comparable(current.cast(d,h)),comparable(plain.cast(d,h)));
  untouched++;
}
const welcome=current.movements(1,4,current.cast(1,4)).find(m=>m.id==='abad');
assert.equal(welcome.segments.length,2,'Day I None keeps welcome and post-welcome as distinct legs');
assert.equal(welcome.segments[0].length,201,'Installed welcome route must not be truncated');
assert.equal(welcome.segments[1].length,109,'Reviewed post-welcome continuation is the second leg');
assert.equal(welcome.path.length,310);
assert.deepEqual(welcome.segments[0].at(-1),welcome.segments[1][0],'Welcome legs meet at William’s cell door');
assert.deepEqual(welcome.origin,welcome.path[0]);
assert.deepEqual(welcome.destination,welcome.path.at(-1));
for(let day=2;day<=7;day++) {
  const prima=current.movements(day,1,current.cast(day,1)).find(m=>m.id==='abad');
  assert.equal(prima.path.length,64,`Day ${day} Prima Abbot route`);
  assert.deepEqual(prima.origin,prima.path[0]);
  assert.deepEqual(prima.destination,prima.path.at(-1));
  assert.equal(prima.from,'abbot');
  assert.equal(prima.to,'church');
}
for(let day=1;day<=6;day++) {
  const compline=current.movements(day,6,current.cast(day,6)).find(m=>m.id==='abad');
  assert.equal(compline.segments.length,2,`Day ${day} Compline preserves its ordered stop`);
  assert.deepEqual(compline.segments[0].at(-1),compline.segments[1][0]);
  assert.equal(compline.from,'church'); assert.equal(compline.to,'corridor');
  const night=current.movements(day+1,0,current.cast(day+1,0)).find(m=>m.id==='abad');
  assert.equal(night.from,'corridor'); assert.equal(night.to,'abbot');
}
for(const [day,hour] of [[3,2],[3,3],[5,4],[5,5]]) {
  assert.equal(current.cast(day,hour).find(r=>r.id==='abad').route.conditional,true,`Day ${day} hour ${hour} stays conditional`);
}
const route=(day,hour,id)=>current.cast(day,hour).find(row=>row.id===id).route;
const movement=(day,hour,id)=>current.movements(day,hour,current.cast(day,hour)).find(item=>item.id===id);
const lastWorld=record=>record.segments.at(-1).worldPoints.at(-1);
const fixedGroundPosition=(x,y)=>({x:100*(panels[0].ox-panels[0].scale*y)/1323,y:100*(panels[0].oy+panels[0].scale*x)/982,dx:0,dy:0});
for(const [id,place,x,y] of [
  ['abad','refectory',61,55],['adso','refectory',52,57],['malaquias','refectory',47,55],
  ['berengario','refectory',50,53],['severino','refectory',54,53],['bernardo','refectory',50,53],
  ['malaquias','shared',188,24],['berengario','shared',188,21],['jorge','shared',188,21],['bernardo','shared',188,21]
]) {
  assert.deepEqual(comparable(current.markerPosition(id,place,current.cast(4,3))),fixedGroundPosition(x,y),`${id} keeps the exact ${place} position`);
}
assert.deepEqual(comparable(current.markerPosition('malaquias','shared',current.cast(2,6))),comparable(current.markerPosition('malaquias','shared',current.cast(3,0))),'A stationary night position must not shift between phases');

assert.match(route(1,5,'abad').note.en,/shares geometry/,'The preserved route record retains its technical provenance');
for(const day of [2,3,4,5,6,7]) {
  assert.match(route(day,0,'abad').note.en,/reduced door mask/,'The preserved route record retains its technical provenance');
  assert.equal(current.cast(day,0).find(row=>row.id==='abad').note,'The Abbot goes to his cell.',`Day ${day} Night uses the concise display note`);
}
assert.equal(current.cast(1,5).find(row=>row.id==='abad').note,'Heads to the altar for Vespers.','Day I Vespers uses the hour-specific display note');
assert.equal(current.cast(2,6).find(row=>row.id==='berengario').note,'Retires from the church to the shared cell.','Berengar Compline describes only this hour');
assert.equal(spanish.cast(2,6).find(row=>row.id==='berengario').note,'Se retira desde la iglesia hasta la celda común.','Spanish Berengar Compline describes only this hour');
for(const [day,hour] of [[2,2],[2,4],[3,4],[4,2],[4,4],[5,2],[6,2],[6,4]]) {
  const abbot=current.cast(day,hour).find(row=>row.id==='abad');
  assert.equal(abbot.to,null);
  assert.doesNotMatch(abbot.note,/follows this route/i,`Day ${day} hour ${hour} must not claim a fixed route`);
}
for(const [day,hour] of current.phases)for(const row of current.cast(day,hour))if(row.route) {
  assert.notEqual(row.note,row.route.note.en,`${day}-${hour}:${row.id} keeps technical route prose out of the visible note`);
  assert.ok(!row.note.includes(row.route.note.en),`${day}-${hour}:${row.id} must not append cross-phase route caveats`);
  const spanishRow=spanish.cast(day,hour).find(item=>item.id===row.id);
  assert.ok(!spanishRow.note.includes(spanishRow.route.note.es),`${day}-${hour}:${row.id} Spanish note must stay phase-specific`);
}

assert.equal(catalogEntries.filter(([key])=>key.endsWith(':guillermo')).length,0,'Player-controlled Guillermo must not acquire catalog geometry');
for(const [day,hour] of current.phases) {
  const englishRow=current.cast(day,hour).find(row=>row.id==='guillermo');
  const spanishRow=spanish.cast(day,hour).find(row=>row.id==='guillermo');
  assert.equal(englishRow.route,undefined,`Guillermo ${day}-${hour} must remain without a reviewed route`);
  assert.equal(englishRow.from,null); assert.equal(englishRow.to,null);
  assert.equal(spanishRow.from,null); assert.equal(spanishRow.to,null);
  assert.equal(movement(day,hour,'guillermo'),undefined,`Guillermo ${day}-${hour} must retain the no-route presentation`);
  if(day===7&&hour===2) {
    assert.equal(englishRow.note,'The investigation is over; the characters no longer begin new journeys.');
    assert.equal(spanishRow.note,'La investigación ha terminado; los personajes ya no emprenden nuevos recorridos.');
  } else {
    assert.equal(englishRow.note,'Player controlled; no fixed position.');
    assert.equal(spanishRow.note,'Su posición depende del jugador.');
  }
}
const worklist=JSON.parse(fs.readFileSync(path.join(site,'tools/route-worklist.json'),'utf8'));
const guillermoSlots=worklist.filter(slot=>slot.character==='guillermo');
assert.equal(guillermoSlots.length,41,'Guillermo must retain all 41 valid explorer slots');
assert.ok(guillermoSlots.every(slot=>slot.status==='intentionally-unintegrated'&&slot.candidateFrom===null&&slot.candidateTo===null&&!slot.schematicMovement),'Every Guillermo slot must be explicitly resolved without route or schematic geometry');
const reviewedSlots=worklist.filter(slot=>slot.status==='reviewed');
const excludedSlots=worklist.filter(slot=>slot.status==='intentionally-unintegrated');
assert.equal(reviewedSlots.length,95,'The worklist must retain exactly the 95 reviewed catalog phases');
assert.equal(excludedSlots.length,233,'All 41 Guillermo and 192 audited non-Guillermo exclusions must remain resolved');
assert.equal(worklist.filter(slot=>slot.status==='needs-source-review').length,0,'Resolved exclusions must not silently return to needs-source-review');
assert.ok(worklist.every(slot=>slot.classification&&slot.classificationNote),'Every worklist slot needs an auditable classification and explanation');
const excludedByCharacter=Object.fromEntries(['guillermo','adso','abad','malaquias','berengario','severino','jorge','bernardo'].map(id=>[id,excludedSlots.filter(slot=>slot.character===id).length]));
assert.deepEqual(excludedByCharacter,{guillermo:41,adso:29,abad:17,malaquias:22,berengario:31,severino:25,jorge:31,bernardo:37},'Character closeout counts changed');
assert.equal(worklist.find(slot=>slot.character==='bernardo'&&slot.day===4&&slot.hour===4).classification,'reactive-variable-target');
assert.equal(worklist.find(slot=>slot.character==='bernardo'&&slot.day===4&&slot.hour===5).classification,'variable-start');
assert.equal(worklist.find(slot=>slot.character==='bernardo'&&slot.day===5&&slot.hour===0).classification,'already-at-destination');
assert.ok(worklist.filter(slot=>slot.day===7&&slot.hour===2&&slot.status!=='reviewed').every(slot=>slot.classification==='beyond-deadline'),'The deadline must take precedence over absence or death labels');

for(const day of [2,3,4,5]) {
  assert.ok(route(day,1,'malaquias'),`Day ${day} Prime expands the shared Malachi extract`);
}
for(const day of [2,3,4]) {
  assert.ok(route(day,2,'malaquias'),`Day ${day} Terce expands the shared Malachi extract`);
}
for(const day of [1,2,3,4]) {
  assert.ok(route(day,6,'malaquias'),`Day ${day} Compline expands the shared Malachi extract`);
}
for(const day of [1,2,3,4,5]) {
  const raw=route(day,5,'malaquias'),walk=movement(day,5,'malaquias');
  assert.equal(raw.conditional,true,`Day ${day} Malachi Vespers remains player-conditional`);
  assert.equal(walk.segments.length,3,`Day ${day} Malachi Vespers joins both ordered legs`);
  assert.deepEqual(walk.segments[1].at(-1),walk.segments[2][0],`Day ${day} Malachi Vespers legs meet`);
  assert.deepEqual(comparable(raw.legs.map(leg=>leg.doorMask)),[0x2f,0x1f],`Day ${day} Malachi Vespers preserves its door-mask change`);
}
assert.equal(route(1,4,'malaquias').conditional,true,'Malachi opening route remains player-divertible');
const malachiTerce=route(5,2,'malaquias'),malachiSext=route(5,3,'malaquias');
assert.equal(malachiTerce.to,'severinus'); assert.deepEqual(comparable(lastWorld(malachiTerce)),[104,82,2]);
assert.equal(malachiSext.from,'severinus'); assert.deepEqual(comparable(malachiSext.segments[0].worldPoints[0]),[104,82,2]);
assert.equal(malachiSext.to,'desk'); assert.deepEqual(comparable(lastWorld(malachiSext)),[55,56,15]);
assert.equal(malachiTerce.conditional,true); assert.equal(malachiSext.conditional,true);
assert.equal(route(5,6,'malaquias'),undefined,'Malachi death creates no later walked route');

const berengarioPhases=[[1,4],[1,5],[1,6],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[3,0]];
for(const [day,hour] of berengarioPhases) {
  assert.equal(route(day,hour,'berengario').conditional,true,`Day ${day} hour ${hour} Berengario route retains its condition`);
}
assert.match(route(2,5,'berengario').conditions,/once that condition clears/i,'Day II Vespers records the normal end of the guard wait');
const berengarioNight=route(3,0,'berengario');
assert.deepEqual(comparable(berengarioNight.segments.map(segment=>segment.floor)),[0,1,0],'Night III preserves ordered floor changes');
assert.deepEqual(comparable(lastWorld(berengarioNight)),[104,87,2],'Night III ends at Severinus cell');
assert.ok(berengarioNight.segments.every(segment=>segment.worldPoints.every(point=>point.some(value=>value!==0))),'Death coordinate reset is not drawn');
assert.equal(route(3,1,'berengario'),undefined,'Berengario death creates no later walked route');

const severinoPhases=[[1,4],[1,6],[2,1],[2,2],[2,4],[2,6],[3,1],[3,2],[3,4],[3,6],[4,1],[4,2],[4,4],[4,6],[5,1],[5,2]];
assert.deepEqual(Object.keys(catalogContext.window.WEEK_ROUTES).filter(key=>key.endsWith(':severino')).sort(),severinoPhases.map(([day,hour])=>`${day}-${hour}:severino`).sort(),'Every and only reviewed Severino phase must expand');
for(const [day,hour] of severinoPhases) {
  const raw=route(day,hour,'severino'),walk=movement(day,hour,'severino');
  assert.ok(raw && walk.explicit && walk.path && walk.segments,`Day ${day} hour ${hour} Severino route expands`);
  assert.deepEqual(comparable(raw.segments.map(segment=>segment.floor)),[0],`Day ${day} hour ${hour} retains its ordered ground-floor leg`);
  assert.deepEqual(comparable(raw.segments[0].worldPoints[0]),comparable(raw.solver.start.slice(1)),`Day ${day} hour ${hour} start changed`);
  assert.deepEqual(comparable(raw.segments.at(-1).worldPoints.at(-1).slice(0,2)),comparable(raw.solver.stops.at(-1).slice(1,3)),`Day ${day} hour ${hour} endpoint changed`);
  assert.ok(raw.segments.every(segment=>segment.worldPoints.every(point=>point.some(value=>value!==0))),`Day ${day} hour ${hour} contains a coordinate reset`);
}
assert.equal(route(5,1,'severino').conditional,true,'Day-V Prime remains conditional on the non-pursuit branch');
assert.match(route(5,1,'severino').conditions,/left wing|state bit 0/i);
assert.equal(route(5,2,'severino').conditional,true,'Day-V Terce remains conditional on Prime ending at church');
assert.match(route(5,2,'severino').conditions,/ends at the cell|route ends at the cell/i);
assert.match(route(4,2,'severino').conditions,/pursuit|changing position/i,'Day-IV Terce records the omitted dynamic continuation');
assert.equal(route(4,2,'severino').to,'severinus','Day-IV Terce must end before pursuing Guillermo');
for(const [day,hour] of [[2,3],[3,3],[4,3],[1,5],[2,5],[3,5],[4,5]]) {
  assert.equal(route(day,hour,'severino'),undefined,`Day ${day} hour ${hour} keeps its variable-start Sext/Vespers route intentionally unintegrated`);
  const fallback=movement(day,hour,'severino');
  assert.ok(fallback && !fallback.explicit && !fallback.path && !fallback.segments,`Day ${day} hour ${hour} retains schematic fallback`);
}
for(const day of [2,3,4]) {
  const none=route(day,4,'severino');
  assert.equal(none.from,'refectory'); assert.equal(none.to,'severinus');
  assert.equal(none.segments.length,1,`Day ${day} None includes only the fixed opening, not an arbitrary loop`);
}
for(const day of [1,2,3,4]) {
  const compline=route(day,6,'severino');
  assert.equal(compline.solver.doorMask,0x0f,`Day ${day} Compline keeps the combined night mask`);
  if(day>1)assert.deepEqual(comparable(compline.segments),comparable(route(day,2,'severino').segments),'Night-mask route may match positions but remains a distinct source record');
}
assert.equal(route(2,2,'severino').solver.doorMask,0x2f,'Daytime church-to-cell route keeps the daytime mask');
for(const [day,hour] of current.phases.filter(([day,hour])=>day>5 || day===5&&hour>=3)) {
  assert.equal(route(day,hour,'severino'),undefined,`No post-death Severino route at ${day}-${hour}`);
}

const adsoKeys=Object.keys(catalogContext.window.WEEK_ROUTES).filter(key=>key.endsWith(':adso')).sort();
assert.deepEqual(adsoKeys,[...[1,2,3,4,5,6].map(day=>`${day}-6:adso`),...[2,3,4,5,6,7].map(day=>`${day}-1:adso`)].sort(),'Every and only resolved Adso phase must expand');
for(const day of [1,2,3,4,5,6]) {
  const raw=route(day,6,'adso');
  assert.equal(raw.solver.doorMask,0x1c); assert.deepEqual(comparable(lastWorld(raw)),[168,24,2]);
  assert.equal(raw.conditional,day===5?true:undefined,`Day ${day} Compline condition boundary changed`);
}
for(const day of [2,3,4,5,6,7]) {
  const raw=route(day,1,'adso');
  assert.equal(raw.conditional,true); assert.equal(raw.solver.doorMask,0x2c);
  assert.match(raw.conditions,/sleep transition/i); assert.deepEqual(comparable(raw.segments[0].worldPoints[0]),[168,24,2]);
}
assert.equal(route(2,4,'adso'),undefined,'Ordinary William-following must not become an explicit route');

assert.ok(route(3,3,'jorge'),'Jorge Day-III Sext fixed walk must expand');
assert.deepEqual(comparable(route(3,3,'jorge').segments[0].worldPoints[0]),[200,36,0]);
assert.deepEqual(comparable(lastWorld(route(3,3,'jorge'))),[188,21,2]);
for(const [day,hour] of [[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6],[7,0],[7,1]]) {
  const raw=route(day,hour,'jorge');
  assert.equal(raw.conditional,true,`Jorge escape at ${day}-${hour} remains encounter-conditional`);
  assert.equal(raw.solver.doorMask,[[6,0],[6,6],[7,0]].some(([d,h])=>d===day&&h===hour)?0x1f:0x2f,`Jorge escape mask at ${day}-${hour}`);
  assert.deepEqual(comparable(raw.segments.map(segment=>segment.floor)),[2]);
  assert.ok(raw.segments.every(segment=>segment.worldPoints.every(point=>point.some(value=>value!==0))),'Jorge placement/death/reset must not be drawn');
}
assert.equal(route(7,2,'jorge'),undefined,'Day VII Terce deadline excludes Jorge escape');

assert.deepEqual(Object.keys(catalogContext.window.WEEK_ROUTES).filter(key=>key.endsWith(':bernardo')).sort(),['4-3:bernardo','4-6:bernardo','5-1:bernardo','5-2:bernardo']);
assert.equal(route(4,3,'bernardo').conditional,undefined); assert.deepEqual(comparable(lastWorld(route(4,3,'bernardo'))),[50,53,2]);
assert.equal(route(4,6,'bernardo').conditional,undefined); assert.equal(route(4,6,'bernardo').solver.doorMask,0x1f);
assert.equal(route(5,1,'bernardo').conditional,true); assert.equal(route(5,1,'bernardo').solver.doorMask,0x2f);
assert.equal(route(5,2,'bernardo').conditional,undefined); assert.deepEqual(comparable(lastWorld(route(5,2,'bernardo'))),[136,168,0]);
for(const [day,hour] of [[4,4],[4,5]]) {
  assert.equal(route(day,hour,'bernardo'),undefined,`Bernardo ${day}-${hour} remains intentionally unintegrated`);
  const fallback=movement(day,hour,'bernardo');
  if(fallback)assert.ok(!fallback.explicit&&!fallback.path&&!fallback.segments,'Bernardo pursuit/wandering fallback must remain schematic');
}
for(const id of ['adso','jorge','bernardo'])for(const key of Object.keys(catalogContext.window.WEEK_ROUTES).filter(key=>key.endsWith(`:${id}`))) {
  const raw=catalogContext.window.WEEK_ROUTES[key];
  assert.ok(raw.segments.every(segment=>segment.worldPoints.every(point=>point.some(value=>value!==0))),`${key} must not contain a zero-coordinate reset`);
  assert.deepEqual(comparable(raw.segments[0].worldPoints[0]),comparable(raw.solver.start.slice(1)),`${key} start changed`);
  assert.deepEqual(comparable(raw.segments.at(-1).worldPoints.at(-1).slice(0,2)),comparable(raw.solver.stops.at(-1).slice(1,3)),`${key} endpoint changed`);
}
// Synthetic geometry checks plumbing only: never publish this as a game route.
const record={from:'desk',to:'desk',note:{es:'Prueba de tramos.',en:'Segment fixture.'},segments:[
  {floor:1,worldPoints:[[55,56,15],[56,56,15]]},
  {floor:2,worldPoints:[[55,56,26],[56,56,26]]}
]};
const injected=load({routes:{'2-4:malaquias':record,'4-4:berengario':record,'7-2:abad':record}});
const rows=injected.cast(2,4),journey=injected.movements(2,4,rows).find(m=>m.id==='malaquias');
assert.equal(journey.segments.length,2);
assert.equal(journey.path.length,4);
assert.equal(injected.routeMapMode(rows),'print');
assert.equal(injected.routeMapMode(injected.cast(2,3)),'print','Map choice must not depend on phase route coverage');
assert.equal(journey.from,journey.to,'Same-room excursion must still be drawn');
assert.deepEqual(journey.destination,journey.path.at(-1));
assert.notEqual(journey.segments[0][0].y,journey.segments[1][0].y,'Storeys use different panels');
assert.equal(injected.cast(4,4).find(r=>r.id==='berengario').route,undefined,'Dead characters cannot acquire routes');
assert.equal(injected.cast(7,2).find(r=>r.id==='abad').route,undefined,'Deadline cannot acquire routes');
assert.equal(load({language:'es',routes:{'2-4:malaquias':record}}).cast(2,4).find(r=>r.id==='malaquias').note,'Vigila el acceso a la biblioteca desde su mesa del scriptorium.');
// Exercise the actual SVG drawing function: never join different storeys.
const node=()=>({dataset:{},style:{},attributes:{},children:[],setAttribute(k,v){this.attributes[k]=v;},append(child){this.children.push(child);},replaceChildren(){this.children=[];}});
const svg=node(),lines=node(),origins=node(),map={clientWidth:1323,clientHeight:982,querySelector:()=>svg};
const source=fs.readFileSync(path.join(site,'week.js'),'utf8');
const draw=source.slice(source.indexOf('  function drawMovements()'),source.indexOf('  function render()'));
const drawContext={mapMovements:[journey],selected:0,ids:['malaquias'],names:['Malachi'],places:{desk:[0,0,'Desk']},
  find:selector=>({'.week-map':map,'[data-week-routes]':lines,'[data-week-origins]':origins,'.week-spoilers':{open:true}}[selector]),
  document:{createElementNS:node,createElement:node}};
vm.runInNewContext(draw+'drawMovements();',drawContext);
assert.equal(lines.children.length,2,'One separate SVG path per floor segment');
assert.equal(origins.children.length,1,'One journey origin, not one per storey');
for(const line of lines.children)assert.equal((line.attributes.d.match(/M/g)||[]).length,1);
console.log(`PASS: ${untouched} all-character fallback phases, 95 reviewed slots, 41 intentionally unintegrated Guillermo slots, 192 classified non-Guillermo exclusions, zero pending reviews, conditional boundaries, deliberate fallbacks, masks, ordered legs, death boundaries, generic phase decisions, presence, deadline, and bilingual notes.`);
