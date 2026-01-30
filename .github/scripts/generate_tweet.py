import os
import sys
import requests
import json
import traceback

# --- 環境設定 ---
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")
COMMIT_MESSAGE = sys.argv[1] if len(sys.argv) > 1 else "Update"

# --- ノイズ除去 ---
IGNORE_KEYWORDS = ["merge", "fix typo", "readme", "docs", "lint", "wip"]
if any(keyword in COMMIT_MESSAGE.lower() for keyword in IGNORE_KEYWORDS) or len(COMMIT_MESSAGE) < 5:
    print("Skipping: Trivial commit.")
    sys.exit(0)

# --- AIペルソナ ---
SYSTEM_PROMPT = """
あなたは「Lore-Anchor」を開発する19歳のエンジニアだ。
クリエイターの権利を守るため、寝食を忘れてコードを書いている。
コミットメッセージを元に、X（Twitter）への投稿案を3つ作成せよ。

【制約】
・一人称「僕」、タメ口、情熱的。
・「勉強中」「初心者」禁止。プロとして振る舞え。
・ハッシュタグ: #LoreAnchor #BuildInPublic

【出力形式】
案1: [内容]
案2: [内容]
案3: [内容]
"""

# --- APIコール ---
try:
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    # ★ ここを修正しました（最新モデルIDに変更）
    data = {
        "model": "claude-3-5-sonnet-20241022", 
        "max_tokens": 500,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": f"作業内容: {COMMIT_MESSAGE}"}]
    }

    response = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"Error: {response.status_code}, {response.text}")
        sys.exit(1)
        
    result = response.json()
    tweet_drafts = result['content'][0]['text']

    # --- Discord通知 ---
    discord_data = {
        "username": "Ghostwriter",
        "content": f"🛠 **Commit Logged**\n`{COMMIT_MESSAGE}`\n\n{tweet_drafts}"
    }
    requests.post(DISCORD_WEBHOOK_URL, json=discord_data)
    print("Success!")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
