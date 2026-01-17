using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace WbApp.Services
{
    public class GroqService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public GroqService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<string> GetGroqResponse(string prompt)
        {
            string apiKey = _config["GROQ_API_KEY"];
            string url = "https://api.groq.com/openai/v1/chat/completions";

            var requestBody = new
            {
                model = "llama-3.1-8b-instant",
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                temperature = 0.2
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Content = JsonContent.Create(requestBody);

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return "Error: " + json;
            }

            dynamic result = JsonConvert.DeserializeObject(json);
            return result.choices[0].message.content ?? "No response";
        }
    }
}
