# Investment Dashboard

실시간 비트코인 시세, 김치프리미엄, 나스닥/코스피 지수 및 상승/하락 상위 종목을 한 화면에 보여주는 투자 대시보드입니다.

## 📋 주요 기능

### Crypto 섹션
- BTC-KRW (업비트)
- BTC-USD (해외거래소)
- USD/KRW 환율
- 김치프리미엄 (%)

### US Market 섹션
- 나스닥 지수
- 상승률 상위 5 종목
- 하락률 상위 5 종목

### Korea Market 섹션
- 코스피 지수
- 상승률 상위 5 종목
- 하락률 상위 5 종목

## 🛠 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인합니다.

### 3. 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
invest/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈 페이지
│   │   ├── dashboard/
│   │   │   └── page.tsx        # 대시보드 페이지
│   │   └── globals.css
│   ├── components/
│   │   ├── CryptoPanel.tsx     # 암호화폐 패널
│   │   ├── UsMarketPanel.tsx   # 미국 주식시장 패널
│   │   └── KrMarketPanel.tsx   # 한국 주식시장 패널
│   └── types/
│       └── index.ts            # 공통 타입 정의
├── .github/
│   └── copilot-instructions.md
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🔧 다음 단계 (TODO)

- [ ] Crypto API 연동 (업비트, 바이낸스, 환율 API)
- [ ] US Market API 연동 (Alpha Vantage, Finnhub 등)
- [ ] Korea Market API 연동 (한국투자증권 Open API, KRX)
- [ ] 실시간 자동 갱신 기능
- [ ] 차트 시각화 추가
- [ ] 다크모드 지원
- [ ] 모바일 최적화

## 📝 라이선스

MIT
