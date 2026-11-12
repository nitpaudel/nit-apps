from PIL import Image, ImageDraw
import sys, os
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
BG=(10,10,12); ACC=(214,255,63)
def icon(n):
    S=n*4; im=Image.new("RGB",(S,S),BG); d=ImageDraw.Draw(im)
    widths=[0.64,0.44,0.24]; bh=0.115*S; gap=0.07*S; total=3*bh+2*gap; y=(S-total)/2
    for w in widths:
        x0=(S-w*S)/2; d.rounded_rectangle([x0,y,x0+w*S,y+bh],radius=bh/2,fill=ACC); y+=bh+gap
    return im.resize((n,n),Image.LANCZOS)
for n in (180,192,512): icon(n).save(os.path.join(out,f"icon-{n}.png"))
L=Image.new("RGB",(1170,2532),(0,0,0)); ic=icon(360); L.paste(ic,((1170-360)//2,(2532-360)//2)); L.save(os.path.join(out,"launch-1170x2532.png"))
