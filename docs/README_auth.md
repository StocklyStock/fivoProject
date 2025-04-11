# 🧑‍💻 Stockly - 인증 시스템 (Frontend & Backend)

> Stockly 프로젝트의 인증 시스템은 **Django REST Framework + SimpleJWT + React + Redux** 기반으로 구성되어 있습니다.  
> ✅ 이메일 인증번호 기반 회원가입, ✅ 인증된 사용자만 로그인 허용, ✅ 권한 기반 리디레프션, ✅ 헤더 고정 UI 적용, ✅ SNS 로그인 연동 준비 중입니다.

---

## 📆 기술 스택

### 🕙 Backend
- Python 3.x
- Django 5.x
- Django REST Framework (DRF)
- SimpleJWT (JWT 인증)
- SQLite (개발용)

### 🔸 Frontend
- React 18 (Vite 기반)
- TailwindCSS + MUI + Lucide-React
- Redux Toolkit
- React Router DOM
- JWT 인증 연동

---

## 📁 폴더 구조

### Backend (`/backend`)
```bash
파일 구조:
📂 backend/
├— accounts/
│   ├— models.py       # CustomUser (email, nickname, phone, is_verified 등)
│   ├— serializers.py  # 회원가입 및 인증번호 지름화
│   ├— urls.py         # 회원가입 / 로그인 / 인증번호 API 라우트링
│   └— utils.py        # 인증번호 생성 및 이메일 보내기 유틸
└— views.py        # RegisterView, VerifyCodeView, LoginView
├— config/
│   ├— settings.py     # DRF, JWT, CORS, 이메일 설정
│   └— urls.py         # 전체 URL 연결
└— requirements.txt
```

### Frontend (`/frontend`)
```bash
📂 src/
├— app/            # Redux store 구성
├— auth/           # 로그인 상태 관리 (authSlice)
├— components/     # Header, RequireAuth 등 UI 구성 요소
├— pages/          # Login, Register, Dashboard, Admin 등 화면
├— services/       # 인증 관련 API 요청
├— assets/         # SVG 로고 및 아이콘
├— App.jsx         # 공통 헤더 포함 레이아웃
└— main.jsx        # 라우터 및 Redux Provider 설정
```

---

## ✅ 구현 기능 요약

### Backend
- ✅ CustomUser 모델 확장 (`email` 로그인, `nickname`, `is_verified`)
- ✅ 회원가입 시 인증번호 이메일 전송
- ✅ 인증번호 확인 API (`/verify-code/`)
- ✅ 인증 유효시간 3분 제한
- ✅ 이메일 인증 후에만 로그인 허용
- ✅ JWT 토큰 발급 및 갱신

### Frontend
- ✅ Tailwind + MUI 기반 로그인/회원가입 화면
- ✅ Redux 기반 인증 상태 관리
- ✅ 이메일 인증된 사용자만 로그인 가능
- ✅ 관리자/사용자 권한에 따른 리디레프션 분기
- ✅ 공통 헤더 컨포넌트 (스크롤 고정)
- ✅ SNS 로그인 아이콘 UI 준비 (Google/Naver/Kakao)

```js
// 예시: 관리자 권한 분기
const role = email === 'admin@stockly.com' ? 'admin' : 'user';
```

---

## 🥺 테스트 계정 (더미)

| 이메일                | 비밀번호     | 권한     | 리디레프션 |
|----------------------|--------------|----------|----------|
| admin@stockly.com    | any          | 관리자   | /admin   |
| user1@stockly.com    | any          | 사용자   | /dashboard |
| guest@stockly.com    | any          | 사용자   | /dashboard |

---

## 🛠️ 설치 및 실행

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # 윈도우: venv\Scripts\activate

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🗓️ 다음 작업 예정

### Backend
- 🔁 유저 프로필 조회/수정 API
- 🔁 PostgreSQL 전환
- 🔁 SNS 로그인 (OAuth) 연동

### Frontend
- 🔁 Redux-Persist 상태 유지
- 🔁 SNS 로그인 연동 (Google/Naver/Kakao)
- 🔁 반응형 디자인 개정

---

## 📄 관련 문서
- [✅ API 명세서: README_Stockly_APIs.md](./README_Stockly_APIs.md)

---

> 💡 본 인증 시스템은 Stockly의 전체 기능과 통합되어 메인 인증 시스템으로 작법하게 될 것이며, 이메일 인증 및 권한 기반 보안을 제공합니다.