namespace MovieApiApp.Models
{
    public class WishList
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string MovieTitle { get; set; }
        public string MovieId { get; set; }
        public string MoviePoster { get; set; }
    }
}
