"""
Spotify Review Discovery Engine — Part 1
Scrapes user feedback from all platforms and runs AI-powered analysis.
"""

import argparse
import sys
from datetime import datetime, timezone

from analysis.analyzer import analyze_feedback, generate_markdown_report
from config import PRODUCT, RAW_DIR, PROCESSED_DIR, OUTPUT_DIR
from scrapers import (
    scrape_app_store_reviews,
    scrape_community_forums,
    scrape_play_store_reviews,
    scrape_reddit_discussions,
    scrape_social_media,
)
from utils import save_csv, save_json


SCRAPERS = {
    "app_store": scrape_app_store_reviews,
    "play_store": scrape_play_store_reviews,
    "reddit": scrape_reddit_discussions,
    "community_forum": scrape_community_forums,
    "social_media": scrape_social_media,
}


def run_scrapers(sources: list[str] | None = None) -> dict[str, list]:
    sources = sources or list(SCRAPERS.keys())
    all_data: dict[str, list] = {}
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    for source in sources:
        if source not in SCRAPERS:
            print(f"  [SKIP] Unknown source: {source}")
            continue

        print(f"  [SCRAPE] {source}...")
        try:
            records = SCRAPERS[source]()
            all_data[source] = records

            json_path = RAW_DIR / f"{source}_{timestamp}.json"
            csv_path = RAW_DIR / f"{source}_{timestamp}.csv"
            save_json(records, json_path)
            save_csv(records, csv_path)

            print(f"           -> {len(records)} records saved to {json_path.name}")
        except Exception as error:
            print(f"  [ERROR] {source}: {error}")
            all_data[source] = []

    return all_data


def combine_and_save(all_data: dict[str, list]) -> list[dict]:
    import json
    combined = []
    
    # First, gather all existing JSON files in RAW_DIR
    for file_path in RAW_DIR.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                records = json.load(f)
                if isinstance(records, list):
                    combined.extend(records)
        except Exception as e:
            print(f"  [WARNING] Could not load {file_path.name}: {e}")

    # Deduplicate records based on text or id to avoid duplicate entries
    unique_combined = []
    seen = set()
    for record in combined:
        # Use 'id' if present, otherwise fallback to 'text' hash
        record_id = record.get("id") or hash(record.get("text", ""))
        if record_id not in seen:
            seen.add(record_id)
            unique_combined.append(record)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    save_json(unique_combined, PROCESSED_DIR / f"combined_{timestamp}.json")
    save_csv(unique_combined, PROCESSED_DIR / f"combined_{timestamp}.csv")
    save_json(unique_combined, PROCESSED_DIR / "combined_latest.json")
    save_csv(unique_combined, PROCESSED_DIR / "combined_latest.csv")

    return unique_combined


def print_summary(all_data: dict[str, list], analysis: dict | None = None) -> None:
    print("\n" + "=" * 60)
    print(f"  {PRODUCT} Review Discovery Engine — Summary")
    print("=" * 60)

    total = 0
    for source, records in all_data.items():
        count = len(records)
        total += count
        print(f"  {source:20s} : {count:4d} records")

    print(f"  {'TOTAL':20s} : {total:4d} records")
    print("=" * 60)

    if analysis:
        print("\n  Executive Summary:")
        print(f"  {analysis.get('executive_summary', '')}")
        print("\n  Top Opportunities:")
        for opp in analysis.get("actionable_opportunities", [])[:3]:
            print(f"    - {opp}")

    print(f"\n  Output files in: {OUTPUT_DIR}")
    print("=" * 60)


def main() -> None:
    parser = argparse.ArgumentParser(description="Spotify Review Discovery Engine")
    parser.add_argument(
        "--scrape-only",
        action="store_true",
        help="Only scrape data, skip AI analysis",
    )
    parser.add_argument(
        "--analyze-only",
        action="store_true",
        help="Only run analysis on existing combined data",
    )
    parser.add_argument(
        "--sources",
        nargs="+",
        choices=list(SCRAPERS.keys()),
        help="Specific sources to scrape (default: all)",
    )
    args = parser.parse_args()

    print(f"\n{'=' * 60}")
    print(f"  {PRODUCT} Review Discovery Engine — Part 1")
    print(f"{'=' * 60}\n")

    if args.analyze_only:
        from utils import load_json

        combined_path = PROCESSED_DIR / "combined_latest.json"
        if not combined_path.exists():
            print("No combined data found. Run scraping first.")
            sys.exit(1)
        combined = load_json(combined_path)
        all_data = {}
    else:
        print("Step 1: Scraping user feedback from all platforms...\n")
        all_data = run_scrapers(args.sources)
        combined = combine_and_save(all_data)

    analysis = None
    if not args.scrape_only:
        print(f"\nStep 2: Running AI-powered analysis on {len(combined)} records...\n")
        analysis = analyze_feedback(combined)
        generate_markdown_report(analysis)
        print("  Analysis saved to data/output/analysis_report.json")
        print("  Markdown report saved to data/output/analysis_report.md")

    print_summary(all_data if not args.analyze_only else {}, analysis)


if __name__ == "__main__":
    main()
