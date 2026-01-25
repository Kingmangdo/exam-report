# Visual Studio Build Tools 설치 확인 스크립트

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Visual Studio Build Tools 확인 중..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# vswhere 경로
$vswherePath = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"

if (-not (Test-Path $vswherePath)) {
    Write-Host "vswhere.exe를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "Visual Studio Build Tools가 설치되지 않았을 수 있습니다." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[1] Visual Studio 설치 경로 확인..." -ForegroundColor Green
$installPath = & $vswherePath -latest -property installationPath
if ($installPath) {
    Write-Host "설치 경로: $installPath" -ForegroundColor Green
} else {
    Write-Host "Visual Studio 설치를 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2] Visual Studio 버전 확인..." -ForegroundColor Green
$version = & $vswherePath -latest -property installationVersion
if ($version) {
    Write-Host "버전: $version" -ForegroundColor Green
} else {
    Write-Host "버전 정보를 가져올 수 없습니다." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3] C++ build tools 워크로드 확인..." -ForegroundColor Green
$hasVCTools = & $vswherePath -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
if ($hasVCTools) {
    Write-Host "C++ build tools 워크로드 설치됨" -ForegroundColor Green
} else {
    Write-Host "C++ build tools 워크로드가 설치되지 않았습니다!" -ForegroundColor Red
    Write-Host ""
    Write-Host "해결 방법:" -ForegroundColor Yellow
    Write-Host "  1. Visual Studio Installer 실행" -ForegroundColor White
    Write-Host "  2. 수정 클릭" -ForegroundColor White
    Write-Host "  3. C++ build tools 워크로드 선택" -ForegroundColor White
    Write-Host "  4. 설치 완료 후 컴퓨터 재시작" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "[4] Windows SDK 확인..." -ForegroundColor Green
$hasSDK = & $vswherePath -latest -requires Microsoft.VisualStudio.Component.Windows10SDK -property installationPath
if ($hasSDK) {
    Write-Host "Windows SDK 설치됨" -ForegroundColor Green
} else {
    Write-Host "Windows SDK가 설치되지 않았을 수 있습니다." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Visual Studio Build Tools 준비 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "이제 다음 명령어로 패키지를 설치할 수 있습니다:" -ForegroundColor White
Write-Host "  cd backend" -ForegroundColor Cyan
Write-Host '  $env:PYTHON = "C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe"' -ForegroundColor Cyan
Write-Host "  npm.cmd install" -ForegroundColor Cyan
