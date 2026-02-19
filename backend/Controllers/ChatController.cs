using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;

[Route("api/chat")]
[ApiController]
public class ChatController(MainDbContext context) : ControllerBase
{
    private readonly MainDbContext _context = context;

    [HttpGet("history")]
    public async Task<IActionResult> GetChatHistory(
        [FromQuery] int senderId,
        [FromQuery] int receiverId,
        [FromQuery] int pageSize = 50,
        [FromQuery] DateTime? before = null)
    {
        var query = _context.ChatMessages
            .Where(m => (m.SenderId == senderId && m.ReceiverId == receiverId) ||
                        (m.SenderId == receiverId && m.ReceiverId == senderId));

        if (before.HasValue)
        {
            query = query.Where(m => m.Timestamp < before.Value);
        }

        var messages = await query
            .OrderByDescending(m => m.Timestamp)
            .Take(pageSize)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();

        return Ok(messages);
    }
}
