import os
import sys
import re
from github import Github, Auth
from openai import OpenAI

# --- 設定: モデル定義 ---
MODEL_MANAGER = "anthropic/claude-3.5-sonnet" # 難しいタスク用
MODEL_WORKER  = "deepseek/deepseek-chat"    # 簡単なタスク用

def decide_model(title, body):
    """
    Issueの内容から難易度を判定し、担当モデル（Manager/Worker）を決定する
    """
    text = (title + " " + body).lower()
    
    # Manager案件（設計・複雑・新規）
    manager_keywords = ['design', 'architect', 'plan', 'complex', 'new feature', '設計', '新規', '複雑']
    if any(k in text for k in manager_keywords):
        return MODEL_MANAGER, "Manager (Claude 3.5 Sonnet)"

    # 明示的な指定がある場合
    if "claude" in text:
        return MODEL_MANAGER, "User Requested (Claude)"
    if "deepseek" in text:
        return MODEL_WORKER, "User Requested (DeepSeek)"

    # それ以外は基本的にWorker（DeepSeek）に任せてコストカット
    # ※デフォルトをどちらにするかは戦略次第ですが、今回は「修正」重視でDeepSeek
    return MODEL_WORKER, "Worker (DeepSeek V3)"

def main():
    # --- 1. 環境変数の取得 ---
    token = os.getenv("GITHUB_TOKEN")
    router_key = os.getenv("OPENROUTER_API_KEY")
    repo_name = os.getenv("GITHUB_REPOSITORY")
    issue_number = os.getenv("ISSUE_NUMBER")

    if not all([token, router_key, repo_name]):
        print("❌ Error: Missing environment variables.")
        sys.exit(1)

    print(f"🤖 Starting AI Agent for: {repo_name} (Issue #{issue_number})")

    # --- 2. GitHubからIssue情報を取得 ---
    auth = Auth.Token(token)
    gh = Github(auth=auth)
    repo = gh.get_repo(repo_name)

    if not issue_number or issue_number == '0':
        print("⚠️ Manual run detected (No issue number).")
        # 手動実行の時はテスト用にダミーデータを入れるか、終了する
        # 今回はManagerテストとしてClaudeを使う
        selected_model = MODEL_MANAGER
        issue_title = "Manual Run"
        issue_body = "Manual execution test."
        issue = None
    else:
        try:
            issue = repo.get_issue(number=int(issue_number))
            issue_title = issue.title
            issue_body = issue.body
            
            # --- 3. 担当モデルの選定 (The Router) ---
            selected_model, role_name = decide_model(issue_title, issue_body)
            print(f"⚖️  Judgment: Task assigned to **{role_name}**")
            
        except Exception as e:
            print(f"❌ Error getting issue: {e}")
            sys.exit(1)

    # --- 4. AIへの発注 ---
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=router_key,
    )

    prompt = f"""
    You are an expert developer.
    Task: "{issue_title}"
    Details: "{issue_body}"
    
    Please provide a solution logic or code snippet to resolve this issue.
    """

    print(f"🧠 {role_name} is thinking...")
    
    try:
        completion = client.chat.completions.create(
            model=selected_model,
            messages=[
                {"role": "system", "content": "You are a helpful AI developer."},
                {"role": "user", "content": prompt},
            ]
        )
        response_text = completion.choices[0].message.content
        
        # --- 5. 結果を報告 ---
        print("💡 Response generated.")
        
        if issue:
            header = f"🤖 **AI Auto-Dev Report**\nAssigned to: `{selected_model}`\n\n"
            issue.create_comment(header + response_text)
            print("✅ Comment posted to issue.")
        else:
            print(f"--- AI Response ---\n{response_text}")

    except Exception as e:
        print(f"❌ AI Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
