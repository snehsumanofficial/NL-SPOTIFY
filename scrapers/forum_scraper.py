"""Scrape Spotify Community Forum discussions."""

import re
import time
from typing import Any
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from config import DISCOVERY_KEYWORDS, MAX_REVIEWS_PER_SOURCE
from utils import is_discovery_relevant, normalize_record

BASE_URL = "https://community.spotify.com"
FORUM_PATHS = [
    "/t5/Spotify-for-Developers/bd-p/Spotify_Developer",
    "/t5/Accounts/bd-p/spotify_account_help",
    "/t5/Other-Partners-Devices-etc/bd-p/other",
    "/t5/Desktop-Windows/bd-p/desktop_windows",
    "/t5/Android/bd-p/android",
    "/t5/iOS-iPhone-iPad/bd-p/ios",
]

SEARCH_URL = (
    "https://community.spotify.com/t5/forums/searchpage/tab/message"
    "?q={query}&advanced=false&collapse_discussion=true"
    "&search_type=thread&filter=includeScopes%2CincludeMessage"
)


def _parse_thread(thread_url: str, session: requests.Session) -> dict[str, Any] | None:
    try:
        response = session.get(thread_url, timeout=30)
        response.raise_for_status()
    except requests.RequestException:
        return None

    soup = BeautifulSoup(response.text, "lxml")

    title_el = soup.select_one("h1, .lia-message-subject, .page-title")
    title = title_el.get_text(strip=True) if title_el else ""

    body_parts = []
    for selector in (
        ".lia-message-body-content",
        ".message-body",
        ".lia-quilt-column-main-content",
        "article .content",
    ):
        for element in soup.select(selector):
            text = element.get_text(" ", strip=True)
            if text and len(text) > 30:
                body_parts.append(text)

    body = "\n".join(body_parts[:3]) if body_parts else ""
    if not body and title:
        body = title

    author_el = soup.select_one(".lia-user-name, .author, .UserAvatar")
    author = author_el.get_text(strip=True) if author_el else ""

    return {
        "title": title,
        "text": body,
        "author": author,
        "url": thread_url,
    }


def _collect_thread_links(soup: BeautifulSoup, base: str) -> list[str]:
    links: list[str] = []
    for anchor in soup.select("a[href*='/td-p/'], a[href*='/m-p/']"):
        href = anchor.get("href", "")
        if "/td-p/" not in href:
            continue
        full_url = urljoin(base, href.split("#")[0])
        if full_url not in links:
            links.append(full_url)
    return links


def scrape_community_forums(
    max_posts: int = MAX_REVIEWS_PER_SOURCE,
    discovery_only: bool = True,
) -> list[dict[str, Any]]:
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
        }
    )

    thread_urls: list[str] = []
    search_queries = [
        "discover",
        "recommendation",
        "discover weekly",
        "playlist",
        "repeat",
        "new music",
        "algorithm",
    ]

    for query in search_queries:
        if len(thread_urls) >= max_posts * 2:
            break
        search_page = SEARCH_URL.format(query=query.replace(" ", "+"))
        try:
            response = session.get(search_page, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "lxml")
            thread_urls.extend(_collect_thread_links(soup, BASE_URL))
        except requests.RequestException:
            continue
        time.sleep(1)

    for path in FORUM_PATHS:
        if len(thread_urls) >= max_posts * 2:
            break
        try:
            response = session.get(urljoin(BASE_URL, path), timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "lxml")
            thread_urls.extend(_collect_thread_links(soup, BASE_URL))
        except requests.RequestException:
            continue
        time.sleep(1)

    # Deduplicate while preserving order
    seen: set[str] = set()
    unique_urls: list[str] = []
    for url in thread_urls:
        normalized = re.sub(r"/m-p/\d+", "", url)
        if normalized not in seen:
            seen.add(normalized)
            unique_urls.append(url)

    records: list[dict[str, Any]] = []
    for thread_url in unique_urls:
        if len(records) >= max_posts:
            break

        parsed = _parse_thread(thread_url, session)
        if not parsed:
            continue

        combined = f"{parsed['title']} {parsed['text']}"
        if discovery_only and not is_discovery_relevant(combined, DISCOVERY_KEYWORDS):
            continue

        records.append(
            normalize_record(
                platform="community_forum",
                title=parsed["title"],
                text=parsed["text"],
                rating=None,
                author=parsed["author"],
                date="",
                url=parsed["url"],
                metadata={"source": "community.spotify.com"},
            )
        )
        time.sleep(0.8)

    return records
