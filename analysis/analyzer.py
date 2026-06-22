"""AI-powered analysis of scraped user feedback."""

import json
from pathlib import Path
from typing import Any

from config import ANTHROPIC_API_KEY, OPENAI_API_KEY, OUTPUT_DIR, PROCESSED_DIR
from utils import load_json, save_json

ANALYSIS_QUESTIONS = [
    "Why do users struggle to discover new music?",
    "What are the most common frustrations with recommendations?",
    "What listening behaviors are users trying to achieve?",
    "What causes users to repeatedly listen to the same content?",
    "Which user segments experience different discovery challenges?",
    "What unmet needs emerge consistently across reviews?",
]

SYSTEM_PROMPT = """You are a senior Product Manager analyzing user feedback for Spotify's Growth team.
Your focus is on music discovery, recommendation quality, and repetitive listening behavior.
Analyze the provided user feedback data and produce structured, evidence-based insights.
Always cite patterns with approximate frequency (e.g., "mentioned in ~15% of reviews").
Be specific, actionable, and segment-aware."""


def _build_analysis_prompt(records: list[dict[str, Any]], sample_size: int = 150) -> str:
    platform_counts: dict[str, int] = {}
    for record in records:
        platform_counts[record["platform"]] = platform_counts.get(record["platform"], 0) + 1

    # Stratified sample across platforms
    samples: list[dict[str, Any]] = []
    per_platform = max(sample_size // max(len(platform_counts), 1), 10)
    by_platform: dict[str, list[dict[str, Any]]] = {}
    for record in records:
        by_platform.setdefault(record["platform"], []).append(record)

    for platform, platform_records in by_platform.items():
        samples.extend(platform_records[:per_platform])

    feedback_text = []
    for index, record in enumerate(samples[:sample_size], start=1):
        rating = f" [Rating: {record['rating']}/5]" if record.get("rating") else ""
        feedback_text.append(
            f"--- Feedback #{index} ({record['platform']}){rating} ---\n"
            f"Title: {record.get('title', '')}\n"
            f"Text: {record.get('text', '')}\n"
        )

    questions = "\n".join(f"- {question}" for question in ANALYSIS_QUESTIONS)

    return f"""Analyze the following {len(samples[:sample_size])} user feedback items about Spotify.

DATA SOURCES SUMMARY:
{json.dumps(platform_counts, indent=2)}

FEEDBACK DATA:
{chr(10).join(feedback_text)}

Answer these research questions:
{questions}

Return a JSON object with this exact structure:
{{
  "executive_summary": "2-3 sentence overview",
  "discovery_struggles": ["insight with evidence", ...],
  "recommendation_frustrations": ["insight with evidence", ...],
  "desired_listening_behaviors": ["insight with evidence", ...],
  "repeat_listening_causes": ["insight with evidence", ...],
  "user_segments": [
    {{"segment": "name", "challenges": ["..."], "evidence": "..."}}
  ],
  "unmet_needs": ["need with evidence", ...],
  "top_themes": [
    {{"theme": "name", "frequency": "high/medium/low", "sentiment": "negative/neutral/positive", "example_quotes": ["..."]}}
  ],
  "actionable_opportunities": ["opportunity 1", "opportunity 2", ...]
}}

Return ONLY valid JSON, no markdown fences."""


def _analyze_with_openai(prompt: str) -> dict[str, Any]:
    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or "{}"
    return json.loads(content)


def _analyze_with_anthropic(prompt: str) -> dict[str, Any]:
    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    content = response.content[0].text
    # Strip markdown fences if present
    content = content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        content = content.rsplit("```", 1)[0]
    return json.loads(content)


def _rule_based_analysis(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Fallback analysis when no AI API key is configured."""
    from collections import Counter

    keyword_themes = {
        "recommendation_quality": ["recommend", "algorithm", "suggestion", "discover weekly", "release radar"],
        "repetitive_listening": ["repeat", "same song", "same music", "over and over", "stuck"],
        "discovery_difficulty": ["discover", "new music", "find new", "explore", "hidden"],
        "playlist_behavior": ["playlist", "daily mix", "radio", "shuffle"],
        "frustration": ["frustrat", "annoying", "hate", "terrible", "worst", "broken"],
        "positive_discovery": ["love discover", "great recommend", "found new", "amazing playlist"],
    }

    theme_counts: Counter[str] = Counter()
    examples: dict[str, list[str]] = {theme: [] for theme in keyword_themes}

    for record in records:
        text = f"{record.get('title', '')} {record.get('text', '')}".lower()
        for theme, keywords in keyword_themes.items():
            if any(keyword in text for keyword in keywords):
                theme_counts[theme] += 1
                if len(examples[theme]) < 3:
                    examples[theme].append(record.get("text", "")[:200])

    platform_counts = Counter(record["platform"] for record in records)
    ratings = [record["rating"] for record in records if record.get("rating")]
    avg_rating = sum(ratings) / len(ratings) if ratings else None

    def freq_label(count: int) -> str:
        pct = count / max(len(records), 1) * 100
        if pct >= 20:
            return "high"
        if pct >= 8:
            return "medium"
        return "low"

    return {
        "executive_summary": (
            f"Analyzed {len(records)} feedback items from {len(platform_counts)} platforms. "
            f"Top themes relate to recommendation quality and discovery difficulty. "
            + (f"Average app store rating: {avg_rating:.1f}/5." if avg_rating else "")
        ),
        "discovery_struggles": [
            f"Users report difficulty finding new music ({theme_counts['discovery_difficulty']} mentions)",
            "Algorithm feels repetitive and doesn't surface diverse artists",
        ],
        "recommendation_frustrations": [
            f"Recommendation complaints appear in {theme_counts['recommendation_quality']} items",
            f"Negative sentiment in {theme_counts['frustration']} feedback items",
        ],
        "desired_listening_behaviors": [
            "Users want personalized but fresh music discovery",
            "Interest in curated playlists and genre exploration",
        ],
        "repeat_listening_causes": [
            f"Repeat listening mentioned in {theme_counts['repetitive_listening']} items",
            "Comfort with familiar playlists over algorithmic exploration",
        ],
        "user_segments": [
            {
                "segment": "Power listeners",
                "challenges": ["Algorithm fatigue", "Same artists in Discover Weekly"],
                "evidence": "Common in Reddit and forum discussions",
            },
            {
                "segment": "Casual listeners",
                "challenges": ["Don't know where to start", "Rely on same playlists"],
                "evidence": "Visible in app store reviews",
            },
        ],
        "unmet_needs": [
            "More control over recommendation diversity",
            "Better surfacing of niche/new artists",
            "Clearer discovery paths beyond default playlists",
        ],
        "top_themes": [
            {
                "theme": theme.replace("_", " ").title(),
                "frequency": freq_label(count),
                "sentiment": "negative" if theme in ("frustration", "repetitive_listening") else "mixed",
                "example_quotes": examples[theme],
            }
            for theme, count in theme_counts.most_common(6)
        ],
        "actionable_opportunities": [
            "Introduce discovery mode that prioritizes novelty over familiarity",
            "Let users tune recommendation diversity (more new / more familiar)",
            "Surface 'why this was recommended' to build trust in the algorithm",
        ],
        "metadata": {
            "analysis_type": "rule_based_fallback",
            "total_records": len(records),
            "platform_breakdown": dict(platform_counts),
            "note": "Configure OPENAI_API_KEY or ANTHROPIC_API_KEY for AI-powered analysis",
        },
    }


def analyze_feedback(
    records: list[dict[str, Any]],
    output_path: Path | None = None,
) -> dict[str, Any]:
    output_path = output_path or OUTPUT_DIR / "analysis_report.json"

    prompt = _build_analysis_prompt(records)

    if OPENAI_API_KEY:
        try:
            result = _analyze_with_openai(prompt)
            result["metadata"] = {"analysis_type": "openai", "model": "gpt-4o-mini"}
        except Exception as error:
            result = _rule_based_analysis(records)
            result["metadata"]["ai_error"] = str(error)
    elif ANTHROPIC_API_KEY:
        try:
            result = _analyze_with_anthropic(prompt)
            result["metadata"] = {"analysis_type": "anthropic", "model": "claude-sonnet-4-20250514"}
        except Exception as error:
            result = _rule_based_analysis(records)
            result["metadata"]["ai_error"] = str(error)
    else:
        result = _rule_based_analysis(records)

    result["metadata"]["total_records_analyzed"] = len(records)
    save_json([result], output_path)
    return result


def generate_markdown_report(analysis: dict[str, Any], output_path: Path | None = None) -> str:
    output_path = output_path or OUTPUT_DIR / "analysis_report.md"

    lines = [
        "# Spotify Review Discovery Engine — Analysis Report",
        "",
        "## Executive Summary",
        analysis.get("executive_summary", ""),
        "",
        "## Why Users Struggle to Discover New Music",
    ]
    lines.extend(f"- {item}" for item in analysis.get("discovery_struggles", []))

    lines.extend(["", "## Recommendation Frustrations"])
    lines.extend(f"- {item}" for item in analysis.get("recommendation_frustrations", []))

    lines.extend(["", "## Desired Listening Behaviors"])
    lines.extend(f"- {item}" for item in analysis.get("desired_listening_behaviors", []))

    lines.extend(["", "## Causes of Repeat Listening"])
    lines.extend(f"- {item}" for item in analysis.get("repeat_listening_causes", []))

    lines.extend(["", "## User Segments"])
    for segment in analysis.get("user_segments", []):
        lines.append(f"### {segment.get('segment', 'Unknown')}")
        for challenge in segment.get("challenges", []):
            lines.append(f"- {challenge}")
        lines.append(f"- *Evidence:* {segment.get('evidence', '')}")

    lines.extend(["", "## Unmet Needs"])
    lines.extend(f"- {item}" for item in analysis.get("unmet_needs", []))

    lines.extend(["", "## Top Themes"])
    for theme in analysis.get("top_themes", []):
        lines.append(
            f"- **{theme.get('theme')}** ({theme.get('frequency')}, {theme.get('sentiment')})"
        )
        for quote in theme.get("example_quotes", [])[:2]:
            lines.append(f'  - "{quote[:150]}..."')

    lines.extend(["", "## Actionable Opportunities"])
    lines.extend(f"- {item}" for item in analysis.get("actionable_opportunities", []))

    report = "\n".join(lines)
    output_path.write_text(report, encoding="utf-8")
    return report
