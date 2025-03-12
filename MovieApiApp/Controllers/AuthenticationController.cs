﻿using Microsoft.AspNetCore.Mvc;
using WbApp.Data;
using System.Net.Http;
using System.Threading.Tasks;
using Form.Models;
using Microsoft.EntityFrameworkCore;
using WbApp.Dto;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc.Infrastructure;
namespace WbApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class AuthenticationController : Controller
    {
        public readonly MainDbContext _context;
        private readonly TokenService _tokenService;
        public readonly HttpClient _httpClient;
        public AuthenticationController(MainDbContext context, HttpClient client, TokenService tokenService)
        {
            _tokenService = tokenService;
            _context = context;
            _httpClient = client;
        }

        //for sign up/register
        [HttpPost("register")]
        public async Task<IActionResult> SignUp([FromBody] User user)
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            var token = _tokenService.GenerateToken(user);
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddHours(2)
            });
            return Ok(new { message = "User registered successfully", userId = user.Id });
        }


        [Authorize]
        [HttpGet("check-session")]
        public IActionResult CheckSession()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }
            return Ok(new { message = "Session active", userId });
        }

        //for login
        [HttpPost("login")]
        public async Task<IActionResult> LogIn([FromBody] LoginReq loginReq)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginReq.Email);
            if (existingUser == null || !BCrypt.Net.BCrypt.Verify(loginReq.Password, existingUser.Password))
            {
                return Unauthorized(new { message = "Invalid email or password" });


            }
            var token = _tokenService.GenerateToken(existingUser);
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddHours(2)
            });
            return Ok(new { message = "login success", userId = existingUser.Id, userName = existingUser.Name });
        }

        //logout
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            if (Request.Cookies["jwt"] != null)
            {
                Response.Cookies.Append("jwt", "", new CookieOptions
                {
                    Expires = DateTime.UtcNow.AddDays(-1), // Set expiration to past date to delete
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None
                });

                return Ok(new { message = "Cookie deleted" });
            }

            // If the cookie does not exist
            return Ok(new { message = "Not logged out, no cookie found" });
        }

        [Authorize]
        [HttpGet("user")]
        public async Task<IActionResult> GetUser()
        {

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId));
            if (user == null)
            {
                return Unauthorized();
            }

            return Ok(new { userName = user.Name });
        }
        [Authorize]
        [HttpGet("get-user-id")]
        public IActionResult GetUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return BadRequest(new { Message = "User ID not found in token." });
            }

            return Ok(new { UserId = userId });
        }
    }
}
