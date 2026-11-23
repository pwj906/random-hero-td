#!/usr/bin/env bash
# 빌드 → 문법 검사 → 커밋 → push(main) → random-hero-defense 루트에도 올리기
#   tools/deploy.sh "바꾼 내용(한국어 커밋 메시지)"
#   DRY=1 tools/deploy.sh      빌드·문법 검사를 임시 폴더에서만 하고 끝(아무것도 바꾸지 않음)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
DEF_URL="${DEF_URL:-https://github.com/pwj906/random-hero-defense.git}"
DEF_DIR="$ROOT/.deploy/random-hero-defense" # 배포 전용 복제본(매번 원격 상태로 되돌림)
die() { echo "중단: $*" >&2; exit 1; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# 합친 JS 문법 검사
check_js() {
  sed -n '/^<script>const BUILD=/,/^<\/script>$/p' "$1" | sed -e '1s/^<script>//' -e '$d' > "$WORK/all.js"
  [ -s "$WORK/all.js" ] || die "index.html에서 스크립트를 못 찾음"
  node --check "$WORK/all.js" || die "문법 오류"
  echo "문법 검사 통과"
}

if [ "${DRY:-}" = 1 ]; then
  OUT="$WORK/out" bash tools/build.sh
  check_js "$WORK/out/index.html"
  exit 0
fi

MSG="${1:-}"
[ -n "$MSG" ] || die '커밋 메시지가 필요해. 예: tools/deploy.sh "복권 확률 조정"'
[ "$(git branch --show-current)" = main ] || die "main 브랜치가 아님"
git fetch -q origin main
git merge-base --is-ancestor origin/main HEAD || die "원격 main이 더 앞서 있음. 먼저 git pull"

# git 사용자 설정이 없는 PC에서는 지금까지의 커밋과 같은 이름을 쓴다
if ! git config user.email >/dev/null; then
  export GIT_AUTHOR_NAME=Claude GIT_AUTHOR_EMAIL=noreply@anthropic.com
  export GIT_COMMITTER_NAME=Claude GIT_COMMITTER_EMAIL=noreply@anthropic.com
fi

# 1) 빌드 → 문법 검사 → 커밋 → push
# 검사를 통과한 것만 루트에 놓는다
OUT="$WORK/out" bash tools/build.sh
check_js "$WORK/out/index.html"
cp "$WORK/out/index.html" "$WORK/out/version.txt" .
git add -A -- src ui sprites tools index.html version.txt CLAUDE.md README.md .gitattributes .gitignore .nojekyll
git commit -q -m "$MSG"
git push -q origin HEAD:main
echo "push 완료: random-hero-td"

# 2) random-hero-defense: index.html·version.txt·ui·sprites 만 덮어쓴다(v1/ 등 다른 폴더는 그대로)
if [ ! -d "$DEF_DIR/.git" ]; then
  mkdir -p "$(dirname "$DEF_DIR")"
  git clone -q --depth 1 --branch main -c core.autocrlf=false "$DEF_URL" "$DEF_DIR"
fi
git -C "$DEF_DIR" fetch -q --depth 1 origin main
git -C "$DEF_DIR" checkout -q -f -B main FETCH_HEAD
git -C "$DEF_DIR" clean -fdq -- ui sprites

rm -rf "$DEF_DIR/ui" "$DEF_DIR/sprites"
cp -R ui sprites version.txt "$DEF_DIR/"
sed 's#random-hero-td/#random-hero-defense/#g' index.html > "$DEF_DIR/index.html"
git -C "$DEF_DIR" add -A -- index.html version.txt ui sprites
git -C "$DEF_DIR" commit -q -m "rtd: $MSG"
git -C "$DEF_DIR" push -q origin HEAD:main
echo "push 완료: random-hero-defense"
