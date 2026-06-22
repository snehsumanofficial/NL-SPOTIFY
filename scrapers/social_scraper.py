"""Scrape social media conversations about Spotify music discovery.

Uses public web sources: Reddit cross-posts, Hacker News discussions,
and web search snippets from DuckDuckGo HTML (no API key required).
"""

import time
from typing import Any
from urllib.parse import quote_plus, urljoin

import requests
from bs4 import BeautifulSoup

from config import DISCOVERY_KEYWORDS, MAX_REVIEWS_PER_SOURCE
from utils import is_discovery_relevant, normalize_record


def _scrape_hackernews(max_items: int) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    queries = ["spotify discovery", "spotify recommendations", "spotify algorithm"]

    for query in queries:
        if len(records) >= max_items:
            break

        url = f"https://hn.algolia.com/api/v1/search?query={quote_plus(query)}&tags=story&hitsPerPage=20"
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            hits = response.json().get("hits", [])
        except requests.RequestException:
            continue

        for hit in hits:
            if len(records) >= max_items:
                break

            title = hit.get("title", "")
            text = hit.get("story_text") or title
            combined = f"{title} {text}"

            if not is_discovery_relevant(combined, DISCOVERY_KEYWORDS):
                continue

            object_id = hit.get("objectID", "")
            records.append(
                normalize_record(
                    platform="social_media",
                    title=title,
                    text=text,
                    rating=None,
                    author=hit.get("author", ""),
                    date=str(hit.get("created_at", "")),
                    url=f"https://news.ycombinator.com/item?id={object_id}",
                    metadata={"source": "hackernews", "points": hit.get("points", 0)},
                )
            )

        time.sleep(0.5)

    return records


def _scrape_duckduckgo_social(max_items: int) -> list[dict[str, Any]]:
    """Collect public social snippets via DuckDuckGo HTML search."""
    records: list[dict[str, Any]] = []
    queries = [
        "site:twitter.com spotify music discovery",
        "site:x.com spotify recommendations",
        "site:linkedin.com spotify music discovery",
        "site:facebook.com spotify discover weekly",
        "spotify music discovery reddit OR twitter",
    ]

    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
        }
    )

    for query in queries:
        if len(records) >= max_items:
            break

        url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
        try:
            response = session.get(url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "lxml")
        except requests.RequestException:
            continue

        for result in soup.select(".result"):
            if len(records) >= max_items:
                break

            title_el = result.select_one(".result__a")
            snippet_el = result.select_one(".result__snippet")
            if not title_el:
                continue

            title = title_el.get_text(strip=True)
            snippet = snippet_el.get_text(strip=True) if snippet_el else ""
            link = title_el.get("href", "")
            combined = f"{title} {snippet}"

            if not is_discovery_relevant(combined, DISCOVERY_KEYWORDS):
                continue

            source = "web"
            if "twitter.com" in link or "x.com" in link:
                source = "twitter/x"
            elif "facebook.com" in link:
                source = "facebook"
            elif "linkedin.com" in link:
                source = "linkedin"

            records.append(
                normalize_record(
                    platform="social_media",
                    title=title,
                    text=snippet,
                    rating=None,
                    author="",
                    date="",
                    url=link,
                    metadata={"source": source, "search_query": query},
                )
            )

        time.sleep(1.5)

    return records


def _scrape_bluesky_search(max_items: int) -> list[dict[str, Any]]:
    """Search public Bluesky posts via AT Protocol public API."""
    records: list[dict[str, Any]] = []
    queries = ["spotify discovery", "spotify recommendations"]

    for query in queries:
        if len(records) >= max_items:
            break

        url = (
            "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts"
            f"?q={quote_plus(query)}&limit=25"
        )
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            posts = response.json().get("posts", [])
        except requests.RequestException:
            continue

        for post in posts:
            if len(records) >= max_items:
                break

            record = post.get("record", {})
            text = record.get("text", "")
            if not text or not is_discovery_relevant(text, DISCOVERY_KEYWORDS):
                continue

            author = post.get("author", {})
            handle = author.get("handle", "")
            uri = post.get("uri", "")
            web_url = f"https://bsky.app/profile/{handle}/post/{uri.split('/')[-1]}" if uri else ""

            records.append(
                normalize_record(
                    platform="social_media",
                    title=text[:100],
                    text=text,
                    rating=None,
                    author=handle,
                    date=record.get("createdAt", ""),
                    url=web_url,
                    metadata={"source": "bluesky", "likes": post.get("likeCount", 0)},
                )
            )

        time.sleep(0.5)

    return records


def scrape_social_media(
    max_items: int = MAX_REVIEWS_PER_SOURCE,
    discovery_only: bool = True,
) -> list[dict[str, Any]]:
    per_source = max(max_items // 3, 20)
    records: list[dict[str, Any]] = []

    records.extend(_scrape_hackernews(per_source))
    records.extend(_scrape_bluesky_search(per_source))
    records.extend(_scrape_duckduckgo_social(per_source))

    # Deduplicate by text
    seen_text: set[str] = set()
    unique: list[dict[str, Any]] = []
    for record in records:
        key = record["text"][:120].lower()
        if key in seen_text:
            continue
        seen_text.add(key)
        unique.append(record)

    if discovery_only:
        unique = [
            record
            for record in unique
            if is_discovery_relevant(
                f"{record['title']} {record['text']}", DISCOVERY_KEYWORDS
            )
        ]

    return unique[:max_items]
