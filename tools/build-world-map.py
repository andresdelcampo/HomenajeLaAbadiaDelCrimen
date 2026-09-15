"""Draw an ornamented SVG directly from the game's floor-height cells.

Run trace-abbot-welcome.py first. No coordinate fitting, wall smoothing, or
image-derived geometry: decoration is independent of the exact cell paths.
"""
from pathlib import Path
import base64
import json
from map_registration import CONFIG, generated_panels, registered_panels, panel_matrix

SITE = Path(__file__).resolve().parents[1]
BUILD = SITE.parent / 'tmp/abbot-welcome'
rom = (BUILD / 'heights.bin').read_bytes()
SIZE = [1323, 982]
# SVG matrix: imageX = ox - scale * worldY; imageY = oy + scale * worldX.
PRINT_PANELS = registered_panels()
PANELS = generated_panels()


def decode(offset):
    grid = [[0]*256 for _ in range(256)]
    covered = set()
    count = 0
    while rom[offset] != 255:
        block, x, y = rom[offset:offset+3]
        kind = block & 7
        assert 1 <= kind <= 5, (hex(offset), block)
        lx, ly = rom[offset+3:offset+5]
        if not block & 8:
            lx, ly = lx >> 4, lx & 15
        offset += 5 if block & 8 else 4
        dx, dy = [(1,0),(0,-1),(-1,0),(0,1),(0,0)][kind-1]
        for j in range(ly+1):
            for i in range(lx+1):
                if x+i < 256 and y+j < 256:
                    grid[y+j][x+i] = (block >> 4) + dx*i + dy*j
                    covered.add((x+i, y+j))
        count += 1
    assert count > 20
    return grid, covered


def zero_floor_cells(grid, covered):
    """Separate real zero-height floors from the unmodelled exterior.

    The height stream explicitly writes some level-zero floors; others use
    the grid's default zero inside closed contours. Keep exterior-connected,
    unwritten cells transparent. Flood the full grid, not the cropped panel:
    the west entrance extends beyond the displayed ground-floor crop.
    Compared with interactive-retrogamer-map.jpg (the printed map).
    """
    exterior = set()
    pending = [(x, y) for x in range(256) for y in (0, 255)]
    pending += [(x, y) for y in range(256) for x in (0, 255)]
    while pending:
        x, y = pending.pop()
        if (x, y) in exterior or grid[y][x] != 0:
            continue
        exterior.add((x, y))
        pending.extend((nx, ny) for nx, ny in
                       ((x-1,y), (x+1,y), (x,y-1), (x,y+1))
                       if 0 <= nx < 256 and 0 <= ny < 256
                       and (nx, ny) not in exterior)
    return {(x, y) for y in range(256) for x in range(256)
            if grid[y][x] == 0 and ((x, y) in covered or (x, y) not in exterior)}


def category(h, x, y, floor):
    if h == 0:
        if floor == 0 and 166 <= x <= 197 and 77 <= y <= 106:
            return 'garden'
        return None
    if h >= 14:
        if 46 <= x <= 64 and 64 <= y <= 84:
            return 'garden-wall'
        return 'wall' if h == 15 else 'blocked'
    if h == 2:
        return 'paving'
    return f'height-{h}'


def draw_floor(floor, grid):
    panel = PANELS[floor]
    x0, x1, y0, y1 = (16,212,16,152) if floor == 0 else (16,128,16,128)
    cats = {(x,y): category(grid[y][x],x,y,floor)
            for y in range(y0,y1) for x in range(x0,x1)}
    paths = {}
    # Merge contiguous cells into rectangles; edges remain at the original
    # half-cell boundaries. This only reduces SVG size, never changes geometry.
    for y in range(y0,y1):
        x = x0
        while x < x1:
            cat = cats[x,y]
            end = x+1
            while end < x1 and cats[end,y] == cat:
                end += 1
            if cat:
                paths.setdefault(cat, []).append(f'M{x-.5} {y-.5}h{end-x}v1h{x-end}z')
            x = end
    matrix=' '.join(str(value) for value in panel_matrix(panel))
    out=[f'<g data-floor="{floor}" transform="matrix({matrix})">']
    # Paint only previously omitted cells. Keep all existing paths, contours,
    # stairs and registration matrices byte-for-byte unchanged above this layer.
    runs = []
    for y in range(y0, y1):
        x = x0
        while x < x1:
            if (x, y) not in zero_floors[floor] or cats[x, y] is not None:
                x += 1
                continue
            end = x + 1
            while end < x1 and (end, y) in zero_floors[floor] and cats[end, y] is None:
                end += 1
            runs.append(f'M{x-.5} {y-.5}h{end-x}v1h{x-end}z')
            x = end
    out.append(f'<path data-zero-floor="true" d="{"".join(runs)}" fill="#eadbbe"/>')
    for cat, runs in paths.items():
        fill = {'wall':'url(#masonry)','blocked':'url(#hatch)','paving':'url(#tiles)',
                'garden':'url(#grass)','garden-wall':'url(#shrubs)'}.get(cat)
        if fill is None:
            h=int(cat.split('-')[1]); fill=['#eadbbe','#dfcea9','#d3bf97','#c6b28d'][h%4]
        out.append(f'<path d="{"".join(runs)}" fill="{fill}"/>')
    # Trace exact obstacle contours, with a fine ink edge on the boundary.
    edges=[]
    for (x,y),cat in cats.items():
        if cat not in ('wall','blocked','garden-wall'):
            continue
        for dx,dy,ax,ay,bx,by in [(-1,0,-.5,-.5,-.5,.5),(1,0,.5,-.5,.5,.5),
                                 (0,-1,-.5,-.5,.5,-.5),(0,1,-.5,.5,.5,.5)]:
            if cats.get((x+dx,y+dy)) not in ('wall','blocked','garden-wall'):
                edges.append(f'M{x+ax} {y+ay}L{x+bx} {y+by}')
    out.append(f'<path d="{"".join(edges)}" fill="none" stroke="#493d2a" stroke-width=".28"/>')
    # Floor-height changes read as individual stair treads, not blurred ramps.
    edges=[]
    for (x,y),cat in cats.items():
        if cat is None or cat in ('wall','blocked','garden-wall'):
            continue
        for dx,dy,ax,ay,bx,by in [(1,0,.5,-.5,.5,.5),(0,1,-.5,.5,.5,.5)]:
            h=grid[y][x]; other=grid[y+dy][x+dx]
            if 0 <= h < 14 and 0 <= other < 14 and h != other:
                edges.append(f'M{x+ax} {y+ay}L{x+bx} {y+by}')
    out.append(f'<path d="{"".join(edges)}" fill="none" stroke="#796c50" stroke-width=".15"/>')
    out.append('</g>')
    return ''.join(out)


decoded=[decode(p) for p in [0x18a00,0x18f00,0x19080]]
grids=[grid for grid, covered in decoded]
zero_floors=[zero_floor_cells(grid, covered) for grid, covered in decoded]
floors=''.join(draw_floor(i,g) for i,g in enumerate(grids))
uncial_font=base64.b64encode((SITE/'assets/fonts/uncial-antiqua/UncialAntiqua-Regular.ttf').read_bytes()).decode()
gregorian_font=base64.b64encode((SITE/'assets/fonts/gregorian-flf/GregorianFLF.ttf').read_bytes()).decode()
parchment_background=base64.b64encode((SITE/'assets/maps/abbey-map-parchment-bg.png').read_bytes()).decode()
for lang in ['es','en']:
    en=lang=='en'
    main='Ground floor' if en else 'Planta principal'
    library='Library' if en else 'Biblioteca'
    subtitle='A plan drawn from the spaces of the game' if en else 'Un plano trazado desde los espacios del juego'
    note='Stone, courtyards and stairs · the original proportions' if en else 'Piedra, patios y escaleras · las proporciones originales'
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1323" height="882" viewBox="0 0 1323 882">
<title>La Abadía del Crimen · {main}</title>
<desc>{subtitle}. {note}.</desc>
<defs>
 <style>@font-face{{font-family:Uncial;src:url(data:font/ttf;base64,{uncial_font})}}@font-face{{font-family:Gregorian;src:url(data:font/ttf;base64,{gregorian_font})}}text{{fill:#493b27;font-family:Georgia,serif}}.uncial{{font-family:Uncial,Georgia,serif}}.gregorian{{font-family:Gregorian,Georgia,serif}}</style>
 <pattern id="tiles" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#ded8bf"/><path d="M0 0H2V2" fill="none" stroke="#a79f87" stroke-width=".11"/><path d="M1 0V2M0 1H2" stroke="#c4bba2" stroke-width=".06"/></pattern>
 <pattern id="masonry" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#655b46"/><path d="M0 0H2M0 1H2M1 0V1M0 1V2" fill="none" stroke="#a79b7d" stroke-width=".12"/></pattern>
 <pattern id="hatch" width="1.5" height="1.5" patternUnits="userSpaceOnUse"><rect width="1.5" height="1.5" fill="#d5c5a4"/><path d="M-.5 1L1-.5M0 1.5L1.5 0M1 2L2 1" stroke="#aa9776" stroke-width=".16"/></pattern>
 <pattern id="grass" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#d0ccaa"/><path d="M.6 1.1l.3-.5.2.4M2 2.5l.2-.6.4.5" fill="none" stroke="#91916d" stroke-width=".12"/></pattern>
 <pattern id="shrubs" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#a8ab87"/><path d="M0 1Q1 0 2 1T3 2M.5 2.5q1-1 2-.3" fill="none" stroke="#6a7251" stroke-width=".22"/></pattern>
</defs>
<image xlink:href="data:image/png;base64,{parchment_background}" width="1323" height="882" preserveAspectRatio="none"/>
<g transform="translate(-205 651)">
 <text class="gregorian" x="661.5" y="87" text-anchor="middle" font-size="58">La Abadía del Crimen</text>
 <text x="661.5" y="116" text-anchor="middle" font-size="13" letter-spacing="2">{subtitle}</text>
 <path d="M452 135h162m95 0h162m-222-5l12 5-12 5m24-10l-12 5 12 5" fill="none" stroke="#937952" stroke-width="1"/>
</g>
{floors}
<g transform="translate(800 705)" stroke="#725c3c" fill="none"><circle r="25" stroke-width=".8"/><circle r="21" stroke-width=".4"/><path d="M-34 0H34M0-34V34M-17-17L17 17M17-17L-17 17" stroke-width=".6"/><path d="M0 18L-5 0 0-27 5 0Z" fill="#725c3c" stroke-width=".5"/><text x="0" y="-43" text-anchor="middle" font-size="16" stroke="none">N</text></g>
<text class="uncial" x="458" y="627" text-anchor="middle" font-size="24">{main}</text>
<text class="uncial" x="1030" y="396" text-anchor="middle" font-size="22">Scriptorium</text>
<text class="uncial" x="1040" y="765" text-anchor="middle" font-size="22">{library}</text>
<path d="M884 409h292M894 778h292" stroke="#a28b61" stroke-width=".7"/>
<text x="661.5" y="841" text-anchor="middle" font-size="12" font-style="italic">{note}</text>
</svg>'''
    (SITE / f'assets/maps/abbey-world-map-{lang}.svg').write_text(svg,encoding='utf-8')
    # Retain the mixed comparison artifact for development. The live explorer
    # now uses either complete map; both share the registered panel positions.
    picture=base64.b64encode((SITE/'assets/maps/interactive-retrogamer-map.jpg').read_bytes()).decode()
    printed_ground=f'<defs><clipPath id="printed-ground"><rect x="0" y="130" width="650" height="745"/></clipPath></defs><g transform="translate(-4 0) translate(350 500) rotate(2.5) scale(1.08) translate(-350 -500)"><image href="data:image/jpeg;base64,{picture}" width="1323" height="982" clip-path="url(#printed-ground)"/></g>'
    from map_registration import multiply, inverse
    ground_layout=multiply(panel_matrix(PANELS[0]),inverse(panel_matrix(PRINT_PANELS[0])))
    ground_transform=' '.join(str(value) for value in ground_layout)
    hybrid=svg.replace(draw_floor(0,grids[0]),f'<g transform="matrix({ground_transform})">{printed_ground}</g>')
    (SITE / f'assets/maps/abbey-route-map-{lang}.svg').write_text(hybrid,encoding='utf-8')

data=json.loads((BUILD/'trace.json').read_text())
assert len(data['worldPoints']) == 201
assert all(grids[0][y][x] < 14 for x,y,h in data['worldPoints'])
assert max(abs(a[0]-b[0])+abs(a[1]-b[1])
           for a,b in zip(data['worldPoints'],data['worldPoints'][1:])) == 2
data['imageSize']=SIZE
data['panels']=PRINT_PANELS
data['geometryPanels']=PANELS
data['geometryImageSize']=CONFIG['geometryImageSize']
data['printAlignment']=CONFIG['sitePrint']
data['upperFloorRegistration']=CONFIG['upperFloors']
data['sampleCount']=len(data['worldPoints'])
data['deskPositions']={'malaquias':[55,56,1], 'berengario':[61,92,1]}
(SITE/'assets/game/abbot-welcome-route.js').write_text(
    '/* Generated by trace-abbot-welcome.py + build-world-map.py. Exact world geometry. */\n'
    + 'window.ABBOT_WELCOME_ROUTE = '+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
print('Built Spanish/English SVG maps and the shared world-coordinate route.')
