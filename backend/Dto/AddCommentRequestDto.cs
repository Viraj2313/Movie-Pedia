namespace MovieApiApp.Dto
{
    public class AddCommentRequestDto
    {
        public int UserId { get; set; }
        public string MovieId { get; set; }
        public string CommentText { get; set; }
        public int? ParentCommentId { get; set; }
    }
}