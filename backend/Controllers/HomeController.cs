using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace MovieApiApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : Controller
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;

        public HomeController(HttpClient httpClient, IConfiguration configuration, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _cache = cache;
        }

        private static readonly string[] SearchTerms = ["batman", "superman", "marvel", "star", "spider", "action", "avenger", "dark", "iron", "war"];

        [HttpGet]
        public async Task<IActionResult> GetMovies([FromQuery] string? type, [FromQuery] string? year, [FromQuery] int page = 1)
        {
            try
            {
                var apiKey = _configuration["ApiKeyOmDb"];
                var filterParams = BuildFilterParams(type, year);

                int termsPerPage = 2;
                int termIndex = ((page - 1) * termsPerPage) % SearchTerms.Length;
                int omdbPage = ((page - 1) * termsPerPage / SearchTerms.Length) + 1;

                var allMovies = new List<Dictionary<string, string>>();
                bool hasMore = true;

                for (int i = 0; i < termsPerPage; i++)
                {
                    var term = SearchTerms[(termIndex + i) % SearchTerms.Length];
                    var cacheKey = $"omdb_browse_{term}_{omdbPage}_{type}_{year}";

                    if (!_cache.TryGetValue(cacheKey, out string response))
                    {
                        var url = $"http://www.omdbapi.com/?s={term}&page={omdbPage}&apikey={apiKey}{filterParams}";
                        response = await _httpClient.GetStringAsync(url);
                        _cache.Set(cacheKey, response, TimeSpan.FromMinutes(30));
                    }

                    var movies = ExtractMovies(response);
                    allMovies.AddRange(movies);

                    if (movies.Count < 10) hasMore = false;
                }

                allMovies = allMovies
                    .GroupBy(m => m.ContainsKey("imdbID") ? m["imdbID"] : m["Title"].ToLower())
                    .Select(g => g.First())
                    .ToList();

                return Ok(new { movies = allMovies, hasMore, page });
            }
            catch
            {
                return StatusCode(500, "Internal server error");
            }
        }

        private List<Dictionary<string, string>> ExtractMovies(string json)
        {
            var movieList = new List<Dictionary<string, string>>();

            try
            {
                if (string.IsNullOrWhiteSpace(json)) return movieList;

                var jsonObject = JsonConvert.DeserializeObject<Dictionary<string, object>>(json);

                if (jsonObject != null && jsonObject.ContainsKey("Search"))
                {
                    var searchResults = JsonConvert.DeserializeObject<List<Dictionary<string, string>>>(jsonObject["Search"]?.ToString() ?? "[]");
                    if (searchResults != null)
                    {
                        movieList = searchResults;
                    }
                }
            }
            catch
            {
                return new List<Dictionary<string, string>>();
            }

            return movieList;
        }

        [HttpGet("search-movie/{query}")]
        public async Task<IActionResult> SearchMovies(string query, [FromQuery] string? type, [FromQuery] string? year)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest("search cannot be empty");
            }
            try
            {
                var cacheKey = $"omdb_search_{query.ToLower()}_{type}_{year}";

                if (!_cache.TryGetValue(cacheKey, out string movies))
                {
                    string apiKey = _configuration["ApiKeyOmDb"];
                    var filterParams = BuildFilterParams(type, year);
                    string apiUrl = $"http://www.omdbapi.com/?s={query}&apikey={apiKey}{filterParams}";
                    movies = await _httpClient.GetStringAsync(apiUrl);
                    _cache.Set(cacheKey, movies, TimeSpan.FromMinutes(15));
                }

                return Ok(movies);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private static string BuildFilterParams(string? type, string? year)
        {
            var filterParams = "";
            if (!string.IsNullOrWhiteSpace(type))
                filterParams += $"&type={type}";
            if (!string.IsNullOrWhiteSpace(year))
                filterParams += $"&y={year}";
            return filterParams;
        }

        [HttpGet("healthcheck"), HttpHead("healthcheck")]
        public IActionResult HealthCheck()
        {
            return Ok(new { status = "OK" });
        }
    }
}
