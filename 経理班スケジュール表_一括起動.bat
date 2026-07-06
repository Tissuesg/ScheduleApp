@echo off
echo ====================================================
echo 経理班スケジュール表 一括起動スクリプト
echo ====================================================
echo.
echo バックエンド (データ処理側) と フロントエンド (画面表示側) を起動します...
echo.

:: バックエンドを新しいPowerShellウィンドウで起動
start "ScheduleApp Backend" powershell -NoExit -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Set-Location '%~dp0backend'; py main.py --host 0.0.0.0 --port 8000"

:: フロントエンドを新しいPowerShellウィンドウで起動
start "ScheduleApp Frontend" powershell -NoExit -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Set-Location '%~dp0frontend'; npm run dev -- --host 0.0.0.0"

echo.
echo 起動処理を開始しました。
echo 開いた2つのウィンドウ（PowerShell）は閉じずに、最小化して実行したままにしてください。
echo.
pause
