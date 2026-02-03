using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;
using MovieApiApp.Models;
using System.Security.Claims;

namespace MovieApiApp.Controllers
{
    [Route("api/watch-history")]
    [ApiController]
    public class WatchHistoryController(MainDbContext context) : ControllerBase
    {
        private readonly MainDbContext _context = context;

        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddToWatchHistory([FromBody] WatchHistoryDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId) || userId == 0)
                return Unauthorized(new { message = "User not logged in" });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var existing = await _context.WatchHistories
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == dto.MovieId);

            if (existing != null)
            {
                existing.Rating = dto.Rating;
                existing.Review = dto.Review;
                existing.WatchedAt = dto.WatchedAt ?? DateTime.UtcNow;
            }
            else
            {
                var watchHistory = new WatchHistory
                {
                    UserId = userId,
                    MovieId = dto.MovieId,
                    MovieTitle = dto.MovieTitle,
                    MoviePoster = dto.MoviePoster,
                    Rating = dto.Rating,
                    Review = dto.Review,
                    WatchedAt = dto.WatchedAt ?? DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                _context.WatchHistories.Add(watchHistory);

                var activity = new ActivityLog
                {
                    UserId = userId,
                    UserName = user.Name,
                    ActivityType = dto.Rating.HasValue ? "watched_rated" : "watched",
                    MovieId = dto.MovieId,
                    MovieTitle = dto.MovieTitle,
                    MoviePoster = dto.MoviePoster,
                    Details = dto.Rating.HasValue ? $"{{\"rating\":{dto.Rating}}}" : null,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ActivityLogs.Add(activity);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Movie added to watch history" });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserWatchHistory(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var history = await _context.WatchHistories
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.WatchedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var total = await _context.WatchHistories.CountAsync(w => w.UserId == userId);

            return Ok(new { history, total, page, pageSize });
        }

        [Authorize]
        [HttpGet("my-history")]
        public async Task<IActionResult> GetMyWatchHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
                return Unauthorized(new { message = "User not logged in" });

            return await GetUserWatchHistory(userId, page, pageSize);
        }

        [Authorize]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateWatchHistory(int id, [FromBody] UpdateWatchHistoryDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
                return Unauthorized(new { message = "User not logged in" });

            var entry = await _context.WatchHistories.FindAsync(id);

            if (entry == null)
                return NotFound(new { message = "Watch history entry not found" });

            if (entry.UserId != userId)
                return Unauthorized(new { message = "Not authorized to update this entry" });

            if (dto.Rating.HasValue)
                entry.Rating = dto.Rating;
            if (dto.Review != null)
                entry.Review = dto.Review;
            if (dto.WatchedAt.HasValue)
                entry.WatchedAt = dto.WatchedAt.Value;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Watch history updated" });
        }

        [Authorize]
        [HttpDelete("remove/{id}")]
        public async Task<IActionResult> RemoveFromWatchHistory(int id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
                return Unauthorized(new { message = "User not logged in" });

            var entry = await _context.WatchHistories.FindAsync(id);

            if (entry == null)
                return NotFound(new { message = "Watch history entry not found" });

            if (entry.UserId != userId)
                return Unauthorized(new { message = "Not authorized to delete this entry" });

            _context.WatchHistories.Remove(entry);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Removed from watch history" });
        }

        [HttpGet("stats/{userId}")]
        public async Task<IActionResult> GetWatchStats(int userId)
        {
            var totalWatched = await _context.WatchHistories.CountAsync(w => w.UserId == userId);
            var totalRated = await _context.WatchHistories.CountAsync(w => w.UserId == userId && w.Rating.HasValue);
            var avgRating = await _context.WatchHistories
                .Where(w => w.UserId == userId && w.Rating.HasValue)
                .AverageAsync(w => (double?)w.Rating) ?? 0;
            var totalReviews = await _context.WatchHistories.CountAsync(w => w.UserId == userId && !string.IsNullOrEmpty(w.Review));

            return Ok(new
            {
                totalWatched,
                totalRated,
                averageRating = Math.Round(avgRating, 1),
                totalReviews
            });
        }

        [HttpGet("check/{movieId}")]
        public async Task<IActionResult> CheckIfWatched(string movieId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
                return Ok(new { watched = false });

            var entry = await _context.WatchHistories
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == movieId);

            return Ok(new { watched = entry != null, entry });
        }
    }

    public class WatchHistoryDto
    {
        public string MovieId { get; set; }
        public string MovieTitle { get; set; }
        public string MoviePoster { get; set; }
        [Range(1, 5)]
        public int? Rating { get; set; }
        public string Review { get; set; }
        public DateTime? WatchedAt { get; set; }
    }

    public class UpdateWatchHistoryDto
    {
        [Range(1, 5)]
        public int? Rating { get; set; }
        public string Review { get; set; }
        public DateTime? WatchedAt { get; set; }
    }
}

