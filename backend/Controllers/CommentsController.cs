using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;
using MovieApiApp.Dto;
using MovieApiApp.Models;

namespace MovieApiApp.Controllers
{
    [ApiController]
    [Route("api")]
    public class CommentsController(MainDbContext context) : ControllerBase
    {
        private readonly MainDbContext _context = context;

        [HttpGet("movies/{movieId}/get-comments")]
        public async Task<IActionResult> GetComments(string movieId, [FromQuery] int? userId)
        {
            var comments = await _context.Comments
                .Where(c => c.MovieId == movieId && c.ParentCommentId == null)
                .Include(c => c.Replies)
                .Select(c => new
                {
                    c.Id,
                    c.CommentText,
                    CommentorName = c.Name,
                    CommentorId = c.UserId,
                    CommentLikes = c.Likes,
                    CommentDislikes = c.Dislikes,
                    c.CreatedAt,
                    UserReaction = userId == null
                        ? null
                        : _context.CommentReactions
                            .Where(r => r.CommentId == c.Id && r.UserId == userId)
                            .Select(r => r.IsLike ? "like" : "dislike")
                            .FirstOrDefault(),
                    Replies = c.Replies.Select(r => new
                    {
                        r.Id,
                        r.CommentText,
                        CommentorName = r.Name,
                        CommentorId = r.UserId,
                        r.CreatedAt,
                        r.ParentCommentId,
                        CommentLikes = r.Likes,
                        CommentDislikes = r.Dislikes,
                        UserReaction = userId == null
                            ? null
                            : _context.CommentReactions
                                .Where(x => x.CommentId == r.Id && x.UserId == userId)
                                .Select(x => x.IsLike ? "like" : "dislike")
                                .FirstOrDefault(),
                    }).ToList()
                })
                .ToListAsync();

            return Ok(comments);
        }

        [Authorize]
        [HttpPost("movies/add-comment")]
        public async Task<IActionResult> AddComment([FromBody] AddCommentRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.CommentText))
                return BadRequest("Comment cannot be empty");

            var name = await _context.Users
                .Where(u => u.Id == request.UserId)
                .Select(u => u.Name)
                .FirstOrDefaultAsync();

            if (name == null)
                return BadRequest("User not found");

            var comment = new Comment
            {
                UserId = request.UserId,
                Name = name,
                MovieId = request.MovieId,
                CommentText = request.CommentText,
                ParentCommentId = request.ParentCommentId
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok("Comment added successfully");
        }

        [Authorize]
        [HttpDelete("movies/{userId}/{movieId}/{commentId}")]
        public async Task<IActionResult> DeleteComment(int userId, string movieId, int commentId)
        {
            var comment = await _context.Comments
                .FirstOrDefaultAsync(c => c.UserId == userId && c.MovieId == movieId && c.Id == commentId);

            if (comment == null)
                return NotFound("comment not found");

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok("Comment Deleted Successfully");
        }

        [Authorize]
        [HttpPost("movies/{movieId}/comments/{commentId}/toggle-reaction")]
        public async Task<IActionResult> ToggleReaction(string movieId, int commentId, [FromQuery] int userId, [FromQuery] string reaction)
        {
            if (reaction != "like" && reaction != "dislike")
                return BadRequest("Reaction must be 'like' or 'dislike'");

            var comment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.MovieId == movieId);

            if (comment == null)
                return NotFound("Comment not found");

            var existing = await _context.CommentReactions
                .FirstOrDefaultAsync(r => r.CommentId == commentId && r.UserId == userId);

            bool newIsLike = reaction == "like";

            if (existing == null)
            {
                _context.CommentReactions.Add(new CommentReaction
                {
                    UserId = userId,
                    CommentId = commentId,
                    IsLike = newIsLike
                });

                if (newIsLike) comment.Likes++;
                else comment.Dislikes++;

                await _context.SaveChangesAsync();
                return Ok(new { action = "added", comment.Likes, comment.Dislikes });
            }

            if (existing.IsLike == newIsLike)
            {
                _context.CommentReactions.Remove(existing);

                if (newIsLike) comment.Likes--;
                else comment.Dislikes--;

                await _context.SaveChangesAsync();
                return Ok(new { action = "removed", comment.Likes, comment.Dislikes });
            }

            if (existing.IsLike)
            {
                comment.Likes--;
                comment.Dislikes++;
            }
            else
            {
                comment.Dislikes--;
                comment.Likes++;
            }

            existing.IsLike = newIsLike;
            await _context.SaveChangesAsync();

            return Ok(new { action = "switched", comment.Likes, comment.Dislikes });
        }
    }
}
