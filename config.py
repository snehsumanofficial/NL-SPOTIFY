import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
OUTPUT_DIR = DATA_DIR / "output"

for directory in (RAW_DIR, PROCESSED_DIR, OUTPUT_DIR):
    directory.mkdir(parents=True, exist_ok=True)

PRODUCT = "Spotify"
SPOTIFY_APP_STORE_ID = "324684580"
SPOTIFY_PLAY_STORE_ID = "com.spotify.music"

MAX_REVIEWS_PER_SOURCE = int(os.getenv("MAX_REVIEWS_PER_SOURCE", "200"))
MAX_REDDIT_POSTS = int(os.getenv("MAX_REDDIT_POSTS", "100"))

REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "SpotifyReviewEngine/1.0")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

DISCOVERY_KEYWORDS = [
    "discover",
    "discovery",
    "recommend",
    "recommendation",
    "playlist",
    "repeat",
    "same songs",
    "new music",
    "explore",
    "algorithm",
    "discover weekly",
    "release radar",
    "daily mix",
    "radio",
    "shuffle",
]

REDDIT_SUBREDDITS = [
    "spotify",
    "truespotify",
    "spotifyplaylists",
    "LetsTalkMusic",
    "music",
]
