namespace MovieApiApp.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MovieId { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
        public int Likes { get; set; }
        public int Dislikes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? ParentCommentId { get; set; }

        public Comment? ParentComment { get; set; }
        public ICollection<CommentReaction> Reactions { get; set; } = [];

        public ICollection<Comment> Replies { get; set; } = new List<Comment>();

    }
}