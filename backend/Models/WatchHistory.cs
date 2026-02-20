namespace MovieApiApp.Models
{
    public class WatchHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string MovieId { get; set; } = string.Empty;
        public string MovieTitle { get; set; } = string.Empty;
        public string MoviePoster { get; set; } = string.Empty;
        public int? Rating { get; set; }
        public string Review { get; set; } = string.Empty;
        public DateTime WatchedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
