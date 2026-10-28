# 🌐 ZelonTrip - FrontEnd Web (웹 프론트엔드)

> **Web application frontend for ZelonTrip.**
> Built on Next.js App Router, providing a responsive UI.
>
> **ZelonTrip의 웹 애플리케이션 프론트엔드**
> Next.js App Router를 기반으로 반응형 UI를 제공합니다.

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management & Data Fetching**: `@tanstack/react-query`, React Context API
- **HTTP Client**: Axios
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Storage & Utilities**: SecureLS, Google Maps API

---

## 📂 Project Architecture & Key Directories (프로젝트 구조 및 핵심 디렉터리)

Core frontend directory structure and role definitions (프론트엔드 주요 폴더 구조 및 역할 정의):

- **`api/` - API Integration (백엔드 통신 모듈)**
  - Communication layer utilizing Axios instances to interact with the FastAPI backend server. (Axios 인스턴스를 활용해 FastAPI 백엔드 서버와 통신하는 레이어)
  - Defines individual HTTP request functions aligned with backend API endpoint specifications. (백엔드 API 엔드포인트 규격에 맞춘 개별 HTTP 요청 함수들이 정의되어 있음.)

- **`app/` - Next.js App Router (페이지 라우팅)**
  - Routing directory based on Next.js App Router. (Next.js App Router 기반의 라우팅 디렉터리)
  - Follows directory structures matching URL paths, containing page-level UI and encapsulated business logic. (각 URL 경로에 맞춘 디렉터리 구조를 가지며, 페이지별 UI와 추상화된 비즈니스 로직을 포함함.)

- **`component/` - UI Components (공통 UI 컴포넌트)**
  - Collection of reusable UI components across the project. (프로젝트 전반에서 재사용되는 UI 컴포넌트 모음)
  - Manages independent components such as common modals and top/bottom navigation tab bars. (공통 모달, 하단/상단 메뉴 탭바 등의 독립적인 컴포넌트를 관리함.)

- **`constants/` - Application Constants (전역 상수)**
  - Manages fixed constants used globally across the application. (애플리케이션 전역에서 사용되는 고정 상수를 관리함.)
  - Includes theme color palettes, default geographic coordinates, and system configuration values. (테마 컬러, 기본 지리 좌표, 시스템 설정값 등을 포함함.)

- **`context/` - Global State (전역 상태 관리)**
  - Global state management layer leveraging React Context API. (React Context API를 활용한 전역 상태 관리 레이어)
  - Manages application dark mode states and synchronization. (애플리케이션의 다크 모드 상태 및 동기화를 관리함.)

- **`hooks/` - Custom React Query Hooks (커스텀 훅)**
  - Collection of custom hooks wrapping `@tanstack/react-query`'s `useQuery` and `useMutation`. (`@tanstack/react-query`의 `useQuery` 및 `useMutation`을 래핑한 커스텀 훅 모음)
  - Abstracts asynchronous API state handling and caching logic. (API 호출 비동기 상태 처리 및 캐싱 로직을 추상화하여 제공함.)

- **`service/` - External Services (외부 서비스 연동)**
  - Handles external service integrations and setup configurations. (외부 서비스 연동 설정을 담당함.)
  - Defines initialization configs for Firebase web push notification (FCM) reception and token issuance. (Firebase 기반 웹 푸시 알림(FCM) 수신 및 토큰 발급 관련 초기화 설정이 정의되어 있음.)

- **`types/` - TypeScript Definitions (타입 정의)**
  - Collection of TypeScript interface and type definition files. (TypeScript 인터페이스 및 Type 정의 파일 모음)
  - Manages API DTOs, domain data models, and common prop types. (API DTO, 데이터 모델, 공통 Prop 타입 등을 관리함.)

- **`utils/` - Helper Utilities (유틸리티 함수)**
  - Collection of project-wide common helper and utility functions. (프로젝트 내 공통 헬퍼 및 유틸리티 함수 모음)
  - Provides push notification controls, SecureLS-based encryption, Google Maps coordinate logic, etc. (푸시 알림 제어, SecureLS 기반 암호화, 구글맵 좌표 로직 등을 제공함.)
