"""Scrape Spotify reviews from Apple App Store via public RSS JSON feed."""

import time
from typing import Any

import requests

from config import DISCOVERY_KEYWORDS, MAX_REVIEWS_PER_SOURCE, SPOTIFY_APP_STORE_ID
from utils import is_discovery_relevant, normalize_record


def scrape_app_store_reviews(
    max_reviews: int = MAX_REVIEWS_PER_SOURCE,
    discovery_only: bool = False,
) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    page = 1
    max_pages = 10

    while len(records) < max_reviews and page <= max_pages:
        url = (
            f"https://itunes.apple.com/us/rss/customerreviews/"
            f"page={page}/id={SPOTIFY_APP_STORE_ID}/sortby=mostrecent/json"
        )
        response = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        payload = response.json()

        entries = payload.get("feed", {}).get("entry", [])
        if not entries:
            break

        # First entry on page 1 is app metadata, not a review
        if page == 1 and entries:
            entries = entries[1:]

        if not entries:
            break

        for entry in entries:
            if len(records) >= max_reviews:
                break

            title = entry.get("title", {}).get("label", "")
            content = entry.get("content", {}).get("label", "")
            author = entry.get("author", {}).get("name", {}).get("label", "")
            rating = entry.get("im:rating", {}).get("label")
            updated = entry.get("updated", {}).get("label", "")
            review_id = entry.get("id", {}).get("label", "")

            combined = f"{title} {content}".strip()
            if discovery_only and not is_discovery_relevant(combined, DISCOVERY_KEYWORDS):
                continue

            records.append(
                normalize_record(
                    platform="app_store",
                    title=title,
                    text=content,
                    rating=float(rating) if rating else None,
                    author=author,
                    date=updated,
                    url=review_id,
                    metadata={"review_id": review_id},
                )
            )

        page += 1
        time.sleep(0.5)

    return records
