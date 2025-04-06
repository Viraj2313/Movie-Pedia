using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;
using MovieApiApp.Dto;
using MovieApiApp.Models;
using System.Security.Claims;

namespace MovieApiApp.Controllers
{
    [Route("api")]
    [ApiController]
    public class WishListController(MainDbContext context) : ControllerBase
    {
        private readonly MainDbContext _context = context;

        [Authorize]
        [HttpPost("add_wishlist")]
        public async Task<IActionResult> AddToWishlist([FromBody] WishList wishlistDto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId) || userId == 0)
            {
                return Unauthorized(new { message = "User not found" });
            }
            var wishlist = new WishList
            {
                UserId = userId,
                MovieId = wishlistDto.MovieId,
                MovieTitle = wishlistDto.MovieTitle,
                MoviePoster = wishlistDto.MoviePoster
            };

            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Movie added to wishlist" });
        }

        [Authorize]
        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveFromWishlist([FromBody] MovieDel movieDel)
        {
            if (movieDel == null || string.IsNullOrEmpty(movieDel.MovieId))
            {
                return BadRequest("Invalid payload or MovieId is null/empty.");
            }

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId) || userId == 0)
            {
                return Unauthorized(new { message = "User not found" });
            }
            var wishlistItem = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.MovieId == movieDel.MovieId && w.UserId == userId);

            if (wishlistItem == null)
            {
                return NotFound("Movie not found in wishlist.");
            }

            _context.Wishlists.Remove(wishlistItem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Movie removed from wishlist" });
        }


        [Authorize]
        [HttpGet("wishlist")]
        public async Task<IActionResult> GetWishList()

        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized(new { message = "User not found" });
            }


            var wishlist = await _context.Wishlists.Where(w => w.UserId == userId).ToListAsync();
            return Ok(wishlist);
        }
    }
}
