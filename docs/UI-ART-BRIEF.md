# 🎨 UI·방 꾸미기 아트 브리프 — for Codex

> 펫 스프라이트([PIXEL-ART-BRIEF.md](./PIXEL-ART-BRIEF.md), 완료)에 이은 2차 아트 작업.
> 목표: **게임에서 OS 이모지를 전부 걷어내고** 펫 도트와 톤이 맞는 전용 픽셀 아트로 교체.
> 이모지는 플랫폼(윈도우/맥/모바일)마다 다르게 렌더되고 게임 아트와 톤이 안 맞아 퀄리티를 깎는 주범.

## 0. 무료 에셋 조사 결과 (2026-07 조사) — 먼저 읽기

바로 쓸 수 있는 것과 직접 제작해야 하는 것을 가른 결과:

| 에셋 | 라이선스 | 판정 |
| --- | --- | --- |
| [sierrassets Pixel Art Furniture Pack](https://sierrassets.itch.io/pixel-art-furniture-pack) (520+ 스프라이트, 사이드뷰 포함, 침대·소파·TV 등) | 무료(가격 자유), **상업 OK**, 재판매만 금지 | ✅ **가구 1차 소스로 채택 권장** — 우리 방이 정면(사이드) 뷰라 시점도 맞음 |
| [Kenney UI Pack](https://kenney.nl/assets/ui-pack) (430 에셋) 외 Kenney 전체 | **CC0** | ✅ 버튼/패널/게이지 프레임. 단, 도트가 아니라 벡터풍이므로 톤 확인 후 부분 채택 |
| [Twemoji (jdecked 포크)](https://github.com/jdecked/twemoji) — 2026-06 v17 릴리스, 활발히 유지 | **CC-BY 4.0** (크레딧 표기) | ✅ **과도기용**: 아직 전용 아트가 없는 이모지를 SVG로 통일 렌더 → 플랫폼 편차 즉시 해소. 최종적으로는 아래 제작 목록으로 대체 |
| [LimeZu Modern Interiors](https://limezu.itch.io/moderninteriors) | 무료판 **비상업 한정**, 유료판($1.5+)은 CC-BY | ⚠️ 무료판 사용 불가. 필요하면 유료판 구매 후 사용 가능 (품질은 최상급) |
| [CraftPix 무료 팩](https://craftpix.net/freebies/) | 자체 라이선스(상업 OK, 재배포 금지) | 🔶 탑다운 위주라 시점 불일치 — 소품 일부만 |
| 원작 다마고치 P1/P2 스프라이트 (GitHub 추출본) | **반다이 저작권** | ❌ 사용 금지 |

**결론**: 가구는 sierrassets 팩에서 1차 커버 가능. **배경 테마·악세서리·UI 아이콘·이펙트는 우리 게임 고유 컨셉(명예/프리미엄/시즌)이라 맞는 기성품이 없음 → 아래 제작 목록을 코덱스로 생성.**

## 1. 공통 스타일 가이드 (펫 스프라이트와 동일 세계관)

- **스타일**: 제한 팔레트(에셋당 4~8색), 또렷한 외곽선, 다마고치풍 둥글고 귀여운 톤. 펫 도트(`public/sprites/*.webp`)와 나란히 놓였을 때 이질감 없어야 함.
- **포맷**: 투명 배경 PNG → 빌드 시 WebP 변환(기존 sharp 파이프라인 재사용).
- **파일명 = 게임 내 id** (아래 표의 id 그대로). 출력 위치는 항목별 명시.
- **크기**: 아이콘류 64×64, 가구 96×96, 배경 총 780×660(@2x, 방 영역 비율 390×330).

## 2. 제작 목록 A — 악세서리 17종 → `public/deco/{id}.png` (64×64)

옷장에서 펫 위에 자유 배치되므로 **단독으로 예쁜 오브젝트**여야 함. 명예(honor)는 화려하게.

| id | 이름 | 비고 |
| --- | --- | --- |
| acc_ribbon | 리본 | |
| acc_hat | 중절모 | |
| acc_glasses | 선글라스 | |
| acc_crown | 왕관 | |
| acc_flower | 꽃 | |
| acc_headphone | 헤드폰 | |
| acc_butterfly | 나비 | 봄 한정 |
| acc_strawhat | 밀짚모자 | 여름 한정 |
| acc_maple | 단풍잎 | 가을 한정 |
| acc_santa | 산타 모자 | 겨울 한정 |
| acc_halo | 천사 후광 | 명예 |
| acc_wings | 빛의 날개 | 명예 |
| acc_starcrown | 별의 관 | 명예 · 고가 |
| acc_moonveil | 달빛 베일 | 명예 · 고가 |
| acc_aurorascarf | 오로라 목도리 | 명예 · 고가 |
| acc_redstring | 인연의 붉은 실 | 명예 · 고가 |
| acc_universe | 작은 우주 | 명예 · 최고가 (궤도 도는 행성 느낌) |

※ 프리미엄 오라 3종(pacc_sparkle/aurora/moonglow)은 CSS 이펙트로 구현 완료 — 제작 불필요.

## 3. 제작 목록 B — 방 테마 배경 15종 → `public/themes/{id}.png` (780×660)

현재 CSS 그라데이션 한 장씩. **펫이 서 있는 방의 뒷벽+바닥이 보이는 실내/풍경 일러스트**(픽셀 아트, 하단 1/3은 바닥 느낌으로 비워 펫·가구 배치 공간 확보).

| id | 이름 | 무드 키워드 |
| --- | --- | --- |
| bg_sunny | 창가 햇살 | 따뜻한 오후, 커튼, 볕 |
| bg_night | 밤하늘 | 창밖 별, 남색 |
| bg_sakura | 벚꽃길 | 흩날리는 분홍 |
| bg_ocean | 바다 | 창밖 수평선 |
| bg_office | 사무실 | 파티션, 모니터 (몰래 키우는 컨셉) |
| bg_galaxy | 은하수 | 명예 · 쏟아지는 별 |
| bg_throne | 왕좌의 방 | 명예 · 붉은 카펫, 기둥 |
| bg_hotspring | 노천 온천 | 명예 · 김, 바위 |
| bg_library | 오래된 서재 | 명예 · 책장 가득, 호박빛 |
| bg_cloudsea | 구름바다 | 명예 · 구름 위 |
| bg_stargarden | 별의 정원 | 명예 · 별이 피는 정원 |
| bg_memoryroom | 추억의 방 | 명예 · 액자 가득한 벽 |
| pbg_aurora | 오로라 밤하늘 | 프리미엄 · 극광 |
| pbg_cafe | 아늑한 카페 | 프리미엄 · 비 오는 창가 |
| pbg_sakura_night | 밤 벚꽃 | 프리미엄 · 달빛+벚꽃 |

## 4. 제작 목록 C — 가구 15종 → `public/deco/{id}.png` (96×96)

sierrassets 팩으로 먼저 매칭해 보고, **없거나 톤이 안 맞는 것만** 제작.

| id | 이름 | 기성품 매칭 가능성 |
| --- | --- | --- |
| fur_bed | 아늑한 침대 | 높음 |
| fur_bookshelf | 책장 | 높음 |
| fur_moon_lamp | 달 조명 | 낮음(고유 컨셉) |
| fur_sofa | 소파 | 높음 |
| fur_toy_box | 장난감 상자 | 중간 |
| fur_plant | 초록 화분 | 높음 |
| fur_rug | 포근한 러그 | 높음 |
| fur_snack_basket | 간식 바구니 | 중간 |
| fur_radio | 라디오 | 중간 |
| fur_fishtank | 어항 | 중간 |
| fur_desk | 작은 책상 | 높음 |
| fur_telescope | 망원경 | 낮음 |
| fur_soccer | 축구공 | 높음 |
| fur_bathtub | 거품 욕조 | 중간 |
| fur_crystal_lamp | 수정 램프 | 낮음(고유 컨셉) |

## 5. 제작 목록 D — 소비 아이템 → `public/deco/{id}.png` (64×64)

- 간식 3종: treat_cake(조각 케이크), treat_coffee(커피), treat_spa(거품 목욕)
- 선물 5종: gift_flower(들꽃 다발), gift_ball(공), gift_teddy(곰인형), gift_cake(생일 케이크), gift_ring(우정의 반지)
- 도구: item_evostone(진화의 돌), charm(12지신 부적 — 공용 1종 + 띠별 문양 12변형은 여유 있으면)

## 6. 제작 목록 E — UI 아이콘 → `public/ui/{name}.png` (64×64, 단색 계열 + 포인트 컬러)

| 그룹 | 목록 |
| --- | --- |
| 케어 액션 6 | feed(먹이), touch(터치), wash(목욕), sleep(잠), play(놀이), gift(선물) |
| 하단 탭 5 | shop, play, care(홈), fusion, dex |
| 헤더 5 | closet(옷장), room(내 방), settings, coin, gem |
| 스탯 5 | hunger, love, clean, energy, health |
| 상태 오버레이 | dirt(얼룩), zzz, heart, spark |

## 7. 통합 지점 (에셋 완성 후 코드 작업)

- `accessoryEmoji()` → 이미지 경로 반환으로 교체: `src/utils/items.ts`, 렌더는 `PetAvatar.tsx`(.pa-accessory)·`ClosetEditor.tsx`·`DesktopPet.tsx`
- 가구 렌더: `PetGame.tsx`(.pg-furniture-item)·`PetRoom.tsx`
- 배경: `backgroundCss()` → 이미지 URL 지원 (`bg` 필드에 `url(...)` 허용하면 CSS 변경 불필요)
- 폴백: 이미지 로드 실패 시 기존 이모지 표시 (DexSprite의 onError 패턴 재사용)
- 과도기: 전용 아트 없는 항목은 Twemoji SVG 렌더 (CC-BY 4.0 — 설정/크레딧 화면에 표기 필요)

## 8. 우선순위

1. **B 배경 15종** — 상점 컬렉션 가치와 방 체감을 한 번에 올림 (가장 효과 큼)
2. **C 가구** — sierrassets 매칭 먼저, 부족분 제작
3. **A 악세서리** — 옷장 신기능과 시너지
4. **E UI 아이콘 + D 아이템** — 마지막 폴리시
