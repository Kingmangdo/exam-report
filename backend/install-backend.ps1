# 백엔드 패키지 설치 스크립트 (Visual Studio Build Tools 인식 개선)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "백엔드 패키지 설치 시작..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Python 경로 설정
$env:PYTHON = "C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe"
Write-Host "`nPython 경로 설정: $env:PYTHON" -ForegroundColor Green

# Visual Studio Build Tools 경로 확인 및 설정
$vsPath = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools"
$vsPath2022 = "C:\Program Files\Microsoft Visual Studio\2022\BuildTools"
$vsPath18 = "C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools"

# Visual Studio 18 = Visual Studio 2022
$env:GYP_MSVS_VERSION = "2022"

if (Test-Path $vsPath) {
    $env:VCINSTALLDIR = "$vsPath\VC"
    $env:VSINSTALLDIR = $vsPath
    Write-Host "Visual Studio 2022 BuildTools 발견: $vsPath" -ForegroundColor Green
} elseif (Test-Path $vsPath2022) {
    $env:VCINSTALLDIR = "$vsPath2022\VC"
    $env:VSINSTALLDIR = $vsPath2022
    Write-Host "Visual Studio 2022 BuildTools 발견: $vsPath2022" -ForegroundColor Green
} elseif (Test-Path $vsPath18) {
    $env:VCINSTALLDIR = "$vsPath18\VC"
    $env:VSINSTALLDIR = $vsPath18
    Write-Host "Visual Studio BuildTools 발견 (18=2022): $vsPath18" -ForegroundColor Green
    
    # Visual Studio 18의 실제 버전 확인
    $versionFile = "$vsPath18\Common7\IDE\devenv.exe"
    if (Test-Path $versionFile) {
        $versionInfo = (Get-Item $versionFile).VersionInfo
        Write-Host "  버전: $($versionInfo.FileVersion)" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  Visual Studio Build Tools를 찾을 수 없습니다." -ForegroundColor Yellow
    Write-Host "   vswhere로 검색 중..." -ForegroundColor Yellow
    
    # vswhere로 찾기 시도
    $vswherePath = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
    if (Test-Path $vswherePath) {
        try {
            $vsInstallPath = & $vswherePath -latest -property installationPath 2>$null
            if ($vsInstallPath -and (Test-Path $vsInstallPath)) {
                $env:GYP_MSVS_VERSION = "2022"
                $env:VCINSTALLDIR = "$vsInstallPath\VC"
                $env:VSINSTALLDIR = $vsInstallPath
                Write-Host "✅ vswhere로 Visual Studio 발견: $vsInstallPath" -ForegroundColor Green
            }
        } catch {
            Write-Host "  vswhere 실행 실패" -ForegroundColor Yellow
        }
    }
}

# .npmrc 파일 생성 (npm config는 최신 버전에서 작동하지 않을 수 있음)
Write-Host "`.npmrc 파일 생성 중..." -ForegroundColor Green
$npmrcContent = @"
msvs_version=2022
python=$env:PYTHON
"@
$npmrcContent | Out-File -FilePath ".npmrc" -Encoding utf8 -NoNewline
Write-Host "✅ .npmrc 파일 생성 완료" -ForegroundColor Green

# 환경 변수 출력
Write-Host "`n설정된 환경 변수:" -ForegroundColor Cyan
Write-Host "  PYTHON: $env:PYTHON" -ForegroundColor White
Write-Host "  GYP_MSVS_VERSION: $env:GYP_MSVS_VERSION" -ForegroundColor White
Write-Host "  VCINSTALLDIR: $env:VCINSTALLDIR" -ForegroundColor White

# 패키지 설치
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "패키지 설치 시작..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

npm.cmd install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ 백엔드 패키지 설치 완료!" -ForegroundColor Green
} else {
    Write-Host "`n❌ 패키지 설치 실패" -ForegroundColor Red
    Write-Host "`n다음 사항을 확인해주세요:" -ForegroundColor Yellow
    Write-Host "  1. Visual Studio Build Tools가 올바르게 설치되었는지" -ForegroundColor White
    Write-Host "  2. 'C++ build tools' 워크로드가 설치되었는지" -ForegroundColor White
    Write-Host "  3. 터미널을 재시작했는지" -ForegroundColor White
    exit 1
}
