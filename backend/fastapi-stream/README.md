# 📘 Stockly - FastAPI 기반 API 문서

**Stockly 프로젝트**의 일부 API 문서를 Swagger로 시각화하고 테스트할 수 있도록 구성된 FastAPI 예시입니다. 예측 API와 뉴스 벡터화 API를 포함하며, Swagger UI를 통해 쉽게 문서화 및 요청 테스트가 가능합니다.

---

## 🚀 실행 방법

### 1. 가상환경 생성 (선택)
```bash
python3 -m venv venv
source venv/bin/activate
```
--- 
### 2. 패키지 설치
```bash
pip install -r requirements.txt
```
--- 
### 3. 서버 실행
```bash
uvicorn app.main:app --reload
```
### 🧪 Swagger 문서 보기
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

###  ✅ 구현된 API
- GET `/api/predict/{stock_id}`
- 기능: AI 기반 종목 주가 예측 결과 반환
- 파라미터: `stock_id` (예: 005930, 삼성전자)

> **응답 예시:**

```json
{
  "stock_id": "005930",
  "prediction": "up",
  "confidence": 0.87,
  "model": "Transformer-v1.0"
}
```
- POST `/api/embed/news`
- 기능: 뉴스 본문을 임베딩 벡터로 변환
> **요청 바디:**

```json
{
  "news_id": "240301-HYBE-001",
  "title": "하이브, 신사업 투자 발표",
  "content": "하이브는 2024년 글로벌 시장을 타겟으로..."
}
```
> **응답 예시:**

```json
{
  "news_id": "240301-HYBE-001",
  "vector": [0.01, -0.23, 0.05, 0.3],
  "dim": 4,
  "model": "KoBERT-v1.3"
}
```
### 📦 폴더 구조
```css
🗂 ApiDocs/
├── 📁 app/
│   └── main.py
├── requirements.txt
└── README.md
```
---
### 🛠 기술 스택
 - FastAPI

 - Swagger / ReDoc 문서 자동 생성

 - Uvicorn
---
📍 목적
이 코드는 주식 분석 서비스 Stockly의 백엔드 구조를 미리 실험하고 문서화하는 데 목적이 있습니다.
API 설계와 팀 간 협업을 위한 명확한 기준점으로 활용됩니다.

