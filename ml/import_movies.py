import pandas as pd
import ast
import numpy as np
from pymongo import MongoClient
from pymongo.errors import BulkWriteError
from datetime import datetime
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://quangtan:quangtan@localhost:27017/movie-recsys?authSource=admin")
DB_NAME = "movie-recsys"
CSV_PATH = "data/"

print(f"Connecting to MongoDB at: {MONGO_URI} (DB: {DB_NAME})")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db["movies"]

def parse_json_safe(x):
    try:
        return ast.literal_eval(x)
    except (ValueError, SyntaxError):
        return []

def get_directors(crew_list):
        directors = []
        for member in crew_list:
            if member.get('job') == 'Director':
                directors.append({
                    'id': member.get('id'),
                    'name': member.get('name'),
                    'profilePath': member.get('profile_path')
                })
        return directors

def clean_movie_data():
    print("Loading CSV files (this may take a moment)...")
    
    try:
        meta_df = pd.read_csv(f"{CSV_PATH}movies_metadata.csv", low_memory=False)
    except FileNotFoundError:
        print(f"Error: Could not find 'movies_metadata.csv' in {CSV_PATH}")
        return
    
    meta_df = meta_df.drop([19730, 29503, 35587], errors='ignore')
    meta_df['id'] = pd.to_numeric(meta_df['id'], errors='coerce')
    meta_df.dropna(subset=['id'], inplace=True)
    meta_df['id'] = meta_df['id'].astype(int)

    initial_count = len(meta_df)
    meta_df.drop_duplicates(subset=['id'], inplace=True)
    print(f"Removed {initial_count - len(meta_df)} duplicate rows from dataset.")

    try:
        credits_df = pd.read_csv(f"{CSV_PATH}credits.csv")
        keywords_df = pd.read_csv(f"{CSV_PATH}keywords.csv")
    except FileNotFoundError as e:
        print(f"Error: Could not find CSV file: {e}")
        return

    credits_df['id'] = credits_df['id'].astype(int)
    keywords_df['id'] = keywords_df['id'].astype(int)

    print("Merging datasets...")
    meta_df = meta_df.merge(credits_df, on='id', how='left')
    meta_df = meta_df.merge(keywords_df, on='id', how='left')

    print("Processing data rows...")
    
    movies_to_insert = []
    total = len(meta_df)
    
    for index, row in meta_df.iterrows():
        if index % 1000 == 0:
            print(f"Processed {index}/{total} movies...")

        genres = parse_json_safe(row['genres'])
        keywords = parse_json_safe(row['keywords']) if 'keywords' in row else []
        cast_raw = parse_json_safe(row['cast']) if 'cast' in row else []
        crew_raw = parse_json_safe(row['crew']) if 'crew' in row else []

        cast = []
        for actor in cast_raw[:10]: 
            cast.append({
                'id': actor.get('id'),
                'name': actor.get('name'),
                'character': actor.get('character'),
                'profilePath': actor.get('profile_path'),
                'order': actor.get('order')
            })

        directors = get_directors(crew_raw)

        try:
            release_date = datetime.strptime(str(row['release_date']), '%Y-%m-%d')
        except:
            release_date = None

        def clean_float(val):
            try:
                return float(val) if not pd.isna(val) else 0.0
            except:
                return 0.0
        
        def clean_int(val):
            try:
                return int(val) if not pd.isna(val) else 0
            except:
                return 0

        movie_doc = {
            "tmdbId": int(row['id']),
            "imdbId": row['imdb_id'] if pd.notna(row['imdb_id']) else None,
            "title": row['title'],
            "originalTitle": row['original_title'],
            "overview": row['overview'] if pd.notna(row['overview']) else "",
            "tagline": row['tagline'] if pd.notna(row['tagline']) else "",
            "releaseDate": release_date,
            "runtime": clean_float(row['runtime']),
            "status": row['status'],
            "genres": [{'id': g['id'], 'name': g['name']} for g in genres],
            "keywords": [{'id': k['id'], 'name': k['name']} for k in keywords],
            "cast": cast,
            "directors": directors,
            "voteAverage": clean_float(row['vote_average']),
            "voteCount": clean_int(row['vote_count']),
            "popularity": clean_float(row['popularity']),
            "posterPath": row['poster_path'] if pd.notna(row['poster_path']) else None,
            "backdropPath": None
        }
        
        movies_to_insert.append(movie_doc)

        if len(movies_to_insert) >= 5000:
            try:
                collection.insert_many(movies_to_insert, ordered=False)
                movies_to_insert = []
                print("Batch inserted to MongoDB")
            except BulkWriteError as bwe:
                inserted_count = bwe.details['nInserted']
                print(f"Batch processed. Inserted {inserted_count} new movies (skipped duplicates).")
                movies_to_insert = []
            except Exception as e:
                print(f"Error inserting batch: {e}")
                return

    if movies_to_insert:
        try:
            collection.insert_many(movies_to_insert, ordered=False)
            print("Final batch inserted.")
        except BulkWriteError as bwe:
             print(f"Final batch processed. Inserted {bwe.details['nInserted']} new movies.")
        except Exception as e:
            print(f"Error inserting final batch: {e}")
    
    print("Finished! Data import complete.")

if __name__ == "__main__":
    clean_movie_data()
