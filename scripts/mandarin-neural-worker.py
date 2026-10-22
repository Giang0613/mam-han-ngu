import os
"""Mandarin neural sample reader. Only lesson text goes to the TTS service.
Microphone audio is never accepted by this JSON-lines worker.
"""
import asyncio
import io
import json
import re
import sys
from pathlib import Path
import edge_tts
import numpy as np
import soundfile as sf
from pypinyin import Style, lazy_pinyin
from pypinyin_dict.phrase_pinyin_data import large_pinyin

root = Path(os.environ.get('SUPERWEB_AUDIO_ROOT') or Path(__file__).resolve().parent.parent / '.cache' / 'mandarin-audio')
cache = root / 'clips'
cache.mkdir(parents=True, exist_ok=True)
# Unambiguous same-sound characters preserve the chosen standalone reading.
# They are pronunciation aliases only; visible lesson text is unchanged.
ALIASES = {'hang2':'航','yue4':'月','de2':'德','di4':'地','hao4':'号','zhang3':'掌',
           'chong2':'虫','huan2':'环','zhuo2':'浊','zhao1':'招','pi4':'屁','pi2':'皮',
           'pi1':'批','chao2':'潮','zang4':'葬','chang2':'常','shen2':'神','shan4':'善',
           'dan1':'丹','dan4':'蛋','zhong4':'众','jiao4':'叫','jue2':'决','wei2':'围','wei4':'位',
           'kong4':'控','kan1':'刊','jiao1':'交','zhong3':'肿','fa4':'髮','xing4':'性','xing1':'星'}
# The neutral reading /de/ and modal /dei/ need context. WordBoundary metadata
# lets us keep exactly the target syllable, with no spoken carrier/filler.
CARRIERS = {'dei3':('我得走了。','得'),'de5':('跑得快。','得'),'ma5':('你好吗？','吗'),
            'a2':('啊？你说什么？','啊')}
large_pinyin.load()

def reference_text(text, reading):
    if not reading or len(text)==1:return text
    desired=iter(reading.split(' '))
    original=lazy_pinyin(text,style=Style.TONE3,neutral_tone_with_five=True,errors=lambda s:list(s))
    output=[]
    for char,native in zip(text,original):
        if re.fullmatch(r'[\u3400-\u9fff\uf900-\ufaff]',char):
            expected=next(desired)
            # Keep natural tone sandhi/neutral tones. Change a sound only when
            # the authored lexical syllable differs and an exact alias exists.
            if native[:-1].replace('ü','v')!=expected[:-1] and expected in ALIASES:
                char=ALIASES[expected]
        output.append(char)
    return ''.join(output)

async def render(text, reading, rate):
    source, target = reference_text(text,reading), None
    if len(text)==1 and reading:
        if reading in CARRIERS: source,target=CARRIERS[reading]
        elif reading in ALIASES: source=ALIASES[reading]
    pcm, boundaries = bytearray(), []
    communicator = edge_tts.Communicate(source,'zh-CN-XiaoxiaoNeural',
        rate=f'{round((rate-1)*100):+d}%',boundary='WordBoundary',connect_timeout=10,receive_timeout=25)
    async for chunk in communicator.stream():
        if chunk['type']=='audio': pcm.extend(chunk['data'])
        elif chunk['type']=='WordBoundary': boundaries.append(chunk)
    waveform,sample_rate=sf.read(io.BytesIO(pcm),dtype='float32')
    if waveform.ndim==2:waveform=waveform.mean(axis=1)
    if target:
        boundary=next((b for b in boundaries if b['text']==target),None)
        if boundary is None: raise ValueError('Target syllable alignment unavailable')
        start=max(0,round((boundary['offset']/10000000-.015)*sample_rate))
        end=min(len(waveform),round(((boundary['offset']+boundary['duration'])/10000000+.015)*sample_rate))
        waveform=waveform[start:end]
    if not waveform.size or not np.all(np.isfinite(waveform)):raise ValueError('Invalid waveform')
    waveform-=np.mean(waveform)
    peak=float(np.max(abs(waveform)))
    # Remove outside padding only. No deletion of pauses, syllables or breaths
    # inside the utterance and no hard clipping / aggressive noise filter.
    frame=max(1,round(sample_rate*.01))
    energy=np.array([np.sqrt(np.mean(waveform[i:i+frame]**2)) for i in range(0,len(waveform),frame)])
    active=np.flatnonzero(energy>max(.0002,peak*.005))
    if not active.size:raise ValueError('Silent synthesis')
    start=max(0,round(active[0]*frame-sample_rate*.03))
    end=min(len(waveform),round((active[-1]+1)*frame+sample_rate*.08))
    waveform=waveform[start:end]
    audible=waveform[abs(waveform)>.01]
    rms=float(np.sqrt(np.mean(audible**2))) if audible.size else 0
    if not rms:raise ValueError('No audible voice')
    waveform*=min(2, .18/rms, .88/peak)
    fade=min(round(sample_rate*.004),len(waveform)//2)
    if fade:
        ramp=np.linspace(0,1,fade,dtype=np.float32)
        waveform[:fade]*=ramp;waveform[-fade:]*=ramp[::-1]
    return waveform,sample_rate

sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
print(json.dumps({'ready':True}),flush=True)
for line in sys.stdin:
    request={}
    try:
        request=json.loads(line)
        key,text=request['key'],request['text']
        speed=float(request.get('rate',1))
        if not re.fullmatch('[a-f0-9]{64}',key) or not .5<=speed<=1.2:raise ValueError('Invalid request')
        waveform,sample_rate=asyncio.run(render(text,request.get('reading',''),speed))
        temporary,target=cache/(key+'.tmp'),cache/(key+'.wav')
        sf.write(temporary,waveform,sample_rate,format='WAV',subtype='PCM_16');temporary.replace(target)
        print(json.dumps({'key':key,'ok':True}),flush=True)
    except Exception as error:
        print(json.dumps({'key':request.get('key',''),'error':type(error).__name__}),flush=True)
