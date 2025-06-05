using Microsoft.EntityFrameworkCore;
using MovieApiApp.Models;

namespace MovieApiApp.Data
{
  public class MainDbContext : DbContext
  {
    public MainDbContext(DbContextOptions<MainDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<WishList> Wishlists { get; set; }
    public DbSet<Friend> Friends { get; set; }
    public DbSet<FriendRequest> FriendRequests { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<UserLike> UserLikes { get; set; }
    public DbSet<Comment> Comments { get; set; }
  }
}