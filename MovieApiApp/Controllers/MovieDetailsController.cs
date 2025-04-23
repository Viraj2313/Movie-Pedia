using Microsoft.AspNetCore.Mvc;
using MovieApiApp.Data;

namespace MovieApiApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class MovieDetailsController(HttpClient httpClient, MainDbContext context, IConfiguration config) : ControllerBase
    {
        private readonly HttpClient _httpClient = httpClient;
        private readonly MainDbContext _context = context;
        private readonly IConfiguration _config = config;

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
            var apiKey = _config["ApiKeyOmDb"];
            var url = $"http://www.omdbapi.com/?i={imdbID}&apikey={apiKey}";
            var response = await _httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var movieDetails = await response.Content.ReadAsStringAsync();
                return Ok(movieDetails);
            }

            return BadRequest("Error fetching data");
        }

    }

}
