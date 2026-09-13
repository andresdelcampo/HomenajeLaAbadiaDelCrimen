// node tools/route-worklist.cjs [day] [character]
// Without filters, write the complete inventory; filters print only that batch.
const fs=require('node:fs'),path=require('node:path');
const {load,site}=require('./week-route-model.cjs');
const model=load(),slots=[];

const exclusion=(code,note)=>({status:'intentionally-unintegrated',classification:code,classificationNote:note});
function classify(row,day,hour) {
  if(row.route)return {status:'reviewed',classification:'reviewed-route',classificationNote:'A source-reviewed route record is present for this phase.'};
  if(day===7&&hour===2)return exclusion('beyond-deadline','Day VII Terce ends the investigation; no character begins a new journey.');
  if(row.id==='guillermo')return exclusion('player-dependent','Guillermo is controlled by the player and has no automatic fixed phase route.');
  if(row.presence==='absent')return exclusion('absent','The character is not present in the abbey during this phase.');
  if(row.presence==='dead')return exclusion('post-death','The character is dead by this phase; disappearance or reset coordinates are not movement.');

  const phase=`${day}-${hour}`;
  switch(row.id) {
    case 'bernardo':
      if(phase==='4-4')return exclusion('reactive-variable-target','Bernardo pursues the manuscript, its holder, or the Abbot, then may wander; no fixed ordered route exists.');
      if(phase==='4-5')return exclusion('variable-start','Vespers overrides Bernardo’s dynamic manuscript pursuit, so his approach to church has no fixed start.');
      if(phase==='5-0')return exclusion('already-at-destination','Night reaffirms the monks’ cell destination established by the reviewed Compline retreat; it does not establish a new walked leg.');
      break;
    case 'adso':
      if(hour===0)return exclusion('dialogue-or-phase-transition','Adso’s night behavior is the sleep question, answer, wait, or phase transition; it is not a fixed walked route.');
      if(hour===5)return exclusion('player-dependent-variable-start','Adso approaches the office by following Guillermo from the player-chosen position; no fixed start is established.');
      return exclusion('player-dependent-following','Outside the reviewed sleep-to-Prime and Compline legs, Adso follows Guillermo and has no independent fixed route.');
    case 'abad':
      return exclusion('reactive-variable-start','This phase can start from an unresolved prior position or divert to William or another monk’s report; no single fixed ordered route is established.');
    case 'malaquias':
      if(hour===0)return exclusion('already-at-destination','Night reaffirms Malachi’s cell destination after the reviewed Compline route; it does not establish a new walked leg.');
      return exclusion('reactive-or-stationary','Malachi guards the library desk and may react to Guillermo; the phase supplies no independent fixed walked leg.');
    case 'berengario':
      if(phase==='2-0')return exclusion('already-at-destination','Night reaffirms the monks’ cell destination after the reviewed Compline route; it does not establish a new walked leg.');
      break;
    case 'severino':
      if(hour===0)return exclusion('already-at-destination','Night reaffirms Severino’s cell destination after the reviewed Compline route; it does not establish a new walked leg.');
      if(hour===3)return exclusion('variable-start','Sext may begin at the cell, corridor, an intermediate loop position, or a player-dependent pursuit position.');
      if(hour===5)return exclusion('variable-start','Vespers may begin at the cell, corridor, an intermediate loop position, or a player-dependent pursuit position.');
      break;
    case 'jorge':
      if(phase==='3-1'||phase==='3-2')return exclusion('placement-dialogue-only','Jorge is placed by the phase script and remains for dialogue; placement and waiting are not walked geometry.');
      break;
  }
  return {status:'needs-source-review',classification:'needs-source-review',classificationNote:'No reviewed route or documented exclusion rule covers this phase.'};
}
for(const [day,hour] of model.phases) {
  const rows=model.cast(day,hour),moves=model.movements(day,hour,rows);
  for(const row of rows) {
    const move=moves.find(m=>m.id===row.id);
    const resolution=classify(row,day,hour);
    slots.push({day,hour,character:row.id,...resolution,
      candidateFrom:move?.from??null,candidateTo:row.to,presence:row.presence??null,
      schematicMovement:!!move&&!row.route,note:row.note});
  }
}
if(process.argv[2])console.log(JSON.stringify(slots.filter(s=>s.day===Number(process.argv[2])&&(!process.argv[3]||s.character===process.argv[3])),null,2));
else {
  const target=path.join(site,'tools/route-worklist.json');
  fs.writeFileSync(target,JSON.stringify(slots,null,2)+'\n');
  console.log(`${slots.length} character/phase slots; ${slots.filter(s=>s.status==='reviewed').length} reviewed routes. Wrote ${target}`);
}
