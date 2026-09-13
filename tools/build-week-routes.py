"""Validate reviewed route records and emit the bilingual explorer's route data.

Run from any directory. No compiler, server, or sibling source checkout required.
See ROUTE_HANDOFF.md before calculating or approving additional routes.
"""
from pathlib import Path
import copy
import json

SITE = Path(__file__).resolve().parents[1]
CHARACTERS = {'guillermo','adso','abad','malaquias','berengario','severino','jorge','bernardo'}
PLACES = {'church','cell','desk','refectory','mirror','abbot','severinus','light','entrance','shared','corridor'}
INTEGRATED_STATUSES = {'integrated','integrated-conditional','integrated-second-leg'}
PHASE_DECISION_STATUSES = {'integrated','integrated-conditional','intentionally-not-integrated'}


def validate(record):
    day, hour, character = record['day'], record['hour'], record['character']
    assert 1 <= day <= 7 and 0 <= hour <= 6, 'Invalid phase'
    assert not (day == 1 and hour < 4 or day == 7 and hour > 2), 'Outside playable week'
    assert character in CHARACTERS
    assert record['from'] in PLACES and record['to'] in PLACES
    assert record['source'] and record['conditions'], 'Source and assumptions are required'
    assert all(record['note'].get(lang) for lang in ('es','en')), 'Both languages required'
    assert record['segments'], 'Empty route'
    for segment in record['segments']:
        floor = segment['floor']
        assert floor in (0,1,2)
        assert len(segment['worldPoints']) >= 2, 'Each segment needs at least two positions'
        for point in segment['worldPoints']:
            assert len(point) == 3 and all(type(v) is int for v in point)
            x,y,h = point
            assert 0 <= x <= 255 and 0 <= y <= 255 and 0 <= h <= 255
            assert floor == (0 if h < 13 else 1 if h < 24 else 2), 'Wrong floor for height'
        for a,b in zip(segment['worldPoints'],segment['worldPoints'][1:]):
            assert abs(a[0]-b[0])+abs(a[1]-b[1]) <= 2, 'Unexplained jump inside floor segment'
    for previous,current in zip(record['segments'],record['segments'][1:]):
        a,b=previous['worldPoints'][-1],current['worldPoints'][0]
        assert abs(a[0]-b[0])+abs(a[1]-b[1]) <= 2, 'Unexplained jump between floor segments'
        assert abs(previous['floor']-current['floor']) <= 1, 'Skipped an entire floor'
    return f'{day}-{hour}:{character}'


def phase_key(phase, character):
    day,hour=map(int,phase.split('-'))
    return day,hour,f'{day}-{hour}:{character}'


def leg_descriptor(record, segment_start=0):
    descriptor={
        'from':record['from'],
        'to':record['to'],
        'segmentStart':segment_start,
        'segmentCount':len(record['segments']),
    }
    if record.get('solver',{}).get('doorMask') is not None:
        descriptor['doorMask']=record['solver']['doorMask']
    return descriptor


def joined_record(first, second):
    assert first['character'] == second['character'], 'Joined legs use different characters'
    assert first['segments'][-1]['worldPoints'][-1] == second['segments'][0]['worldPoints'][0], 'Joined legs do not meet'
    joined=copy.deepcopy(first)
    joined['to']=second['to']
    joined['source']+=second['source']
    joined['conditions']+=' Second leg: '+second['conditions']
    joined['note']={lang:first['note'][lang]+' '+second['note'][lang] for lang in ('es','en')}
    joined['segments']+=copy.deepcopy(second['segments'])
    joined['legs']=copy.deepcopy(first.get('legs',[leg_descriptor(first)]))
    joined['legs'].append(leg_descriptor(second,len(first['segments'])))
    joined['integrationStatus']=second['integrationStatus']
    if second.get('routeGroup'):
        joined['routeGroup']=second['routeGroup']
    if first.get('conditional') or second.get('conditional'):
        joined['conditional']=True
    return joined


def sliced_segments(record, start_point, end_point):
    points=[]
    for segment in record['segments']:
        points.extend((segment['floor'],point) for point in segment['worldPoints'])
    start=next((i for i,(_,point) in enumerate(points) if point==start_point),None)
    assert start is not None, f'Phase-slice start not found: {start_point}'
    end=next((i for i,(_,point) in enumerate(points[start:],start) if point==end_point),None)
    assert end is not None and end > start, f'Phase-slice end not found after start: {end_point}'
    sliced=[]
    for floor,point in points[start:end+1]:
        if not sliced or sliced[-1]['floor'] != floor:
            sliced.append({'floor':floor,'worldPoints':[]})
        sliced[-1]['worldPoints'].append(point)
    assert all(len(segment['worldPoints']) >= 2 for segment in sliced), 'Phase slice created a one-point floor segment'
    return sliced


def expanded_extracts(extract):
    slices=extract.get('phaseSlices')
    if not slices:
        for phase in extract['appliesTo']:
            decision=extract.get('phaseDecisions',{}).get(phase)
            if decision:
                assert decision['integrationStatus'] in PHASE_DECISION_STATUSES, f'Invalid phase decision: {phase}'
                if decision['integrationStatus']=='intentionally-not-integrated':
                    assert decision.get('reason'), f'Excluded phase needs a reason: {phase}'
                    continue
            expanded=copy.deepcopy(extract)
            day,hour,_=phase_key(phase,extract['character'])
            expanded['day'],expanded['hour']=day,hour
            if decision:
                expanded['integrationStatus']=decision['integrationStatus']
                for field in ('conditions','note','from','to','conditional'):
                    if field in decision:
                        expanded[field]=copy.deepcopy(decision[field])
                if 'solver' in decision:
                    expanded.setdefault('solver',{}).update(copy.deepcopy(decision['solver']))
                if decision['integrationStatus']=='integrated-conditional':
                    expanded['conditional']=True
                expanded['phaseDecision']=copy.deepcopy(decision)
            yield phase,expanded
        return
    assert [item['phase'] for item in slices] == extract['appliesTo'], 'Phase slices must cover appliesTo in order'
    for item in slices:
        expanded=copy.deepcopy(extract)
        day,hour,_=phase_key(item['phase'],extract['character'])
        expanded['day'],expanded['hour']=day,hour
        expanded['from'],expanded['to']=item['from'],item['to']
        expanded['segments']=sliced_segments(extract,item['startPoint'],item['endPoint'])
        for field in ('conditions','note','conditional'):
            if field in item:
                expanded[field]=copy.deepcopy(item[field])
        expanded['phaseSlice']={key:copy.deepcopy(value) for key,value in item.items() if key not in ('conditions','note')}
        yield item['phase'],expanded


def build():
    records = {}
    grouped = {}
    for path in sorted((SITE/'tools/routes').glob('*.json')):
        record = json.loads(path.read_text(encoding='utf-8'))
        key = validate(record)
        assert key not in records, f'Duplicate route: {key}'
        records[key] = record
    for path in sorted((SITE/'tools/route-extracts').glob('*.json')):
        extract=json.loads(path.read_text(encoding='utf-8'))
        validate(extract)
        decisions=extract.get('phaseDecisions')
        if decisions:
            assert list(decisions)==extract['appliesTo'], f'Phase decisions must cover appliesTo in order: {path.name}'
        if extract.get('integrationStatus') not in INTEGRATED_STATUSES:
            if extract.get('integrationStatus')=='intentionally-not-integrated':
                assert extract.get('integrationReason'), f'Excluded extract needs a reason: {path.name}'
            continue
        applies_to=extract.get('appliesTo',[])
        assert applies_to, f'Integrated extract has no applicability: {path.name}'
        if extract['integrationStatus']=='integrated-second-leg':
            assert len(applies_to)==1 and extract.get('joinTo'), f'Joined extract needs one phase and joinTo: {path.name}'
            day,hour,key=phase_key(applies_to[0],extract['character'])
            assert key==extract['joinTo'] and key in records, f'Invalid joined route target: {path.name}'
            records[key]=joined_record(records[key],extract)
            validate(records[key])
            continue
        for phase,expanded in expanded_extracts(extract):
            day,hour,key=phase_key(phase,extract['character'])
            validate(expanded)
            if extract.get('routeGroup'):
                grouped.setdefault((key,extract['routeGroup']),[]).append(expanded)
            else:
                assert key not in records, f'Duplicate route: {key}'
                records[key]=expanded
    for (key,route_group),legs in grouped.items():
        legs.sort(key=lambda item:item['leg'])
        assert [item['leg'] for item in legs] == list(range(1,len(legs)+1)), f'Incomplete route group: {route_group} at {key}'
        assert key not in records, f'Duplicate route: {key}'
        record=legs[0]
        for leg in legs[1:]:
            record=joined_record(record,leg)
        validate(record)
        records[key]=record
    target = SITE/'assets/game/week-routes.js'
    target.write_text('/* Generated by tools/build-week-routes.py; edit source records, not this file. */\n'
                      +'window.WEEK_ROUTES = '+json.dumps(records,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    print(f'Built {len(records)} reviewed routes (installed records plus integrated extracts): {target}')


if __name__ == '__main__':
    build()
