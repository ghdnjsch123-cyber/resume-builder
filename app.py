import os
import logging
from flask import Flask, render_template, request, jsonify, send_from_directory
from dotenv import load_dotenv
from google import genai

# 1. .env 파일에서 환경변수 로드
load_dotenv()

# 2. 백엔드 로깅 설정 (요청, 응답, 에러 추적)
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)
logger = logging.getLogger(__name__)

# 3. Flask 앱 인스턴스 생성
app = Flask(__name__)

# Gemini 클라이언트 초기화 헬퍼 함수
def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key.strip() == "" or api_key == "your_gemini_api_key_here":
        raise ValueError("유효한 GEMINI_API_KEY가 설정되지 않았습니다. .env 파일에 실제 API 키를 입력해 주세요.")
    return genai.Client(api_key=api_key)

# 메인 페이지 라우트
@app.route("/")
def index():
    logger.info("메인 페이지('/') 접근 요청")
    return render_template("index.html")

# PWA 매니페스트 및 서비스 워커 서빙 라우트
@app.route("/manifest.json")
def manifest():
    static_dir = os.path.join(app.root_path, "static")
    response = send_from_directory(static_dir, "manifest.json", mimetype="application/manifest+json")
    response.headers["Cache-Control"] = "no-cache"
    return response

@app.route("/sw.js")
def service_worker():
    static_dir = os.path.join(app.root_path, "static")
    response = send_from_directory(static_dir, "sw.js", mimetype="application/javascript")
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Service-Worker-Allowed"] = "/"
    return response

# AI 이력서 및 포트폴리오 생성 API 라우트
@app.route("/generate", methods=["POST"])
def generate():
    logger.info("이력서 및 포트폴리오 생성('/generate') 요청 수신")
    
    try:
        # 클라이언트 JSON 데이터 파싱
        data = request.get_json()
        if not data:
            logger.warning("요청 본문(Body)에 JSON 데이터가 없습니다.")
            return jsonify({"success": False, "error": "요청 데이터가 올바르지 않습니다."}), 400

        # 필수 입력값 추출
        name = data.get("name", "").strip()
        job_title = data.get("job_title", "").strip()
        experience = data.get("experience", "").strip()
        projects = data.get("projects", "").strip()
        tone = data.get("tone", "전문적인").strip()
        prompt_type = data.get("prompt_type", "A").strip()

        # 백엔드 입력값 검증 (Validation)
        missing_fields = []
        if not name:
            missing_fields.append("이름")
        if not job_title:
            missing_fields.append("지원 직무")
        if not experience:
            missing_fields.append("주요 경력")
        if not projects:
            missing_fields.append("프로젝트 경험")

        if missing_fields:
            error_msg = f"필수 항목이 누락되었습니다: {', '.join(missing_fields)}"
            logger.warning(f"입력 검증 실패: {error_msg}")
            return jsonify({"success": False, "error": error_msg}), 400

        logger.info(f"입력 검증 통과 - 지원자: {name}, 직무: {job_title}, 모드: Prompt {prompt_type}, Tone: {tone}")

        # 프롬프트 엔지니어링: 모드에 따른 역할 및 전략 정의
        if prompt_type == "B":
            # Prompt B: 전문가 모드 (STAR 기법, 정량적 성과, 시니어 컨설턴트 관점)
            system_instruction = (
                "당신은 테크 기업의 최고 채용담당자(Head of Talent)이자 전문 커리어 컨설턴트입니다. "
                "지원자의 정보를 바탕으로 서류 합격률을 극대화할 수 있는 강력하고 전문적인 이력서(Resume)와 포트폴리오(Portfolio)를 작성하세요. "
                "STAR(Situation, Task, Action, Result) 기법을 적극 활용하고, 정량적 수치와 비즈니스 임팩트를 강조하세요."
            )
        else:
            # Prompt A: 일반 모드 (가독성 중심, 명확하고 친절한 표준 이력서)
            system_instruction = (
                "당신은 친절하고 유능한 커리어 코치입니다. "
                "지원자의 경험과 역량이 한눈에 명확히 들어오도록 깔끔하고 균형 잡힌 표준 이력서(Resume)와 포트폴리오(Portfolio) 초안을 작성하세요. "
                "이해하기 쉽고 단정하며 논리적인 문장 구조를 사용하세요."
            )

        # AI에 전달할 전체 프롬프트 구성
        prompt = f"""
{system_instruction}

[지원자 기본 정보]
- 이름: {name}
- 지원 직무: {job_title}
- 주요 경력 사항:
{experience}
- 수행 프로젝트 경험:
{projects}
- 요청 어조(Tone): {tone}

[작성 요구사항]
1. 전체 결과물은 완성도 높은 마크다운(Markdown) 문서 형식으로 작성하세요.
2. 문서는 크게 아래 두 파트로 명확하게 나누어 작성하세요:
   # 1. 이력서 (Resume)
   # 2. 포트폴리오 (Portfolio)
3. [이력서 파트]에는 다음 항목을 포함하세요:
   - 프로필 요약 (Profile Summary)
   - 핵심 역량 (Core Competencies)
   - 주요 경력 사항 (Work Experience - 직무, 역할, 성과 정리)
   - 학력 및 기타 (Education & Certifications - 가이드라인 예시 포함)
4. [포트폴리오 파트]에는 프로젝트별로 다음 구조를 갖추어 상세히 기술하세요:
   - 프로젝트명 및 한 줄 소개
   - 수행 기간 및 본인의 역할/기여도
   - 사용 기술 스택 (Tech Stack)
   - 핵심 구현 내용 및 해결한 문제
   - 성과 및 배운 점 (Key Outcomes & Learnings)
5. 요청된 어조('{tone}')를 일관성 있게 유지하여 자연스러운 문장으로 작성하세요.
"""

        # Gemini API 클라이언트 호출
        client = get_gemini_client()
        logger.info("Gemini API 모델 호출 시작 (model: gemini-3.5-flash-lite)")

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        result_text = response.text
        if not result_text:
            logger.error("Gemini API에서 빈 응답이 반환되었습니다.")
            return jsonify({"success": False, "error": "AI 생성 결과가 비어있습니다. 다시 시도해 주세요."}), 500

        logger.info(f"Gemini API 응답 생성 완료 (결과 글자 수: {len(result_text)}자)")

        return jsonify({
            "success": True,
            "result": result_text
        })

    except ValueError as ve:
        logger.error(f"환경설정 오류: {str(ve)}")
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        logger.error(f"서버 내부 오류 발생: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": f"AI 생성 중 오류가 발생했습니다: {str(e)}"
        }), 500

# 개발 서버 실행
if __name__ == "__main__":
    logger.info("AI 포트폴리오 작성 웹 서버 구동 시작: http://127.0.0.1:5000")
    app.run(debug=True, host="127.0.0.1", port=5000)
