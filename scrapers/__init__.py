from .app_store import scrape_app_store_reviews
from .play_store import scrape_play_store_reviews
from .reddit_scraper import scrape_reddit_discussions
from .forum_scraper import scrape_community_forums
from .social_scraper import scrape_social_media

__all__ = [
    "scrape_app_store_reviews",
    "scrape_play_store_reviews",
    "scrape_reddit_discussions",
    "scrape_community_forums",
    "scrape_social_media",
]
