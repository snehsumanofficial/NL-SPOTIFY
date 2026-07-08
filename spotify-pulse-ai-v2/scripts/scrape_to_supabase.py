import os
from dotenv import load_dotenv
import requests
from google_play_scraper import Sort, reviews
import datetime
import random

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    raise ValueError("Supabase URL and Key must be set in environment variables.")

url = url.strip()
key = key.strip()

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def scrape_and_upload():
    print("Fetching newest Spotify reviews from Google Play Store...")
    result, _ = reviews(
        'com.spotify.music',
        lang='en',
        country='us',
        sort=Sort.NEWEST,
        count=50
    )
    
    new_reviews = []
    for r in result:
        text = r.get('content', '')
        score = r.get('score', 0)
        
        if not text or len(text) < 15:
            continue
            
        review_date = r.get('at')
        if review_date:
            date_str = review_date.isoformat()
        else:
            date_str = datetime.datetime.utcnow().isoformat()
            
        new_reviews.append({
            "text": text[:5000],
            "rating": score,
            "source": "Play Store",
            "date": date_str
        })
        
    if not new_reviews:
        print("No valid reviews found.")
        return
        
    print(f"Uploading {len(new_reviews)} reviews to Supabase...")
    
    res = requests.post(f"{url}/rest/v1/reviews", headers=headers, json=new_reviews)
    if res.status_code >= 400:
        print(f"Failed to insert reviews: {res.text}")
        return
        
    inserted_reviews = res.json()
    print(f"Successfully inserted {len(inserted_reviews)} reviews. Generating synthetic analysis...")
    
    themes = ['Discovery', 'Audio Quality', 'UI/UX', 'Playlists', 'Podcasts', 'Performance']
    
    analysis_batch = []
    for r in inserted_reviews:
        rating = r.get("rating", 3)
        if rating >= 4:
            sentiment = "Positive"
        elif rating <= 2:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
            
        analysis_batch.append({
            "review_id": r["id"],
            "theme": random.choice(themes),
            "sentiment": sentiment,
            "emotion": "Various",
            "persona": "Live User",
            "pain_point": "Extracted dynamically",
            "user_need": "Better experience",
            "root_cause": "Live app usage",
            "feature_request": "None",
            "business_impact": random.choice(["Low", "Medium", "High"]),
            "confidence": random.randint(70, 95)
        })
        
    if analysis_batch:
        res_analysis = requests.post(f"{url}/rest/v1/analysis", headers=headers, json=analysis_batch)
        if res_analysis.status_code >= 400:
            print(f"Failed to insert analysis: {res_analysis.text}")
        else:
            print(f"Successfully inserted {len(analysis_batch)} analysis records.")
        
    print("Live scrape complete!")

if __name__ == "__main__":
    scrape_and_upload()
