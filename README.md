# Spotify Review Discovery Engine (Part 1)

AI-powered system that scrapes and analyzes user feedback about Spotify music discovery from multiple platforms.

## Platforms Scraped

| Platform | Source | Method |
|----------|--------|--------|
| App Store | iTunes RSS JSON feed | Public API |
| Play Store | Google Play | `google-play-scraper` |
| Reddit | r/spotify, r/truespotify, etc. | PullPush archive API |
| Community Forums | community.spotify.com | Web scraping |
| Social Media | Hacker News, Bluesky, DuckDuckGo | Public APIs + search |

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Copy env template (optional — for AI analysis)
copy .env.example .env

# Run full pipeline (scrape + analyze)
python main.py

# Scrape only
python main.py --scrape-only

# Analyze existing data only
python main.py --analyze-only

# Scrape specific platforms
python main.py --sources app_store play_store reddit
```

## Output

All data is saved under `data/`:

- `data/raw/` — per-platform JSON and CSV files
- `data/processed/combined_latest.json` — merged dataset
- `data/output/analysis_report.json` — AI analysis results
- `data/output/analysis_report.md` — human-readable report

## AI Analysis

Set one of these in `.env` for AI-powered insights:

```
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
```

Without an API key, the system runs rule-based theme analysis as a fallback.

## Research Questions Answered

The analysis engine answers:

1. Why do users struggle to discover new music?
2. What are the most common frustrations with recommendations?
3. What listening behaviors are users trying to achieve?
4. What causes users to repeatedly listen to the same content?
5. Which user segments experience different discovery challenges?
6. What unmet needs emerge consistently across reviews?
