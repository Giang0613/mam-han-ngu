"""Locate printed answer underlines locally; never expose page scans in the UI."""
import json
from pathlib import Path
import cv2
ROOT=Path(__file__).resolve().parent.parent
out={}
for book,start,end in [('textbook',16,143),('workbook',8,137)]:
    for page in range(start,end+1):
        image=cv2.imread(str(ROOT/'public/hsk1-materials/pages'/book/f'{page:03}.webp'))
        h,w=image.shape[:2]
        gray=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
        bw=cv2.threshold(gray,100,255,cv2.THRESH_BINARY_INV)[1]
        horizontal=cv2.morphologyEx(bw,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_RECT,(max(25,int(w*.035)),1)))
        contours=cv2.findContours(horizontal,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)[0]
        segments=[]
        for c in contours:
            x,y,cw,ch=cv2.boundingRect(c)
            if .035*w<=cw<=.23*w and ch<=.004*h and .1*h<y<.93*h:
                segments.append([round(x/w,5),round(y/h,5),round(cw/w,5)])
        out[f'{book}-{page:03}']=sorted(segments,key=lambda s:(s[1],s[0]))
(ROOT/'data/hsk1-materials/underlines.json').write_text(json.dumps(out),encoding='utf8')
print('Located underline candidates for',len(out),'content pages.')
