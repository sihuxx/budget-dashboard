# Vercel 배포 가이드

## 준비 사항
- GitHub 계정
- Vercel 계정 (GitHub 연동 권장)

## 1단계: GitHub 저장소 생성 및 푸시

```bash
# 로컬에서 Git 초기화
cd budget-dashboard
git init
git add .
git commit -m "Initial commit"

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/budget-dashboard.git
git branch -M main
git push -u origin main
```

## 2단계: Vercel에서 프로젝트 배포

1. **Vercel 로그인**: https://vercel.com 접속 후 GitHub 계정으로 로그인
2. **New Project 클릭**
3. **저장소 Import**: 방금 푸시한 `budget-dashboard` 선택
4. **Framework Preset**: Next.js 자동 감지됨 (그대로 두기)
5. **Environment Variables 설정**:
   - `DATABASE_URL` 추가 (아래 3단계에서 생성)
6. **Deploy 버튼 클릭**

## 3단계: Vercel Postgres 데이터베이스 설정

### 방법 1: Vercel Postgres (권장 - 무료 플랜 제공)

1. Vercel 대시보드에서 프로젝트 선택
2. **Storage 탭** 클릭
3. **Create Database** → **Postgres** 선택
4. 데이터베이스 이름 입력 (예: `budget-db`)
5. Region 선택 (가장 가까운 지역)
6. **Create** 클릭
7. 자동으로 환경변수 `DATABASE_URL`이 프로젝트에 추가됨

### 방법 2: Neon (무료 플랜 제공)

1. https://neon.tech 접속 및 가입
2. **Create Project** 클릭
3. Project name 입력, Region 선택
4. Connection String 복사 (예: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb`)
5. Vercel 프로젝트 → **Settings** → **Environment Variables**
6. `DATABASE_URL` 추가하고 복사한 URL 붙여넣기
7. **Save** 후 **Redeploy** 필수

## 4단계: 데이터베이스 초기화

배포 완료 후 Prisma 마이그레이션 실행이 필요합니다.

### Vercel Postgres 사용 시
Vercel CLI 설치 및 실행:
```bash
npm i -g vercel

# 로컬에서 프로덕션 DB에 연결
vercel env pull .env.local

# Prisma 마이그레이션 (DB 스키마 생성)
npx prisma db push

# 기본 카테고리 시드
npx prisma db seed
```

### Neon 사용 시
로컬 `.env` 파일에 Neon URL 추가 후:
```bash
# .env 파일에 추가
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb"

# Prisma 마이그레이션
npx prisma db push

# 기본 카테고리 시드
npx prisma db seed
```

## 5단계: 앱 접속 및 확인

1. Vercel 배포 URL 접속 (예: `https://budget-dashboard.vercel.app`)
2. 첫 접속 시 자동으로 기본 카테고리 시드 실행됨
3. "내역 추가" 버튼으로 수입/지출 입력 테스트

## 환경변수 추가 설정 (선택사항)

Vercel 프로젝트 → Settings → Environment Variables에서 추가 가능:

- `NODE_ENV=production` (자동 설정됨)
- `DATABASE_URL` (필수 - 위에서 설정)

## 문제 해결

### 배포는 성공했는데 데이터베이스 에러가 나는 경우
- `DATABASE_URL` 환경변수가 제대로 설정되었는지 확인
- Vercel 대시보드 → Settings → Environment Variables 재확인
- 환경변수 추가/수정 후 반드시 **Redeploy** 필요

### "Prisma Client not generated" 에러
- `package.json`의 `postinstall` 스크립트가 있는지 확인:
  ```json
  "postinstall": "npx prisma generate"
  ```
- Vercel이 자동으로 빌드 시 Prisma Client 생성함

### 로컬에서 개발 시
```bash
# 로컬 개발 서버 실행
npm install
npm run dev

# 로컬 DB 설정 (.env 파일 생성)
DATABASE_URL="postgresql://localhost:5432/budget_dev"

# Prisma 마이그레이션
npx prisma db push
npx prisma db seed
```

## 커스텀 도메인 연결 (선택)

1. Vercel 프로젝트 → Settings → Domains
2. 도메인 입력 (예: `mybudget.com`)
3. DNS 설정 안내에 따라 도메인 제공업체에서 레코드 추가
4. 자동으로 SSL 인증서 발급됨

## 자동 배포 설정

- GitHub `main` 브랜치에 푸시하면 자동으로 Vercel에 배포됨
- Pull Request 생성 시 Preview 배포 자동 생성
- 환경변수 변경 시 수동 Redeploy 필요

## 추가 팁

- **무료 플랜 제한**: Vercel Postgres는 월 60시간 compute time 제공
- **데이터 백업**: Neon 대시보드에서 주기적으로 백업 권장
- **성능 모니터링**: Vercel Analytics 활성화 가능

배포 완료! 🎉
