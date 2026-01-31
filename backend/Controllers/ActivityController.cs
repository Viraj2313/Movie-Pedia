using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;

namespace MovieApiApp.Controllers
{
    [Route("api/activity")]
    [ApiController]
    public class ActivityController(MainDbContext context) : ControllerBase
    {
        private readonly MainDbContext _context = context;

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserActivity(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var activities = await _context.ActivityLogs
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var total = await _context.ActivityLogs.CountAsync(a => a.UserId == userId);

            return Ok(new { activities, total, page, pageSize });
        }

        [HttpGet("my-activity")]
        public async Task<IActionResult> GetMyActivity([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userIdClaim = HttpContext.User.FindFirst("UserId");
            if (userIdClaim == null)
                return Unauthorized(new { message = "User not logged in" });

            var userId = int.Parse(userIdClaim.Value);
            return await GetUserActivity(userId, page, pageSize);
        }

        [HttpGet("friends/{userId}")]
        public async Task<IActionResult> GetFriendsActivity(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 30)
        {
            var friendIds = await _context.Friends
                .Where(f => f.UserId == userId)
                .Select(f => f.FriendId)
                .ToListAsync();

            var activities = await _context.ActivityLogs
                .Where(a => friendIds.Contains(a.UserId))
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var total = await _context.ActivityLogs.CountAsync(a => friendIds.Contains(a.UserId));

            return Ok(new { activities, total, page, pageSize });
        }

        [HttpGet("global")]
        public async Task<IActionResult> GetGlobalActivity([FromQuery] int page = 1, [FromQuery] int pageSize = 30)
        {
            var activities = await _context.ActivityLogs
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var total = await _context.ActivityLogs.CountAsync();

            return Ok(new { activities, total, page, pageSize });
        }
    }
}
