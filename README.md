# ✈️ AI 기반 맞춤 여행 가이드 플랫폼 (ZelonTrip)

> **사용자의 취향과 스타일을 분석하여 최적의 여행 코스와 완벽한 동선을 설계해주는 AI 여행 가이드**

사용자가 입력한 여행지, MBTI, 여행 스타일, 동행자, 이동 수단, 일정 페이스, 개별 요청사항 등을 분석하여 AI가 맞춤형 여행 코스를 설계해줍니다. 또한, 구글맵 연동을 통해 동선 시각화 및 길찾기 기능과 다크모드를 지원합니다.

---

## 🛠 Tech Stack

### Frontend
- **Web**: Next.js, TypeScript, Tailwind CSS
- **App**: React Native (Expo), TypeScript
- **State & Theme**: React Context API, Dark Mode 

### Backend & AI
- **Backend**: FastAPI, Python
- **LLM API**: OpenAI API (GPT-4o-mini)

### Database & External APIs
- **Database**: PostgreSQL, NeonDB
- **Maps & Location**: Google Maps API (Directions / Maps SDK)

---

## 🔑 Key Features

### 1. 🤖 AI 맞춤형 여행 코스 및 일정 생성 
- **사용자 입력 기반 분석**: 여행지, MBTI, 여행 기간, 여행 스타일, 동행자, 이동 수단, 일정 페이스, 개별 요청사항 분석
- **최적화된 코스 제공**: 입력된 조건을 바탕으로 AI가 일자별/시간대별 최적의 여행 코스 설계

### 2. 🗺️ 구글맵 동선 시각화 & 길찾기
- **동선 파악**: AI가 추천한 여행 코스의 관광지를 구글맵 위에 시각화
- **길찾기 연동**: 각 관광지 간 최단 경로 및 이동 정보(대중교통, 도보, 차량) 안내

### 3. 📊 AI 개인화 여행지 추천 
- **이전 기록 분석**: 사용자의 과거 여행 기록 데이터를 AI가 분석하여 취향 파악
- **취향 기반 추천**: 사용자에게 어울리는 새로운 여행지 추천 및 제안

### 4. 🌙 UI/UX 최적화 (다크모드 지원)
- **야간 사용성 개선**: 저녁이나 밤 시간대 사용 시 눈의 피로도를 최소화하는 다크모드 완벽 지원
- **웹/앱 반응형 디자인**: Next.js 웹과 Expo기반 앱 전반에 걸친 다양한 UI 환경 제공
