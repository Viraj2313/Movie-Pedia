namespace MovieApiApp.Models
{
    public class CommentReaction
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CommentId { get; set; }
        public bool IsLike { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Comment Comment { get; set; }
    }
}