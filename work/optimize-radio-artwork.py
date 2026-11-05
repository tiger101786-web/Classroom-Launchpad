"""Build pixel-identical PNG delivery copies; retain the source PNGs unchanged.

Requires Pillow. Run from any directory with Python.
"""
from pathlib import Path
from PIL import Image
import hashlib
import json

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / 'assets/radio-skins/illustrated'
REPORT = ROOT / 'work/radio-artwork-lossless.json'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def main():
    results = []
    for source in sorted(path for path in ART.glob('*.png') if not path.stem.endswith('-lossless')):
        original = source.read_bytes()
        target = source.with_name(source.stem + '-lossless.png')
        with Image.open(source) as image:
            # Keep resolution and all original RGB/RGBA values; no palette conversion.
            if image.mode not in ('RGB', 'RGBA') or image.info:
                raise ValueError(f'Review mode/metadata before conversion: {source.name}')
            image.save(target, format='PNG', optimize=True, compress_level=9)
            with Image.open(target) as decoded:
                if decoded.size != image.size or decoded.convert(image.mode).tobytes() != image.tobytes():
                    raise ValueError(f'Pixel mismatch: {source.name}')
            if source.read_bytes() != original:
                raise ValueError(f'Source changed: {source.name}')
            result = dict(source=source.relative_to(ROOT).as_posix(), delivery=target.relative_to(ROOT).as_posix(),
                          width=image.width, height=image.height, sourceBytes=len(original), deliveryBytes=target.stat().st_size,
                          sourceSha256=digest(original), deliverySha256=digest(target.read_bytes()),
                          pixelsSha256=digest(image.tobytes()))
            if result['deliveryBytes'] >= result['sourceBytes']:
                raise ValueError(f'No savings for {source.name}; retain the PNG for delivery')
            results.append(result)
            print(f"{source.name}: {len(original):,} -> {target.stat().st_size:,} bytes; exact pixels", flush=True)
    before = sum(item['sourceBytes'] for item in results)
    after = sum(item['deliveryBytes'] for item in results)
    report = dict(format='PNG lossless', pixels='exact', sourceBytes=before, deliveryBytes=after,
                  reductionPercent=round(100*(before-after)/before, 2), assets=results)
    REPORT.write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
    print(f'TOTAL: {before:,} -> {after:,} bytes ({report["reductionPercent"]}% smaller)', flush=True)

if __name__ == '__main__':
    main()
