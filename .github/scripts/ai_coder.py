import os
import sys
import re
from github import Github
from openai import OpenAI

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_NAME = os.getenv("REPO_NAME")
ISSUE_NUMBER = int(os.getenv("ISSUE_NUMBER"))

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

gh = Github(GITHUB_TOKEN)
repo = gh.get_repo(REPO_NAME)
issue = repo.get_issue(ISSUE_NUMBER)

def get_file_structure():
    file_paths = []
    exclude_dirs = {'.git', 'node_modules', '__pycache__', '.github', 'venv', 'env'}
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            file_paths.append(os.path.join(root, file))
    return "\n".join(file_paths)

def ai_chat(model, system_prompt, user_prompt):
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error calling AI: {e}", file=sys.stderr)
        sys.exit(1)

# --- Phase 1: Manager ---
print("Running Phase 1: Complexity Analysis...")
manager_system = "You are a Lead Engineer. Analyze the issue and determine if the fix is 'simple' (minor text/logic fix) or 'complex' (refactoring, multiple files). Output ONLY 'simple' or 'complex'."
manager_user = f"Issue Title: {issue.title}\n\nIssue Body: {issue.body}"

difficulty = ai_chat("deepseek/deepseek-chat", manager_system, manager_user).strip().lower()
if "complex" not in difficulty:
    difficulty = "simple"
else:
    difficulty = "complex"

print(f"Detected Difficulty: {difficulty}")

# --- Phase 2: Worker ---
print("Running Phase 2: Code Generation...")
worker_model = "deepseek/deepseek-chat" if difficulty == "simple" else "anthropic/claude-3.5-sonnet"
file_structure = get_file_structure()

worker_system = """You are an expert AI Developer.
Based on the file structure and issue description, generate the code to fix the issue.
Return the full content of the file(s) to be created or modified.

Format your response EXACTLY as follows for each file:

FILENAME: path/to/file.ext
```
<complete file content>
```

Do not include any other text or markdown explanations. Existing files will be overwritten."""

worker_user = f"""
Current File Structure:
{file_structure}

Issue Title: {issue.title}
Issue Description: {issue.body}

Please generate the required code changes.
"""

response = ai_chat(worker_model, worker_system, worker_user)

# Parse and Apply
modified_files = []
# Regex to find FILENAME: ... followed by a code block
pattern = r"FILENAME:\s*(.+?)\s*```(?:[\w]*)\n(.*?)```"
matches = re.finditer(pattern, response, re.DOTALL)

for match in matches:
    path = match.group(1).strip()
    content = match.group(2)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    
    modified_files.append(path)
    print(f"Wrote file: {path}")

# --- Reporting ---
if modified_files:
    report_body = f"""
## 🤖 AI Auto-Fix Report
**Status**: Completed
**Difficulty**: `{difficulty}`
**Model**: `{worker_model}`

**Modified Files**:
""" + "\n".join([f"- `{f}`" for f in modified_files])
    
    issue.create_comment(report_body)
    print("Report posted to issue.")
else:
    print("No changes were applied.")
    issue.create_comment("🤖 AI Analysis completed but no file changes were detected/parsed.")
