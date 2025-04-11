### 📦 Git 브랜치 전략

- `main`: 실제 운영 배포용 브랜치 (직접 푸시 ❌, PR 통해 머지)
- `dev`: 개발 통합 브랜치 (모든 기능은 dev로 PR → 테스트 후 main으로 머지)
- `feature/기능명`: 각자 작업 브랜치 (예: feature/login, feature/register)

### 🔁 협업 순서

1. `git checkout dev`
2. `git pull origin dev`
3. `git checkout -b feature/기능명`
4. 작업 후 `git add . && git commit -m "✨ 기능 구현: ~~~"`
5. `git push origin feature/기능명`
6. GitHub에서 `PR → dev`
