import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def save_json(records: list[dict[str, Any]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(records, handle, indent=2, ensure_ascii=False)


def load_json(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_csv(records: list[dict[str, Any]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(records).to_csv(path, index=False, encoding="utf-8")


def normalize_record(
    *,
    platform: str,
    text: str,
    title: str = "",
    rating: float | None = None,
    author: str = "",
    date: str = "",
    url: str = "",
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "platform": platform,
        "title": title.strip(),
        "text": text.strip(),
        "rating": rating,
        "author": author,
        "date": date,
        "url": url,
        "scraped_at": utc_now_iso(),
        "metadata": metadata or {},
    }


def is_discovery_relevant(text: str, keywords: list[str]) -> bool:
    lowered = text.lower()
    return any(keyword in lowered for keyword in keywords)
