import os
import sys
import requests
import json

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")
COMMIT_MESSAGE = sys.argv[1]

IGNORE_KEYWORDS = ["merge", "fix typo", "readme", "docs", "lint", "wip"]
if any(keyword in COMMIT_MESSAGE.lower() for keyword in IGNORE_KEYWORDS) or len(COMMIT_MESSAGE) < 5:
    print("Skipping: Trivial commit.")
    sys.exit(0)

SYSTEM_PROMPT = """
あなたは「Lore-Anchor」を開発する19歳のエンジニアだ。
クリエイターの権利を守るため、寝食を忘れてコードを書いている。
コミットメッセージを元に、X（Twitter）への投稿案を3つ作成せよ。

【制約】
・一人称「僕」、タメ口。少し攻撃的だが情熱的。
・「勉強中」「初心者」禁止。プロとして振る舞え。
・ハッシュタグ: #LoreAnchor #BuildInPublic

【出力形式】
案1: [内容]
案2: [内容]
案3: [内容]
"""

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
    result = response.json()
    if "content" not in result: sys.exit(1)
    tweet_drafts = result['content'][0]['text']

    discord_data = {
        "username": "Ghostwriter",
        "content": f"🛠 **New Commit!**\n`{COMMIT_MESSAGE}`\n\n{tweet_drafts}"
    }
    requests.post(DISCORD_WEBHOOK_URL, json=discord_data)
    print("Sent to Discord.")

except Exception:
    sys.exit(1)
