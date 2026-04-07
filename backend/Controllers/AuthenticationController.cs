using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using MovieApiApp.Models;
using MovieApiApp.Data;
using MovieApiApp.Dto;
using MovieApiApp.Services;
using MovieApiApp.Helpers;

namespace MovieApiApp.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly MainDbContext _context;
        private readonly TokenService _tokenService;

        public AuthenticationController(MainDbContext context, TokenService tokenService)
        {
            _tokenService = tokenService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> SignUp([FromBody] User user)
        {
            if (string.IsNullOrWhiteSpace(user.Email) || !user.Email.Contains("@") || !user.Email.Contains("."))
                return BadRequest(new { message = "Invalid email format" });

            if (string.IsNullOrWhiteSpace(user.Name))
                return BadRequest(new { message = "Name is required" });

            if (string.IsNullOrWhiteSpace(user.Password))
                return BadRequest(new { message = "Password is required" });

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (existingUser != null)
                return Conflict(new { message = "An account with this email already exists" });

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            user.AuthProvider = "local";
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _tokenService.GenerateToken(user);
            var refreshToken = await _tokenService.GenerateRefreshToken(user.Id);

            Response.SetAuthCookie(token);
            Response.SetRefreshTokenCookie(refreshToken.Token);

            return Ok(new { message = "User registered successfully", userId = user.Id });
        }

        [Authorize]
        [HttpGet("check-session")]
        public IActionResult CheckSession()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Invalid token." });

            return Ok(new { message = "Session active", userId });
        }

        [HttpPost("login")]
        public async Task<IActionResult> LogIn([FromBody] LoginReq loginReq)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginReq.Email);

            if (existingUser == null)
                return Unauthorized(new { message = "Invalid email or password" });

            if (existingUser.AuthProvider == "google")
                return BadRequest(new { message = "This account uses Google Sign-In. Please log in with Google." });

            if (!BCrypt.Net.BCrypt.Verify(loginReq.Password, existingUser.Password))
                return Unauthorized(new { message = "Invalid email or password" });

            var token = _tokenService.GenerateToken(existingUser);
            var refreshToken = await _tokenService.GenerateRefreshToken(existingUser.Id);

            Response.SetAuthCookie(token);
            Response.SetRefreshTokenCookie(refreshToken.Token);

            return Ok(new { message = "login success", userId = existingUser.Id, userName = existingUser.Name });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshTokenValue = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(refreshTokenValue))
                await _tokenService.RevokeRefreshToken(refreshTokenValue);

            Response.ClearAuthCookies();
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshTokenValue = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshTokenValue))
                return Unauthorized(new { message = "No refresh token" });

            var storedToken = await _tokenService.ValidateRefreshToken(refreshTokenValue);
            if (storedToken == null)
                return Unauthorized(new { message = "Invalid or expired refresh token" });

            var newJwt = _tokenService.GenerateToken(storedToken.User);
            var newRefreshToken = await _tokenService.GenerateRefreshToken(storedToken.UserId);

            Response.SetAuthCookie(newJwt);
            Response.SetRefreshTokenCookie(newRefreshToken.Token);

            return Ok(new { message = "Token refreshed", userId = storedToken.UserId });
        }
    }
}
