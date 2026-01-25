# 독강영어학원 성적표 시스템 - 전체 패키지 설치 스크립트

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "패키지 설치를 시작합니다..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Python 경로 설정
$env:PYTHON = "C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe"

# 백엔드 설치
Write-Host "`n[1/2] 백엔드 패키지 설치 중..." -ForegroundColor Green
Set-Location backend
if (Test-Path "package.json") {
    npm.cmd install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 백엔드 설치 완료!" -ForegroundColor Green
    } else {
        Write-Host "❌ 백엔드 설치 실패" -ForegroundColor Red
        Write-Host "Visual Studio Build Tools가 필요할 수 있습니다." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ package.json을 찾을 수 없습니다." -ForegroundColor Red
}
Set-Location ..

# 프론트엔드 설치
Write-Host "`n[2/2] 프론트엔드 패키지 설치 중..." -ForegroundColor Green
Set-Location frontend
if (Test-Path "package.json") {
    npm.cmd install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 프론트엔드 설치 완료!" -ForegroundColor Green
    } else {
        Write-Host "❌ 프론트엔드 설치 실패" -ForegroundColor Red
    }
} else {
    Write-Host "❌ package.json을 찾을 수 없습니다." -ForegroundColor Red
}
Set-Location ..

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "설치 완료!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
