"""Local Mandarin TTS worker; JSON lines in/out, no network or recordings."""
import json
import re
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro
from misaki import zh

root = Path(__file__).resolve().parent.parent / '.cache' / 'mandarin-audio'
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
session = ort.InferenceSession(str(root / 'model-fp32.onnx'), options, providers=['CPUExecutionProvider'])
class MandarinKokoro(Kokoro):
    # kokoro-onnx 0.4.9 assumes int32 speed for newer exports. The pinned
    # ONNX Community export correctly exposes float32; adapt to its schema.
    def _create_audio(self, phonemes, styles, speed):
        tokens = self.tokenizer.tokenize(phonemes)
        if len(tokens) >= len(styles):
            raise ValueError('Speech chunk exceeds voice context')
        inputs = {
            'input_ids': np.array([[0, *tokens, 0]], dtype=np.int64),
            'style': np.asarray(styles[len(tokens)], dtype=np.float32),
            'speed': np.array([speed], dtype=np.float32),
        }
        return self.sess.run(None, inputs)[0].reshape(-1), 24000
# The published single-voice binary is a float32 style table, not executable data.
voice = np.fromfile(root / 'zf_001.bin', dtype=np.float32).reshape(-1, 1, 256)
if not (root / 'voice.npz').exists():
    np.savez(root / 'voice.npz', zf_001=voice)
model = MandarinKokoro.from_session(session, str(root / 'voice.npz'), vocab_config=str(root / 'config.json'))
g2p = zh.ZHG2P(version='1.1')
cache = root / 'clips'
cache.mkdir(exist_ok=True)
sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
print(json.dumps({'ready': True}), flush=True)
for line in sys.stdin:
    request = {}
    try:
        request = json.loads(line)
        key, text = request['key'], request['text']
        speed = float(request.get('rate', 1.0))
        if not np.isfinite(speed) or not 0.5 <= speed <= 1.2:
            raise ValueError('Invalid reading speed')
        if not re.fullmatch(r'[a-f0-9]{64}', key):
            raise ValueError('Invalid cache key')
        audio = []
        # Keep short chunks at natural punctuation. Long Chinese paragraphs also
        # split below the model's phoneme limit without cutting individual words.
        segments = re.findall(r'.{1,90}(?:[。！？；，]|$)|.{1,90}', text)
        for part in segments:
            phonemes, _ = g2p(part)
            if phonemes:
                samples, sample_rate = model.create(phonemes, voice='zf_001', speed=speed, is_phonemes=True)
                samples = np.asarray(samples, dtype=np.float32)
                # A short fade removes edge clicks without filtering consonants or tones.
                fade = min(int(sample_rate * 0.004), len(samples) // 2)
                if fade:
                    ramp = np.linspace(0, 1, fade, dtype=np.float32)
                    samples[:fade] *= ramp
                    samples[-fade:] *= ramp[::-1]
                pause = 0.2 if re.search(r'[。！？；]$', part) else 0.1
                audio.extend([samples, np.zeros(int(sample_rate * pause), dtype=np.float32)])
        if not audio:
            raise ValueError('No Mandarin speech generated')
        target = cache / (key + '.wav')
        temp = cache / (key + '.tmp')
        waveform = np.concatenate(audio)
        if not np.all(np.isfinite(waveform)):
            raise ValueError('Non-finite audio samples')
        waveform -= np.mean(waveform)
        peak = float(np.max(np.abs(waveform)))
        audible = waveform[np.abs(waveform) > 0.01]
        rms = float(np.sqrt(np.mean(audible ** 2))) if audible.size else 0.0
        if peak > 0 and rms > 0:
            # Raise quiet clips, while retaining 1 dB+ of headroom; never hard-clip.
            waveform *= min(3.5, 0.15 / rms, 0.9 / peak)
        sf.write(temp, waveform, sample_rate, format='WAV', subtype='PCM_16')
        temp.replace(target)
        print(json.dumps({'key': key, 'ok': True}), flush=True)
    except Exception as error:
        print(json.dumps({'key': request.get('key', ''), 'error': type(error).__name__}), flush=True)
