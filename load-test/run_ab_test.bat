@echo off
chcp 65001 >nul
setlocal

:: ============================================================
::  Нагрузочное испытание GET /api/health — Apache Bench
::  Таблица 4.3: 2000 запросов, параллельность 10
:: ============================================================

set TARGET=http://127.0.0.1:3000/api/health
set REQUESTS=2000
set CONCURRENCY=10
set OUTFILE=ab_result_%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%.txt

:: Полный путь к ab.exe
set AB_EXE=D:\приложения\httpd-2.4.67-260504-Win64-VS18\Apache24\bin\ab.exe

echo ============================================================
echo  Нагрузочное испытание API
echo  Цель       : %TARGET%
echo  Запросов   : %REQUESTS%
echo  Параллельно: %CONCURRENCY%
echo  Результат  : %OUTFILE%
echo ============================================================
echo.

:: Проверяем наличие ab.exe
if not exist "%AB_EXE%" (
    echo [ОШИБКА] ab.exe не найден по пути:
    echo   %AB_EXE%
    pause
    exit /b 1
)

echo Запуск ab...
echo.

:: Запуск Apache Bench
:: -n  число запросов
:: -c  параллельность
:: -k  keep-alive
:: -q  тихий режим (без прогресса)
"%AB_EXE%" -n %REQUESTS% -c %CONCURRENCY% -k -q %TARGET% > "%OUTFILE%" 2>&1

if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] ab завершился с кодом %ERRORLEVEL%
    echo Проверьте что сервер запущен на %TARGET%
    type "%OUTFILE%"
    pause
    exit /b 1
)

echo Результаты сохранены в: %OUTFILE%
echo.
echo ---- Краткая сводка ----------------------------------------
type "%OUTFILE%"
echo ------------------------------------------------------------
echo.
pause
endlocal
