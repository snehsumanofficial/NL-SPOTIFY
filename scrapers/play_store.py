"""Scrape Spotify reviews from Google Play Store."""

from typing import Any

from google_play_scraper import Sort, reviews

from config import DISCOVERY_KEYWORDS, MAX_REVIEWS_PER_SOURCE, SPOTIFY_PLAY_STORE_ID
from utils import is_discovery_relevant, normalize_record


def scrape_play_store_reviews(
    max_reviews: int = MAX_REVIEWS_PER_SOURCE,
    discovery_only: bool = False,
) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    continuation_token = None
    batch_size = 100

    while len(records) < max_reviews:
        batch, continuation_token = reviews(
            SPOTIFY_PLAY_STORE_ID,
            lang="en",
            country="us",
            sort=Sort.NEWEST,
            count=min(batch_size, max_reviews - len(records)),
            continuation_token=continuation_token,
        )

        if not batch:
            break

        for item in batch:
            text = item.get("content", "")
            if discovery_only and not is_discovery_relevant(text, DISCOVERY_KEYWORDS):
                continue

            records.append(
                normalize_record(
                    platform="play_store",
                    title="",
                    text=text,
                    rating=item.get("score"),
                    author=item.get("userName", ""),
                    date=str(item.get("at", "")),
                    url="",
                    metadata={
                        "review_id": item.get("reviewId", ""),
                        "thumbs_up": item.get("thumbsUpCount", 0),
                        "app_version": item.get("reviewCreatedVersion", ""),
                    },
                )
            )

            if len(records) >= max_reviews:
                break

        if continuation_token is None:
            break

    return records[:max_reviews]
