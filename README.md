# 🛡️ Lore-Anchor Patrol MVP

著作権侵害検知 & 削除要請自動生成システム。
React + Vite フロントエンドと FastAPI バックエンドの構成になりました。

## Directory Structure
- `app/`: Frontend (React, Vite, TypeScript)
- `api/`: Backend (FastAPI, Python)

## Features
- 🔍 **画像逆検索**: Google Lens経由で類似画像を検索
- ✅ **ホワイトリスト判定**: 正規サイトと疑わしいサイトを自動分類
- 📝 **削除要請文自動生成**: 法的根拠に基づいた削除要請テンプレート
- 🧪 **Mockモード**: APIキー不要でテスト可能

## Setup & Run

### 1. Backend (API)
```bash
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
API runs at http://localhost:8000.
Docs at http://localhost:8000/docs.

**Environment Variables**:
Create `.env` in `api/` directory with:
```
SERPAPI_KEY=your_api_key
```

### 2. Frontend (App)
```bash
cd app
npm install
npm run dev
```
App runs at http://localhost:5173.

## License
MIT License

## Developers
Lore-Anchor Team
