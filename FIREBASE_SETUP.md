# 클라우드 저장(로그인) 설정 가이드

게임의 아이디/비밀번호 로그인 + 진행 상황 클라우드 저장은 **Firebase**를 씁니다.
아래 설정을 마쳐야 작동해요. (설정 전에는 설정 화면에 "클라우드 저장 미설정" 안내가 떠요.)

## 1. Firebase 프로젝트 만들기
1. https://console.firebase.google.com 접속 → **프로젝트 추가**
2. 프로젝트 이름 입력 (예: `danjjak-tamagotchi`) → 생성

## 2. 이메일/비밀번호 로그인 켜기
1. 좌측 **빌드 → Authentication → 시작하기**
2. **Sign-in method** 탭 → **이메일/비밀번호** → 사용 설정 → 저장
   - (참고: 게임에선 아이디만 입력하지만, 내부적으로 `아이디@danjjak.app` 이메일로 변환해 쓴다)

## 3. Firestore 데이터베이스 만들기
1. 좌측 **빌드 → Firestore Database → 데이터베이스 만들기**
2. 위치 선택(아무거나) → **프로덕션 모드**로 시작
3. **규칙(Rules)** 탭에 아래를 붙여넣고 게시:
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
→ 각 사용자는 **자기 데이터만** 읽고 쓸 수 있어요. (보안 핵심)

## 4. 웹 앱 등록 + 설정값 복사
1. **프로젝트 설정(톱니) → 일반 → 내 앱 → 웹(`</>`) 앱 추가**
2. 표시되는 `firebaseConfig` 값을 프로젝트 루트의 `.env` 에 넣기
   (`.env.example` 를 복사해서 `.env` 로 만들고 채우면 됨)
```
VITE_FB_API_KEY=...
VITE_FB_AUTH_DOMAIN=...firebaseapp.com
VITE_FB_PROJECT_ID=...
VITE_FB_STORAGE_BUCKET=...appspot.com
VITE_FB_SENDER_ID=...
VITE_FB_APP_ID=...
```
3. `.env` 저장 후 **dev 서버 재시작** (`npm run dev`) — env는 시작 시 1회 로드됨

## 5. 사용법 (게임 안)
- **설정(⚙️) → ☁️ 클라우드 저장** 에서 아이디·비밀번호로 **가입/로그인**
- 가입하면 현재 펫 데이터가 클라우드에 업로드돼요
- 다른 기기에서 로그인하면 클라우드 데이터를 내려받아 이어서 키워요
- 로그인 중에는 **30초마다 + 종료 시 자동 저장**, "지금 백업"으로 즉시 저장도 가능

## 동작 방식 (요약)
- 인증: Firebase Auth (이메일/비번, 아이디→가짜 이메일 매핑)
- 저장: Firestore `saves/{uid}` 문서에 게임의 `localStorage`(danjjak*) 전체를 스냅샷으로 보관
- 로그인 시 클라우드→로컬 복원 후 새로고침으로 반영
