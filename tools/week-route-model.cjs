// Load only the pure chronology/route model; no browser or DOM mutation.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const site=path.resolve(__dirname,'..');
function load({language='en',routes,source}={}) {
  const context={document:{querySelector:()=>({}),documentElement:{lang:language}},window:{}};
  for(const file of ['abbot-welcome-route.js','week-routes.js']) vm.runInNewContext(fs.readFileSync(path.join(site,'assets/game',file),'utf8'),context);
  if(routes!==undefined)context.window.WEEK_ROUTES=routes;
  const script=source??fs.readFileSync(path.join(site,'week.js'),'utf8');
  const boundary=script.indexOf('  let mapMovements');
  if(boundary<0)throw Error('week.js model boundary changed; update this helper');
  vm.runInNewContext(script.slice(0,boundary)+'this.model={cast,movements,phases,routeMapMode,markerPosition};})();',context);
  return context.model;
}
module.exports={load,site};
