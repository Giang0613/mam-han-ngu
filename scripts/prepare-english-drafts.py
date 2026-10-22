"""One-time, local-only translation preparation; no lesson text leaves this PC.
Model weights and Python packages stay in ignored .cache, not the source release.
"""
import argparse,hashlib,json,re,sys,urllib.request,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'.cache'/'i18n'
CACHE.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(ROOT/'.cache'/'i18n-python'))

def main():
 import ctranslate2,sentencepiece as sp
 converted=CACHE/'ct2'
 converted.mkdir(exist_ok=True)
 revision='5813c7d77fc31cf9bac8569ec655215750435b21'
 base='https://huggingface.co/gaudi/opus-mt-vi-en-ctranslate2/resolve/'+revision+'/'
 for name in ['config.json','shared_vocabulary.json','source.spm','target.spm','model.bin','README.md']:
  target_file=converted/name
  if not target_file.exists():
   print('Downloading model asset '+name+'; application text stays on this PC.',flush=True)
   temporary=target_file.with_suffix('.download')
   urllib.request.urlretrieve(base+name,temporary)
   temporary.replace(target_file)
 model_dir=converted
 source=sp.SentencePieceProcessor(model_file=str(model_dir/'source.spm'))
 target=sp.SentencePieceProcessor(model_file=str(model_dir/'target.spm'))
 translator=ctranslate2.Translator(str(converted),device='cpu',compute_type='int8',inter_threads=1,intra_threads=4)
 def is_vi(text):return bool(re.search('[đĐăĂâÂêÊôÔơƠưƯ\u1ea0-\u1ef9]',text))
 public=json.loads((CACHE/'public-texts.json').read_text(encoding='utf-8'))
 private=json.loads((CACHE/'private-texts.json').read_text(encoding='utf-8'))
 known={}
 for name in ['ui.en.json','overrides.en.json']:
  known.update(json.loads((ROOT/'src/lib/i18n'/name).read_text(encoding='utf-8')))
 for word in json.loads((ROOT/'data/hsk-vocabulary.json').read_text(encoding='utf-8')):
  if word.get('meaningEn'):known.setdefault(word['meaning'],word['meaningEn'])
 output=CACHE/'drafts-v2.json'
 drafts=json.loads(output.read_text(encoding='utf-8')) if output.exists() else {}
 missing=[s for s in dict.fromkeys(public+private) if s not in drafts and s not in known]
 # Split around protected Hanzi, numeric interpolation slots, and source pinyin.
 # This retains target Chinese exactly, rather than asking the model to copy it.
 def parts(text):return re.split(r'([\u3400-\u9fff\u3000-\u303f]+|\{\d+\}|\b[A-Za-z\u00c0-\u024f]*[āēīōūǎěǐǒǔǖǘǚǜ][A-Za-z\u00c0-\u024f]*\b)',text)
 pending=list(dict.fromkeys(p.strip() for s in missing for p in parts(s) if is_vi(p)))
 segments_path=CACHE/'segments-v2.json'
 segments=json.loads(segments_path.read_text(encoding='utf-8')) if segments_path.exists() else {}
 pending=[s for s in pending if s not in segments]
 pending.sort(key=len)
 print(json.dumps({'public':len(public),'private':len(private),'newSegments':len(pending)}),flush=True)
 for pos in range(0,len(pending),48):
  batch=pending[pos:pos+48]
  results=translator.translate_batch([source.encode(s,out_type=str)+['</s>'] for s in batch],beam_size=2,max_decoding_length=256,max_input_length=384,no_repeat_ngram_size=4)
  for text,result in zip(batch,results):
   value=target.decode(result.hypotheses[0]).strip()
   if not value:raise ValueError('Empty translation: '+text)
   segments[text]=value
  if pos%240==0:
   segments_path.write_text(json.dumps(segments,ensure_ascii=False),encoding='utf-8')
   print(f'Translated {min(pos+48,len(pending))}/{len(pending)} segments',flush=True)
 segments_path.write_text(json.dumps(segments,ensure_ascii=False),encoding='utf-8')
 for text in missing:
  result=[]
  for piece in parts(text):
   if piece.strip() in segments:
    result.append((' ' if piece.startswith(' ') else '')+segments[piece.strip()]+(' ' if piece.endswith(' ') else ''))
   else:result.append(piece)
  drafts[text]=''.join(result)
 output.write_text(json.dumps(drafts,ensure_ascii=False,indent=2),encoding='utf-8')
 (ROOT/'src/lib/i18n/content.en.json').write_text(json.dumps({s:known.get(s,drafts.get(s,s)) for s in public},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (ROOT/'data/materials.en.json').write_text(json.dumps({s:known.get(s,drafts.get(s,s)) for s in private},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (CACHE/'provenance.json').write_text(json.dumps({'model':'Helsinki-NLP/opus-mt-vi-en','conversion':'gaudi/opus-mt-vi-en-ctranslate2','conversionRevision':revision,'license':'Apache-2.0','modelSha256':hashlib.sha256((converted/'model.bin').read_bytes()).hexdigest(),'method':'local CTranslate2 int8 drafts; manual UI and core-course overrides','humanReview':'pending'},indent=2),encoding='utf-8')
 print('English drafts written. Manual overrides must be checked before release.',flush=True)
if __name__=='__main__':main()
