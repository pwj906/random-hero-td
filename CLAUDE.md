# 랜덤 히어로 디펜스 — 작업 규칙

운빨존많겜 규칙 기반 HTML 캔버스 디펜스 게임(모바일 세로 우선). 사용자와는 한국어 반말로 대화한다. 답은 짧게, 결과 위주로.

## 파일
- src/ 가 원본. 수정은 항상 src에서만 한다.
  - head.html(CSS) · body.html(DOM) · data.js(캐릭터·웨이브·미션 데이터) · game.js(본체, 지도 THEMES 포함) · augment.js(증강·보급상자·등급 룰렛) · sound.js(효과음·BGM, Web Audio 합성) · meta.js(홈·결과·도움말·자동 새로고침) · fx.js
- ui/ (UI 그림), sprites/ (캐릭터·몬스터·소품 그림)
- index.html, version.txt 는 빌드 결과물. 직접 고치지 않는다.

## 빌드·배포 (tools/build.sh, tools/deploy.sh)
- 빌드: B=$(date +%s); index.html = `<meta charset="utf-8"><meta name="viewport" ...>` + head.html + body.html + `<script>const BUILD="$B";` + data.js + game.js + augment.js + sound.js + meta.js + fx.js + `</script>`. version.txt에 $B를 쓴다.
  - 폰이 옛 index.html을 캐시하는 문제가 있다. meta.js가 version.txt를 받아서 BUILD와 다르면 ?v=새번호로 한 번 새로고침한다.
- 배포: 빌드 → 문법 검사(합친 JS를 node --check) → 커밋 → push(main). GitHub Pages(main/root)가 1~2분 뒤 https://pwj906.github.io/random-hero-td/ 에 반영한다.
- 같은 게임을 pwj906/random-hero-defense 저장소 루트에도 올린다.
  - 그 저장소의 index.html·version.txt·ui·sprites를 덮어쓴다. index.html 안의 주소 'random-hero-td/'는 'random-hero-defense/'로 바꾼다.
  - 그 저장소의 v1/ 는 예전 다른 게임이니 건드리지 않는다. survivor/·autobattler/·black-and-white/ 도 건드리지 않는다.
- 커밋 메시지는 한국어로, 바꾼 내용을 적는다.
- 바꾼 뒤에는 Playwright로 폰 크기(390×844, 412×860) 화면을 띄워 확인하고, 오류(pageerror)가 없는지 본다.

## 게임 규칙 (현재)
- 웨이브 1~40, 이후 100웨이브까지 무한. 지도는 10웨이브마다 바뀜(THEMES 10개, 100 넘으면 5~10번 반복). 보스는 10웨이브마다.
- 소환: 빈 칸 탭, 골드 100. 같은 캐릭터 2명이면 합성(하단 '합성' 버튼 또는 두 번 탭). 신 등급은 농축(N명 → 공속 ×N, 피해 +N×10%).
- 등급: 견습·숙련·정예·영웅·전설·신. 계열: 근접(사거리 1칸)·사격(2칸 고정)·저격(4칸). 공격 방식: 단발·범위.
- 근접은 자동 이동이 없다. 플레이어가 길 옆 칸에 놓아야 한다.
- 업글(보석): 계열별 +10%/레벨, 단발·범위별 +7%/레벨.
- 증강: 5·15·25…웨이브. 먼저 브론즈·실버·골드 룰렛(55/33/12%)이 돌고, 카드 3장은 모두 그 등급. 다시 뽑기는 보석 50.
  - 등급은 봇 측정 성능 순으로 나눔.
  - 삭제한 증강: 낙뢰 탑, 원하는 대로, 행운의 동전, 보급 요청·특급 보급·공수 지원.
- 보스 보상: 200×보스 순번 골드. '받기' 또는 '2배 뽑기'(50% → 25% → 12.5%…, 실패하면 0골드).
- 복권: 골드 100, 꽝 약 60%, 천장 없음.
- 보급상자: 삭제됨(코드는 augment.js에 꺼진 채 남아 있음).
- 상황별 도움말은 한 번씩만 뜸(localStorage rhd_tips): 첫 뽑기(빈 칸을 금색 테두리+손가락으로 짚음), 첫 합성, 첫 증강, 7웨이브 업글, 첫 보스 보상. 홈 '게임 방법'에서 다시 보기.
- 메뉴·증강·보스 보상·캐릭터 카드가 열려 있으면 게임이 멈춤.
- 일시정지·배속·소리 버튼은 전장 아래 왼쪽에 둔다(오른쪽 위는 플랫폼 랭킹 창이 가림). 상단 정보줄은 왼쪽 정렬.
- 밸런스: 봇 기준 중간값 14~17웨이브. 캐릭터는 같은 등급 안에서 ±8% 이내로 맞춤(game.js HERO_K).

## 그림
- 그림은 사용자가 다른 AI(GPT)로 만들어 zip으로 준다. 받으면 규격 확인 → WebP 변환·크기 조정 → ui/ 또는 sprites/ 에 넣고 코드에 연결한다.
- 진행 중: 기본 캐릭터 30명(견습~전설)을 완전 탑뷰에서 앞모습 쿼터뷰로 교체.
  - 요청서: https://claude.ai/artifact/VBPNNPjWubGX2DfMa71DZY
  - 규격: 프레임 256×256, 발 위치 (128,232), 오른쪽을 봄, idle 4프레임·attack 6프레임 가로 시트, proj는 오른쪽 향함.
  - 그림이 오면 캐릭터 회전(적 방향으로 360도 회전)을 끄고 좌우 반전만 하도록 바꾼다. 신 6명은 지금 그림 유지.
- 몬스터·지도는 지금 그림 유지.
