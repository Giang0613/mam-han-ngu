"""Precompute Chinese/Vietnamese reading support on this computer. No text export."""
import argparse,json,re,time
from pathlib import Path
import ctranslate2,sentencepiece as sp
PROJECT=Path(__file__).resolve().parent.parent
DATA=PROJECT/'data'/'hsk1-materials'
ROOT=PROJECT/'.cache'/'hsk1-translator'
NAMES={'王一飞':('Alice','Vương Nhất Phi'),'王一雪':('Sara','Vương Nhất Tuyết'),'白家月':('Anna','Bạch Gia Nguyệt'),'陈天中':('David','Trần Thiên Trung'),'李文':('Peter','Lý Văn'),'刘明':('Michael','Lưu Minh'),'刘小雪':('Emma','Lưu Tiểu Tuyết'),'刘小明':('James','Lưu Tiểu Minh'),'杨同乐':('Robert','Dương Đồng Lạc'),'小语':('Lucy','Xiaoyu')}
MODEL_REVISION='opus-zh-vi-sentences-names-v2'
def chinese(text):
    # Keep all recognized Hanzi, punctuation and blanks, discard the duplicated
    # English and OCR Latin pinyin. Every original line stays in the sidecar.
    if re.fullmatch(r'(?:新HSK教程1|新HSK教程1学习手册|AI生成合?)',text.replace(' ','')):return ''
    text=text.replace('对寸不起','对不起')
    text=re.sub(r'[A-Za-zÀ-ž]+(?:[’\x27][A-Za-zÀ-ž]+)?','',text)
    text=re.sub(r'[^\u3400-\u9fff〇0-9\s，。！？、；：…“”‘’（）()×＿_/.+\-]','',text)
    text=re.sub(r'\s+','',text).strip('.,，。-+()（）')
    text=re.sub(r'^\d+[.、]','',text)
    text=re.sub(r'[）)]?\d{1,2}[-–—]\d+$','',text)
    text=re.sub(r'^口(?=了解|能|掌握)','',text)
    return text if re.search(r'[\u3400-\u9fff]',text) else ''
def lookup_key(text):return re.sub(r'[^\u3400-\u9fff〇×/]','',text)
def edited_translations():
    result={}
    for w in json.loads((PROJECT/'data'/'hsk-vocabulary.json').read_text(encoding='utf-8')):
        if w['level']<=2 and w['language']=='vi':
            result.setdefault(lookup_key(w['hanzi']),{'vi':w['meaning'],'translation':'edited' if w.get('translationStatus')!='draft' else 'machine'})
    for text,vi in json.loads((DATA/'translations-edited.json').read_text(encoding='utf-8')).items():result[lookup_key(text)]={'vi':vi,'translation':'edited'}
    return result
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--watch',action='store_true');options=parser.parse_args()
    path=DATA/'translations.json';translations=json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
    edited=edited_translations()
    src=sp.SentencePieceProcessor(model_file=str(ROOT/'source.spm'));tgt=sp.SentencePieceProcessor(model_file=str(ROOT/'target.spm'))
    translator=ctranslate2.Translator(str(ROOT/'ct2'),device='cpu',compute_type='int8',intra_threads=2,inter_threads=1)
    while True:
        pages=list((DATA/'ocr').rglob('*.json'))
        texts=list(dict.fromkeys(chinese(r['text']) for p in sorted(pages) for r in json.loads(p.read_text(encoding='utf-8'))['rows']))
        texts=[t for t in texts if t]
        for text in texts:
            if entry:=edited.get(lookup_key(text)):translations[text]=entry
        missing=[t for t in texts if t not in translations or (translations[t]['translation']=='machine' and translations[t].get('modelRevision')!=MODEL_REVISION and (any(n in t for n in NAMES) or len(re.findall('[。！？；]',t))>=2))]
        for pos in range(0,len(missing),16):
            batch=missing[pos:pos+16]
            jobs=[]
            for index,text in enumerate(batch):
                for sentence in re.split(r'(?<=[。！？；])',text):
                    if not re.search('[\u3400-\u9fff]',sentence):continue
                    for name,(alias,vi_name) in NAMES.items():sentence=sentence.replace(name,alias)
                    jobs.append((index,sentence))
            results=translator.translate_batch([src.encode(s,out_type=str) for _,s in jobs],beam_size=4,max_decoding_length=256,max_input_length=512)
            pieces={i:[] for i in range(len(batch))}
            for (index,sentence),r in zip(jobs,results):
                vi=tgt.decode(r.hypotheses[0]).strip()
                for alias,vi_name in NAMES.values():vi=re.sub(r'(?<![A-Za-z])'+alias+r'(?![A-Za-z])',vi_name,vi,flags=re.I)
                pieces[index].append(vi)
            for index,text in enumerate(batch):
                vi=' '.join(pieces[index]).strip()
                if not vi:raise ValueError('Empty translation: '+text)
                translations[text]={'vi':vi,'translation':'machine','modelRevision':MODEL_REVISION}
            tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(translations,ensure_ascii=False),encoding='utf-8');tmp.replace(path)
            if (pos//16)%8==0:print(f'Translations: {len(translations)} unique lines from {len(pages)}/298 pages',flush=True)
        tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(translations,ensure_ascii=False),encoding='utf-8');tmp.replace(path)
        print(f'Translation pass complete: {len(pages)}/298 pages, {len(translations)} unique Chinese lines.',flush=True)
        if not options.watch or len(pages)==298:break
        edited=edited_translations()
        time.sleep(5)
if __name__=='__main__':main()
