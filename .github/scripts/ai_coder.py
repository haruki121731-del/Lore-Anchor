import os
import sys
from github import Github, Auth
from openai import OpenAI

def main():
    # --- 1. 設定の読み込みとチェック ---
    token = os.getenv("GITHUB_TOKEN")
    router_key = os.getenv("OPENROUTER_API_KEY")
    repo_name = os.getenv("GITHUB_REPOSITORY")
    issue_number = os.getenv("ISSUE_NUMBER")

    # 必須変数のチェック（これがエラーの原因でした）
    if not token:
        print("❌ Error: GITHUB_TOKEN is missing")
        sys.exit(1)
    if not router_key:
        print("❌ Error: OPENROUTER_API_KEY is missing")
        sys.exit(1)
    if not repo_name:
        print("❌ Error: GITHUB_REPOSITORY is missing")
        sys.exit(1)
    
    print(f"🤖 Starting AI Agent for: {repo_name} (Issue #{issue_number})")

    # --- 2. GitHub接続 (新しいAuth方式) ---
    auth = Auth.Token(token)
    gh = Github(auth=auth)
    repo = gh.get_repo(repo_name)

    # Issueの取得
    if not issue_number or issue_number == '0':
        print("⚠️ No issue number provided (Manual run). Exiting.")
        return

    try:
        issue = repo.get_issue(number=int(issue_number))
    except Exception as e:
        print(f"❌ Error getting issue: {e}")
        sys.exit(1)

    # --- 3. OpenRouter (AI) 接続 ---
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=router_key,
    )

    # --- 4. AIによるコーディング (簡易版) ---
    # ここにプロンプトを組み立ててコードを生成させるロジックが入ります
    # 今回はテスト動作のため、コメントのみを返信します
    
    prompt = f"""
    You are an AI developer.
    The user posted an issue: "{issue.title}"
    Body: "{issue.body}"
    
    Please suggest a solution or fix.
    """

    print("🧠 Thinking...")
    
    # モデル選択 (DeepSeek / Claude)
    model = "anthropic/claude-3.5-sonnet"
    
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful AI developer."},
                {"role": "user", "content": prompt},
            ]
        )
        response_text = completion.choices[0].message.content
        print("💡 AI Response generated.")
        
        # 結果をIssueにコメントバック
        issue.create_comment(f"🤖 **AI Auto-Dev Report**\n\n{response_text}")
        print("✅ Comment posted to issue.")

    except Exception as e:
        print(f"❌ AI Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
