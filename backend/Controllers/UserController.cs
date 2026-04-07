using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using MovieApiApp.Data;

namespace MovieApiApp.Controllers
{
    [Route("api/user")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly MainDbContext _context;

        public UserController(MainDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId!));
            if (user == null)
                return Unauthorized();

            return Ok(new { userName = user.Name });
        }

        [HttpGet("id")]
        public IActionResult GetUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return BadRequest(new { Message = "User ID not found in token." });

            return Ok(new { UserId = userId });
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return BadRequest(new { Message = "User ID not found in token." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId));
            if (user == null)
                return NotFound(new { Message = "User not found." });

            return Ok(new { name = user.Name, id = user.Id, email = user.Email, bio = user.Bio ?? "" });
        }

        [HttpPut("bio")]
        public async Task<IActionResult> UpdateBio([FromBody] UpdateBioRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId));
            if (user == null)
                return NotFound();

            if (request.Bio?.Length > 200)
                return BadRequest(new { message = "Bio must be 200 characters or less" });

            user.Bio = request.Bio?.Trim();
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bio updated", bio = user.Bio });
        }
    }

    public class UpdateBioRequest
    {
        public string? Bio { get; set; }
    }
}
