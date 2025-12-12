import os
import time
import requests
import concurrent.futures
from pymongo import MongoClient
from dotenv import load_dotenv
from threading import Lock

# --- Config ---
load_dotenv()
load_dotenv("../server/.env")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/movie-recsys")
TMDB_ACCESS_TOKEN = os.getenv("TMDB_API_KEY")

# TMDb allows ~50 requests/second. We'll use 15 workers for maximum throughput.
MAX_WORKERS = 15

# SET THIS TO TRUE TO FIX MISSING TRAILERS
RETRY_MODE = True

client = MongoClient(MONGO_URI)
db = client["movie-recsys"]
collection = db["movies"]

# Thread-safe counter for progress logging
progress_lock = Lock()
processed_count = 0
updated_count = 0
total_count = 0

# Create a session for connection pooling
session = requests.Session()
session.headers.update({
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_ACCESS_TOKEN}"
})

def fetch_and_update(movie):
    global processed_count, updated_count
    
    tmdb_id = movie.get('tmdbId')
    if not tmdb_id:
        return

    # UPDATED URL: Added include_video_language=en,null to catch videos without language tags
    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?language=en-US&append_to_response=videos,credits,keywords&include_video_language=en,null"
    
    try:
        # Retry logic for Rate Limiting
        for attempt in range(3):
            resp = session.get(url, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                
                # 1. Extract Trailer - "Desperate Mode"
                videos = data.get("videos", {}).get("results", [])
                trailer_url = None
                video_type_found = "None"
                
                # Sort videos to prioritize the best types
                # Trailer > Teaser > Clip > Featurette > Opening Credits > Others
                def get_video_score(vid):
                    if vid.get("site") != "YouTube": return -1
                    v_type = vid.get("type")
                    if v_type == "Trailer": return 10
                    if v_type == "Teaser": return 8
                    if v_type == "Clip": return 5
                    if v_type == "Featurette": return 3
                    return 1 # Catch-all for other types

                # Sort descending by score
                videos.sort(key=get_video_score, reverse=True)

                # Pick the best valid one
                for v in videos:
                    score = get_video_score(v)
                    if score > 0: # It's a YouTube video we accept
                        trailer_url = f"https://www.youtube.com/watch?v={v.get('key')}"
                        video_type_found = v.get("type")
                        break # We found the best available one

                # 2. Extract Cast (Top 10)
                cast_raw = data.get("credits", {}).get("cast", [])[:10]
                cast = [{
                    "id": c.get("id"),
                    "name": c.get("name"),
                    "character": c.get("character"),
                    "profilePath": c.get("profile_path"),
                    "order": c.get("order")
                } for c in cast_raw]

                # 3. Extract Directors
                crew_raw = data.get("credits", {}).get("crew", [])
                directors = [{
                    "id": c.get("id"),
                    "name": c.get("name"),
                    "profilePath": c.get("profile_path")
                } for c in crew_raw if c.get("job") == "Director"]

                # 4. Update MongoDB Document
                update_fields = {
                    "title": data.get("title"),
                    "originalTitle": data.get("original_title"),
                    "overview": data.get("overview"),
                    "posterPath": data.get("poster_path"),
                    "backdropPath": data.get("backdrop_path"),
                    "releaseDate": data.get("release_date"),
                    "runtime": data.get("runtime"),
                    "status": data.get("status"),
                    "voteAverage": data.get("vote_average"),
                    "voteCount": data.get("vote_count"),
                    "popularity": data.get("popularity"),
                    "genres": data.get("genres", []),
                    "keywords": data.get("keywords", {}).get("keywords", []),
                    "cast": cast,
                    "directors": directors,
                    "hydrated": True,
                    "lastUpdated": time.time()
                }

                # Only update trailerUrl if we found one
                if trailer_url:
                    update_fields["trailerUrl"] = trailer_url
                elif videos == []: 
                    update_fields["trailerUrl"] = None

                collection.update_one({"_id": movie["_id"]}, {"$set": update_fields})
                
                with progress_lock:
                    if trailer_url:
                        updated_count += 1
                break 

            elif resp.status_code == 404:
                collection.update_one({"_id": movie["_id"]}, {"$set": {"hydrated": True, "status": "Deleted"}})
                break
            
            elif resp.status_code == 429:
                sleep_time = int(resp.headers.get("Retry-After", 5))
                time.sleep(sleep_time)
            else:
                break

    except Exception as e:
        print(f"❌ Exception on ID {tmdb_id}: {e}")

    with progress_lock:
        processed_count += 1
        if processed_count % 200 == 0:
            print(f"🚀 Progress: {processed_count}/{total_count} | Found Videos: {updated_count}")

def hydrate_movies():
    global total_count
    
    if not TMDB_ACCESS_TOKEN:
        print("❌ Error: TMDB_API_KEY (Access Token) not found.")
        return

    # Build Query
    if RETRY_MODE:
        print("💧 Starting DEEP SEARCH Mode (Checking ALL movies without trailers)...")
        query = {
            "tmdbId": {"$exists": True},
            # Explicitly target movies where trailerUrl is missing or null
            "$or": [
                {"trailerUrl": None},
                {"trailerUrl": {"$exists": False}}
            ]
        }
    else:
        print("💧 Starting Standard Hydration (New movies only)...")
        query = {
            "tmdbId": {"$exists": True},
            "$or": [
                {"hydrated": {"$exists": False}}, 
                {"hydrated": False}
            ]
        }
    
    total_count = collection.count_documents(query)
    print(f"📊 Found {total_count} movies waiting for check.")
    
    print("⏳ Fetching list from DB (Sorting by Popularity)...")
    movies = list(collection.find(query, {"tmdbId": 1}).sort("popularity", -1))

    print(f"🧵 Spawning {MAX_WORKERS} worker threads...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        executor.map(fetch_and_update, movies)

    print("🎉 Hydration Complete!")

if __name__ == "__main__":
    hydrate_movies()