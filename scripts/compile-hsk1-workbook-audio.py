"""Export reviewed excerpts of FLTRP's workbook recordings for the lesson UI.

The editorial plan contains locations only, never inferred answer keys. The
publisher's MP3s are checked against their frozen import hashes before cutting.
"""
from pathlib import Path
import hashlib
import json
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data/hsk1-materials/editorial'
ORIGINAL = ROOT / '.cache/hsk-workbook-source/original'
OUT = ROOT / 'public/hsk1-materials/workbook-audio'
OUT.mkdir(parents=True, exist_ok=True)
source = json.loads((DATA / 'workbook-audio-source.json').read_text(encoding='utf-8'))
plan = json.loads((DATA / 'workbook-audio-plan.json').read_text(encoding='utf-8'))['clips']
recordings = {r['id']: r for r in source['recordings']}
native_hashes = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT / 'data/hsk1-materials/native').glob('*.json')}
clips, audit, decoded_sources = [], [], []
for source_id in dict.fromkeys(c['sourceId'] for c in plan):
    original = ORIGINAL / (source_id + '.mp3')
    assert hashlib.sha256(original.read_bytes()).hexdigest() == recordings[source_id]['sha256'], source_id
    pcm, sample_rate = sf.read(original, dtype='float32', always_2d=True)
    decoded_sources.append({'id': source_id, 'duration': len(pcm) / sample_rate, 'sampleRate': sample_rate, 'channels': pcm.shape[1]})
    for entry in (c for c in plan if c['sourceId'] == source_id):
        assert 0 <= entry['start'] < entry['end'] <= len(pcm) / sample_rate + .001, entry
        assert entry['id'].replace('-', '').isalnum(), entry['id']
        audio = pcm[round(entry['start'] * sample_rate):round(entry['end'] * sample_rate)]
        assert len(audio) > sample_rate * .3, entry['id']
        output = OUT / (entry['id'] + '.mp3')
        assert output.resolve().parent == OUT.resolve()
        # Preserve both channels and the original sample rate. Silence padding
        # in the reviewed plan keeps consonant onsets and final sounds intact.
        sf.write(output, audio, sample_rate, format='MP3', subtype='MPEG_LAYER_III', bitrate_mode='CONSTANT', compression_level=.1)
        decoded, rate = sf.read(output, dtype='float32', always_2d=True)
        duration = len(decoded) / rate
        assert rate == sample_rate and decoded.shape[1] == pcm.shape[1]
        assert abs(duration - len(audio) / sample_rate) < .03, entry['id']
        assert np.max(np.abs(decoded)) > .015, f"{entry['id']}: inaudible excerpt"
        assert np.max(np.abs(decoded)) < 1, f"{entry['id']}: clipped excerpt"
        clips.append({**entry, 'url': '/hsk1-materials/workbook-audio/' + output.name, 'duration': round(duration, 3)})
        audit.append({'id': entry['id'], 'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'bytes': output.stat().st_size, 'peak': round(float(np.max(np.abs(decoded))), 4)})
    print('EXPORTED', source_id, len([c for c in clips if c['sourceId'] == source_id]), flush=True)
assert len({c['id'] for c in clips}) == len(clips)
for name, before in native_hashes.items():
    assert hashlib.sha256((ROOT / 'data/hsk1-materials/native' / name).read_bytes()).hexdigest() == before, name
(ROOT / 'src/lib/hsk/workbook-audio-clips.json').write_text(json.dumps(clips, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(DATA / 'workbook-audio-audit.json').write_text(json.dumps({'clips': len(clips), 'blocks': len({c['blockId'] for c in clips}), 'pages': len({c['pageId'] for c in clips}), 'nativeContentHashes': native_hashes, 'decodedSources': decoded_sources, 'assets': audit}, ensure_ascii=False, indent=2), encoding='utf-8')
print('PASS:', len(clips), 'verified workbook audio excerpts; lesson content and answer keys unchanged.', flush=True)
