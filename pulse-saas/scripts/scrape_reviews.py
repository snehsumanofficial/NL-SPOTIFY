import os
import pandas as pd
from google_play_scraper import Sort, reviews

# Target CSV path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "api", "data", "live_playstore_reviews.csv")

def scrape_spotify_reviews():
    print("Fetching newest Spotify reviews from Google Play Store...")
    result, _ = reviews(
        'com.spotify.music',
        lang='en',
        country='us',
        sort=Sort.NEWEST,
        count=500
    )
    
    new_reviews = []
    for r in result:
        text = r.get('content', '')
        score = r.get('score', 0)
        
        if not text or len(text) < 15:
            continue
            
        sentiment = "Neutral"
        if score <= 2:
            sentiment = "Negative"
        elif score >= 4:
            sentiment = "Positive"
            
        new_reviews.append({
            "summary_paraphrased": text,
            "sentiment": sentiment,
            "score": score,
            "date": r.get('at', '').strftime("%Y-%m-%d %H:%M:%S") if r.get('at') else ""
        })
        
    df_new = pd.DataFrame(new_reviews)
    
    if os.path.exists(CSV_PATH):
        df_existing = pd.read_csv(CSV_PATH)
        # Combine and drop duplicates based on text
        df_combined = pd.concat([df_existing, df_new]).drop_duplicates(subset=['summary_paraphrased'])
    else:
        df_combined = df_new
        
    # Limit to latest 1000 reviews to avoid memory bloat on Vercel
    df_combined = df_combined.head(1000)
    
    df_combined.to_csv(CSV_PATH, index=False)
    print(f"Successfully saved {len(df_combined)} live reviews to {CSV_PATH}")

if __name__ == "__main__":
    scrape_spotify_reviews()
