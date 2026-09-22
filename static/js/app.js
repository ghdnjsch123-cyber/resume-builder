// ==========================================================
// 1. PWA 즉시 등록 및 설치 프롬프트 캡처 (최상위 실행)
// ==========================================================
let deferredPrompt = null;

// PWA 설치 프롬프트 이벤트 리스너를 페이지 초기화 즉시 등록
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("[PWA] beforeinstallprompt 이벤트 발생 감지 완료");
    const banner = document.getElementById("pwa-install-banner");
    if (banner) {
        banner.style.display = "block";
    }
});

// Service Worker 즉시 등록 (window.load 대기 제거)
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
            console.log("[PWA] Service Worker 등록 완료. Scope:", reg.scope);
        })
        .catch((err) => {
            console.error("[PWA] Service Worker 등록 실패:", err);
        });
}

// 설치 완료 이벤트
window.addEventListener("appinstalled", () => {
    console.log("[PWA] 앱 설치 완료");
    deferredPrompt = null;
    const banner = document.getElementById("pwa-install-banner");
    if (banner) {
        banner.style.display = "none";
    }
});

// ==========================================================
// 2. DOMContentLoaded: 화면 UI 및 폼 이벤트
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
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

    const installBanner = document.getElementById("pwa-install-banner");
    const installBtn = document.getElementById("pwa-install-btn");

    // 이미 설치된 독립 창(standalone 모드)에서 실행 중이면 배너 숨김
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (isStandalone && installBanner) {
        installBanner.style.display = "none";
    }

    // PWA 설치 버튼 클릭 핸들러
    if (installBtn) {
        installBtn.addEventListener("click", async () => {
            if (deferredPrompt) {
                // 브라우저 네이티브 설치 창 호출
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log("[PWA] 사용자 응답:", outcome);
                if (outcome === "accepted") {
                    deferredPrompt = null;
                    if (installBanner) installBanner.style.display = "none";
                }
            } else {
                // 안드로이드 크롬 등에서 beforeinstallprompt가 지연되거나 이미 설치된 경우
                alert("크롬 브라우저 우측 상단 점 세 개(⋮) 메뉴를 누르신 후, [앱 설치] 또는 [홈 화면에 추가]를 눌러주시면 즉시 설치됩니다.");
            }
        });
    }

    // 에러 표시
    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = "block";
    }

    // 에러 숨김
    function hideError() {
        errorBox.textContent = "";
        errorBox.style.display = "none";
    }

    // 로딩 상태 전환
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

    // 폼 제출 이벤트
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const jobTitle = jobTitleInput.value.trim();
        const experience = experienceInput.value.trim();
        const projects = projectsInput.value.trim();
        const tone = toneSelect.value;
        const promptTypeRadio = document.querySelector('input[name="prompt_type"]:checked');
        const promptType = promptTypeRadio ? promptTypeRadio.value : "A";

        if (!name || !jobTitle || !experience || !projects) {
            showError("모든 필수 입력 항목(*)을 입력해 주세요.");
            return;
        }

        setLoading(true);

        try {
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

            if (!response.ok || !data.success) {
                const errorMessage = data.error || "AI 생성 요청 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.";
                showError(errorMessage);
                placeholderBox.style.display = "block";
                return;
            }

            resultContent.textContent = data.result;
            resultBox.style.display = "block";
            actionButtons.style.display = "flex";

        } catch (error) {
            console.error("통신 오류 발생:", error);
            showError("서버와의 통신 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해 주세요.");
            placeholderBox.style.display = "block";
        } finally {
            setLoading(false);
        }
    });

    // 복사 버튼
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

    // 다운로드 버튼
    downloadBtn.addEventListener("click", () => {
        const textToDownload = resultContent.textContent;
        if (!textToDownload) return;

        const userName = nameInput.value.trim() || "resume";
        const sanitizedUserName = userName.replace(/[^a-zA-Z0-9가-힣_-]/g, "");
        const fileName = `${sanitizedUserName}_이력서_포트폴리오.md`;

        const blob = new Blob([textToDownload], { type: "text/markdown;charset=utf-8;" });
        const downloadUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement("a");

        tempLink.href = downloadUrl;
        tempLink.download = fileName;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);

        URL.revokeObjectURL(downloadUrl);
    });
});
