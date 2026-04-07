using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;
using MovieApiApp.Dto;
using MovieApiApp.Helpers;
using MovieApiApp.Models;
using MovieApiApp.Services;

namespace MovieApiApp.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class GoogleAuthController(MainDbContext context, TokenService tokenService) : ControllerBase
    {
        private readonly MainDbContext _context = context;
        private readonly TokenService _tokenService = tokenService;

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginReq request)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token);
                if (payload == null)
                    return Unauthorized(new { message = "Invalid Google token" });

                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);
                if (existingUser == null)
                {
                    existingUser = new User
                    {
                        Name = payload.Name,
                        Email = payload.Email,
                        Password = "",
                        AuthProvider = "google"
                    };
                    _context.Users.Add(existingUser);
                    await _context.SaveChangesAsync();
                }

                var token = _tokenService.GenerateToken(existingUser);
                var refreshToken = await _tokenService.GenerateRefreshToken(existingUser.Id);

                Response.SetAuthCookie(token);
                Response.SetRefreshTokenCookie(refreshToken.Token);

                return Ok(new { message = "Login successful", userId = existingUser.Id, userName = existingUser.Name });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Google login failed", error = ex.Message });
            }
        }
    }
}