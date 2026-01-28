"""
Generator Module for Lore-Anchor Patrol
Generates legal takedown request letters for copyright infringement
"""

from typing import Dict


def generate_takedown_request(target_url: str, original_url: str) -> str:
    """
    Generates a copyright infringement takedown request letter

    Args:
        target_url: The URL where unauthorized use was found
        original_url: The legitimate/original URL where content was posted

    Returns:
        Formatted takedown request letter
    """
    template = f"""件名: 著作権侵害による画像削除の請求

{target_url} の運営者様

私は以下の画像の著作権者です。

正規URL: {original_url}

貴サイトにおける無断掲載を確認しました。
著作権法に基づき、24時間以内の削除を求めます。

削除が行われない場合、法的措置を検討させていただきます。

何卒よろしくお願いいたします。
"""
    return template


def generate_batch_requests(suspicious_urls: list, original_url: str) -> Dict[str, str]:
    """
    Generates multiple takedown requests for a list of suspicious URLs

    Args:
        suspicious_urls: List of suspicious URL dictionaries
        original_url: The legitimate/original URL

    Returns:
        Dictionary mapping each suspicious URL to its takedown request
    """
    requests = {}

    for item in suspicious_urls:
        url = item.get('url', '')
        if url:
            requests[url] = generate_takedown_request(url, original_url)

    return requests


def get_summary_statistics(classified_results: list) -> Dict[str, int]:
    """
    Calculates statistics from classified results

    Args:
        classified_results: List of classified result dictionaries

    Returns:
        Dictionary with counts of total, safe, and suspicious URLs
    """
    total = len(classified_results)
    suspicious = sum(1 for r in classified_results if "Suspicious" in r.get('status', ''))
    safe = total - suspicious

    return {
        'total': total,
        'safe': safe,
        'suspicious': suspicious
    }
