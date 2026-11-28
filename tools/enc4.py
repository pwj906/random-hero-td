import sys,os
from PIL import Image
import sys;S=(sys.argv[1] if len(sys.argv)>1 else '/home/claude/zin/a4').rstrip('/')+'/';G=__import__('os').path.dirname(__import__('os').path.abspath(__file__))+'/../sprites/'
def L(p):return Image.open(S+p).convert('RGBA')
def save(im,dst,size=None,q=86):
    if size:im=im.resize(size,Image.LANCZOS)
    im.save(G+dst,'WEBP',quality=q,method=6)
def pose(src,dst):
    o=Image.new('RGBA',(1024,256))
    for i,k in enumerate(['idle','ready','fire','recover']):o.paste(L(f'{src}/{k}.png').resize((256,256),Image.LANCZOS),(i*256,0))
    save(o,f'{dst}/pose.webp')
M={'a5_flail':'area_flail','a6_whirl':'area_whirl','c3_scorpion':'scorpion_soldier','c6_storm':'storm_blade'}
for s,d in M.items():
    pose(s,d)
    save(L(f'{s}/swing.png'),f'{d}/swing.webp',(256,256))
    save(L(f'{s}/hit.png'),f'{d}/hit.webp',(256,256))
    if os.path.exists(S+f'{s}/aura.png'):save(L(f'{s}/aura.png'),f'{d}/aura.webp',(384,384))
# storm & scorpion: projectile (wind/poison trail), tip already at the right of the 384 canvas
for s,d in [('c3_scorpion','scorpion_soldier'),('c6_storm','storm_blade')]:save(L(f'{s}/shot.png'),f'{d}/shot.webp',(192,192))
# yeti: ground hit + body impacts + flying ice debris
save(L('a5_flail/impact.png'),'area_flail/impact.webp');save(L('a5_flail/impact2.png'),'area_flail/impact2.webp')
save(L('a5_flail/debris.png'),'area_flail/debris.webp')
# ninja: orbit layers, impact, and the flying blade = wind tail + blade (tip at 320/384, pointing right)
for k in ['orbit','orbit_ready','orbit_recover']:save(L(f'a6_whirl/{k}.png'),f'area_whirl/{k}.webp',(256,256))
save(L('a6_whirl/impact.png'),'area_whirl/impact.webp')
c=Image.new('RGBA',(384,384));tail=L('a6_whirl/shot.png').resize((230,230),Image.LANCZOS)
t2=tail.copy();t2.putalpha(tail.split()[3].point(lambda v:int(v*.75)));c.alpha_composite(t2,(40,77))
b=L('a6_whirl/blade.png');bb=b.getbbox();b=b.crop(bb);sc=150/b.width;b=b.resize((150,max(1,int(b.height*sc))),Image.LANCZOS)
c.alpha_composite(b,(330-b.width,192-b.height//2));save(c,'area_whirl/shot.webp',(192,192))
print('ok')
