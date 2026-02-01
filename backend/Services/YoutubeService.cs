using System.Text.Json;

namespace WbApp.Services
{
    public class YouTubeService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public YouTubeService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["YouTube:ApiKey"]!;
        }

        public async Task<string?> GetFirstTrailerUrl(string movieTitle)
        {
            var query = Uri.EscapeDataString($"{movieTitle} official trailer");

            var url =
                $"https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q={query}&key={_apiKey}";

            var json = await _httpClient.GetStringAsync(url);

            using var doc = JsonDocument.Parse(json);

            var items = doc.RootElement.GetProperty("items");
            if (items.GetArrayLength() == 0) return null;

            var videoId = items[0].GetProperty("id").GetProperty("videoId").GetString();
            if (string.IsNullOrWhiteSpace(videoId)) return null;

            return $"https://www.youtube.com/watch?v={videoId}";
        }

        public async Task<string?> GetTrailerVideoId(string movieTitle)
        {
            var query = Uri.EscapeDataString($"{movieTitle} official trailer");

            var url =
                $"https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q={query}&key={_apiKey}";

            var json = await _httpClient.GetStringAsync(url);

            using var doc = JsonDocument.Parse(json);

            var items = doc.RootElement.GetProperty("items");
            if (items.GetArrayLength() == 0) return null;

            var videoId = items[0].GetProperty("id").GetProperty("videoId").GetString();
            if (string.IsNullOrWhiteSpace(videoId)) return null;

            return videoId;
        }
    }
}
