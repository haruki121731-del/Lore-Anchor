"""
Detector Module for Lore-Anchor Patrol
Handles whitelist domain checking and suspicious URL detection
"""

from urllib.parse import urlparse
from typing import List, Dict


def is_whitelisted(url: str, whitelist_domains: List[str]) -> bool:
    """
    Checks if a URL is in the whitelist

    Args:
        url: The URL to check
        whitelist_domains: List of whitelisted domains (e.g., ['twitter.com', 'pixiv.net'])

    Returns:
        True if URL is whitelisted, False otherwise
    """
    if not url or not whitelist_domains:
        return False

    try:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()

        # Remove 'www.' prefix if present
        if domain.startswith('www.'):
            domain = domain[4:]

        # Check if domain matches any whitelist entry
        for whitelist_domain in whitelist_domains:
            whitelist_domain = whitelist_domain.strip().lower()

            # Remove 'www.' from whitelist domain too
            if whitelist_domain.startswith('www.'):
                whitelist_domain = whitelist_domain[4:]

            # Exact match or subdomain match
            if domain == whitelist_domain or domain.endswith('.' + whitelist_domain):
                return True

        return False

    except Exception as e:
        print(f"Error parsing URL {url}: {e}")
        return False


def classify_results(search_results: List[Dict[str, str]],
                     whitelist_domains: List[str]) -> List[Dict[str, str]]:
    """
    Classifies search results as Safe or Suspicious

    Args:
        search_results: List of search result dictionaries with 'url' and 'title'
        whitelist_domains: List of whitelisted domains

    Returns:
        List of results with added 'status' field (Safe or Suspicious)
    """
    classified_results = []
    import uuid

    for result in search_results:
        url = result.get('url', '')
        title = result.get('title', 'No Title')
        
        # Parse domain
        try:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.lower()
            if domain.startswith('www.'):
                domain = domain[4:]
        except:
            domain = url

        if is_whitelisted(url, whitelist_domains):
            status = "safe"
        else:
            status = "suspicious"

        classified_results.append({
            'id': str(uuid.uuid4()),
            'title': title,
            'url': url,
            'domain': domain,
            'status': status,
            'similarity': 90 # Default high confidence for found results as placeholder
        })

    return classified_results


def get_suspicious_urls(classified_results: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    Filters and returns only suspicious URLs

    Args:
        classified_results: List of classified results

    Returns:
        List of suspicious URLs only
    """
    return [result for result in classified_results if result.get('status') == 'suspicious']
