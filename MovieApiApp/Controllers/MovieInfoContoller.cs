
using Microsoft.AspNetCore.Mvc;
using WbApp.Services;
using MovieApiApp.Dto;

namespace MovieApiApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class MovieInfoController(GeminiService geminiService) : Controller
    {
        private readonly GeminiService _geminiService = geminiService;

        [HttpPost("get-trailer-url")]
        public async Task<IActionResult> GetTrailerUrl([FromBody] MovieInfoDto movieInfoDto)
        {
            if (string.IsNullOrWhiteSpace(movieInfoDto.MovieTitle))
            {
                return BadRequest("Movie title is required.");
            }
            var movieTitle = movieInfoDto.MovieTitle;
            var prompt = $"Just give a url for the youtube trailer of this movie {movieTitle} dont give any other text with it";
            var trailerUrl = await _geminiService.GetGeminiResponse(prompt);
            return Ok(trailerUrl);
        }
        [HttpPost("get-imdb-url")]
        public async Task<IActionResult> GetImdbUrl([FromBody] MovieInfoDto movieInfoDto)
        {
            if (string.IsNullOrWhiteSpace(movieInfoDto.MovieTitle))
            {
                return BadRequest("Movie title is required.");
            }
            var movieTitle = movieInfoDto.MovieTitle;
            var prompt = $"Just give a url for the imdb page of this movie {movieTitle} dont give any other text with it";
            var imdbUrl = await _geminiService.GetGeminiResponse(prompt);
            return Ok(imdbUrl);
        }
        [HttpPost("where-to-watch")]
        public async Task<IActionResult> WhereToWatch([FromBody] MovieInfoDto movieInfoDto)
        {
            if (string.IsNullOrWhiteSpace(movieInfoDto.MovieTitle))
            {
                return BadRequest("Movie title is required.");
            }
            var movieTitle = movieInfoDto.MovieTitle;
            var prompt = $"where to watch {movieTitle} just give array nothing else";
            var whereToWatchArr = await _geminiService.GetGeminiResponse(prompt);
            return Ok(whereToWatchArr);
        }
        [HttpPost("get-wiki-url")]
        public async Task<IActionResult> GetWikiUrl([FromBody] MovieInfoDto movieInfoDto)
        {
            if (string.IsNullOrWhiteSpace(movieInfoDto.MovieTitle))
            {
                return BadRequest("Movie title is required.");
            }
            var movieTitle = movieInfoDto.MovieTitle;
            var prompt = $"Just give a url for the wikipedia page of this movie {movieTitle} dont give any other text with it";
            var wikiUrl = await _geminiService.GetGeminiResponse(prompt);
            return Ok(wikiUrl);
        }
        [HttpPost("get-reviews-url")]
        public async Task<IActionResult> GetReviews([FromBody] MovieInfoDto movieInfoDto)
        {
            if (string.IsNullOrWhiteSpace(movieInfoDto.MovieTitle))
            {
                return BadRequest("Movie title is required.");
            }
            var movieTitle = movieInfoDto.MovieTitle;
            var prompt = $"Just give Rotten Tomatoes url for the movie {movieTitle} nothing else";
            var rtUrl = await _geminiService.GetGeminiResponse(prompt);
            return Ok(rtUrl);
        }
    }
}