namespace MovieApiApp.Dto
{
    public class AddCommentRequestDto
    {
        public int UserId { get; set; }
        public string MovieId { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
        public int? ParentCommentId { get; set; }
    }
}