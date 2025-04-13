using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;

[Route("api/chat")]
[ApiController]
public class ChatController(MainDbContext context) : ControllerBase
{
    private readonly MainDbContext _context = context;

    [HttpGet("history")]
    public async Task<IActionResult> GetChatHistory([FromQuery] int senderId, [FromQuery] int receiverId)
    {
        var messages = await _context.ChatMessages
            .Where(m => (m.SenderId == senderId && m.ReceiverId == receiverId) ||
                        (m.SenderId == receiverId && m.ReceiverId == senderId))
            .OrderBy(m => m.Timestamp)
            .ToListAsync();

        return Ok(messages);
    }
}
