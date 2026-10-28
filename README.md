# ✈️ ZelonTrip - AI-Powered Personalized Travel Guide Platform (AI 기반 맞춤 여행 가이드 플랫폼)

> **An AI travel guide that analyzes user preferences and styles to design optimal travel itineraries and seamless routes.**  
> Analyzes user inputs—including travel destination, MBTI, travel style, companions, transportation mode, schedule pace, and specific requests—to generate tailored travel itineraries. It also features Google Maps integration for route visualization and turn-by-turn directions, alongside native dark mode support.
>
> **사용자의 취향과 스타일을 분석하여 최적의 여행 코스와 완벽한 동선을 설계해주는 AI 여행 가이드**  
> 사용자가 입력한 여행지, MBTI, 여행 스타일, 동행자, 이동 수단, 일정 페이스, 개별 요청사항 등을 분석하여 AI가 맞춤형 여행 코스를 설계해줍니다. 또한, 구글맵 연동을 통해 동선 시각화 및 길찾기 기능과 다크모드를 지원합니다.

---

## 🛠 Tech Stack (기술 스택)

### **Frontend**

- **Web Client**: Next.js, TypeScript, Tailwind CSS
- **Mobile App**: React Native (Expo), TypeScript
- **State & Theme**: React Context API, Dark Mode Support

### **Backend & AI**

- **Backend Service**: FastAPI, Python
- **LLM Engine**: OpenAI API (`gpt-4o-mini`)

### **Database & External APIs**

- **Database**: PostgreSQL, NeonDB
- **Maps & Location Services**: Google Maps API (Directions API, Maps SDK)

---

## 🔑 Key Features (주요 기능)

### 🤖 1. AI Personalized Itinerary Generation (AI 맞춤형 여행 코스 및 일정 생성)

- **Input-Based Preference Analysis (사용자 입력 기반 분석)**: Analyzes travel destination, MBTI, duration, travel style, companions, transportation, schedule pace, and custom user prompts. (여행지, MBTI, 여행 기간, 여행 스타일, 동행자, 이동 수단, 일정 페이스, 개별 요청사항 분석)
- **Optimized Itinerary Planning (최적화된 코스 제공)**: Generates daily and time-budgeted travel itineraries tailored to user constraints via OpenAI LLM pipeline. (입력된 조건을 바탕으로 AI가 일자별/시간대별 최적의 여행 코스 설계)

### 🗺️ 2. Google Maps Route Visualization & Navigation (구글맵 동선 시각화 & 길찾기)

- **Interactive Route Pinning (동선 파악)**: Visualizes recommended attractions and route stops interactively on Google Maps. (AI가 추천한 여행 코스의 관광지를 구글맵 위에 시각화)
- **Turn-by-Turn Navigation (길찾기 연동)**: Provides direct navigation and transit info `public transit, walking, driving` between itinerary stops. (각 관광지 간 최단 경로 및 이동 정보 `대중교통, 도보, 차량` 안내)

### 📊 3. AI Personalized Destination Recommendations (AI 개인화 여행지 추천)

- **Travel History Analysis (이전 기록 분석)**: Analyzes user's past travel logs and interaction patterns to extract preference embeddings. (사용자의 과거 여행 기록 데이터를 AI가 분석하여 취향 파악)
- **Preference-Driven Suggestions (취향 기반 추천)**: Suggests new destinations and hidden gems aligned with user taste. (사용자에게 어울리는 새로운 여행지 추천 및 제안)

### 🌙 4. Optimized UI/UX with Dark Mode (UI/UX 최적화 & 다크모드)

- **Enhanced Usability (야간 사용성 개선)**: Delivers full dark mode support to minimize eye strain during evening or nighttime use. (저녁이나 밤 시간대 사용 시 눈의 피로도를 최소화하는 다크모드 완벽 지원)
- **Responsive Web & App Design (반응형 디자인)**: Ensures consistent multi-platform UI experiences across Next.js web and Expo mobile clients. (Next.js 웹과 Expo 기반 앱 전반에 걸친 다양한 UI 환경 제공)
