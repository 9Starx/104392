@echo off
chcp 65001 >nul
echo.
echo ====================================
echo     清空 Git 歷史並同步遠端
echo ====================================
echo.

REM 檢查Git是否安裝
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤：Git 尚未安裝
    echo 請先安裝 Git: https://git-scm.com/download/win
    echo 或執行: winget install Git.Git
    pause
    exit /b 1
)

echo ✅ Git 已安裝

REM 檢查是否是Git倉庫
if not exist .git (
    echo ❌ 錯誤：當前目錄不是Git倉庫
    pause
    exit /b 1
)

echo ✅ 檢測到Git倉庫
echo.

REM 獲取當前遠端URL（如果存在）
echo 🔍 檢查遠端倉庫設定...
git remote -v >nul 2>&1
if errorlevel 1 (
    echo ⚠️  沒有設定遠端倉庫
    set HAS_REMOTE=false
) else (
    echo ✅ 檢測到遠端倉庫設定
    git remote -v
    set HAS_REMOTE=true
)

echo.
echo ⚠️  警告：此操作將會：
echo    1. 完全清空所有Git歷史記錄
echo    2. 創建一個全新的初始commit
echo    3. 強制推送到遠端（如果存在）
echo.
echo ❓ 確定要繼續嗎？(Y/N)
set /p CONFIRM=
if /i not "%CONFIRM%"=="Y" (
    echo 操作已取消
    pause
    exit /b 0
)

echo.
echo 🗑️ 步驟 1/4: 備份當前遠端設定...
git remote -v > remote_backup.txt 2>nul

echo 🚀 步驟 2/4: 創建新的Git歷史...
REM 刪除.git目錄並重新初始化
rmdir /s /q .git
git init

echo 📁 步驟 3/4: 添加所有文件並創建初始commit...
git add .
git commit -m "Initial commit"

echo 🔄 步驟 4/4: 恢復遠端設定並同步...
if "%HAS_REMOTE%"=="true" (
    REM 讀取備份的遠端設定
    for /f "tokens=1,2" %%a in ('type remote_backup.txt 2^>nul ^| findstr "origin.*push"') do (
        set REMOTE_URL=%%b
    )
    
    if defined REMOTE_URL (
        echo 🔗 恢復遠端倉庫設定...
        git remote add origin !REMOTE_URL!
        
        echo 📤 強制推送到遠端...
        git branch -M main
        git push -u origin main --force
        
        if errorlevel 1 (
            echo ❌ 推送失敗，請檢查遠端倉庫權限
        ) else (
            echo ✅ 成功同步到遠端倉庫
        )
    )
)

REM 清理備份文件
del remote_backup.txt >nul 2>&1

echo.
echo 🎉 操作完成！
echo 📊 結果：
echo    - Git 歷史已完全重置
echo    - 創建了一個新的初始 commit
if "%HAS_REMOTE%"=="true" (
    echo    - 已同步到遠端倉庫
)
echo.
pause 