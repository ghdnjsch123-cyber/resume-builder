// 웹 문서(DOM)가 모두 로드된 후 스크립트 실행
document.addEventListener("DOMContentLoaded", () => {
    // 1. 필요한 HTML 요소(DOM) 가져오기
    const form = document.getElementById("resume-form");
    const nameInput = document.getElementById("name");
    const jobTitleInput = document.getElementById("job-title");
    const experienceInput = document.getElementById("experience");
    const projectsInput = document.getElementById("projects");
    const toneSelect = document.getElementById("tone");
    const generateBtn = document.getElementById("generate-btn");

    const placeholderBox = document.getElementById("placeholder-box");
    const loadingBox = document.getElementById("loading-box");
    const errorBox = document.getElementById("error-box");
    const resultBox = document.getElementById("result-box");
    const resultContent = document.getElementById("result-content");
    const actionButtons = document.getElementById("action-buttons");
    const copyBtn = document.getElementById("copy-btn");
    const downloadBtn = document.getElementById("download-btn");

    // 2. 오류 메시지 표시 헬퍼 함수
    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = "block";
    }

    // 3. 오류 메시지 숨기기 헬퍼 함수
    function hideError() {
        errorBox.textContent = "";
        errorBox.style.display = "none";
    }

    // 4. 로딩 상태 전환 함수 (true: 로딩 중, false: 로딩 종료)
    function setLoading(isLoading) {
        if (isLoading) {
            hideError();
            placeholderBox.style.display = "none";
            resultBox.style.display = "none";
            actionButtons.style.display = "none";
            loadingBox.style.display = "block";

            generateBtn.disabled = true;
            generateBtn.textContent = "AI 포트폴리오 작성 중입니다...";
        } else {
            loadingBox.style.display = "none";
            generateBtn.disabled = false;
            generateBtn.textContent = "AI 이력서 및 포트폴리오 생성하기";
        }
    }

    // 5. 폼 제출(Submit) 이벤트 처리
    form.addEventListener("submit", async (event) => {
        // 브라우저의 기본 페이지 새로고침 방지
        event.preventDefault();

        // 사용자 입력값 가져오기
        const name = nameInput.value.trim();
        const jobTitle = jobTitleInput.value.trim();
        const experience = experienceInput.value.trim();
        const projects = projectsInput.value.trim();
        const tone = toneSelect.value;
        const promptTypeRadio = document.querySelector('input[name="prompt_type"]:checked');
        const promptType = promptTypeRadio ? promptTypeRadio.value : "A";

        // 프론트엔드 입력값 검증 (Validation)
        if (!name || !jobTitle || !experience || !projects) {
            showError("모든 필수 입력 항목(*)을 입력해 주세요.");
            return;
        }

        // 로딩 시작
        setLoading(true);

        try {
            // 백엔드 Flask의 /generate 엔드포인트로 비동기 POST 요청
            const response = await fetch("/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    job_title: jobTitle,
                    experience: experience,
                    projects: projects,
                    tone: tone,
                    prompt_type: promptType,
                }),
            });

            const data = await response.json();

            // 백엔드 응답 검증
            if (!response.ok || !data.success) {
                const errorMessage = data.error || "AI 생성 요청 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.";
                showError(errorMessage);
                placeholderBox.style.display = "block";
                return;
            }

            // 성공: 생성된 결과 화면에 출력
            resultContent.textContent = data.result;
            resultBox.style.display = "block";
            actionButtons.style.display = "flex";

        } catch (error) {
            console.error("통신 오류 발생:", error);
            showError("서버와의 통신 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해 주세요.");
            placeholderBox.style.display = "block";
        } finally {
            // 로딩 종료
            setLoading(false);
        }
    });

    // 6. 결과 텍스트 복사 버튼 기능
    copyBtn.addEventListener("click", async () => {
        const textToCopy = resultContent.textContent;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "복사 완료";
            copyBtn.style.backgroundColor = "#111111";
            copyBtn.style.color = "#ffffff";

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = "";
                copyBtn.style.color = "";
            }, 2000);
        } catch (err) {
            console.error("클립보드 복사 실패:", err);
            alert("클립보드 복사에 실패했습니다. 수동으로 텍스트를 복사해 주세요.");
        }
    });

    // 7. Markdown 파일 다운로드 기능 (.md)
    downloadBtn.addEventListener("click", () => {
        const textToDownload = resultContent.textContent;
        if (!textToDownload) return;

        // 지원자 이름 기반의 파일명 생성
        const userName = nameInput.value.trim() || "resume";
        const sanitizedUserName = userName.replace(/[^a-zA-Z0-9가-힣_-]/g, "");
        const fileName = `${sanitizedUserName}_이력서_포트폴리오.md`;

        // 마크다운 Blob 생성 및 가상 다운로드 링크 트리거
        const blob = new Blob([textToDownload], { type: "text/markdown;charset=utf-8;" });
        const downloadUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement("a");

        tempLink.href = downloadUrl;
        tempLink.download = fileName;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);

        // 메모리 해제
        URL.revokeObjectURL(downloadUrl);
    });

    // 8. PWA Service Worker 등록
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/sw.js")
                .then((reg) => {
                    console.log("Service Worker 등록 완료. Scope:", reg.scope);
                })
                .catch((err) => {
                    console.error("Service Worker 등록 실패:", err);
                });
        });
    }
});
