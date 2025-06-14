# 🚀 簡易部署指南

## 🔥 步驟一：部署資料庫到 Firebase

```bash
# 1. 安裝 Firebase CLI
npm install -g firebase-tools

# 2. 登入 Firebase
firebase login

# 3. 設定專案
firebase use cny-90e4e

# 4. 部署資料庫規則
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

## 🌐 步驟二：部署網站到 GitHub Pages

### 手動部署（推薦新手）：

1. **推送程式碼到 GitHub**
```bash
git add .
git commit -m "準備部署"
git push origin main
```

2. **啟用 GitHub Pages**
   - 前往 GitHub 專案設定
   - 點選 "Pages"
   - Source 選擇 "Deploy from a branch"
   - Branch 選擇 "main"
   - 點選 "Save"

3. **設定安全性**
   - 前往 Google Cloud Console
   - 找到您的 Firebase 專案
   - API 和服務 > 憑證
   - 編輯 API 金鑰，添加網域限制：
     ```
     https://yourusername.github.io/*
     ```

## ✅ 完成！

**您的網站將在 5-10 分鐘內上線：**
- 主網站：`https://yourusername.github.io/your-repo-name`
- 管理後台：`https://yourusername.github.io/your-repo-name/admin.html`

## 🔧 常見問題

**Q: Firebase 連接錯誤？**
A: 檢查 Google Cloud Console 的 API 金鑰限制設定

**Q: 頁面顯示 404？**
A: 等待 5-10 分鐘，GitHub Pages 需要時間建置

**Q: 檔案上傳失敗？**
A: 確認已執行 `firebase deploy --only storage:rules` 