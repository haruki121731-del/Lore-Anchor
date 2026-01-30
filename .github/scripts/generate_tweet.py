import os
import sys
import requests
import json
import traceback

# --- 環境設定 ---
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")
COMMIT_MESSAGE = sys.argv[1] if len(sys.argv) > 1 else "Update"

# --- 1. キーの存在チェック ---
if not DISCORD_WEBHOOK_URL:
    print("❌ Error: DISCORD_WEBHOOK_URL is missing in Secrets.")
    sys.exit(1)

# --- 2. AIペルソナ ---
SYSTEM_PROMPT = """
あなたは「Lore-Anchor」を開発する19歳のエンジニアだ。
コミットメッセージを元に、X（Twitter）への投稿案を3つ作成せよ。
【制約】一人称「僕」、タメ口、情熱的。#LoreAnchor
"""

# --- 3. APIコール (Claude) ---
try:
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    data = {
        "model": "claude-3-haiku-20240307", 
        "max_tokens": 500,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": f"作業内容: {COMMIT_MESSAGE}"}]
    }

    print("🤖 Asking Claude...")
    response = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"❌ Anthropic Error: {response.status_code}, {response.text}")
        sys.exit(1)
        
    tweet_drafts = response.json()['content'][0]['text']
    print("✅ Draft Generated.")

    # --- 4. Discord通知 (ここを強化) ---
    discord_data = {
        "username": "Ghostwriter",
        "content": f"🛠 **Debug Test**\n`{COMMIT_MESSAGE}`\n\n{tweet_drafts}"
    }
    
    print(f"📨 Sending to Discord... (URL starts with: {DISCORD_WEBHOOK_URL[:30]}...)")
    
    disc_res = requests.post(DISCORD_WEBHOOK_URL, json=discord_data)
    
    # 成功(204)以外ならエラー内容を表示して止める
    if disc_res.status_code not in [200, 204]:
        print(f"❌ Discord Error! Status: {disc_res.status_code}")
        print(f"Details: {disc_res.text}")
        sys.exit(1)

    print("✅ Success! Notification sent.")

except Exception as e:
    print(f"❌ Unexpected Error: {e}")
    traceback.print_exc()
    sys.exit(1)
