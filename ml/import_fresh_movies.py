import os
import time
import requests
import concurrent.futures
import calendar
from pymongo import MongoClient
from dotenv import load_dotenv
from threading import Lock

load_dotenv()
load_dotenv("../server/.env")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/movie-recsys")
TMDB_ACCESS_TOKEN = os.getenv("TMDB_API_KEY")

# TMDb Rate Limit safety
MAX_WORKERS = 10

client = MongoClient(MONGO_URI)
db = client["movie-recsys"]
collection = db["movies"]

# Global counters and locks
progress_lock = Lock()
total_new_movies = 0

session = requests.Session()
session.headers.update({
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_ACCESS_TOKEN}"
})

def get_date_range(year, month):
    """Returns (start_date, end_date) strings for a given year/month"""
    last_day = calendar.monthrange(year, month)[1]
    start_date = f"{year}-{month:02d}-01"
    end_date = f"{year}-{month:02d}-{last_day}"
    return start_date, end_date

def fetch_month_movies(args):
    year, month = args
    global total_new_movies
    
    start_date, end_date = get_date_range(year, month)
    current_page = 1
    total_pages = 1 # Will be updated after first request
    movies_added_this_month = 0
    
    # Loop until we exhaust all pages for this month
    while current_page <= total_pages:
        # DISCOVER API: Filter by Release Date Range (Month)
        # Removed vote_count filter to get EVERYTHING
        url = f"https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page={current_page}&primary_release_date.gte={start_date}&primary_release_date.lte={end_date}&sort_by=popularity.desc"
        
        try:
            resp = session.get(url, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                
                # Update total_pages from the API response (only needed on page 1)
                if current_page == 1:
                    total_pages = min(data.get("total_pages", 1), 500) # Cap at 500 (API Limit)
                
                docs_to_insert = []
                
                for movie in results:
                    tmdb_id = movie.get("id")
                    
                    # Skip if exists
                    if collection.find_one({"tmdbId": tmdb_id}):
                        continue 

                    new_doc = {
                        "tmdbId": tmdb_id,
                        "title": movie.get("title"),
                        "overview": movie.get("overview"),
                        "posterPath": movie.get("poster_path"),
                        "backdropPath": movie.get("backdrop_path"),
                        "releaseDate": movie.get("release_date"),
                        "popularity": movie.get("popularity"),
                        "voteAverage": movie.get("vote_average"),
                        "voteCount": movie.get("vote_count"),
                        "hydrated": False, 
                        "trailerUrl": None 
                    }
                    docs_to_insert.append(new_doc)
                
                if docs_to_insert:
                    try:
                        collection.insert_many(docs_to_insert, ordered=False)
                        movies_added_this_month += len(docs_to_insert)
                    except:
                        pass

                current_page += 1
                
                # Tiny sleep to be nice to API
                time.sleep(0.1)

            elif resp.status_code == 429:
                sleep_time = int(resp.headers.get("Retry-After", 5))
                time.sleep(sleep_time)
                # Don't increment current_page, retry this page
            else:
                print(f"❌ Error {year}-{month} pg {current_page}: {resp.status_code}")
                break # Stop this month if error

        except Exception as e:
            print(f"❌ Exception {year}-{month}: {e}")
            break

    with progress_lock:
        global total_new_movies
        total_new_movies += movies_added_this_month
        if movies_added_this_month > 0:
            print(f"📅 {year}-{month:02d}: Added {movies_added_this_month} movies.")

def import_fresh_content():
    print("🌟 Importing COMPLETE Catalog (2018-2025) by Month...")
    print("⚠️ This may take a while as it fetches ALL movies...")
    
    tasks = []
    # Generate tasks for every month of every year
    for year in range(2018, 2026):
        for month in range(1, 13):
            tasks.append((year, month))

    print(f"📦 Queued {len(tasks)} months to process...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        executor.map(fetch_month_movies, tasks)

    print(f"✅ Import finished. Total added: {total_new_movies}")
    print("⚠️ IMPORTANT: Now run 'python hydrate_movies.py' to fetch Trailers/Cast!")

if __name__ == "__main__":
    import_fresh_content()