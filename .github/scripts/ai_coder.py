import os
import sys
import re
from github import Github, Auth
from openai import OpenAI

# --- 設定: モデル定義 ---
MODEL_MANAGER = "anthropic/claude-3.5-sonnet" # 難しいタスク用
MODEL_WORKER  = "deepseek/deepseek-chat"    # 簡単なタスク用

def decide_model(title, body):
    """Issueの内容から担当モデルを決定"""
    text = (title + " " + body).lower()
    
    manager_keywords = ['design', 'architect', 'plan', 'complex', 'new feature', '設計', '新規', '複雑']
    if any(k in text for k in manager_keywords):
        return MODEL_MANAGER, "Manager (Claude 3.5 Sonnet)"
    if "claude" in text:
        return MODEL_MANAGER, "User Requested (Claude)"
    if "deepseek" in text:
        return MODEL_WORKER, "User Requested (DeepSeek)"

    return MODEL_WORKER, "Worker (DeepSeek V3)"

def apply_file_changes(response_text):
    """
    AIのレスポンスからファイル書き込みブロックを抽出して適用する
    フォーマット:
    FILENAME: path/to/file.ext
    ```ext
    content
    ```
    """
    # 正規表現: FILENAME: <path> の後にコードブロックが続くパターンを抽出
    pattern = r"FILENAME:\s*([^\n]+)\n```[a-zA-Z0-9]*\n(.*?)```"
    matches = re.findall(pattern, response_text, re.DOTALL)
    
    modified_files = []
    
    if not matches:
        print("ℹ️ No file changes detected in AI response.")
        return []

    print(f"⚡ Applying {len(matches)} file changes...")

    for file_path, content in matches:
        file_path = file_path.strip()
        # セキュリティ対策: 親ディレクトリへの脱出禁止などを入れるべきだが、今はMVPとしてそのまま
        
        # ディレクトリがなければ作成
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # ファイル書き込み
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"  📝 Wrote to: {file_path}")
        modified_files.append(file_path)
        
    return modified_files

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

    auth = Auth.Token(token)
    gh = Github(auth=auth)
    repo = gh.get_repo(repo_name)

    issue = None
    if issue_number and issue_number != '0':
        try:
            issue = repo.get_issue(number=int(issue_number))
            issue_title = issue.title
            issue_body = issue.body
        except Exception as e:
            print(f"❌ Error getting issue: {e}")
            sys.exit(1)
    else:
        # 手動実行用ダミー
        issue_title = "Manual Update"
        issue_body = "Update README."

    # --- 2. 担当モデルの選定 ---
    selected_model, role_name = decide_model(issue_title, issue_body)
    print(f"⚖️  Judgment: Task assigned to **{role_name}**")

    # --- 3. プロンプト作成 ---
    # ここで「書き込みルール」をAIに徹底させる
    system_prompt = """
    You are an expert AI developer capable of reading and writing code.
    
    IMPORTANT: To modify or create files, you MUST use the following format strictly:
    
    FILENAME: path/to/filename.ext
    ```language
    file_content_here
    ```
    
    - Provide the FULL content of the file (do not use placeholders like // ... existing code ...).
    - You can output multiple files in one response.
    - If no code changes are needed, just provide advice.
    """

    user_prompt = f"""
    Task: "{issue_title}"
    Details: "{issue_body}"
    
    Please implement the solution.
    """

    # --- 4. AI実行 ---
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=router_key,
    )
    
    print(f"🧠 {role_name} is coding...")
    
    try:
        completion = client.chat.completions.create(
            model=selected_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
        )
        response_text = completion.choices[0].message.content
        
        # --- 5. コードの適用（ここが新機能） ---
        modified_files = apply_file_changes(response_text)
        
        # --- 6. 結果報告 ---
        if issue:
            files_log = "\n".join([f"- `{f}`" for f in modified_files])
            comment = f"🤖 **AI Auto-Dev Report**\nAssigned to: `{selected_model}`\n\n"
            
            if modified_files:
                comment += f"### ✅ Applied Changes to:\n{files_log}\n\n"
                comment += "Changes have been committed and a Pull Request will be created/updated."
            else:
                comment += "### ℹ️ No code changes detected\n"
                comment += response_text  # コード変更がない場合は会話内容を表示

            issue.create_comment(comment)
            print("✅ Comment posted to issue.")

    except Exception as e:
        print(f"❌ AI Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
