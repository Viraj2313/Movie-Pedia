using Microsoft.AspNetCore.Mvc;
using WbApp.Services;
using MovieApiApp.Dto;

namespace MovieApiApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class MovieInfoController(YouTubeService youTubeService, AiService aiService) : Controller
    {

        private readonly YouTubeService _youTubeService = youTubeService;
        private readonly AiService _aiService = aiService;

        [HttpPost("get-trailer-url")]
        public async Task<IActionResult> GetTrailerUrl([FromBody] MovieInfoDto movieInfoDto)
        {
            if (string.IsNullOrWhiteSpace(movieInfoDto.MovieTitle))
                return BadRequest("Movie title is required.");

            var url = await _youTubeService.GetFirstTrailerUrl(movieInfoDto.MovieTitle);

            if (string.IsNullOrWhiteSpace(url))
                return NotFound("Trailer not found.");

            return Ok(url);
        }

        [HttpPost("get-trailer-id")]
        public async Task<IActionResult> GetTrailerId([FromBody] MovieInfoDto movieInfoDto)
        {
            if (string.IsNullOrWhiteSpace(movieInfoDto.MovieTitle))
                return BadRequest("Movie title is required.");

            var videoId = await _youTubeService.GetTrailerVideoId(movieInfoDto.MovieTitle);

            if (string.IsNullOrWhiteSpace(videoId))
                return NotFound("Trailer not found.");

            return Ok(videoId);
        }

        [HttpPost("get-imdb-url")]
        public IActionResult GetImdbUrl([FromBody] MovieInfoDto movieInfoDto)
        {
            if (string.IsNullOrWhiteSpace(movieInfoDto.MovieTitle))
                return BadRequest("IMDb ID is required.");

            var imdbId = movieInfoDto.MovieTitle.Trim();


            var imdbUrl = $"https://www.imdb.com/title/{imdbId}/";
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
