"""Convert a solver result into a reviewable source record, splitting at floors.

Creates a draft OUTSIDE tools/routes. Fill both notes and source references,
review the trace, then move the record into tools/routes and build-week-routes.py.
"""
from pathlib import Path
import argparse
import json

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('trace',type=Path)
p.add_argument('--day',type=int,required=True)
p.add_argument('--hour',type=int,required=True)
p.add_argument('--character',required=True)
p.add_argument('--from',dest='origin',required=True)
p.add_argument('--to',required=True)
p.add_argument('--output',type=Path,required=True)
a=p.parse_args()
data=json.loads(a.trace.read_text(encoding='utf-8'))
segments=[]
for point in data['worldPoints']:
    floor=0 if point[2]<13 else 1 if point[2]<24 else 2
    if not segments or segments[-1]['floor']!=floor: segments.append({'floor':floor,'worldPoints':[]})
    segments[-1]['worldPoints'].append(point)
record={'day':a.day,'hour':a.hour,'character':a.character,'from':a.origin,'to':a.to,
        'source':[],'conditions':data['conditions'],'dskSha256':data['dskSha256'],
        'solver':{key:data.get(key) for key in ['start','stops','doorMask']},
        'note':{'es':'','en':''},'segments':segments}
assert not a.output.exists(), 'Refusing to overwrite a reviewed record or another draft'
a.output.parent.mkdir(parents=True,exist_ok=True)
a.output.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Wrote draft {a.output}; source references and bilingual notes still require review.')
