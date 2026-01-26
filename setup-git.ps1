# Git 저장소 초기 설정 스크립트

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "독강영어학원 성적표 시스템 - Git 설정" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Git 설치 확인
Write-Host "[1/5] Git 설치 확인 중..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Git이 설치되어 있습니다: $gitVersion" -ForegroundColor Green
    } else {
        throw "Git이 설치되어 있지 않습니다"
    }
} catch {
    Write-Host "❌ Git이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "Git 설치 방법:" -ForegroundColor Yellow
    Write-Host "1. https://git-scm.com/download/win 접속" -ForegroundColor White
    Write-Host "2. 다운로드 후 설치" -ForegroundColor White
    Write-Host "3. 설치 완료 후 이 스크립트를 다시 실행하세요" -ForegroundColor White
    Write-Host ""
    Read-Host "계속하려면 Enter를 누르세요"
    exit
}

Write-Host ""

# 현재 디렉토리 확인
$projectPath = $PSScriptRoot
if (-not $projectPath) {
    $projectPath = Get-Location
}

Write-Host "[2/5] 프로젝트 경로: $projectPath" -ForegroundColor Yellow
Write-Host ""

# Git 저장소 초기화 확인
Write-Host "[3/5] Git 저장소 상태 확인 중..." -ForegroundColor Yellow
if (Test-Path "$projectPath\.git") {
    Write-Host "✅ Git 저장소가 이미 초기화되어 있습니다." -ForegroundColor Green
} else {
    Write-Host "⚠️  Git 저장소가 초기화되지 않았습니다." -ForegroundColor Yellow
    $init = Read-Host "Git 저장소를 초기화하시겠습니까? (y/n)"
    if ($init -eq "y" -or $init -eq "Y") {
        Set-Location $projectPath
        git init
        Write-Host "✅ Git 저장소가 초기화되었습니다." -ForegroundColor Green
    } else {
        Write-Host "❌ Git 저장소 초기화를 건너뜁니다." -ForegroundColor Red
        exit
    }
}

Write-Host ""

# 파일 추가 확인
Write-Host "[4/5] 변경된 파일 확인 중..." -ForegroundColor Yellow
Set-Location $projectPath
$status = git status --short
if ($status) {
    Write-Host "변경된 파일:" -ForegroundColor Cyan
    git status --short
    Write-Host ""
    $add = Read-Host "모든 파일을 스테이징 영역에 추가하시겠습니까? (y/n)"
    if ($add -eq "y" -or $add -eq "Y") {
        git add .
        Write-Host "✅ 모든 파일이 추가되었습니다." -ForegroundColor Green
    }
} else {
    Write-Host "✅ 변경된 파일이 없습니다." -ForegroundColor Green
}

Write-Host ""

# 커밋 확인
Write-Host "[5/5] 커밋 상태 확인 중..." -ForegroundColor Yellow
$commits = git log --oneline 2>&1
if ($LASTEXITCODE -eq 0 -and $commits) {
    Write-Host "✅ 커밋이 있습니다." -ForegroundColor Green
    Write-Host "최근 커밋:" -ForegroundColor Cyan
    git log --oneline -5
} else {
    Write-Host "⚠️  아직 커밋이 없습니다." -ForegroundColor Yellow
    $commit = Read-Host "초기 커밋을 생성하시겠습니까? (y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        $message = Read-Host "커밋 메시지를 입력하세요 (기본값: Initial commit)"
        if (-not $message) {
            $message = "Initial commit: 독강영어학원 성적표 시스템"
        }
        git commit -m $message
        Write-Host "✅ 커밋이 생성되었습니다." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Git 설정 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. GitHub.com에서 새 저장소 생성" -ForegroundColor White
Write-Host "2. 다음 명령어 실행:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/사용자명/exam-report.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "자세한 내용은 GITHUB_SETUP_GUIDE.md 파일을 참고하세요." -ForegroundColor Yellow
Write-Host ""
