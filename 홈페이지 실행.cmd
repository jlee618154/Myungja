@echo off
setlocal
set "SITE_DIR=%~dp0"
set "PYTHON_EXE=C:\Users\UserK\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
set "SITE_PORT=8877"

if not exist "%PYTHON_EXE%" (
  echo 홈페이지 실행 도구를 찾을 수 없습니다.
  echo 이 파일과 같은 폴더의 index.html을 일반 브라우저에서 열어주세요.
  pause
  exit /b 1
)

start "MYUNGJA Local Server" /min "%PYTHON_EXE%" -m http.server %SITE_PORT% --bind 127.0.0.1 --directory "%SITE_DIR%"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:%SITE_PORT%/index.html"
endlocal
