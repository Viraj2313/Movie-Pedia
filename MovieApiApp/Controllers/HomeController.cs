using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace MovieApiApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : Controller
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public HomeController(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> GetMovies()
        {
            try
            {
                var apiKey = _configuration["ApiKeyOmDb"];

                var movies1 = await _httpClient.GetStringAsync($"http://www.omdbapi.com/?s=batman&apikey={apiKey}");
                var movies2 = await _httpClient.GetStringAsync($"http://www.omdbapi.com/?s=superman&apikey={apiKey}");

                var list1 = ExtractMovies(movies1);
                var list2 = ExtractMovies(movies2);

                var mergedMovies = list1.Concat(list2).ToList();

                return Ok(mergedMovies);
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
        public async Task<IActionResult> SearchMovies(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest("search cannot be empty");
            }
            try
            {
                string apiKey = _configuration["ApiKeyOmDb"];
                string apiUrl = $"http://www.omdbapi.com/?s={query}&apikey={apiKey}";
                var movies = await _httpClient.GetStringAsync(apiUrl);
                return Ok(movies);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("healthcheck"), HttpHead("healthcheck")]
        public IActionResult HealthCheck()
        {
            return Ok(new { status = "OK" });
        }

    }
}
