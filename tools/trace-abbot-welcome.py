"""Run the preserved VigasocoSDL route finder without its graphics/game loop.

Requires the sibling Fuentes checkout and a C++ compiler. Static floor geometry;
other actors and door leaves are omitted. The two scripted legs end at the cell
door; the subsequent return to the Abbot's own cell is deliberately excluded.
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import os
import sys
import argparse

parser=argparse.ArgumentParser(description=__doc__)
number=lambda value:int(value,0)
parser.add_argument('--start',nargs=4,type=number,metavar=('O','X','Y','H'))
parser.add_argument('--stop',nargs=4,type=number,action='append',metavar=('O','X','Y','H'))
parser.add_argument('--output',type=Path,help='Required for a custom trace; never overwrite the welcome baseline')
parser.add_argument('--door-mask',type=number,help='Combined character and current global room-door mask (0..63); door-leaf collisions still omitted')
args=parser.parse_args()
custom=args.start is not None or args.stop is not None or args.door_mask is not None
if custom and not (args.start and args.stop and args.output): parser.error('Custom traces require --start, --stop and --output')
if args.door_mask is not None and not 0 <= args.door_mask <= 63: parser.error('--door-mask must be 0..63')
for state in ([args.start] if args.start else [])+(args.stop or []):
    if not (0 <= state[0] <= 3 and all(0 <= value <= 255 for value in state[1:])): parser.error('Orientation must be 0..3; x/y/height must be 0..255')
if custom and args.output.exists(): parser.error('Output already exists; choose a fresh filename to avoid mistaking stale output for a successful trace')

SITE = Path(__file__).resolve().parents[1]
SOURCE = SITE.parent / 'Fuentes/VigasocoSDL-master/VigasocoSDL-master'
CORE = SOURCE / 'core/abadia'
BUILD = SITE.parent / 'tmp/abbot-welcome'
BUILD.mkdir(parents=True, exist_ok=True)


def read(name):
    return (CORE / name).read_text(encoding='utf-8')


def clean(code):
    return re.sub(r'^#include.*$', '', code, flags=re.M)


def function(code, signature):
    start = code.index(signature)
    opening = code.index('{', start)
    level = 1
    end = opening + 1
    while level:
        level += (code[end] == '{') - (code[end] == '}')
        end += 1
    return code[start:end]


# Same track extraction and byte reversal as AbadiaDriver/DskReader.
dsk = (SOURCE / 'VigasocoSDL/roms/abadia/abadia.dsk').read_bytes()
assert dsk.startswith(b'EXTENDED CPC DSK File')
def track(number):
    offset = 256 + sum(dsk[0x34:0x34 + number]) * 256
    return dsk[offset + 256:offset + 256 + 0xf00]
rom = bytearray(0x24000)
# Juego::Juego offsets its ROM pointer by 0x4000, so bank 7 (loaded at
# 0x1c000 by the driver) supplies the floor data at game-relative 0x18a00.
rom[0x18000:0x1c000] = b''.join(track(i) for i in range(0x12, 0x17))[:0x4000][::-1]
(BUILD / 'heights.bin').write_bytes(rom)

stub = r'''
#include <cassert>
#include <cstdint>
#include <cstdio>
#include <fstream>
#include <iostream>
#include <cstdlib>
using UINT8=uint8_t; using UINT16=uint16_t; using INT16=int16_t; using INT32=int32_t;
namespace Abadia {
enum Orientacion {DERECHA=0, ABAJO=1, IZQUIERDA=2, ARRIBA=3};
class PosicionJuego { public:
 int orientacion=0,posX=0,posY=0,altura=0;
 PosicionJuego(){} PosicionJuego(int o,int x,int y,int h):orientacion(o),posX(x),posY(y),altura(h){}
};
class RejillaPantalla;
class Personaje: public PosicionJuego {public:
 bool enDesnivel=false,giradoEnDesnivel=false,bajando=false;
 void incrementaPos(int x,int y){posX+=x;posY+=y;}
 bool cambioCentro(){return orientacion==ABAJO || orientacion==IZQUIERDA;}
};
class PersonajeConIA: public Personaje {public:
 void reiniciaPosicionBuffer(){} void modificaOrientacion(int o){orientacion=o;}
 void escribeComandos(UINT16,int){}
 void avanzaPosicion(int,int,int,int);
};
class MotorGrafico {public:
 RejillaPantalla* rejilla;
 int obtenerAlturaBasePlanta(int h){return h<0x0d?0:h<0x18?0x0b:0x16;}
 int obtenerPlanta(int h){assert(h==0 || h==0x0b || h==0x16);return h==0?0:h==0x0b?1:2;}
 int tablaDespOri[4][2]={{1,0},{0,-1},{-1,0},{0,1}};
};
struct Juego {UINT8* roms;};
MotorGrafico motor; MotorGrafico* elMotorGrafico=&motor;
Juego game; Juego* elJuego=&game;
}
'''
headers = clean(read('RejillaPantalla.h')) + clean(read('FijarOrientacion.h'))
route_header = clean(read('BuscadorRutas.h')).replace(' : public Singleton<BuscadorRutas>', '')
route_header = re.sub(r'^#define elBuscadorDeRutas.*$', '', route_header, flags=re.M)
route = clean(read('BuscadorRutas.cpp'))
# Omit the high-level destination/actor interface; invoke buscaCamino directly.
for signature in ['void BuscadorRutas::generaAccionesMovimiento',
                  'void BuscadorRutas::generaAlternativas',
                  'void BuscadorRutas::generaAlternativa(',
                  'void BuscadorRutas::procesaAlternativas']:
    route = route.replace(function(route, signature), '')
route=route.replace('mascara = mascara & laLogica->mascaraPuertas;', '// Caller supplies the already combined character/global mask.')
route = route.replace(function(route, 'void BuscadorRutas::generaAlturasPantalla'),
    'void BuscadorRutas::generaAlturasPantalla(PersonajeConIA* p){rejilla->rellenaAlturasPantalla(p);}')
# Reconstruction already walks the character through the generated commands.
# Retain that final position, instead of rewinding for the graphical game loop.
route = route.replace(function(route, 'void BuscadorRutas::grabaComandosCamino'),
    'void BuscadorRutas::grabaComandosCamino(PersonajeConIA* p){reconstruyeCamino(p);}')
advance = function(read('PersonajeConIA.cpp'), 'void PersonajeConIA::avanzaPosicion')
advance = advance.replace('escribeComandos(comandosAvanzar[numEntrada][0], comandosAvanzar[numEntrada][1]);',
    'std::cout << posX << "," << posY << "," << altura << "\\n";')
main = r'''
int main(int argc,char**argv){
 if(argc<11 || (argc-7)%4!=0) return 2;
 UINT8 rom[0x24000]={}; std::ifstream f(argv[1],std::ios::binary); f.read((char*)rom,sizeof rom);
 game.roms=rom; INT32 buffer[8192]={}; BuscadorRutas finder((UINT8*)buffer,sizeof buffer);
 motor.rejilla=finder.rejilla;
 PersonajeConIA p; p.orientacion=atoi(argv[2]);p.posX=atoi(argv[3]);p.posY=atoi(argv[4]);p.altura=atoi(argv[5]);
 if(atoi(argv[6])>=0) finder.modificaPuertasRuta(atoi(argv[6]));
 std::cout<<p.posX<<","<<p.posY<<","<<p.altura<<"\n";
 for(int destIndex=7;destIndex<argc;destIndex+=4){
  PosicionJuego dest(atoi(argv[destIndex]),atoi(argv[destIndex+1]),atoi(argv[destIndex+2]),atoi(argv[destIndex+3]));
  for(int i=0;i<1000;i++){
   finder.generadoCamino=false;finder.contadorAnimGuillermo=0;
   finder.numAlternativas=1;finder.alternativaActual=0;
   int result=finder.buscaCamino(&p,&dest);
   if(result==-3){std::cerr<<"Reached "<<p.posX<<","<<p.posY<<","<<p.altura<<"\n";break;}
   if(result!=-1 || i==999){std::cerr<<"Failed "<<result<<" at "<<p.posX<<","<<p.posY<<"\n";return 1;}
  }
 }
}
'''
cpp = stub + headers + route_header + clean(read('RejillaPantalla.cpp')) + clean(read('FijarOrientacion.cpp')) + route + advance + main
(BUILD / 'trace.cpp').write_text(cpp, encoding='utf-8')
compiler = Path('C:/msys64/mingw64/bin/g++.exe')
env = dict(os.environ, PATH=str(compiler.parent) + os.pathsep + os.environ['PATH'])
subprocess.run([str(compiler), '-std=c++11', '-O0', '-g', str(BUILD / 'trace.cpp'), '-o', str(BUILD / 'trace.exe')], check=True, env=env)
start=args.start or [3,136,132,2]
stops=args.stop or [[1,164,88,0],[0,165,33,2]]
parameters=start+[args.door_mask if args.door_mask is not None else -1]+[v for stop in stops for v in stop]
result = subprocess.run([str(BUILD / 'trace.exe'), str(BUILD / 'heights.bin'), *map(str,parameters)], capture_output=True, text=True, env=env,timeout=60)
if result.returncode:
    print(result.stderr.strip(),file=sys.stderr)
    raise SystemExit(f'No complete trace (exit {result.returncode}); no route JSON written. Check start state, door mask, scripted stops, and destination reachability.')
points = [list(map(int, line.split(','))) for line in result.stdout.splitlines()]
assert points[0] == start[1:]
assert points[-1][:2] == stops[-1][1:3]
# The stop's table uses h=0 to select the ground floor; the terrain is h=2.
# buscaCamino tests x/y and floor membership, not exact destination height.
if not custom: assert [164,88,2] in points and len(points)==201
data = {'source': 'VigasocoSDL', 'dskSha256': hashlib.sha256(dsk).hexdigest(),
        'conditions': 'Static floor geometry, no actor or door-leaf collisions; source-derived scripted stops.',
        'start':start,'stops':stops,'doorMask':args.door_mask,
        'worldPoints': points}
output=args.output or BUILD/'trace.json'
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
print(result.stderr.strip())
print(f'{len(points)} positions written to {output}')
if not custom: subprocess.run([sys.executable, str(SITE / 'tools/build-world-map.py')], check=True)
