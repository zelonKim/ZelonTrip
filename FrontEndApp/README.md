# ZelonTrip - FrontEnd App

React Native 및 Expo 기반의 ZelonTrip 모바일 애플리케이션 프론트엔드 
FastAPI 백엔드와 연동하여 AI 맞춤형 여행 일정 추천 및 위치 기반 서비스를 제공함.


---


## 🛠 Tech Stack

- **Framework**: React Native (Expo SDK), TypeScript
- **Styling**: StyleSheet
- **State Management & Data Fetching**: `@tanstack/react-query`, React Context API
- **HTTP Client**: Axios
- **Notification**: Firebase Cloud Messaging (FCM), Expo Notifications
- **Storage & Native APIs**: Expo SecureStore, Google Maps API, Expo Location


---



## 📂 Project Architecture & Key Directories

- **`api/`**
  - Axios 인스턴스를 활용해 백엔드 서버와 통신하는 레이어
  - 백엔드 API 엔드포인트별 HTTP 요청 함수를 포함함.

- **`app/`**
  - Expo Router 기반의 파일 시스템 라우팅 디렉터리 (Tab & Stack Navigation)
  - 화면 UI 구성 및 라우팅 흐름을 관리함.

- **`component/`**
  - 재사용 가능한 공통 UI 컴포넌트 모음 
  - 모달, 카드, 커스텀 버튼, List RenderItem 등을 포함함.

- **`constants/`**
  - 애플리케이션 전역 상수 모음
  - 테마 컬러 Palette, 기본 지도 좌표, API Base URL 등을 포함함.

- **`context/`**
  - React Context API 기반의 전역 상태 관리
  - 다크 모드 테마, 인증 상태 등을 관리함.

- **`hooks/`**
  - `@tanstack/react-query`의 `useQuery` / `useMutation`을 래핑한 커스텀 훅 모음
  - 비동기 데이터 패칭, 캐싱, 서버 상태 관리를 담당함.

- **`types/`**
  - TypeScript 타입 및 인터페이스 정의 
  - API DTO, 데이터 모델, Props를 포함함.

- **`utils/`**
  - 순수 유틸리티 및 헬퍼 함수 모음 
  - FCM 푸시 알림 제어, 좌표 계산, 토큰 암호화 저장 등을 수행함.


---


## 🚀 Getting Started

### 1. 패키지 설치
```bash
npx expo start