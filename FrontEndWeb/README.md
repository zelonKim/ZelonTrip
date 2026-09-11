# ZelonTrip - FrontEnd Web

ZelonTrip의 웹 애플리케이션 프론트엔드
Next.js App Router를 기반으로, 반응형 UI를 제공함.


---


## 🛠 Tech Stack

- **Framework**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management & Data Fetching**: @tanstack/react-query, React Context API
- **HTTP Client**: Axios
- **Notification**: Firebase Cloud Messaging (FCM)
- **Storage & Utilities**: SecureLS, Google Maps API


---


## 📂 Project Architecture & Key Directories

프론트엔드 주요 폴더 구조 및 역할 정의

- **`api/`**
  - Axios 인스턴스를 활용해 FastAPI 백엔드 서버와 통신하는 레이어
  - 백엔드 API 엔드포인트 규격에 맞춘 개별 HTTP 요청 함수들이 정의되어 있음.


- **`app/`**
  - Next.js App Router 기반의 라우팅 디렉터리
  - 각 URL 경로에 맞춘 디렉터리 구조를 가지며, 페이지별 UI와 추상화된 비즈니스 로직을 포함함.


- **`component/`**
  - 프로젝트 전반에서 재사용되는 UI 컴포넌트 모음
  - 공통 모달(Modal), 하단/상단 메뉴 탭바(Tab Bar) 등의 독립적인 컴포넌트를 관리함.


- **`constants/`**
  - 애플리케이션 전역에서 사용되는 고정 상수를 관리함.
  - 테마 컬러, 기본 지리 좌표, 시스템 설정값 등을 포함함.


- **`context/`**
  - React Context API를 활용한 전역 상태 관리 레이어
  - 애플리케이션의 다크 모드 상태 및 동기화를 관리함.


- **`hooks/`**
  - `@tanstack/react-query`의 `useQuery` 및 `useMutation`을 래핑한 커스텀 훅 모음
  - API 호출 비동기 상태 처리 및 캐싱 로직을 추상화하여 제공함.


- **`service/`**
  - 외부 서비스 연동 설정을 담당함.
  - Firebase 기반 웹 푸시 알림(FCM) 수신 및 토큰 발급 관련 초기화 설정이 정의되어 있음.


- **`types/`**
  - TypeScript 인터페이스 및 Type 정의 파일 모음
  - API DTO, 데이터 모델, 공통 Prop 타입 등을 관리함.


- **`utils/`**
  - 프로젝트 내 공통 헬퍼 및 유틸리티 함수 모음
  - 푸시 알림 제어, SecureLS 기반 암호화, 구글맵 좌표 로직 등을 제공함.


---


## 🚀 Getting Started

```bash
npm run dev
```
