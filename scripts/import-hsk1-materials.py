"""Import user-provided scanned HSK 1 books and audio entirely on this machine.
Run with the isolated speech Python after installing scripts/hsk1-import-requirements.txt.
Every page and MP3 is retained; OCR is an additional reading aid, never the original.
"""
import argparse,hashlib,json,re,shutil,zipfile
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor,as_completed
import fitz,numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

PROJECT=Path(__file__).resolve().parent.parent
ASSETS=PROJECT/'public'/'hsk1-materials'
DATA=PROJECT/'data'/'hsk1-materials'
BOOKS=[('textbook','hsk-course-1.pdf',144),('workbook','hsk-course-1-workbook.pdf',139),('writing','hsk-course-1-writing.pdf',15)]
engine=None
def init_worker():
    global engine
    engine=RapidOCR(intra_op_num_threads=2,inter_op_num_threads=1,text_score=.35,det_limit_side_len=1100)
def page_job(args):
    key,name,number,source=args
    target=DATA/'ocr'/key/f'{number:03}.json'
    image_path=ASSETS/'pages'/key/f'{number:03}.webp'
    if target.exists() and image_path.exists():return key,number,'cached'
    with fitz.open(Path(source)/name) as doc:
        page=doc[number-1]
        pix=page.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False)
        image=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
        result,timing=engine(np.asarray(image))
        rows=[]
        for box,text,confidence in result or []:
            rows.append({'text':text,'confidence':round(float(confidence),5),'box':[[round(float(x)/pix.width,5),round(float(y)/pix.height,5)] for x,y in box]})
        image.thumbnail((1440,2100))
        image_path.parent.mkdir(parents=True,exist_ok=True)
        image.save(image_path,'WEBP',quality=90,method=4)
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_text(json.dumps({'book':key,'page':number,'width':pix.width,'height':pix.height,'rows':rows},ensure_ascii=False),encoding='utf-8')
    return key,number,len(rows)
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source',default='./source-materials');parser.add_argument('--workers',type=int,default=4)
    options=parser.parse_args();source=Path(options.source)
    DATA.mkdir(parents=True,exist_ok=True);ASSETS.mkdir(parents=True,exist_ok=True)
    manifest={'revision':'hsk1-books-2026-10-07-v1','books':[],'audio':[]}
    jobs=[]
    for key,name,count in BOOKS:
        path=source/name
        with fitz.open(path) as doc:assert len(doc)==count,(name,len(doc))
        target=ASSETS/f'{key}.pdf'
        if not target.exists() or target.stat().st_size!=path.stat().st_size:shutil.copyfile(path,target)
        manifest['books'].append({'id':key,'pages':count,'file':f'/hsk1-materials/{key}.pdf','sha256':hashlib.file_digest(path.open('rb'),'sha256').hexdigest(),'sourceFilename':name})
        jobs.extend((key,name,n,options.source) for n in range(1,count+1))
    with zipfile.ZipFile(source/'HSK-1-textbook-audio-files.zip') as archive:
        for item in archive.infolist():
            if item.is_dir():continue
            match=re.fullmatch(r'HSK 1 Textbook/Lesson (\d{2})/(\d{2})-(\d+)\.mp3',item.filename)
            if not match:raise ValueError('Unrecognized ZIP entry: '+item.filename)
            lesson,again,track=map(int,match.groups());assert lesson==again and 1<=lesson<=15 and 1<=track<=7
            content=archive.read(item);name=f'{lesson:02}-{track}.mp3';target=ASSETS/'audio'/name;target.parent.mkdir(exist_ok=True)
            target.write_bytes(content)
            manifest['audio'].append({'lesson':lesson,'track':track,'file':f'/hsk1-materials/audio/{name}','bytes':len(content),'sha256':hashlib.sha256(content).hexdigest()})
    assert len(manifest['audio'])==93
    (DATA/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    completed=0
    with ProcessPoolExecutor(max_workers=options.workers,initializer=init_worker) as pool:
        futures=[pool.submit(page_job,j) for j in jobs]
        for f in as_completed(futures):
            f.result();completed+=1
            if completed%15==0 or completed==len(jobs):print(f'OCR/page assets {completed}/{len(jobs)}',flush=True)
    print('Complete: 298 original page images, 3 intact PDFs, 93 exact MP3 files, and OCR sidecars.',flush=True)
if __name__=='__main__':main()
