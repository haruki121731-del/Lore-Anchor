# 🛡️ Lore-Anchor Patrol

著作権侵害検知 & 削除要請自動生成システム（MVP）

## 概要

Lore-Anchor Patrolは、ユーザーがアップロードした画像がWeb上で無断転載されていないかを監視し、発見した場合は法的削除要請文を自動生成して、権利回復（削除率70%目標）を支援するアプリケーションです。

## 機能

- 🔍 **画像逆検索**: Google Lens経由で類似画像を検索
- ✅ **ホワイトリスト判定**: 正規サイトと疑わしいサイトを自動分類
- 📝 **削除要請文自動生成**: 法的根拠に基づいた削除要請テンプレート
- 🧪 **Mockモード**: APIキー不要でテスト可能

## 技術スタック

- **言語**: Python 3.10+
- **フレームワーク**: Streamlit
- **検索エンジン**: SerpApi (Google Lens)
- **環境管理**: python-dotenv

## セットアップ

### 1. 依存関係のインストール

```bash
pip install -r requirements.txt
```

### 2. 環境変数の設定

`.env`ファイルを編集し、SerpApi APIキーを設定します（オプション）:

```
SERPAPI_KEY=your_api_key_here
```

APIキーがない場合、Mockモードで動作します（ダミーデータを使用）。

### 3. アプリケーションの起動

```bash
streamlit run app.py
```

ブラウザで `http://localhost:8501` が自動的に開きます。

## 使い方

1. **サイドバー**から監視したい画像をアップロード
2. **正規URL**にオリジナル投稿先URLを入力
3. **ホワイトリスト**で許可するドメインを設定（カンマ区切り）
4. **パトロール開始**ボタンをクリック
5. 検出された疑わしいURLの削除要請文をコピー
6. 該当サイト運営者に送信

## ファイル構成

```
root/
├── app.py              # メインアプリケーション
├── requirements.txt    # 依存ライブラリ
├── .env                # APIキー管理
├── README.md           # プロジェクト説明
└── modules/
    ├── __init__.py
    ├── search_engine.py # SerpApi検索ロジック (Mock機能付き)
    ├── detector.py      # ホワイトリスト判定ロジック
    └── generator.py     # 削除要請文のテンプレート生成
```

## Mockモードについて

APIキーが未設定の場合、以下のダミーデータが返されます：

- `http://kangaipakattena-matome.com/entry/123` (無断転載まとめ速報)
- `https://twitter.com/my_account/status/1` (自分のツイート)
- `https://suspicious-site.net/gallery/img456` (フリー画像ギャラリー)
- `https://pixiv.net/artworks/98765432` (Pixiv - オリジナル投稿)

## ライセンス

MIT License

## 開発者

Lore-Anchor Team

## バージョン

1.0.0 (MVP)
