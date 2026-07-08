# 배포 가이드 — 오피스 펫

친구들에게 배포하기 전 체크리스트.

## 1. Firebase 실연동 (클라우드 저장·로그인)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. **Authentication** → 로그인 방법에서 "이메일/비밀번호" 사용 설정
   (앱은 `아이디@danjjak.app` 형태로 이메일화해서 쓰므로 이메일 인증 불필요)
3. **Firestore Database** 생성 → 규칙:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /saves/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
4. 프로젝트 설정 → 일반 → 웹 앱 추가 → config 값을 `.env`에 복사
   (`.env.example` 참고. `.env`는 커밋 금지)
5. `.env` 없이 빌드하면 로그인 없이 로컬 저장으로만 동작한다 (기존과 동일)

## 2. 빌드

```bash
npm run build        # 웹 (dist/)
npm run electron:build  # 데스크톱 앱 (설치본)
```

- 웹 배포는 dist/를 아무 정적 호스팅(Vercel/Netlify/Firebase Hosting)에 올리면 된다
- PWA(서비스 워커) 포함이라 모바일 홈 화면 추가 가능

## 3. 배포 전 확인

- [x] dev-species.html은 work/로 이동됨 (빌드에 미포함)
- [x] 스프라이트 WebP 최적화 완료 (34.8MB → 10.7MB, PNG 원본은 backups/에 보존)
- [ ] `.env`에 Firebase 값 채우기 (1번)
- [ ] 상점 "보석 충전 (임시)" 스텁 — 결제 연동 전까지는 무료 지급. 친구 배포 수준에선 무방,
      스토어 출시 전에 제거/연동 필요
- [ ] 치트 단축키 Ctrl+Shift+I (도감 전체 해금, src/main.tsx) — 공개 배포 전 제거 권장

## 참고

- 클라우드 저장은 유저당 Firestore 문서 1개(1MB 상한)에 localStorage 전체(danjjak*)를 통째로 저장
- 무료(Spark) 요금제 쿼터로 충분: 쓰기는 2분 스로틀 + 변경 없으면 생략
