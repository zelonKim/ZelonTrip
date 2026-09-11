# ZelonTrip - BackEnd API Server

ZelonTrip의 AI 연동을 담당하는 FastAPI 기반의 백엔드 서버


---


## 🛠 Tech Stack

- **Framework**: FastAPI
- **Database & ORM**: PostgreSQL, SQLModel, SQLAlchemy
- **Authentication & Security**: JWT (JSON Web Token), Argon2, OAuth2
- **Python Version**: 3.13.11


---


## 📂 Project Architecture & Key Files

백엔드 주요 로직 및 모듈별 역할 정의

- **`main.py`**
  - 애플리케이션의 메인 엔트리 포인트
  - 전체 API 엔드포인트 및 비즈니스 로직을 정의하며, LLM API 호출 및 외부 연동 레이어를 처리함.


- **`models.py`**
  - SQLModel을 활용하여 데이터베이스 테이블, 각 필드 타입, 제약 조건(Constraints) 및 관계(Relationship)를 정의함.


- **`schemas.py`**
  - Pydantic 기반으로 API 요청 및 응답 시 주고받는 데이터 형식을 정의함.


- **`database.py`**
  - SQLModel과 SQLAlchemy를 기반으로 데이터베이스 엔진 생성 및 세션 연결 관리 통신을 담당함.


- **`dependencies.py`**
  - FastAPI의 Depends 기능을 활용하여 프로젝트 전체에서 사용되는 핵심 의존성(`SessionDep`, `AuthDep`, `CurrentUserDep`)을 정의하고 주입함.


- **`auth.py`**
  - `argon2` 단방향 암호화를 통한 비밀번호 해싱 처리 및 사용자 인증 로직을 수행함.
  - JSON Web Token 발급 및 검증을 통해 로그인 세션을 관리함.


- **`security.py`**
  - `OAuth2PasswordBearer`를 설정하여 API 보안 체계 및 토큰 기반 인증 스키마를 구성함.


---


## 🚀 Getting Started

```bash
uvicorn main:app --reload
```
