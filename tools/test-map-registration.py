"""Verify accepted comparison -> live site across whole floors, not one path."""
import json
import math
from pathlib import Path
import xml.etree.ElementTree as ET
from map_registration import CONFIG, generated_panels, registered_panels, project

site = Path(__file__).resolve().parents[1]
panels = registered_panels()
geometry_panels = generated_panels()

def transform(point, fit, undo=False):
    # Independent pointwise implementation of SVG translate/rotate/scale.
    px, py = fit['pivot']
    angle = math.radians(fit['rotation'])
    co, si = math.cos(angle), math.sin(angle)
    sx = fit.get('scaleX', fit.get('scale'))
    sy = fit.get('scaleY', fit.get('scale'))
    if undo:
        x, y = point[0]-px-fit['x'], point[1]-py-fit['y']
        return [px+(co*x+si*y)/sx, py+(-si*x+co*y)/sy]
    x, y = (point[0]-px)*sx, (point[1]-py)*sy
    return [px+fit['x']+co*x-si*y, py+fit['y']+si*x+co*y]

def close(a, b):
    assert max(abs(x-y) for x, y in zip(a, b)) < 1e-8, (a,b)

count = 0
for floor in (1,2):
    saved = CONFIG['upperFloors'][str(floor)]
    for x in range(0,160,4):
        for y in range(0,160,4):
            reference = project(saved['referenceGeometryMatrix'], [x,y])
            original = transform(reference, saved['acceptedPrint'], undo=True)
            expected = transform(original, CONFIG['sitePrint'])
            close(project(panels[floor]['matrix'], [x,y]), expected)
            count += 1

asset = (site/'assets/game/abbot-welcome-route.js').read_text(encoding='utf-8')
data = json.loads(asset.split('window.ABBOT_WELCOME_ROUTE = ',1)[1].strip().removesuffix(';'))
assert data['panels'] == panels
assert data['geometryPanels'] == geometry_panels
assert data['upperFloorRegistration'] == CONFIG['upperFloors']
for lang in ('en','es'):
    root = ET.parse(site/f'assets/maps/abbey-world-map-{lang}.svg').getroot()
    groups = {int(g.attrib['data-floor']):g for g in root if 'data-floor' in g.attrib}
    for floor in (1,2):
        actual = list(map(float, groups[floor].attrib['transform'][7:-1].split()))
        close(actual, geometry_panels[floor]['matrix'])
for floor in (1,2):
    # The generated floor is the printed projection turned 180 degrees about
    # the centre of the world-coordinate crop, then lowered as a unit.
    for point in ([16,16],[16,128],[128,16],[128,128],[72,72]):
        turned = [144-point[0],144-point[1]]
        expected=project(panels[floor]['matrix'],turned)
        expected[1]+=CONFIG['generatedUpperOffsetY'][str(floor)]
        close(project(geometry_panels[floor]['matrix'],point),expected)
assert CONFIG['generatedUpperOffsetY'] == {
    '1':105.21649484536086,
    '2':115.34339585720764,
}
lab = CONFIG['upperFloors']['2']['acceptedPrint']
assert (lab['scaleX'],lab['scaleY'],lab['x'],lab['y']) == (1.117,.973,65.9,21.4)
print(f'PASS: {count} floor-wide print registrations; generated upper floors and both SVGs agree.')
