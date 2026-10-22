"""Install the isolated Mandarin TTS runtime. New clips use a network service."""
import subprocess
import sys
import tempfile
import venv
from pathlib import Path

project = Path(__file__).resolve().parent.parent
root = project / '.cache' / 'mandarin-audio'
root.mkdir(parents=True, exist_ok=True)
python = root / 'venv' / ('Scripts/python.exe' if sys.platform == 'win32' else 'bin/python')
if not python.exists():
    venv.create(root / 'venv', with_pip=True)
with tempfile.TemporaryDirectory(prefix='superweb-mandarin-pip-') as package_cache:
    subprocess.run([str(python), '-m', 'pip', 'install', '-r', str(project / 'scripts/mandarin-requirements.txt'), '--cache-dir', package_cache], check=True)
print('Mandarin neural reader installed. New samples need Internet; cached WAVs stay on localhost.', flush=True)
