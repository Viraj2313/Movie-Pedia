using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;
using MovieApiApp.Models;

namespace MovieApiApp.Controllers
{
    [ApiController]
    [Route("api")]
    public class CommentsController(MainDbContext context) : ControllerBase
    {
        private readonly MainDbContext _context = context;

        [HttpGet("movies/{movieId}/get-comments")]
        public async Task<IActionResult> GetComments(string movieId)
        {
            var comments = await _context.Comments
                .Where(c => c.MovieId == movieId && c.ParentCommentId == null) // Get only main comments
                .Include(c => c.Replies) // Load replies
                .Select(c => new
                {
                    c.Id,
                    c.CommentText,
                    CommentorName = c.Name,
                    CommentorId = c.UserId,
                    c.CreatedAt,
                    Replies = c.Replies.Select(r => new
                    {
                        r.Id,
                        r.CommentText,
                        CommentorName = r.Name,
                        CommentorId = r.UserId,
                        r.CreatedAt,
                        r.ParentCommentId
                    }).ToList()
                }).ToListAsync();

            return Ok(comments);
        }

        //post and reply comments method
        [HttpPost("movies/{userId}/{movieId}/{commentText}/{parentCommentId?}")]
        public async Task<IActionResult> AddComment(int userId, string movieId, string commentText, int? parentCommentId = null)
        {
            var name = await _context.Users.Where(u => u.Id == userId).Select(u => u.Name).FirstOrDefaultAsync();
            if (name == null)
            {
                return BadRequest("User not found");
            }

            var comment = new Comment
            {
                UserId = userId,
                Name = name,
                MovieId = movieId,
                CommentText = commentText,
                ParentCommentId = parentCommentId,
            };
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return Ok("Comment added successfully");
        }

        [HttpDelete("movies/{userId}/{movieId}/{commentId}")]
        public async Task<IActionResult> DeleteComment(int userId, string movieId, int commentId)
        {
            var comment = await _context.Comments.FirstOrDefaultAsync(c => c.UserId == userId && c.MovieId == movieId && c.Id == commentId);

            if (comment == null)
            {
                return NotFound("comment not found");
            }
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return Ok("Comment Deleted Successfully");


        }
    }
}