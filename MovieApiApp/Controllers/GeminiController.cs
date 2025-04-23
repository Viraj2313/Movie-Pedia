using Microsoft.AspNetCore.Mvc;
using MovieApiApp.Dto;
using WbApp.Services;

namespace MovieApiApp.Controllers
{
    [ApiController]
    [Route("api/gemini")]
    public class GeminiController(GeminiService geminiService) : ControllerBase
    {
        private readonly GeminiService _geminiService = geminiService;

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] PromptDto promptDto)
        {
            if (string.IsNullOrWhiteSpace(promptDto.Prompt))
            {
                return BadRequest("Prompt is required");
            }

            var result = await _geminiService.GetGeminiResponse(promptDto.Prompt);
            return Ok(result);
        }
    }
}