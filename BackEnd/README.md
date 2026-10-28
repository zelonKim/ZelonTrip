# 💻 ZelonTrip - BackEnd API Server (FastAPI 백엔드 서버)

> **FastAPI-based backend server handling AI integration, user authentication, database operations, and API orchestration for ZelonTrip.**  
> **ZelonTrip의 AI 연동, 사용자 인증, 데이터베이스 연동 및 API 로직을 전담하는 FastAPI 기반 백엔드 서버**

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: FastAPI
- **Database & ORM**: PostgreSQL, SQLModel, SQLAlchemy
- **Authentication & Security**: JWT (JSON Web Token), Argon2, OAuth2
- **Language**: Python 3.13+

---

## 📂 Project Architecture & Key Files (프로젝트 구조 및 핵심 파일)

Core backend module definitions and architectural responsibilities (백엔드 주요 로직 및 모듈별 역할 정의):

- **`main.py` - Application Entry Point & API Handlers (애플리케이션 진입점)**
  - Serves as the primary application entry point. (애플리케이션의 메인 엔트리 포인트입니다.)
  - Defines API routes and core business logic while handling LLM API calls and external integrations. (전체 API 엔드포인트 및 비즈니스 로직을 정의하며, LLM API 호출 및 외부 연동 레이어를 처리합니다.)

- **`models.py` - Database Models & Relationships (데이터베이스 모델)**
  - Leverages SQLModel to define database tables, column types, constraints, and relational mappings. (SQLModel을 활용하여 데이터베이스 테이블, 각 필드 타입, 제약 조건 및 관계를 정의합니다.)

- **`schemas.py` - Pydantic DTO Schemas (데이터 검증 스키마)**
  - Utilizes Pydantic to define API request and response data transfer objects (DTOs) for strict validation. (Pydantic 기반으로 API 요청 및 응답 시 주고받는 데이터 형식을 정의합니다.)

- **`database.py` - Database Connection & Engine (데이터베이스 세션)**
  - Configures the SQLAlchemy database engine and manages session lifecycle contexts. (SQLModel과 SQLAlchemy를 기반으로 데이터베이스 엔진 생성 및 세션 연결 관리를 담당합니다.)

- **`dependencies.py` - FastAPI Dependency Injection (의존성 주입)**
  - Leverages FastAPI's `Depends` feature to inject core reusable dependencies `SessionDep`, `AuthDep`, `CurrentUserDep` across endpoints. (FastAPI의 Depends 기능을 활용하여 프로젝트 전체에서 사용되는 핵심 의존성을 정의하고 주입합니다.)

- **`auth.py` - Authentication & Hashing Logic (인증 및 암호화)**
  - Implements password hashing and verification using `argon2` one-way cryptography. (`argon2` 단방향 암호화를 통한 비밀번호 해싱 처리 및 사용자 인증 로직을 수행합니다.)
  - Manages authenticated user sessions through JWT token issuance and signature verification. (JSON Web Token 발급 및 검증을 통해 로그인 세션을 관리합니다.)

- **`security.py` - Security Scheme & OAuth2 Configuration (API 보안 체계)**
  - Configures `OAuth2PasswordBearer` to enforce token-based authorization and API security schemes. (`OAuth2PasswordBearer`를 설정하여 API 보안 체계 및 토큰 기반 인증 스키마를 구성합니다.)
