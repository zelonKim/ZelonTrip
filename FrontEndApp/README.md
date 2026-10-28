# 📱 ZelonTrip - FrontEnd Mobile App (프론트엔드 모바일 앱)

> **React Native and Expo-based mobile application frontend for ZelonTrip, delivering AI-powered personalized travel itinerary recommendations and location-based services.**  
> **React Native 및 Expo 기반의 ZelonTrip 모바일 애플리케이션 프론트엔드로, AI 맞춤형 여행 일정 추천 및 위치 기반 서비스를 제공합니다.**

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: React Native (Expo SDK), TypeScript
- **Styling**: `StyleSheet`
- **State Management & Data Fetching**: `@tanstack/react-query`, React Context API
- **HTTP Client**: Axios
- **Push Notifications**: Firebase Cloud Messaging (FCM), Expo Notifications
- **Storage & Native APIs**: Expo SecureStore, Google Maps API, Expo Location

---

## 📂 Project Architecture & Key Directories (프로젝트 구조 및 핵심 디렉터리)

- **`api/` - API Integration (백엔드 통신 모듈)**
  - Communication layer with the backend server leveraging Axios instances. (Axios 인스턴스를 활용해 백엔드 서버와 통신하는 레이어)
  - Contains HTTP request functions corresponding to backend API endpoints. (백엔드 API 엔드포인트별 HTTP 요청 함수를 포함함.)

- **`app/` - Expo Router Screens (화면 및 라우팅)**
  - File-system routing directory based on Expo Router `Tab & Stack Navigation`. (Expo Router 기반의 파일 시스템 라우팅 디렉터리)
  - Manages UI composition and navigation flows. (화면 UI 구성 및 라우팅 흐름을 관리함.)

- **`component/` - UI Components (공통 컴포넌트)**
  - Collection of modularized, reusable UI components across the app. (재사용 가능한 공통 UI 컴포넌트 모음)
  - Includes modal dialogs, cards, custom buttons, and list item renderers. (모달, 카드, 커스텀 버튼, List RenderItem 등을 포함함.)

- **`constants/` - Application Constants (전역 상수)**
  - Application-wide global constants and configuration presets. (애플리케이션 전역 상수 모음)
  - Includes theme color palettes, default map coordinates, and API Base URLs. (테마 컬러 Palette, 기본 지도 좌표, API Base URL 등을 포함함.)

- **`context/` - Global State (전역 상태 관리)**
  - Global state management powered by React Context API. (React Context API 기반의 전역 상태 관리)
  - Manages dark mode theme toggles, authentication states, etc. (다크 모드 테마, 인증 상태 등을 관리함.)

- **`hooks/` - Custom React Query Hooks (커스텀 훅)**
  - Collection of custom hooks wrapping `@tanstack/react-query`'s `useQuery` / `useMutation`. (`@tanstack/react-query`의 `useQuery` / `useMutation`을 래핑한 커스텀 훅 모음)
  - Responsible for asynchronous data fetching, caching, and server state management. (비동기 데이터 패칭, 캐싱, 서버 상태 관리를 담당함.)

- **`types/` - TypeScript Definitions (타입 정의)**
  - TypeScript type and interface declarations used throughout the project. (TypeScript 타입 및 인터페이스 정의)
  - Includes API DTOs, domain data models, and component props. (API DTO, 데이터 모델, Props를 포함함.)

- **`utils/` - Helper Utilities (유틸리티 함수)**
  - Collection of pure utility and helper functions. (순수 유틸리티 및 헬퍼 함수 모음)
  - Handles FCM push notification controls, coordinate calculations, secure token storage, etc. (FCM 푸시 알림 제어, 좌표 계산, 토큰 암호화 저장 등을 수행함.)
