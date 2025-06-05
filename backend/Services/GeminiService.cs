using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace WbApp.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public GeminiService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<string> GetGeminiResponse(string prompt)
        {
            string apiKey = _config["GEMINI_API_KEY"];
            string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));


            var response = await _httpClient.PostAsJsonAsync(url, requestBody);
            var json = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                dynamic result = JsonConvert.DeserializeObject(json);
                return result.candidates[0].content.parts[0].text ?? "No response";
            }

            return "Error: " + json;
        }
    }
}
