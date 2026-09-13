"""Convert the user's accepted print-to-reference fit to site coordinates.

SVG affine convention: (x',y')=(a*x+c*y+e,b*x+d*y+f).
If A(print)=G(world) in the accepted comparison and P is the site's print
transform, then siteGeometry(world)=P * inverse(A) * G(world).
No new visual fitting, independent nudges, or world-coordinate mutations.
"""
from pathlib import Path
import json
import math

CONFIG=json.loads(Path(__file__).with_name('map-registration.json').read_text(encoding='utf-8'))


def multiply(left,right):
    a,b,c,d,e,f=left; g,h,i,j,k,l=right
    return [a*g+c*h,b*g+d*h,a*i+c*j,b*i+d*j,a*k+c*l+e,b*k+d*l+f]


def inverse(matrix):
    a,b,c,d,e,f=matrix; det=a*d-b*c
    assert abs(det)>1e-12, 'Singular map registration'
    return [d/det,-b/det,-c/det,a/det,(c*f-d*e)/det,(b*e-a*f)/det]


def print_matrix(fit):
    angle=math.radians(fit['rotation']); co,si=math.cos(angle),math.sin(angle)
    sx=fit.get('scaleX',fit.get('scale')); sy=fit.get('scaleY',fit.get('scale'))
    px,py=fit['pivot']; a,b,c,d=sx*co,sx*si,-sy*si,sy*co
    return [a,b,c,d,fit['x']+px-a*px-c*py,fit['y']+py-b*px-d*py]


def panel_matrix(panel):
    if 'matrix' in panel:return panel['matrix']
    s=panel['scale']; sign=-1 if panel.get('rotation')==180 else 1
    return [0,sign*s,-sign*s,0,panel['ox'],panel['oy']]


def registered_panels():
    """Project every floor onto the orientations used by the printed map."""
    site_print=print_matrix(CONFIG['sitePrint'])
    panels=[CONFIG['groundPanel']]
    for floor in ('1','2'):
        fit=CONFIG['upperFloors'][floor]
        matrix=multiply(multiply(site_print,inverse(print_matrix(fit['acceptedPrint']))),fit['referenceGeometryMatrix'])
        panels.append({'matrix':matrix})
    return panels


def original_generated_panels():
    """Keep the ground registration but restore the upper floors' orientation.

    The printed cartography turns both upper plans by 180 degrees.  Rotate each
    registered upper panel around the centre of its 16..128 world-coordinate
    crop so the generated plan reads in the same orientation as the ground
    floor while retaining its size and horizontal position.  Floor-specific
    vertical offsets preserve the visible top alignment of the printed plans.
    """
    panels=registered_panels()
    turn=[-1,0,0,-1,144,144]
    generated=[]
    for floor,panel in enumerate(panels[1:],1):
        matrix=multiply(panel['matrix'],turn)
        matrix[5]+=CONFIG['generatedUpperOffsetY'][str(floor)]
        generated.append({'matrix':matrix})
    return [panels[0], *generated]


def generated_panels():
    """Turn each reconstructed floor left, then place its crop on the sheet.

    Use these same matrices for the artwork and every world-coordinate overlay.
    The historical printed map retains its separate accepted registration.
    """
    result=[]
    for floor,panel in enumerate(original_generated_panels()):
        matrix=multiply([0,-1,1,0,0,0],panel_matrix(panel))
        xmax,ymax=(211.5,151.5) if floor==0 else (127.5,127.5)
        corners=[project(matrix,[x,y]) for x in (15.5,xmax) for y in (15.5,ymax)]
        left,top=CONFIG['generatedNorthUpPositions'][floor]
        matrix[4]+=left-min(p[0] for p in corners)
        matrix[5]+=top-min(p[1] for p in corners)
        result.append({'matrix':matrix})
    return result


def project(matrix,point):
    a,b,c,d,e,f=matrix;x,y=point
    return [a*x+c*y+e,b*x+d*y+f]
