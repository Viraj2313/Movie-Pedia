namespace MovieApiApp.Models
{
    public class Friend
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int FriendId { get; set; }
        public string FriendName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
