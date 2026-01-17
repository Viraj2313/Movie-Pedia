using System.Net;

namespace WbApp.Services
{
    public class AiService
    {
        private readonly GeminiService _geminiService;
        private readonly GroqService _groqService;

        public AiService(GeminiService geminiService, GroqService groqService)
        {
            _geminiService = geminiService;
            _groqService = groqService;
        }

        public async Task<string> GetResponse(string prompt)
        {
            try
            {
                return await _geminiService.GetGeminiResponse(prompt);
            }
            catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
            {
                return await _groqService.GetGroqResponse(prompt);
            }
        }
    }
}
