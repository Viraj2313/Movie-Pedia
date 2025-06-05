
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;
using MovieApiApp.Models;

namespace MovieApiApp.Controllers
{
    [ApiController]
    [Route("api")]
    public class UserLikesController(MainDbContext context) : ControllerBase
    {
        private readonly MainDbContext _context = context;

        [HttpPost("user-likes")]
        public IActionResult LikeMovie([FromBody] UserLike userLike)
        {
            _context.UserLikes.Add(userLike);
            _context.SaveChanges();

            return Ok();
        }

        [HttpGet("liked/{userId}")]
        public async Task<IActionResult> GetLikedMovies(int? userId)
        {
            if (!userId.HasValue)
            {
                return BadRequest("User ID is required");
            }
            var likedMovies = await _context.UserLikes.Where(u => u.UserId == userId).Select(u => u.MovieId).ToListAsync();
            if (likedMovies.Count == 0)
            {
                return NotFound("No liked movies found for this user.");
            }
            return Ok(likedMovies);
        }
    }
}