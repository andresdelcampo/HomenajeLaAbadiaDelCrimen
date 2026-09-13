"""Reject route-data mistakes before they become convincing-looking paths."""
from pathlib import Path
import copy
import hashlib
import importlib.util
import json

path=Path(__file__).with_name('build-week-routes.py')
spec=importlib.util.spec_from_file_location('route_builder',path)
builder=importlib.util.module_from_spec(spec); spec.loader.exec_module(builder)
record=json.loads(path.with_name('routes').joinpath('1-4-abad.json').read_text(encoding='utf-8'))
assert builder.validate(record)=='1-4:abad'
reviewed=list(path.with_name('routes').glob('*.json'))
extracts=list(path.with_name('route-extracts').glob('*.json'))

def source_hash(paths):
    digest=hashlib.sha256()
    for candidate in sorted(paths):
        digest.update(candidate.name.encode('utf-8'))
        digest.update(b'\0')
        digest.update(candidate.read_bytes())
        digest.update(b'\0')
    return digest.hexdigest()

assert source_hash(reviewed)=='a32fea78377f9adfd9365226b231a3ac2553cc8bc02afe4de4b1b38845e20ece', 'Installed Abbot records changed'
preserved_extracts=[p for p in extracts if p.name.startswith(('abad-','malaquias-','berengario-','severino-'))]
assert source_hash(preserved_extracts)=='ae891f19e244ecb19ecd8d78b0a07fd1807a91959317c46ea565bfdefbc2a808', 'Previously reviewed extracts changed'
integrated_paths=[p for p in extracts if json.loads(p.read_text(encoding='utf-8')).get('integrationStatus') in builder.INTEGRATED_STATUSES]
assert len(integrated_paths)==36, 'The complete reviewed extract set changed'
assert source_hash(integrated_paths)=='50a010ace9059c09b263175620c8964a1fc3e4deeba392e13ec059fc09e680ce', 'Integrated Abbot, Malachi, Berengario, Severino, Adso, Jorge, or Bernardo extracts changed'
for candidate in reviewed+extracts:
    data=json.loads(candidate.read_text(encoding='utf-8'))
    builder.validate(data)
    if candidate.parent.name=='route-extracts':
        assert data.get('appliesTo'), f'Missing applicability: {candidate.name}'
        for phase in data['appliesTo']:
            day,hour=map(int,phase.split('-'))
            assert 1 <= day <= 7 and 0 <= hour <= 6
        if data.get('phaseDecisions'):
            assert list(data['phaseDecisions'])==data['appliesTo'], f'Phase decisions do not cover candidates: {candidate.name}'
            for phase,decision in data['phaseDecisions'].items():
                assert decision['integrationStatus'] in builder.PHASE_DECISION_STATUSES
                if decision['integrationStatus']=='intentionally-not-integrated':
                    assert decision.get('reason'), f'Excluded phase lacks a reason: {candidate.name} {phase}'
        if data.get('integrationStatus')=='intentionally-not-integrated':
            assert data.get('integrationReason'), f'Excluded extract lacks a reason: {candidate.name}'
integrated=[json.loads(p.read_text(encoding='utf-8')) for p in integrated_paths]
by_character={character:[r for r in integrated if r['character']==character] for character in builder.CHARACTERS}
assert len(by_character['abad'])==8, 'The eight Abbot extracts must remain integrated'
assert len(by_character['malaquias'])==7 and len(by_character['berengario'])==8, 'This batch integrates only Malachi and Berengario extracts'
assert len(by_character['severino'])==5, 'Exactly five reusable Severino extracts should contribute reviewed phases'
assert len(by_character['adso'])==2 and len(by_character['jorge'])==2 and len(by_character['bernardo'])==4, 'This batch must resolve exactly the selected Adso, Jorge, and Bernardo extracts'
assert not by_character['guillermo'], 'Guillermo extracts must remain untouched'
assert sum(r.get('conditional') is True for r in by_character['abad'])==4, 'Day III and Day V Abbot routes must remain explicitly conditional'
post=next(r for r in by_character['abad'] if r.get('joinTo'))
assert post['joinTo']=='1-4:abad' and post['leg']==2
compline=next(r for r in integrated if r['from']=='church' and r['to']=='corridor')
assert compline['appliesTo']==[f'{day}-6' for day in range(1,7)]
assert len(compline['segments'])==2 and compline['segments'][0]['worldPoints'][-1]==[165,33,2]
assert compline['segments'][1]['worldPoints'][0]==[165,33,2], 'Compline must retain the ordered cell-door stop'
night=next(r for r in by_character['abad'] if r['from']=='corridor' and r['to']=='abbot')
assert night['appliesTo']==[f'{day}-0' for day in range(2,8)] and night['solver']['doorMask']==0x17
assert compline['solver']['doorMask']==0x1f, 'Night return must remain separate after the door-mask change'
extract_by_name={p.name:json.loads(p.read_text(encoding='utf-8')) for p in extracts}
vespers_1=extract_by_name.get('malaquias-vespers-leg1.json')
vespers_2=extract_by_name.get('malaquias-vespers-leg2.json')
assert vespers_1['integrationStatus']=='integrated-conditional' and vespers_2['integrationStatus']=='integrated-conditional'
assert vespers_1['conditional'] is True and vespers_2['conditional'] is True
assert vespers_1['appliesTo']==vespers_2['appliesTo']==[f'{day}-5' for day in range(1,6)]
assert (vespers_1['routeGroup'],vespers_1['leg'],vespers_2['leg'])==('malaquias-vespers',1,2)
assert vespers_1['segments'][-1]['worldPoints'][-1] == vespers_2['segments'][0]['worldPoints'][0], 'Vespers legs do not meet'
assert vespers_1['solver']['doorMask']==0x2f and vespers_2['solver']['doorMask']==0x1f, 'Vespers door-mask change must remain between legs'

split=extract_by_name['malaquias-day5-terce.json']
expanded=list(builder.expanded_extracts(split))
assert [phase for phase,_ in expanded]==['5-2','5-3']
terce,sext=[record for _,record in expanded]
assert (terce['from'],terce['to'],sext['from'],sext['to'])==('church','severinus','severinus','desk')
assert terce['segments'][0]['worldPoints'][0]==[132,72,2] and terce['segments'][-1]['worldPoints'][-1]==[104,82,2]
assert sext['segments'][0]['worldPoints'][0]==[104,82,2] and sext['segments'][-1]['worldPoints'][-1]==[55,56,15]
assert sum(len(s['worldPoints']) for s in terce['segments'])==153
assert sum(len(s['worldPoints']) for s in sext['segments'])==292
assert terce['conditional'] is True and sext['conditional'] is True

malaquias_phases={phase for record in by_character['malaquias'] for phase in record['appliesTo']}
assert malaquias_phases=={'1-4',*[f'{day}-1' for day in range(2,6)],*[f'{day}-2' for day in range(2,6)],'5-3',*[f'{day}-5' for day in range(1,6)],*[f'{day}-6' for day in range(1,5)]}
berengario_phases={phase for record in by_character['berengario'] for phase in record['appliesTo']}
assert berengario_phases=={'1-4','1-5','1-6',*[f'2-{hour}' for hour in range(1,7)],'3-0'}
assert all(record.get('conditional') is True for record in by_character['berengario']), 'Ordinary Berengario routes require the inactive-report condition'
berengario_vespers=extract_by_name['berengario-vespers.json']
assert berengario_vespers['appliesTo']==['1-5','2-5'] and 'once that condition clears' in berengario_vespers['conditions']
berengario_night=extract_by_name['berengario-night3.json']
assert berengario_night['conditional'] is True and 'not moved or taken the book' in berengario_night['conditions']
assert [segment['floor'] for segment in berengario_night['segments']]==[0,1,0], 'Night III floor changes must remain ordered'
night_points=[point for segment in berengario_night['segments'] for point in segment['worldPoints']]
ordered_stops=[[82,103,4],[52,92,15],[104,87,2]]
indices=[night_points.index(point) for point in ordered_stops]
assert indices==sorted(indices) and night_points[-1]==[104,87,2], 'Night III must end at Severinus cell after its ordered stops'

severino={name:data for name,data in extract_by_name.items() if name.startswith('severino-')}
assert len(severino)==10 and all(data.get('integrationStatus') for data in severino.values()), 'Every Severino extract needs a resolved status'
excluded={name for name,data in severino.items() if data['integrationStatus']=='intentionally-not-integrated'}
assert excluded=={
    'severino-cell-corridor.json','severino-corridor-cell.json',
    'severino-cell-refectory.json','severino-corridor-refectory.json',
    'severino-corridor-church.json'
}, 'Only the indefinite loop and unestablished Sext/Vespers alternatives remain fallbacks'
cell_church=severino['severino-cell-church.json']
assert cell_church['appliesTo']==['2-1','3-1','4-1','5-1','1-5','2-5','3-5','4-5']
assert cell_church['phaseDecisions']['5-1']['integrationStatus']=='integrated-conditional'
assert all(cell_church['phaseDecisions'][phase]['integrationStatus']=='intentionally-not-integrated' for phase in ('1-5','2-5','3-5','4-5'))
church_cell=severino['severino-church-cell-day.json']
assert church_cell['phaseDecisions']['4-2']['integrationStatus']=='integrated' and "changing position" in church_cell['phaseDecisions']['4-2']['conditions']
assert church_cell['phaseDecisions']['5-2']['integrationStatus']=='integrated-conditional' and 'murder' in church_cell['phaseDecisions']['5-2']['conditions']
assert severino['severino-refectory-cell.json']['integrationStatus']=='integrated'
assert 'no loop repetition is appended' in severino['severino-refectory-cell.json']['conditions']
day_mask=church_cell['solver']['doorMask']; night_mask=severino['severino-church-cell-night.json']['solver']['doorMask']
assert (day_mask,night_mask)==(0x2f,0x0f), 'Compline must retain its distinct combined door mask'
for data in severino.values():
    assert [segment['floor'] for segment in data['segments']]==[0], 'Severino extracts must retain their source-ordered ground-floor leg'
    assert data['segments'][0]['worldPoints'][0]==data['solver']['start'][1:], 'Severino leg start changed'
    assert data['segments'][-1]['worldPoints'][-1][:2]==data['solver']['stops'][-1][1:3], 'Severino leg endpoint changed'
assert all(point != [0,0,0] for data in severino.values() for segment in data['segments'] for point in segment['worldPoints']), 'A disappearance/reset was drawn as movement'

adso_compline=extract_by_name['adso-compline.json']
assert list(adso_compline['phaseDecisions'])==adso_compline['appliesTo']
assert all(adso_compline['phaseDecisions'][phase]['integrationStatus']=='integrated' for phase in ('1-6','2-6','3-6','4-6','6-6'))
assert adso_compline['phaseDecisions']['5-6']['integrationStatus']=='integrated-conditional'
assert 'attendance masks include Adso' in adso_compline['conditions'] and adso_compline['solver']['doorMask']==0x1c
adso_prime=extract_by_name['adso-prime-after-sleep.json']
assert adso_prime['integrationStatus']=='integrated-conditional' and adso_prime['conditional'] is True
assert 'sleep transition' in adso_prime['conditions'] and 'Guillermo-following' in adso_prime['conditions'] and adso_prime['solver']['doorMask']==0x2c

jorge_sext=extract_by_name['jorge-day3-sext.json']; jorge_escape=extract_by_name['jorge-final-escape.json']
assert jorge_sext['integrationStatus']=='integrated' and jorge_sext['appliesTo']==['3-3']
assert list(jorge_escape['phaseDecisions'])==jorge_escape['appliesTo'] and jorge_escape['appliesTo'][-1]=='7-2'
assert jorge_escape['phaseDecisions']['7-2']['integrationStatus']=='intentionally-not-integrated'
for phase,decision in jorge_escape['phaseDecisions'].items():
    if phase=='7-2': continue
    expected=0x1f if phase in ('6-0','6-6','7-0') else 0x2f
    assert decision['integrationStatus']=='integrated-conditional' and decision['solver']['doorMask']==expected

bernardo={name:data for name,data in extract_by_name.items() if name.startswith('bernardo-')}
assert {name:data['integrationStatus'] for name,data in bernardo.items()}=={
    'bernardo-arrival-refectory.json':'integrated',
    'bernardo-compline.json':'integrated',
    'bernardo-prima.json':'integrated-conditional',
    'bernardo-departure.json':'integrated',
}
assert 'attendance mask includes Bernardo' in bernardo['bernardo-compline.json']['conditions']
assert 'attendance mask includes Bernardo' in bernardo['bernardo-departure.json']['conditions']
assert 'manuscript-pursuit' in bernardo['bernardo-arrival-refectory.json']['conditions']
new_batch=[data for data in extract_by_name.values() if data['character'] in ('adso','jorge','bernardo')]
assert all(point != [0,0,0] for data in new_batch for segment in data['segments'] for point in segment['worldPoints']), 'A placement/disappearance/reset was drawn into the new batch'
for data in new_batch:
    assert data['segments'][0]['worldPoints'][0]==data['solver']['start'][1:], f'New-batch start changed: {data["character"]}'
    assert data['segments'][-1]['worldPoints'][-1][:2]==data['solver']['stops'][-1][1:3], f'New-batch endpoint changed: {data["character"]}'
for mutation in [
 lambda r:r['note'].update(en=''),
 lambda r:r.update(source=[]),
 lambda r:r.update(day=1,hour=0),
 lambda r:r['segments'][0].update(floor=1),
 lambda r:r['segments'][0]['worldPoints'].__setitem__(1,[200,200,2]),
]:
    bad=copy.deepcopy(record); mutation(bad)
    try: builder.validate(bad)
    except AssertionError: pass
    else: raise AssertionError('Invalid route was accepted')
print(f'PASS: {len(reviewed)} reviewed records and {len(extracts)} reusable extracts; rejected missing translation/source, invalid phase, wrong floor, and path teleport.')
