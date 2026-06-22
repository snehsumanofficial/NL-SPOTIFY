"""Scrape Reddit discussions about Spotify music discovery."""

import time
from typing import Any

import requests

from config import (
    DISCOVERY_KEYWORDS,
    MAX_REDDIT_POSTS,
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_SUBREDDITS,
    REDDIT_USER_AGENT,
)
from utils import is_discovery_relevant, normalize_record


def _scrape_with_praw(max_posts: int) -> list[dict[str, Any]]:
    import praw

    reddit = praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT,
    )

    records: list[dict[str, Any]] = []
    search_queries = [
        "music discovery",
        "discover weekly",
        "recommendations",
        "same songs",
        "repeat listening",
        "new music",
    ]

    for subreddit_name in REDDIT_SUBREDDITS:
        subreddit = reddit.subreddit(subreddit_name)
        for query in search_queries:
            for submission in subreddit.search(query, limit=max_posts // len(REDDIT_SUBREDDITS)):
                if len(records) >= max_posts:
                    return records

                text = f"{submission.title}\n{submission.selftext}".strip()
                records.append(
                    normalize_record(
                        platform="reddit",
                        title=submission.title,
                        text=submission.selftext or submission.title,
                        rating=None,
                        author=str(submission.author) if submission.author else "",
                        date=str(submission.created_utc),
                        url=f"https://reddit.com{submission.permalink}",
                        metadata={
                            "subreddit": subreddit_name,
                            "score": submission.score,
                            "num_comments": submission.num_comments,
                            "query": query,
                        },
                    )
                )

                submission.comments.replace_more(limit=0)
                for comment in submission.comments[:5]:
                    if len(records) >= max_posts:
                        break
                    comment_text = getattr(comment, "body", "")
                    if not comment_text or comment_text in ("[deleted]", "[removed]"):
                        continue
                    records.append(
                        normalize_record(
                            platform="reddit",
                            title=f"Comment on: {submission.title[:80]}",
                            text=comment_text,
                            rating=None,
                            author=str(comment.author) if comment.author else "",
                            date=str(comment.created_utc),
                            url=f"https://reddit.com{comment.permalink}",
                            metadata={
                                "subreddit": subreddit_name,
                                "score": comment.score,
                                "type": "comment",
                                "parent_post": submission.title,
                            },
                        )
                    )

    return records


def _scrape_with_pullpush(max_posts: int) -> list[dict[str, Any]]:
    """Use PullPush archive API (works without Reddit API credentials)."""
    records: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    search_queries = [
        "music discovery",
        "recommendations",
        "discover weekly",
        "repeat listening",
        "new music",
        "algorithm",
        "playlist",
    ]

    for subreddit in REDDIT_SUBREDDITS:
        for query in search_queries:
            if len(records) >= max_posts:
                return records

            url = (
                "https://api.pullpush.io/reddit/search/submission/"
                f"?subreddit={subreddit}&q={query.replace(' ', '+')}&size=25&sort=desc&sort_type=score"
            )
            try:
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                payload = response.json()
                posts = payload.get("data", payload) if isinstance(payload, dict) else payload
                if not isinstance(posts, list):
                    continue
            except requests.RequestException:
                continue

            for post in posts:
                if len(records) >= max_posts:
                    return records

                post_id = str(post.get("id", ""))
                if post_id in seen_ids:
                    continue
                seen_ids.add(post_id)

                title = post.get("title", "")
                selftext = post.get("selftext", "")
                combined = f"{title} {selftext}"

                if not is_discovery_relevant(combined, DISCOVERY_KEYWORDS):
                    continue

                permalink = post.get("permalink", "")
                records.append(
                    normalize_record(
                        platform="reddit",
                        title=title,
                        text=selftext or title,
                        rating=None,
                        author=post.get("author", ""),
                        date=str(post.get("created_utc", "")),
                        url=f"https://reddit.com{permalink}" if permalink else "",
                        metadata={
                            "subreddit": subreddit,
                            "score": post.get("score", 0),
                            "num_comments": post.get("num_comments", 0),
                            "query": query,
                        },
                    )
                )

            time.sleep(0.5)

        # Also fetch recent top posts from each subreddit
        url = (
            f"https://api.pullpush.io/reddit/search/submission/"
            f"?subreddit={subreddit}&size=25&sort=desc&sort_type=created_utc"
        )
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            payload = response.json()
            posts = payload.get("data", payload) if isinstance(payload, dict) else payload
            if not isinstance(posts, list):
                continue
            for post in posts:
                if len(records) >= max_posts:
                    return records
                post_id = str(post.get("id", ""))
                if post_id in seen_ids:
                    continue

                title = post.get("title", "")
                selftext = post.get("selftext", "")
                if not is_discovery_relevant(
                    f"{title} {selftext}", DISCOVERY_KEYWORDS + ["spotify"]
                ):
                    continue

                seen_ids.add(post_id)
                permalink = post.get("permalink", "")
                records.append(
                    normalize_record(
                        platform="reddit",
                        title=title,
                        text=selftext or title,
                        rating=None,
                        author=post.get("author", ""),
                        date=str(post.get("created_utc", "")),
                        url=f"https://reddit.com{permalink}" if permalink else "",
                        metadata={
                            "subreddit": subreddit,
                            "score": post.get("score", 0),
                            "num_comments": post.get("num_comments", 0),
                        },
                    )
                )
        except requests.RequestException:
            continue

        time.sleep(0.5)

    return records


def _scrape_with_public_api(max_posts: int) -> list[dict[str, Any]]:
    """Fallback using Reddit's public JSON endpoints (no API key required)."""
    records: list[dict[str, Any]] = []
    headers = {"User-Agent": "Mozilla/5.0 (compatible; SpotifyReviewEngine/1.0)"}

    endpoints = []
    for subreddit in REDDIT_SUBREDDITS:
        for query in ["music discovery", "recommendations", "discover weekly", "repeat"]:
            endpoints.append(
                (
                    subreddit,
                    f"https://www.reddit.com/r/{subreddit}/search.json"
                    f"?q={query.replace(' ', '+')}&restrict_sr=1&sort=relevance&limit=25"
                )
            )

    seen_urls: set[str] = set()

    for subreddit, url in endpoints:
        if len(records) >= max_posts:
            break

        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code in (403, 429):
                break
            response.raise_for_status()
            children = response.json().get("data", {}).get("children", [])
        except requests.RequestException:
            continue

        for child in children:
            if len(records) >= max_posts:
                break

            post = child.get("data", {})
            permalink = post.get("permalink", "")
            if permalink in seen_urls:
                continue
            seen_urls.add(permalink)

            title = post.get("title", "")
            selftext = post.get("selftext", "")
            combined = f"{title} {selftext}"

            if not is_discovery_relevant(combined, DISCOVERY_KEYWORDS):
                continue

            records.append(
                normalize_record(
                    platform="reddit",
                    title=title,
                    text=selftext or title,
                    rating=None,
                    author=post.get("author", ""),
                    date=str(post.get("created_utc", "")),
                    url=f"https://reddit.com{permalink}",
                    metadata={
                        "subreddit": subreddit,
                        "score": post.get("score", 0),
                        "num_comments": post.get("num_comments", 0),
                    },
                )
            )

        time.sleep(1)

    return records


def scrape_reddit_discussions(
    max_posts: int = MAX_REDDIT_POSTS,
    discovery_only: bool = True,
) -> list[dict[str, Any]]:
    if REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET:
        try:
            return _scrape_with_praw(max_posts)
        except Exception:
            pass

    records = _scrape_with_pullpush(max_posts)
    if not records:
        records = _scrape_with_public_api(max_posts)
    if discovery_only:
        records = [
            record
            for record in records
            if is_discovery_relevant(
                f"{record['title']} {record['text']}", DISCOVERY_KEYWORDS
            )
        ]
    return records[:max_posts]
