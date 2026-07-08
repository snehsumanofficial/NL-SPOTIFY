from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from openai import OpenAI
import pandas as pd
import glob
import re

app = FastAPI(title="Spotify Vibe Check API")

# Allow CORS for Vercel Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VibeRequest(BaseModel):
    vibe_description: str
    familiarity_preference: str # 'low', 'medium', 'high'

class CopilotRequest(BaseModel):
    query: str

def load_reviews():
    all_reviews = []
    # Find all CSV files in the data directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    csv_files = glob.glob(os.path.join(data_dir, "*.csv"))
    for file in csv_files:
        try:
            df = pd.read_csv(file)
            basename = os.path.basename(file)
            source_name = basename.replace(".csv", "").replace("_", " ").title()
            
            # Find the text column (could be 'summary_paraphrased' or 'comment_text')
            text_col = None
            if "summary_paraphrased" in df.columns:
                text_col = "summary_paraphrased"
            elif "comment_text" in df.columns:
                text_col = "comment_text"
            
            if text_col:
                # Add to all_reviews list
                for _, row in df.iterrows():
                    sentiment = "Neutral"
                    if "sentiment" in df.columns:
                        sentiment = str(row["sentiment"]).capitalize()
                    
                    review_text = str(row[text_col])
                    if len(review_text) > 10 and review_text.lower() != "nan":
                        all_reviews.append({
                            "id": len(all_reviews) + 1,
                            "text": review_text,
                            "source": source_name,
                            "sentiment": sentiment
                        })
        except Exception as e:
            print(f"Error loading {file}: {e}")
    return all_reviews

# Cache the reviews in memory
ALL_REVIEWS = load_reviews()

# Initialize Groq Client
API_KEY = os.environ.get("GROQ_API_KEY", "")
client = OpenAI(
    api_key=API_KEY if API_KEY else "dummy_key",
    base_url="https://api.groq.com/openai/v1"
)

@app.post("/generate-vibe-playlist")
async def generate_vibe_playlist(request: VibeRequest):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable is not set on the server.")
        
    prompt = f"""
    You are an expert AI Music Curator for Spotify. 
    A user is frustrated with the standard algorithm repeating the same songs. 
    They have provided the following real-time intent for their session:
    - Current Vibe/Activity: "{request.vibe_description}"
    - Familiarity Preference: "{request.familiarity_preference}"
    
    Generate a highly curated, mood-specific playlist of 5 songs that perfectly matches this vibe.
    Since they are frustrated with algorithms, ensure the selections are creative, diverse, and fit the intent perfectly.
    
    Return the response ONLY as a JSON array of objects, with each object having exactly two keys: "title" and "artist".
    Do not include markdown blocks or any other text.
    """
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful JSON-only API. You output raw JSON arrays and nothing else."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        
        # Parse the JSON response
        content = response.choices[0].message.content.strip()
        
        # Remove potential markdown formatting if the model disobeys
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        playlist = json.loads(content)
        
        return {
            "status": "success",
            "message": "AI successfully broke the algorithm trap and generated a context-aware session.",
            "playlist": playlist
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        # Fallback response in case API fails
        fallback_playlist = [
            {"title": "Echoes of the Unknown", "artist": "The New Explorers"},
            {"title": "Breaking the Loop", "artist": "AI Curators"},
            {"title": "Fresh Frequencies", "artist": "Vibe Masters"},
            {"title": "Uncharted Rhythms", "artist": "Sonic Pioneers"},
            {"title": "Beyond the Algorithm", "artist": "Data Rebels"}
        ]
        return {
            "status": "fallback",
            "message": f"Using fallback logic due to API error: {str(e)}",
            "playlist": fallback_playlist
        }

@app.get("/")
async def root():
    return {"message": "Spotify Vibe Check API is running! Connect your Vercel frontend to /generate-vibe-playlist."}

@app.post("/api/copilot")
async def copilot_chat(request: CopilotRequest):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set.")
    
    query = request.query.lower()
    
    # Simple keyword search (tokenize query and count matches)
    keywords = set(re.findall(r'\w+', query))
    stop_words = {"what", "why", "how", "the", "a", "an", "and", "or", "but", "is", "are", "do", "does", "to", "of", "for", "in", "on", "with", "about"}
    keywords = keywords - stop_words
    
    scored_reviews = []
    for review in ALL_REVIEWS:
        text_lower = review["text"].lower()
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scored_reviews.append((score, review))
            
    # Sort by score descending
    scored_reviews.sort(key=lambda x: x[0], reverse=True)
    
    # Take top 30 most relevant reviews
    top_reviews = [r[1] for r in scored_reviews[:30]]
    
    # If no keywords matched well, just take some random reviews
    if not top_reviews:
        import random
        top_reviews = random.sample(ALL_REVIEWS, min(30, len(ALL_REVIEWS)))
        
    # Calculate stats for evidence
    total_used = len(top_reviews)
    sources = {}
    for r in top_reviews:
        sources[r["source"]] = sources.get(r["source"], 0) + 1
        
    evidence_reviews = [
        {
            "id": r["id"], 
            "text": r["text"], 
            "source": r["source"], 
            "sentiment": r["sentiment"]
        } for r in top_reviews[:5]  # send top 5 to frontend for display
    ]
    
    # Build the prompt
    context_text = "\n".join([f"- [{r['source']}] ({r['sentiment']}): {r['text']}" for r in top_reviews])
    
    system_prompt = """You are Spotify Pulse AI, an evidence-based Product Intelligence Assistant.
You must answer the user's product question STRICTLY using the provided retrieved customer feedback context.
Format your response exactly with these markdown sections (do not output JSON, just markdown):

### Executive Summary
[Brief summary of what the data says]

### Evidence Summary
* **Matching Reviews:** [Number of reviews analyzed]
* **Sources:** [List sources from the context]

### Representative User Quotes
[Select 2-3 compelling quotes from the context. Format as blockquotes: > "quote" - *Source*]

### Root Cause
[Why are users feeling this way based on the data?]

### Product Opportunity
[What should Spotify build or fix based on this feedback?]

### Confidence Score
[Assign a percentage confidence based on how strong and consistent the signal is in the context, e.g. **88%** (High Confidence)]
"""
    
    user_prompt = f"User Question: {request.query}\n\nRetrieved Context:\n{context_text}"
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=1024,
        )
        ai_response_text = response.choices[0].message.content.strip()
    except Exception as e:
        ai_response_text = f"Error connecting to AI: {str(e)}"
        
    return {
        "response": ai_response_text,
        "evidence": {
            "totalUsed": total_used,
            "sources": sources,
            "themes": list(keywords)[:2] if keywords else ["General Feedback"],
            "confidence": 85,
            "reviews": evidence_reviews
        }
    }
