using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MovieApiApp.Data;

namespace MovieApiApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class MovieDetailsController(HttpClient httpClient, MainDbContext context, IConfiguration config, IMemoryCache cache) : ControllerBase
    {
        private readonly HttpClient _httpClient = httpClient;
        private readonly MainDbContext _context = context;
        private readonly IConfiguration _config = config;
        private readonly IMemoryCache _cache = cache;

        [HttpGet("test-db")]
        public IActionResult TestDb()
        {
            try
            {
                var canConnect = _context.Database.CanConnect();
                return Ok(new { message = canConnect ? "Database connection successful!" : "Failed to connect to database" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("movie_details")]
        public async Task<IActionResult> GetMovieById([FromQuery] string imdbID)
        {
            var cacheKey = $"omdb_detail_{imdbID}";

            if (_cache.TryGetValue(cacheKey, out string cachedDetails))
            {
                return Ok(cachedDetails);
            }

            var apiKey = _config["ApiKeyOmDb"];
            var url = $"http://www.omdbapi.com/?i={imdbID}&apikey={apiKey}";
            var response = await _httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var movieDetails = await response.Content.ReadAsStringAsync();
                _cache.Set(cacheKey, movieDetails, TimeSpan.FromHours(1));
                return Ok(movieDetails);
            }

            return BadRequest("Error fetching data");
        }
    }
}
