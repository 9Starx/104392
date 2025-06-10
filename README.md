# 智能對話系統

基於Firebase的智能對話系統，支援AI模型整合與即時訊息處理。

## 專案結構

```
├── index.html          # 主要前端頁面
├── admin.html          # 管理後台頁面
├── config.json         # 系統配置檔案
├── prompts.json        # AI提示詞配置
├── functions/          # Firebase雲端函數
│   ├── index.js       # 雲端函數主程式
│   └── package.json   # 依賴管理
├── firebase.json       # Firebase專案配置
├── firestore.rules     # Firestore安全規則
├── firestore.indexes.json  # Firestore索引配置
├── storage.rules       # Storage安全規則
└── CNAME              # 自定義域名設定

```

## 部署至GitHub Pages

1. 將專案推送至GitHub repository
2. 在GitHub專案設定中啟用Pages功能
3. 設定自定義域名（可選）

## Firebase部署

```bash
# 安裝Firebase CLI
npm install -g firebase-tools

# 登入Firebase
firebase login

# 部署專案
firebase deploy
```

## 本地開發

1. 啟動Firebase模擬器：
```bash
cd functions
npm install
firebase emulators:start
```

2. 開啟瀏覽器訪問 `http://localhost:5000`

## 技術棧

- **前端**: HTML, CSS, JavaScript
- **後端**: Firebase Functions (Node.js)
- **資料庫**: Firestore
- **儲存**: Firebase Storage
- **部署**: GitHub Pages + Firebase Hosting

## 授權

此專案為私人專案，版權所有。 