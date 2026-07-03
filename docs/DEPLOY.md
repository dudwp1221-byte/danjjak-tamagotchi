# 배포 가이드

단짝 다마고치는 빌드 결과(`dist/`)가 정적 파일인 SPA라서 어떤 정적 호스팅에도
올릴 수 있어요. 로컬 데이터(localStorage)만 쓰므로 서버가 필요 없습니다.

```bash
npm install
npm run build      # dist/ 생성
npm run preview    # 로컬에서 빌드 결과 미리보기
```

---

## 방법 1) Vercel (추천 — 가장 간단)

설정 파일 `vercel.json`이 이미 있어요.

**CLI로:**
```bash
npm i -g vercel        # 최초 1회
vercel login           # 브라우저 로그인 (이 세션에선 `! vercel login` 으로 실행)
vercel                 # 미리보기 배포
vercel --prod          # 프로덕션 배포 → 접속 URL 발급
```

**또는 GitHub 연동:** 레포를 Vercel에 import 하면 push마다 자동 배포돼요.
(Framework: Vite 자동 감지 / Build: `npm run build` / Output: `dist`)

---

## 방법 2) Netlify

설정 파일 `netlify.toml`이 이미 있어요.

```bash
npm i -g netlify-cli   # 최초 1회
netlify login          # (이 세션에선 `! netlify login`)
netlify deploy         # 미리보기
netlify deploy --prod  # 프로덕션
```

또는 Netlify 대시보드에서 레포 연결 → 자동으로 `netlify.toml`을 읽어요.

---

## 방법 3) 그 외 정적 호스팅 (Cloudflare Pages, GitHub Pages 등)

- **빌드 명령**: `npm run build`
- **배포 디렉터리**: `dist`
- **SPA 폴백**: 모든 경로를 `/index.html`로 (`sw.js`·`manifest.webmanifest`·
  `icon.svg` 같은 정적 파일은 그보다 먼저 매칭되어 그대로 제공됨)
- **GitHub Pages 주의**: 하위 경로(`/repo-name/`)에 올라가므로
  `vite.config.ts`에 `base: '/repo-name/'`를 추가하고, 서비스 워커 경로도
  맞춰야 해요. 루트 도메인이면 불필요.

---

## 배포 후 체크리스트

- [ ] 펫 생성 → 케어 → 새로고침 후 펫 유지 (localStorage)
- [ ] Esc / 🚨 로 위장 화면 전환
- [ ] PWA 설치 배너 표시 (주소창의 설치 아이콘)
- [ ] 오프라인에서 재접속 시 동작 (서비스 워커 캐시)
- [ ] HTTPS 환경인지 확인 (PWA·알림은 HTTPS 필수, localhost 예외)

> 멀티플레이를 실제 친구 연동으로 바꾸려면 Firebase 설정 후
> `src/features/multiplayer/backend.ts`의 `createFirebaseBackend()`를 구현하세요.
