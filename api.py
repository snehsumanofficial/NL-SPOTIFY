from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from openai import OpenAI

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

# Initialize Groq Client
API_KEY = os.environ.get("GROQ_API_KEY", "")
client = OpenAI(
    api_key=API_KEY,
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
            model="llama-3.1-70b-versatile",
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
