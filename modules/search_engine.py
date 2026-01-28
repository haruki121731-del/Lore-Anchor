"""
Search Engine Module for Lore-Anchor Patrol
Handles reverse image search using SerpApi (Google Lens)
Includes Mock mode for testing without API consumption
"""

import os
from typing import List, Dict
from serpapi import GoogleSearch


def get_mock_results() -> List[Dict[str, str]]:
    """
    Returns dummy data for testing without API calls
    """
    return [
        {
            "url": "http://kangaipakattena-matome.com/entry/123",
            "title": "無断転載まとめ速報 - 画像まとめ"
        },
        {
            "url": "https://twitter.com/my_account/status/1",
            "title": "自分のツイート"
        },
        {
            "url": "https://suspicious-site.net/gallery/img456",
            "title": "フリー画像ギャラリー"
        },
        {
            "url": "https://pixiv.net/artworks/98765432",
            "title": "Pixiv - オリジナル投稿"
        }
    ]


def reverse_image_search(image_path: str, api_key: str = None) -> List[Dict[str, str]]:
    """
    Performs reverse image search using SerpApi Google Lens

    Args:
        image_path: Path to the uploaded image file
        api_key: SerpApi API key (optional, uses Mock mode if not provided)

    Returns:
        List of dictionaries containing 'url' and 'title' of found images
    """
    # Mock mode: No API key or empty API key
    if not api_key or api_key.strip() == "":
        return get_mock_results()

    try:
        # Real API call
        params = {
            "engine": "google_lens",
            "url": image_path if image_path.startswith("http") else None,
            "api_key": api_key
        }

        # If local file, use image parameter instead
        if not image_path.startswith("http"):
            params["image"] = image_path
            del params["url"]

        search = GoogleSearch(params)
        results = search.get_dict()

        # Parse visual matches from Google Lens results
        visual_matches = results.get("visual_matches", [])

        parsed_results = []
        for match in visual_matches[:20]:  # Limit to top 20 results
            parsed_results.append({
                "url": match.get("link", ""),
                "title": match.get("title", "No Title")
            })

        return parsed_results if parsed_results else get_mock_results()

    except Exception as e:
        # Fallback to Mock mode on error
        print(f"API Error: {e}. Falling back to Mock mode.")
        return get_mock_results()


def search_by_image(image_file, api_key: str = None) -> List[Dict[str, str]]:
    """
    Wrapper function for Streamlit file upload compatibility

    Args:
        image_file: Streamlit UploadedFile object
        api_key: SerpApi API key

    Returns:
        List of search results
    """
    # Save uploaded file temporarily for API processing
    if image_file is not None:
        temp_path = f"/tmp/{image_file.name}"
        with open(temp_path, "wb") as f:
            f.write(image_file.getbuffer())

        return reverse_image_search(temp_path, api_key)

    return []
