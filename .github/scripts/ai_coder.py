#!/usr/bin/env python3
"""
AI Auto Developer - OpenRouter + GitHub Integration
"""
import os
import sys
import re
import traceback

print("🔍 Starting AI Coder...", flush=True)
print(f"Python version: {sys.version}", flush=True)

# インポートエラーの詳細な追跡
try:
    print("📦 Importing github module...", flush=True)
    from github import Github, Auth
    print("✅ github module imported", flush=True)
except ImportError as e:
    print(f"❌ Failed to import github: {e}", flush=True)
    print("Installing PyGithub...", flush=True)
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "PyGithub", "-q"])
    from github import Github, Auth

try:
    print("📦 Importing openai module...", flush=True)
    from openai import OpenAI
    print("✅ openai module imported", flush=True)
except ImportError as e:
    print(f"❌ Failed to import openai: {e}", flush=True)
    print("Installing openai...", flush=True)
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "openai", "-q"])
    from openai import OpenAI

# --- 設定: モデル定義 ---
MODEL_MANAGER = "anthropic/claude-3.5-sonnet"  # 難しいタスク用
MODEL_WORKER = "deepseek/deepseek-chat"      # 簡単なタスク用


def decide_model(title, body):
    """Issueの内容から担当モデルを決定"""
    text = (title or "") + " " + (body or "")
    text = text.lower()

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
    """
    # 正規表現: FILENAME: <path> の後にコードブロックが続くパターンを抽出
    pattern = r"FILENAME:\s*([^\n]+)\n```[a-zA-Z0-9]*\n(.*?)```"
    matches = re.findall(pattern, response_text, re.DOTALL)

    modified_files = []

    if not matches:
        print("ℹ️ No file changes detected in AI response.", flush=True)
        return []

    print(f"⚡ Applying {len(matches)} file changes...", flush=True)

    for file_path, content in matches:
        file_path = file_path.strip()

        # セキュリティ対策: 親ディレクトリへの脱出防止
        if '..' in file_path or file_path.startswith('/'):
            print(f"  ⚠️ Skipped (security): {file_path}", flush=True)
            continue

        # ディレクトリがなければ作成
        dir_path = os.path.dirname(file_path)
        if dir_path:
            os.makedirs(dir_path, exist_ok=True)

        # ファイル書き込み
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"  📝 Wrote to: {file_path}", flush=True)
        modified_files.append(file_path)

    return modified_files


def main():
    try:
        # --- 1. 環境変数の取得 ---
        print("🔍 Reading environment variables...", flush=True)
        
        token = os.getenv("GITHUB_TOKEN")
        router_key = os.getenv("OPENROUTER_API_KEY")
        repo_name = os.getenv("GITHUB_REPOSITORY")
        issue_number = os.getenv("ISSUE_NUMBER", "0")

        print(f"   GITHUB_REPOSITORY: {repo_name}", flush=True)
        print(f"   ISSUE_NUMBER: {issue_number}", flush=True)
        print(f"   GITHUB_TOKEN present: {bool(token)}", flush=True)
        print(f"   OPENROUTER_API_KEY present: {bool(router_key)}", flush=True)

        if not token:
            print("❌ Error: GITHUB_TOKEN environment variable is missing", flush=True)
            sys.exit(1)

        if not router_key:
            print("❌ Error: OPENROUTER_API_KEY environment variable is missing", flush=True)
            print("   Please set the OPENROUTER_API_KEY secret in your repository settings", flush=True)
            sys.exit(1)

        if not repo_name:
            print("❌ Error: GITHUB_REPOSITORY environment variable is missing", flush=True)
            sys.exit(1)

        print(f"🤖 Starting AI Agent for: {repo_name} (Issue #{issue_number})", flush=True)

        # --- 2. GitHubクライアントの初期化 ---
        try:
            print("🔌 Connecting to GitHub...", flush=True)
            auth = Auth.Token(token)
            gh = Github(auth=auth)
            repo = gh.get_repo(repo_name)
            print(f"✅ Connected to repository: {repo.full_name}", flush=True)
        except Exception as e:
            print(f"❌ Error connecting to GitHub: {e}", flush=True)
            traceback.print_exc()
            sys.exit(1)

        # --- 3. Issueの取得 ---
        issue = None
        issue_title = "Manual Update"
        issue_body = "Update code to improve functionality and fix bugs."

        if issue_number and issue_number != '0':
            try:
                print(f"🔍 Fetching issue #{issue_number}...", flush=True)
                issue = repo.get_issue(number=int(issue_number))
                issue_title = issue.title or "No title"
                issue_body = issue.body or "No description"
                print(f"✅ Found issue: #{issue_number} - {issue_title}", flush=True)
            except Exception as e:
                print(f"⚠️ Warning: Could not get issue #{issue_number}: {e}", flush=True)
                print("   Continuing with default task...", flush=True)

        # --- 4. 担当モデルの選定 ---
        selected_model, role_name = decide_model(issue_title, issue_body)
        print(f"⚖️  Judgment: Task assigned to **{role_name}**", flush=True)

        # --- 5. プロンプト作成 ---
        system_prompt = """You are an expert AI developer capable of reading and writing code.

IMPORTANT: To modify or create files, you MUST use the following format strictly:

FILENAME: path/to/filename.ext
```language
file_content_here
```

- Provide the FULL content of the file (do not use placeholders).
- You can output multiple files in one response.
- If no code changes are needed, just provide advice without the FILENAME blocks.
- Be careful with file paths - they should be relative to the repository root.
"""

        user_prompt = f"""Task: "{issue_title}"
Details: "{issue_body}"

Please implement the solution. If this is a bug fix, explain what was wrong and how you fixed it.
If this is a feature, implement it with clean, maintainable code.
"""

        # --- 6. AI実行 ---
        print(f"🧠 {role_name} is thinking...", flush=True)
        print(f"   Using model: {selected_model}", flush=True)
        
        try:
            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=router_key,
            )
            
            completion = client.chat.completions.create(
                model=selected_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                timeout=120
            )
            response_text = completion.choices[0].message.content
            print("✅ AI response received", flush=True)
            print(f"   Response length: {len(response_text)} chars", flush=True)
        except Exception as e:
            print(f"❌ Error calling OpenRouter API: {e}", flush=True)
            traceback.print_exc()
            if issue:
                try:
                    issue.create_comment(f"❌ **AI Error**: Failed to get response from {selected_model}\n\nError: {str(e)}")
                except:
                    pass
            sys.exit(1)

        # --- 7. コードの適用 ---
        modified_files = apply_file_changes(response_text)

        # --- 8. 結果報告 ---
        if issue:
            files_log = "\n".join([f"- `{f}`" for f in modified_files]) if modified_files else "None"
            comment = f"🤖 **AI Auto-Dev Report**\n\n"
            comment += f"**Model Used:** `{selected_model}`\n\n"

            if modified_files:
                comment += f"### ✅ Applied Changes to:\n{files_log}\n\n"
                comment += "Changes have been committed and a Pull Request will be created."
            else:
                comment += "### ℹ️ No code changes detected\n\n"
                comment += "**AI Response:**\n\n"
                if len(response_text) > 2000:
                    comment += response_text[:2000] + "\n\n... (truncated)"
                else:
                    comment += response_text

            try:
                issue.create_comment(comment)
                print("✅ Comment posted to issue", flush=True)
            except Exception as e:
                print(f"⚠️ Warning: Could not post comment: {e}", flush=True)

        print("✅ AI Agent completed successfully", flush=True)

    except Exception as e:
        print(f"❌ Unexpected error: {e}", flush=True)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
