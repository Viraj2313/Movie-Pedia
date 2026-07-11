using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;

namespace MovieApiApp.Controllers
{
    [Route("api/profile")]
    [ApiController]
    public class PublicProfileController(MainDbContext context) : ControllerBase
    {
        private readonly MainDbContext _context = context;

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetPublicProfile(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var friendCount = await _context.Friends.CountAsync(f => f.UserId == userId);
            var totalWatched = await _context.WatchHistories.CountAsync(w => w.UserId == userId);
            var totalRated = await _context.WatchHistories.CountAsync(w => w.UserId == userId && w.Rating.HasValue);
            var avgRating = await _context.WatchHistories
                .Where(w => w.UserId == userId && w.Rating.HasValue)
                .AverageAsync(w => (double?)w.Rating) ?? 0;
            var totalReviews = await _context.WatchHistories.CountAsync(w => w.UserId == userId && !string.IsNullOrEmpty(w.Review));
            var totalComments = await _context.Comments.CountAsync(c => c.UserId == userId);
            var wishlistCount = await _context.Wishlists.CountAsync(w => w.UserId == userId);

            var watchedDates = await _context.WatchHistories
                .Where(w => w.UserId == userId)
                .Select(w => w.WatchedAt)
                .ToListAsync();

            var watchedWeeks = watchedDates
                .Select(d => {
                    var day = (int)d.DayOfWeek;
                    var monday = d.AddDays(day == 0 ? -6 : -(day - 1)).Date;
                    return monday;
                })
                .Distinct()
                .OrderByDescending(w => w)
                .ToList();

            int weekStreak = 0;
            var today = DateTime.UtcNow.Date;
            var dayOfWeek = (int)today.DayOfWeek;
            var currentWeekStart = today.AddDays(dayOfWeek == 0 ? -6 : -(dayOfWeek - 1));

            if (watchedWeeks.Count > 0)
            {
                var expected = watchedWeeks[0] == currentWeekStart || watchedWeeks[0] == currentWeekStart.AddDays(-7)
                    ? watchedWeeks[0]
                    : (DateTime?)null;

                if (expected.HasValue)
                {
                    foreach (var week in watchedWeeks)
                    {
                        if (week == expected.Value)
                        {
                            weekStreak++;
                            expected = expected.Value.AddDays(-7);
                        }
                        else
                        {
                            break;
                        }
                    }
                }
            }

            var recentActivity = await _context.ActivityLogs
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Take(10)
                .ToListAsync();

            var favoriteMovies = await _context.WatchHistories
                .Where(w => w.UserId == userId && w.Rating >= 4)
                .OrderByDescending(w => w.Rating)
                .ThenByDescending(w => w.WatchedAt)
                .Take(5)
                .Select(w => new { w.MovieId, w.MovieTitle, w.MoviePoster, w.Rating })
                .ToListAsync();

            var currentUserId = HttpContext.User.FindFirst("UserId");
            bool isFriend = false;
            bool hasPendingRequest = false;
            bool isOwnProfile = false;

            if (currentUserId != null)
            {
                var currentId = int.Parse(currentUserId.Value);
                isOwnProfile = currentId == userId;
                isFriend = await _context.Friends.AnyAsync(f => f.UserId == currentId && f.FriendId == userId);
                hasPendingRequest = await _context.FriendRequests.AnyAsync(
                    fr => (fr.SenderId == currentId && fr.ReceiverId == userId && fr.Status == "Pending") ||
                          (fr.SenderId == userId && fr.ReceiverId == currentId && fr.Status == "Pending"));
            }

            return Ok(new
            {
                user = new { user.Id, user.Name, Bio = user.Bio ?? "" },
                stats = new
                {
                    friendCount,
                    totalWatched,
                    totalRated,
                    averageRating = Math.Round(avgRating, 1),
                    totalReviews,
                    totalComments,
                    wishlistCount,
                    weekStreak
                },
                recentActivity,
                favoriteMovies,
                isFriend,
                hasPendingRequest,
                isOwnProfile
            });
        }

        [HttpGet("{userId}/friends")]
        public async Task<IActionResult> GetUserFriends(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var friends = await _context.Friends
                .Where(f => f.UserId == userId)
                .Select(f => new { f.FriendId, f.FriendName })
                .ToListAsync();

            return Ok(friends);
        }

        [HttpGet("{userId}/watch-history")]
        public async Task<IActionResult> GetUserWatchHistory(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var history = await _context.WatchHistories
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.WatchedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var total = await _context.WatchHistories.CountAsync(w => w.UserId == userId);

            return Ok(new { history, total, page, pageSize });
        }
    }
}
