# AI 포트폴리오 작성 (AI Resume & Portfolio Builder)

> **Google Gemini 3.5 Flash Lite**와 **Python Flask**를 기반으로 지원자의 경험과 프로젝트를 분석하여 고품질의 이력서(Resume) 및 포트폴리오(Portfolio) 초안을 자동으로 생성해 주는 풀스택 웹 애플리케이션입니다.

---

## 📌 프로젝트 소개

코딩을 처음 접하는 개발자도 쉽게 이해하고 활용할 수 있도록 설계된 풀스택 웹 애플리케이션입니다.  
사용자가 자신의 기본 정보, 지원 직무, 경력, 프로젝트 경험을 입력하면 최신 생성형 AI가 서류 합격률을 높여주는 정교한 마크다운 문서를 작성합니다.

- **고전 황실 & 곤룡포(袞龍袍) 테마**: 붉은 비단 자수 프레임, 황금 용보(龍補) 엠블럼, 금괴 메탈릭 버튼이 적용된 품격 있는 UI/UX
- **모바일 완벽 최적화**: 스마트폰 및 태블릿에서도 쾌적하게 작성할 수 있는 반응형 웹 디자인

---

## ✨ 핵심 기능

1. **사용자 맞춤형 입력 폼**
   - 이름, 지원 직무, 주요 경력, 수행 프로젝트, 희망 어조(Tone) 설정
   - 브라우저 및 백엔드 서버 양방향 유효성 검증(Validation)
2. **프롬프트 엔지니어링 선택 (Prompt Modes)**
   - **Prompt A (표준 모드)**: 가독성이 뛰어나고 핵심 경험이 한눈에 들어오는 균형 잡힌 표준 이력서
   - **Prompt B (황실 전문가 모드)**: STAR(상황-과제-행동-결과) 기법에 기반한 정량적 수치 및 비즈니스 임팩트 강조 이력서
3. **Google Gemini API 실시간 연동**
   - 최신 초고속 경량 모델인 `gemini-3.5-flash-lite`를 탑재하여 수초 이내에 완성도 높은 마크다운 문서 생성
4. **원클릭 결과 복사 & 파일 다운로드**
   - 클립보드 원클릭 복사 기능
   - 브라우저에서 즉시 `.md` 파일(`[이름]_이력서_포트폴리오.md`)로 내려받을 수 있는 마크다운 다운로드 기능
5. **안전한 환경변수 보안 관리**
   - Gemini API Key는 로컬의 `.env` 파일에서만 격리되어 로드되며, `.gitignore`를 통해 Git 추적에서 원천 배제

---

## 🛠 기술 스택

| 분류 | 기술 및 도구 |
|---|---|
| **Backend** | Python 3, Flask, python-dotenv |
| **AI / LLM** | Google Gen AI SDK (`google-genai`), Gemini 3.5 Flash Lite |
| **Frontend** | HTML5, Modern CSS3 (Grid/Flexbox, 반응형), Vanilla JavaScript (ES6+ Fetch API) |
| **Design** | 곤룡포 테마 (Imperial Red & Gold), Noto Serif KR, Cinzel Web Font |
| **VCS** | Git, GitHub |

---

## 📂 프로젝트 구조

```text
resume-builder/
├── app.py                  # Flask 백엔드 서버, 라우팅, 프롬프트 엔지니어링, Gemini API 연동
├── requirements.txt        # 프로젝트 구동에 필요한 외부 라이브러리 목록
├── .env                    # 실제 API Key가 저장되는 비밀 환경변수 파일 (Git 제외)
├── .env.example            # 환경변수 설정 템플릿 예시 파일
├── .gitignore              # Git에 포함하지 않을 파일/폴더 목록 (venv, .env 등)
├── README.md               # 프로젝트 안내 문서
├── templates/
│   └── index.html          # 메인 웹 페이지 (입력 폼, 용보 엠블럼, 결과 출력창)
└── static/
    ├── css/
    │   └── style.css       # 곤룡포 황실 스타일시트 및 모바일 최적화 반응형 CSS
    └── js/
        └── app.js          # 비동기 API 통신(fetch), 로딩 제어, 클립보드 복사, 다운로드
```

---

## 🚀 시작하기 (설치 및 실행 방법)

### 1. 작업 위치 이동
```powershell
cd C:\AI-study\resume-builder
```

### 2. 가상환경 생성 및 활성화
```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
```
> 터미널 프롬프트 앞에 `(venv)`가 표시되는지 확인합니다.

### 3. 필수 패키지 설치
```powershell
py -m pip install -r requirements.txt
```

### 4. 환경변수(`.env`) 설정
[Google AI Studio](https://aistudio.google.com/)에서 발급받은 Gemini API 키를 준비합니다.

`.env.example`을 복사하여 `.env` 파일을 생성합니다:
```powershell
Copy-Item .env.example .env
notepad .env
```
메모장이 열리면 실제 키 값을 입력하고 저장(`Ctrl + S`) 후 닫습니다:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 5. 웹 서버 실행
```powershell
py app.py
```

### 6. 웹 브라우저 접속
웹 브라우저를 열고 아래 주소로 접속합니다:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 💡 사용 방법

1. **정보 입력**: 이름, 지원 직무, 주요 경력, 수행 프로젝트를 입력창에 자유롭게 작성합니다.
2. **희망 어조(Tone) 선택**: '당당하고 위엄 있는 어조', '전문적이고 신뢰감 있는 어조' 등 원하는 문체를 선택합니다.
3. **작성 모드 선택**: 
   - 일반적인 가독성을 원한다면 **Prompt A**
   - 구체적인 수치와 문제 해결 역량을 부각하고 싶다면 **Prompt B**를 선택합니다.
4. **생성하기 클릭**: `[AI 이력서 & 포트폴리오 생성하기]` 버튼을 누르면 AI가 작성을 시작합니다.
5. **결과 활용**: 생성이 완료되면 화면에서 내용을 확인하고, `[결과 복사]` 또는 `[Markdown 다운로드]` 버튼을 눌러 소장합니다.

---

## 🔒 보안 및 주의사항

- `.env` 파일에는 개인 고유의 API Key가 들어 있으므로, **절대로 GitHub 원격 저장소나 외부에 유출되지 않도록 주의**하십시오.
- 본 프로젝트는 `.gitignore`에 `.env`와 `venv/`가 기본 등록되어 있어 안전하게 관리됩니다.

---

## 📄 라이선스

This project is licensed under the MIT License.
