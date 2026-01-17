using Newtonsoft.Json;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

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
            string url =
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";

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

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Content = JsonContent.Create(requestBody);

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                throw new HttpRequestException("Gemini RPD limit exceeded (429).", null, response.StatusCode);
            }

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Gemini Error: {json}", null, response.StatusCode);
            }

            dynamic result = JsonConvert.DeserializeObject(json);
            return result.candidates[0].content.parts[0].text ?? "No response";
        }
    }
}
