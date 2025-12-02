import os
import time
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

# --- Configuration ---
load_dotenv() 
load_dotenv("../client/.env") 

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://quangtan:quangtan@localhost:27017/movie-recsys?authSource=admin")
DB_NAME = "movie-recsys"

# TMDb Access Token (The long string starting with eyJ...)
TMDB_ACCESS_TOKEN = os.getenv("TMDB_API_KEY", "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzM2U0MGRiZGRmYTk1ODBkNjVlZjcwNDgyMzczZDAwNiIsIm5iZiI6MTc2MDI1NDk3Ni4wMzgsInN1YiI6IjY4ZWI1YzAwNjlkYmRhZTEyYmMzZGZhNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A5t_gUPiRXKcrqgVk19JsmHJzyz_aBUmHo2AmMY2WKw").strip()

# --- Setup ---
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db["movies"]

def fetch_trailers():
    print("🎬 Starting Trailer Fetcher...")

    if TMDB_ACCESS_TOKEN == "YOUR_TMDB_TOKEN_HERE" or not TMDB_ACCESS_TOKEN:
        print("\n❌ ERROR: TMDb Token is missing.")
        return

    # Debug: Print masked token
    masked_key = f"{TMDB_ACCESS_TOKEN[:10]}...{TMDB_ACCESS_TOKEN[-5:]}"
    print(f"🔑 Using Token: {masked_key}")

    # Query for movies missing trailers
    query = {"trailerUrl": {"$exists": False}}
    total_to_process = collection.count_documents(query)
    cursor = collection.find(query, {"tmdbId": 1})
    
    print(f"📊 Found {total_to_process} movies to check for trailers.")
    
    count = 0
    updated_count = 0
    
    # Headers for v4 Auth (Bearer Token)
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_ACCESS_TOKEN}"
    }
    
    for movie in cursor:
        count += 1
        tmdb_id = movie.get("tmdbId")
        
        if not tmdb_id:
            continue

        try:
            tmdb_id = int(tmdb_id)

            # URL without api_key parameter
            url = f"https://api.themoviedb.org/3/movie/{tmdb_id}/videos?language=en-US"
            
            # Pass headers here
            response = requests.get(url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                
                trailer_link = None
                
                # Priority 1: Official Trailer on YouTube
                for video in results:
                    if video.get("site") == "YouTube" and video.get("type") == "Trailer":
                        trailer_link = f"https://www.youtube.com/watch?v={video.get('key')}"
                        break
                
                # Priority 2: Teaser on YouTube
                if not trailer_link:
                    for video in results:
                        if video.get("site") == "YouTube" and video.get("type") == "Teaser":
                            trailer_link = f"https://www.youtube.com/watch?v={video.get('key')}"
                            break

                if trailer_link:
                    collection.update_one(
                        {"_id": movie["_id"]},
                        {"$set": {"trailerUrl": trailer_link}}
                    )
                    updated_count += 1
                else:
                    collection.update_one(
                        {"_id": movie["_id"]},
                        {"$set": {"trailerUrl": None}}
                    )

            elif response.status_code == 401:
                print(f"   ❌ 401 Unauthorized for ID {tmdb_id}.")
                print(f"   PLEASE CHECK: Is '{masked_key}' valid?")
                break 
            elif response.status_code == 429:
                print("   ⚠️ Rate limit hit. Sleeping...")
                time.sleep(10)
            elif response.status_code == 404:
                 collection.update_one(
                        {"_id": movie["_id"]},
                        {"$set": {"trailerUrl": None}}
                    )
            
        except Exception as e:
            print(f"   ❌ Error processing ID {tmdb_id}: {e}")

        if count % 100 == 0:
            print(f"   ⏳ Processed {count}/{total_to_process} | Updated: {updated_count}")
        
        time.sleep(0.25)

    print(f"🎉 Done! Updated trailers for {updated_count} movies.")

if __name__ == "__main__":
    fetch_trailers()