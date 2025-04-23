from flask import Flask, jsonify,request
import aiohttp
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import os

def load_config():
    config = {}
    try:
        with open('config.json', 'r') as file:
            config = json.load(file)
    except FileNotFoundError:
        print("Warning: config.json not found. Using environment variables.")

    config["API_URL"] = os.getenv("API_URL", config.get("API_URL"))
    config["API_KEY"] = os.getenv("API_KEY", config.get("API_KEY"))

    return config

config = load_config()
API_KEY = config["API_KEY"]
API_URL = config["API_URL"]


app = Flask(__name__)
CORS(app,resources={r"/*": {"origins": ["https://moviepedia-p9bf.onrender.com","http://localhost:5174"]}})


async def fetch_liked_movies(user_id):
    url = f'{API_URL}/api/liked/{user_id}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            movie_ids = await response.json()
    
    movie_data = []
    for movie_id in movie_ids:
        movie_details = await fetch_movie_details(movie_id)
        if movie_details:
            movie_data.append(movie_details)
    
    return movie_data

async def fetch_movie_details(movie_id):
    api_url = f"http://www.omdbapi.com/?i={movie_id}&apikey={API_KEY}"
    async with aiohttp.ClientSession() as session:
        async with session.get(api_url) as response:
            data = await response.json()
    
    if data.get("Response") == "True" and data.get("Plot"):
        return {
            "id": movie_id,
            "title": data.get("Title"),
            "plot": data.get("Plot", ""), 
            "poster": data.get("Poster", "")  
        }
    else:
        return None

async def fetch_movies():
    url = f"{API_URL}/api/Home"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                data = await response.json()
                movie_data = []
                for movie in data:
                    movie_details = await fetch_movie_details(movie.get('imdbID'))
                    if movie_details:
                        movie_data.append(movie_details)
                return movie_data
    return []

@app.route('/recommend/<user_id>', methods=['GET'])
async def recommend(user_id):
    liked_movies = await fetch_liked_movies(user_id)
    if not liked_movies:
        return jsonify({"Recommendations": []})
    
    liked_plots = [movie['plot'] for movie in liked_movies if 'plot' in movie]
    liked_titles = [movie['title'] for movie in liked_movies if 'title' in movie]
    
    if not liked_plots:
        return jsonify({"Recommendations": []})
    
    home_movies = await fetch_movies()
    home_movie_dict = {movie['title']: {"id": movie['id'], "poster": movie['poster']} for movie in home_movies if 'title' in movie and 'plot' in movie}
    
    home_titles = list(home_movie_dict.keys())
    home_plots = [movie['plot'] for movie in home_movies if 'plot' in movie]
    
    if not home_plots:
        return jsonify({"Recommendations": []})
    
    all_plots = liked_plots + home_plots
    
    #vectorizes the plots of the movies to be able to compare the similarity between the liked movies and the home movies
    vectorizer = TfidfVectorizer(stop_words='english')

    #creates a matrix of the plots of the movies
    tfidf_matrix = vectorizer.fit_transform(all_plots)
    print(tfidf_matrix)
    #compares the cosine similarity between the liked movies and the home movies the cosine similiarity returns the similarity score 
    # between the two movies
    cosine_sim = cosine_similarity(tfidf_matrix[:len(liked_plots)], tfidf_matrix[len(liked_plots):])
    recommendations = []
    #sorts the movies based on the similarity score and returns the top 5 similar movies
    for i, similarities in enumerate(cosine_sim):
        similar_movies = sorted(list(enumerate(similarities)), key=lambda x: x[1], reverse=True)[:5]
        recommendations += [{
            "title": home_titles[movie[0]],
            "imdbID": home_movie_dict[home_titles[movie[0]]]["id"],
            "poster": home_movie_dict[home_titles[movie[0]]]["poster"]
        } for movie in similar_movies]
    #removes duplicates from the recommendations
    recommendations = list({movie["imdbID"]: movie for movie in recommendations}.values())  # Remove duplicates
    
    return jsonify({"Recommendations": recommendations})
@app.route("/healthcheck",methods=['GET','HEAD'])
def healthCheck():
    if request.method=='HEAD':
        return '', 200
    return jsonify({"status":"OK"}),200
if __name__ == '__main__':
    app.run(debug=True, port=5001)
