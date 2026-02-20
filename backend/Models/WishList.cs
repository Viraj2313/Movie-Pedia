namespace MovieApiApp.Models
{
    public class WishList
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
        public string MovieId { get; set; } = string.Empty;
        public string MoviePoster { get; set; } = string.Empty;
    }
}
