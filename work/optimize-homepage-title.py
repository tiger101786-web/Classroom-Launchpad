"""Create a smaller homepage logo delivery file without changing any RGBA pixel."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'assets/classroom-launchpad-title.png'
TARGET = ROOT / 'assets/classroom-launchpad-title-lossless.webp'

if __name__ == '__main__':
    before = SOURCE.read_bytes()
    with Image.open(SOURCE) as image:
        image.save(TARGET, format='WEBP', lossless=True, method=6, exact=True)
        with Image.open(TARGET) as delivered:
            assert delivered.size == image.size
            assert delivered.convert('RGBA').tobytes() == image.convert('RGBA').tobytes()
    assert SOURCE.read_bytes() == before, 'Preserve original artwork'
    print(f'{len(before):,} -> {TARGET.stat().st_size:,} bytes; identical RGBA pixels')
