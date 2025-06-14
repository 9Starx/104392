# 🚀 混合部署指導手冊

## 部署架構
- **Firebase**：資料庫、Storage、安全規則
- **GitHub Pages**：靜態網站託管

## 🔧 Firebase 資料庫部署

### 1. 安裝 Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. 設定專案
```bash
firebase use cny-90e4e
```

### 3. 部署資料庫規則和設定
```bash
# 部署 Firestore 規則
firebase deploy --only firestore:rules

# 部署 Storage 規則  
firebase deploy --only storage:rules

# 部署索引
firebase deploy --only firestore:indexes

# 一次部署所有資料庫相關設定
firebase deploy --only firestore,storage
```

## 🌐 GitHub Pages 靜態網站部署

### 方法一：手動部署

#### 1. 推送到 GitHub
```bash
git add .
git commit -m "準備部署到 GitHub Pages"
git push origin main
```

#### 2. 啟用 GitHub Pages
1. 前往 GitHub 專案設定
2. 選擇 Pages
3. Source 選擇 "Deploy from a branch"
4. Branch 選擇 "main"
5. 資料夾選擇 "/ (root)"

### 方法二：自動化部署（推薦）

#### 1. 設定 GitHub Secrets
前往 GitHub 專案 > Settings > Secrets and variables > Actions

添加以下 Secrets：
```
FIREBASE_TOKEN: （Firebase CI Token）
```

取得 Firebase Token：
```bash
firebase login:ci
```

#### 2. 推送程式碼
```bash
git add .
git commit -m "設定自動化部署"
git push origin main
```

自動化部署將會：
- 部署靜態網站到 GitHub Pages
- 同時部署 Firebase 規則

## 📊 資料庫安全規則

### Firestore 規則重點：
- **訂單集合**：允許讀取和創建，限制更新欄位
- **會員集合**：驗證手機號碼格式，限制狀態變更
- **設定集合**：只允許讀取
- **錯誤日誌**：只允許創建

### Storage 規則重點：
- 驗證台灣手機號碼格式（09xxxxxxxx）
- 僅允許圖片格式（jpg, jpeg, png, gif, webp）
- 檔案大小限制 2MB
- 禁止刪除檔案

## 🔒 安全性配置

### Firebase Console 設定：
1. **API 金鑰限制**：
   - 前往 Google Cloud Console
   - API 和服務 > 憑證
   - 編輯 API 金鑰
   - 添加 HTTP 參照者限制：
     ```
     https://yourusername.github.io/*
     https://your-custom-domain.com/*
     ```

2. **授權網域**：
   - Firebase Console > Authentication > Settings
   - 授權網域添加：
     ```
     yourusername.github.io
     your-custom-domain.com
     ```

## 🌐 自訂網域設定（可選）

### GitHub Pages 自訂網域：
1. 在專案根目錄確認 `CNAME` 檔案
#### 自訂網域（如果使用）：
1. 前往 Firebase Console > Hosting
2. 添加自訂網域
3. 設定 DNS 記錄
4. 等待 SSL 憑證自動配置

#### CNAME 檔案：
檔案 `CNAME` 已設定，內容請確認正確

### 🔒 安全性檢查

#### 必須確認的設定：
1. **Firebase API 金鑰**：已設定適當的 HTTP 參照者限制
2. **Firestore 規則**：已設定生產環境嚴格規則
3. **Storage 規則**：已限制檔案類型和大小
4. **HTTPS**：Firebase Hosting 自動啟用

### 📈 效能優化

#### 已實作的優化：
- 資源預載入和延遲載入
- 現代化 CSS Grid/Flexbox 佈局
- 圖片格式優化建議
- Service Worker 快取策略
- CDN 資源使用

### 🔧 監控設定

#### 建議設定的監控：
```javascript
// Google Analytics (可選)
// Firebase Performance Monitoring (建議)
// Firebase Crashlytics (建議)
```

### 📱 測試檢查清單

#### 上線前測試：
- [ ] 桌面版瀏覽器測試
- [ ] 手機版響應式測試
- [ ] 檔案上傳功能測試
- [ ] 會員註冊流程測試
- [ ] 訂單創建流程測試
- [ ] 管理後台功能測試
- [ ] 安全規則測試

### 🚨 上線後監控

#### 需要監控的指標：
1. **效能指標**：頁面載入時間、首次繪製時間
2. **錯誤監控**：JavaScript 錯誤、網路錯誤
3. **使用者行為**：轉換率、跳出率
4. **資料庫使用量**：讀寫次數、儲存空間

### 📞 技術支援

#### 如遇問題請檢查：
1. 瀏覽器開發者工具的 Console 面板
2. Firebase Console 的使用量和錯誤報告
3. 網路連線狀態

#### 緊急處理：
如需回滾至前一版本：
```bash
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION_ID TARGET_SITE_ID
```

---

## 🎉 部署完成後

### 驗證清單：
- [ ] 網站可正常訪問
- [ ] 所有功能正常運作
- [ ] 手機版顯示正常
- [ ] 檔案上傳正常
- [ ] 資料庫連接正常
- [ ] 效能表現良好

**恭喜！您的系統已成功上線！** 🚀 