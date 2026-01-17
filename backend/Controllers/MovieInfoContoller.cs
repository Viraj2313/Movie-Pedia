using Microsoft.AspNetCore.Mvc;
using WbApp.Services;
using MovieApiApp.Dto;

namespace MovieApiApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class MovieInfoController(AiService aiService) : Controller
    {
        private readonly AiService _aiService = aiService;

        [HttpPost("get-trailer-url")]
        public async Task<IActionResult> GetTrailerUrl([FromBody] MovieInfoDto movieInfoDto)
        {
            if (string.IsNullOrWhiteSpace(movieInfoDto.MovieTitle))
            {
                return BadRequest("Movie title is required.");
            }

            var movieTitle = movieInfoDto.MovieTitle;
            var prompt = $"Just give a url for the youtube trailer of this movie {movieTitle} dont give any other text with it";
            var trailerUrl = await _aiService.GetResponse(prompt);

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
            var imdbUrl = await _aiService.GetResponse(prompt);

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
            var prompt = $@"
            Return ONLY a JSON array of streaming platforms (strings) where the movie can be watched.
            Rules:
            - Output must start with [ and end with ]
            - Only strings inside the array
            - No extra text, no markdown, no code fences
            Example: [""Netflix"",""Prime Video""]
            Movie: {movieTitle}
            ";
            var whereToWatchArr = await _aiService.GetResponse(prompt);

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
            var wikiUrl = await _aiService.GetResponse(prompt);

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
            var rtUrl = await _aiService.GetResponse(prompt);

            return Ok(rtUrl);
        }
    }
}
