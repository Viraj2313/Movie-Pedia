namespace MovieApiApp.Models
{
    public class UserLike
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string MovieId { get; set; }
        public bool Liked { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}