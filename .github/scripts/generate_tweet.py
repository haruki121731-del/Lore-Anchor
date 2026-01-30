import os
import sys
import requests
import json
import traceback

print("--- 🔍 DIAGNOSTIC MODE START ---")

# 1. 環境変数のチェック
try:
    ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
    DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")

    if not ANTHROPIC_API_KEY:
        print("❌ Error: ANTHROPIC_API_KEY is MISSING or EMPTY.")
    else:
        print(f"✅ ANTHROPIC_API_KEY found (Starts with: {ANTHROPIC_API_KEY[:4]}...)")

    if not DISCORD_WEBHOOK_URL:
        print("❌ Error: DISCORD_WEBHOOK_URL is MISSING or EMPTY.")
    else:
        print("✅ DISCORD_WEBHOOK_URL found.")
        
    if not ANTHROPIC_API_KEY or not DISCORD_WEBHOOK_URL:
        sys.exit(1)

except Exception as e:
    print(f"❌ Env Check Error: {e}")
    sys.exit(1)

# 2. コミットメッセージの取得
try:
    if len(sys.argv) > 1:
        COMMIT_MESSAGE = sys.argv[1]
    else:
        COMMIT_MESSAGE = "Update without message"
    print(f"📝 Commit Message: {COMMIT_MESSAGE}")
except Exception:
    COMMIT_MESSAGE = "Error getting message"

# ノイズ除去
IGNORE_KEYWORDS = ["merge", "fix typo", "readme", "docs", "lint", "wip"]
if any(keyword in COMMIT_MESSAGE.lower() for keyword in IGNORE_KEYWORDS) or len(COMMIT_MESSAGE) < 5:
    print("⏭️ Skipping: Commit message is trivial.")
    sys.exit(0)

# 3. AIペルソナ定義
SYSTEM_PROMPT = """
あなたは「Lore-Anchor」を開発する19歳のエンジニアだ。
コミットメッセージを元に、X（Twitter）への投稿案を3つ作成せよ。
【制約】一人称「僕」、タメ口、情熱的。ハッシュタグ: #LoreAnchor
"""

# 4. APIコールテスト
print("📡 Connecting to Anthropic API...")
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
        "messages": [{"role": "user", "content": f"作業内容: {COMMIT_MESSAGE}"}]
    }

    response = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
    
    # ここでエラー詳細を表示する
    if response.status_code != 200:
        print(f"❌ Anthropic API Error! Status Code: {response.status_code}")
        print(f"Error Details: {response.text}")
        sys.exit(1)
        
    result = response.json()
    if "content" in result:
        tweet_drafts = result['content'][0]['text']
        print("✅ AI Draft Generated Successfully.")
    else:
        print(f"❌ Unexpected API Response: {result}")
        sys.exit(1)

    # 5. Discord通知
    discord_data = {
        "username": "Ghostwriter (Debug)",
        "content": f"🛠 **Debug Success!**\n`{COMMIT_MESSAGE}`\n\n{tweet_drafts}"
    }
    requests.post(DISCORD_WEBHOOK_URL, json=discord_data)
    print("✅ Sent to Discord.")

except Exception:
    print("❌ Unexpected Error:")
    traceback.print_exc()
    sys.exit(1)

print("--- DIAGNOSTIC MODE END ---")
