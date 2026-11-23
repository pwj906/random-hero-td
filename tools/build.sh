#!/usr/bin/env bash
# src/ 를 합쳐 index.html · version.txt 를 만든다.
#   tools/build.sh            저장소 루트에 빌드
#   OUT=폴더 tools/build.sh   다른 폴더에 빌드(확인용)
#   BUILD_NO=숫자             빌드 번호를 직접 정할 때
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/src"
OUT="${OUT:-$ROOT}"
B="${BUILD_NO:-$(date +%s)}"

for f in head.html body.html data.js game.js augment.js sound.js meta.js fx.js; do
  [ -s "$SRC/$f" ] || { echo "src/$f 가 없거나 비어 있음" >&2; exit 1; }
done

mkdir -p "$OUT"
TMP="$OUT/.index.html.tmp"
trap 'rm -f "$TMP"' EXIT
{
  printf '%s\n' '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">'
  cat "$SRC/head.html" "$SRC/body.html"
  printf '<script>const BUILD="%s";\n' "$B"
  cat "$SRC/data.js"
  # 파일 사이에 빈 줄 하나: 끝 줄바꿈이 빠져도 다음 파일과 붙지 않는다
  for f in game augment sound meta fx; do cat "$SRC/$f.js"; echo; done
  printf '</script>\n'
} > "$TMP"
mv "$TMP" "$OUT/index.html"
printf '%s\n' "$B" > "$OUT/version.txt"
echo "빌드 $B → $OUT/index.html"
