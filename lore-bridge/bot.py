import os
import discord
from dotenv import load_dotenv
from github import Github

# 1. 環境変数の読み込み
load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
REPO_NAME = os.getenv('REPO_NAME')

# トークンがない場合はわかりやすいエラーメッセージを出して終了する
if not all([DISCORD_TOKEN, GITHUB_TOKEN, REPO_NAME]):
    print("❌ エラー: 必要な環境変数が設定されていません。.envファイルを確認してください。")
    if not DISCORD_TOKEN: print("- DISCORD_TOKEN が見つかりません")
    if not GITHUB_TOKEN: print("- GITHUB_TOKEN が見つかりません")
    if not REPO_NAME: print("- REPO_NAME が見つかりません")
    exit(1)

# 2. Discord Clientの設定 (Intents: Message Content必須)
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

# GitHub Clientの設定
try:
    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(REPO_NAME)
except Exception as e:
    print(f"❌ エラー: GitHubリポジトリ '{REPO_NAME}' にアクセスできませんでした。")
    print(e)
    exit(1)

# チャンネル判定設定（完全一致）
CHANNEL_CONFIG = {
    "💎feedback-ideas💎": {
        "labels": ["enhancement", "discord-feedback"],
        "prefix": "[Idea] "
    },
    "👹bug-reports👹": {
        "labels": ["bug", "discord-report"],
        "prefix": "[Bug] "
    }
}

@client.event
async def on_ready():
    print(f"Botが起動しました（リポジトリ名: {REPO_NAME}）")
    print(f"Logged in as {client.user} (ID: {client.user.id})")

@client.event
async def on_message(message):
    # Bot自身の発言は無視
    if message.author == client.user:
        return

    # 指定のチャンネル以外は無視
    if message.channel.name not in CHANNEL_CONFIG:
        return

    config = CHANNEL_CONFIG[message.channel.name]
    content = message.content

    # コンテンツが空の場合は無視（画像のみの場合など）
    if not content.strip():
        return

    try:
        print(f"📩 メッセージ受信 [{message.channel.name}] from {message.author.name}")

        # 3. Issue作成
        # タイトル: 接頭辞 + メッセージの冒頭30文字
        safe_content = content.replace("\n", " ")
        title_suffix = safe_content[:30] + "..." if len(safe_content) > 30 else safe_content
        issue_title = f"{config['prefix']}{title_suffix}"

        # 本文: 投稿者名、元メッセージのURL、メッセージ全文
        issue_body = (
            f"**Reporter:** {message.author.display_name} ({message.author})\n"
            f"**Source:** {message.jump_url}\n\n"
            f"**Content:**\n{content}"
        )

        # GitHub APIへ送信
        issue = repo.create_issue(
            title=issue_title,
            body=issue_body,
            labels=config['labels']
        )
        print(f"   ✅ Issue Created: #{issue.number} {issue.html_url}")

        # Discordに返信
        reply_content = (
            f"{issue.html_url}\n"
            f"開発用コマンド: `claude issue {issue.number}`"
        )
        reply_msg = await message.reply(reply_content)

        # スレッドを作成（議論用）
        await reply_msg.create_thread(name=f"Discussion: Issue #{issue.number}")

    except Exception as e:
        error_msg = f"❌ エラーが発生しました: {e}"
        print(error_msg)
        await message.channel.send(error_msg)

if __name__ == "__main__":
    client.run(DISCORD_TOKEN)
