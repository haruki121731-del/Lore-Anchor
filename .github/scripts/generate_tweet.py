import os
import sys
import requests
import json

# 環境変数からキーを取得
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")
COMMIT_MESSAGE = sys.argv[1]

# --- 1. ノイズ除去 ---
IGNORE_KEYWORDS = ["merge", "fix typo", "readme", "docs", "lint", "wip"]
if any(keyword in COMMIT_MESSAGE.lower() for keyword in IGNORE_KEYWORDS) or len(COMMIT_MESSAGE) < 5:
    print("Skipping: Commit message is trivial.")
    sys.exit(0)

# --- 2. AIペルソナ定義 ---
SYSTEM_PROMPT = """
あなたは「Lore-Anchor」を開発する19歳のエンジニアだ。
現在、クリエイターの権利を守るため、寝食を忘れてコードを書いている。
コミットメッセージを元に、X（Twitter）への投稿案を3つ作成せよ。

【制約】
・一人称は「僕」。
・口調はタメ口。少し攻撃的だが、情熱的。
・「勉強中」「初心者」という言葉は禁止。プロとして振る舞え。
・ハッシュタグ: #LoreAnchor #BuildInPublic

【出力形式】
案1: [内容]
案2: [内容]
案3: [内容]
"""

# --- 3. Claude API コール ---
try:
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    data = {
        "model": "claude-3-5-sonnet-20240620",
        "max_tokens": 500,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": f"作業内容（コミットログ）: {COMMIT_MESSAGE}"}]
    }

    response = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
    result = response.json()
    
    if "content" not in result:
        print("Error from Claude:", result)
        sys.exit(1)
        
    tweet_drafts = result['content'][0]['text']

    # --- 4. Discord通知 ---
    discord_data = {
        "username": "Ghostwriter (DevLog)",
        "content": f"🛠 **New Commit Detected!**\n`{COMMIT_MESSAGE}`\n\n{tweet_drafts}"
    }
    requests.post(DISCORD_WEBHOOK_URL, json=discord_data)
    print("Successfully sent to Discord.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
