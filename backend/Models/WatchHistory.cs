namespace MovieApiApp.Models
{
    public class WatchHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string MovieId { get; set; }
        public string MovieTitle { get; set; }
        public string MoviePoster { get; set; }
        public int? Rating { get; set; }
        public string Review { get; set; }
        public DateTime WatchedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
