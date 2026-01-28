"""
Lore-Anchor Patrol MVP
Copyright Infringement Detection & Takedown Request Generator

Author: Lore-Anchor Team
Version: 1.0.0
"""

import streamlit as st
import os
from dotenv import load_dotenv

# Import custom modules
from modules.search_engine import search_by_image
from modules.detector import classify_results, get_suspicious_urls
from modules.generator import generate_takedown_request, get_summary_statistics

# Load environment variables
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="Lore-Anchor Patrol",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Title and description
st.title("🛡️ Lore-Anchor Patrol")
st.markdown("""
**著作権侵害検知 & 削除要請自動生成システム**
あなたの作品がWeb上で無断転載されていないかを監視し、削除要請文を自動生成します。
""")

# Sidebar configuration
with st.sidebar:
    st.header("⚙️ 設定")

    # Image upload
    st.subheader("1. ターゲット画像")
    uploaded_file = st.file_uploader(
        "監視したい画像をアップロード",
        type=["jpg", "jpeg", "png"],
        help="あなたが著作権を持つ画像をアップロードしてください"
    )

    if uploaded_file is not None:
        st.image(uploaded_file, caption="アップロード画像", use_container_width=True)

    # Original URL input
    st.subheader("2. 正規URL")
    original_url = st.text_input(
        "正規投稿先URL",
        placeholder="https://pixiv.net/artworks/12345678",
        help="あなたがオリジナルで投稿したURL（削除要請文に使用されます）"
    )

    # Whitelist domains
    st.subheader("3. ホワイトリスト")
    whitelist_input = st.text_area(
        "許可ドメイン（カンマ区切り）",
        value="twitter.com, pixiv.net",
        help="これらのドメインは安全と判定されます"
    )

    # Parse whitelist
    whitelist_domains = [domain.strip() for domain in whitelist_input.split(",") if domain.strip()]

    # API Key (optional)
    st.subheader("4. API設定")
    api_key = os.getenv("SERPAPI_KEY", "")

    if not api_key or api_key.strip() == "":
        st.info("🧪 **Mockモード**: APIキーが未設定のため、ダミーデータを使用します。")
    else:
        st.success("✅ APIキー検出済み")

    # Scan button
    st.markdown("---")
    scan_button = st.button("🔍 パトロール開始 (Scan)", type="primary", use_container_width=True)

# Main area
if scan_button and uploaded_file is not None:
    with st.spinner("🔍 画像を検索中..."):
        # Search for similar images
        search_results = search_by_image(uploaded_file, api_key)

        if not search_results:
            st.warning("検索結果が見つかりませんでした。")
        else:
            # Classify results
            classified_results = classify_results(search_results, whitelist_domains)

            # Get statistics
            stats = get_summary_statistics(classified_results)

            # Display statistics
            st.markdown("### 📊 スキャン結果サマリー")
            col1, col2, col3 = st.columns(3)

            with col1:
                st.metric("総検出数", stats['total'])
            with col2:
                st.metric("✅ 安全", stats['safe'])
            with col3:
                st.metric("⚠️ 疑わしい", stats['suspicious'])

            # Display results table
            st.markdown("### 📋 検出結果一覧")

            for idx, result in enumerate(classified_results):
                with st.expander(f"{result['status']} - {result['title']}", expanded=False):
                    st.write(f"**URL:** {result['url']}")
                    st.write(f"**タイトル:** {result['title']}")
                    st.write(f"**ステータス:** {result['status']}")

                    # Show takedown request for suspicious URLs
                    if "Suspicious" in result['status']:
                        st.markdown("---")
                        st.markdown("#### 🚨 削除要請文（自動生成）")

                        if original_url:
                            takedown_text = generate_takedown_request(result['url'], original_url)
                            st.text_area(
                                "コピーして使用してください",
                                value=takedown_text,
                                height=250,
                                key=f"takedown_{idx}"
                            )

                            # Download button
                            st.download_button(
                                label="📥 テキストをダウンロード",
                                data=takedown_text,
                                file_name=f"takedown_request_{idx}.txt",
                                mime="text/plain",
                                key=f"download_{idx}"
                            )
                        else:
                            st.warning("正規URLを入力してください（サイドバー）")

            # Summary of suspicious URLs
            suspicious_list = get_suspicious_urls(classified_results)
            if suspicious_list:
                st.markdown("---")
                st.markdown("### ⚠️ 要対応URL一覧")
                st.markdown("以下のURLは無断転載の可能性があります：")

                for item in suspicious_list:
                    st.markdown(f"- [{item['title']}]({item['url']})")

                st.info(f"**削除目標達成率:** 70% (対象: {len(suspicious_list)}件)")

elif scan_button and uploaded_file is None:
    st.error("画像をアップロードしてください（サイドバー）")

else:
    # Initial state
    st.markdown("### 🚀 使い方")
    st.markdown("""
    1. **サイドバー**から監視したい画像をアップロード
    2. **正規URL**にあなたのオリジナル投稿先URLを入力
    3. **ホワイトリスト**で許可するドメインを設定（カンマ区切り）
    4. **パトロール開始**ボタンをクリックして検索実行
    5. 検出された疑わしいURLに対して、自動生成された削除要請文をコピー
    6. 該当サイトの運営者に送信

    **Note:** APIキーが未設定の場合、Mockモードでダミーデータを使用します。
    """)

    st.markdown("---")
    st.markdown("### 💡 ヒント")
    st.markdown("""
    - **ホワイトリスト**には、自分が公式に投稿しているSNSやギャラリーサイトを追加しましょう
    - **削除要請文**は法的根拠に基づいて自動生成されます
    - **削除率70%目標**を達成するため、継続的な監視が重要です
    """)

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: gray;'>
    Powered by Lore-Anchor Team | Version 1.0.0 MVP
</div>
""", unsafe_allow_html=True)
