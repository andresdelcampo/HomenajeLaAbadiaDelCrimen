"""Small source index for a fresh route-analysis context; no route inference."""
from pathlib import Path
import hashlib
import json
import re

SITE=Path(__file__).resolve().parents[1]
CORE=SITE.parent/'Fuentes/VigasocoSDL-master/VigasocoSDL-master/core/abadia'
names=['Abad','Malaquias','Berengario','Severino','Jorge','Bernardo','Adso','Guillermo']
result={'sourceRoot':str(CORE),'characters':{},'sourceHashes':{}}
for name in names:
 p=CORE/(name+'.cpp'); s=p.read_text(encoding='utf-8')
 table=re.search(r'PosicionJuego '+name+r'::posicionesPredef.*?=\s*\{(.*?)\};',s,re.S)
 entries=[]
 if table:
  for m in re.finditer(r'PosicionJuego\(([^)]+)\)([^\n]*)',table.group(1)):
   values=[v.strip() for v in m.group(1).split(',')]
   entries.append({'index':len(entries),'orientation':values[0],'x':int(values[1],0),'y':int(values[2],0),'height':int(values[3],0),'comment':m.group(2).strip(', \t/')})
 result['characters'][name]={'file':p.name,'destinations':entries,'doorMaskAssignments':re.findall(r'mascarasPuertasBusqueda\s*=\s*([^;]+);',s)}
for name in [n+'.cpp' for n in names]+['Logica.cpp','AccionesDia.cpp','BuscadorRutas.cpp','RejillaPantalla.cpp','FijarOrientacion.cpp','PersonajeConIA.cpp','MotorGrafico.cpp']:
 result['sourceHashes'][name]=hashlib.sha256((CORE/name).read_bytes()).hexdigest()
(SITE/'tools/route-source-index.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Wrote tools/route-source-index.json; destination tables are an index, not a chronological itinerary.')
