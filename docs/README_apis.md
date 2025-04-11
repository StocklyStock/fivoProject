# 📘 Stockly API 명세

Stockly 프로젝트에서 사용하는 인증 API 목록입니다.  
이메일 인증번호 기반 회원가입, 인증번호 검증, 로그인 제한 기능이 포함되어 있습니다.

---

## 📌 회원가입 API

- **URL**: `/api/accounts/register/`
- **Method**: `POST`
- **설명**: 회원 가입 시 인증번호를 이메일로 전송합니다.

### 🔸 Request
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "password2": "securepassword123",
  "nickname": "코비코비",
  "phone": "01012345678"
}
```

### 🔸 Response (성공)
```json
{
  "message": "회원가입이 완료되었습니다. 이메일 인증을 완료해주세요."
}
```

---

## 📌 인증번호 검증 API

- **URL**: `/api/accounts/verify-code/`
- **Method**: `POST`
- **설명**: 이메일로 받은 인증번호를 검증하고 이메일 인증 완료 처리합니다.

### 🔸 Request
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### 🔸 Response (성공)
```json
{
  "message": "✅ 이메일 인증이 완료되었습니다."
}
```

---

## 📌 로그인 API

- **URL**: `/api/accounts/login/`
- **Method**: `POST`
- **설명**: 이메일 인증을 완료한 사용자만 로그인할 수 있습니다.

### 🔸 Request
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### 🔸 Response
```json
{
  "message": "로그인 성공",
  "access": "JWT_ACCESS_TOKEN",
  "refresh": "JWT_REFRESH_TOKEN",
  "user": {
    "email": "user@example.com",
    "nickname": "코비코비닉이시다",
    "role": "user"
  }
}
```

---

## 📌 토큰 갱신 API

- **URL**: `/api/token/refresh/`
- **Method**: `POST`

### 🔸 Request
```json
{
  "refresh": "JWT_REFRESH_TOKEN"
}
```

### 🔸 Response
```json
{
  "access": "NEW_ACCESS_TOKEN"
}
```

---

## ✅ 향후 추가될 API (예정)

| 기능             | URL                          | 설명                          |
|------------------|-------------------------------|-------------------------------|
| 유저 프로필 조회 | `/api/accounts/profile/`      | JWT 인증 기반 프로필 조회     |
| 유저 정보 수정   | `/api/accounts/update/`       | 닉네임, 휴대폰번호 등 수정   |
| 소셜 로그인 연동 | `/api/accounts/social/`       | OAuth 기반 Google, Kakao 등   |

---

> 📍 이 문서는 Stockly 인증 시스템의 API 흐름을 기준으로 작성되며, 기능이 추가되면 계속 업데이트됩니다.
