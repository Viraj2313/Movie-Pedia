using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;
using MovieApiApp.Models;

namespace MovieApiApp.Controllers
{
    [Route("api/friends")]
    [ApiController]
    public class SearchFriendController(MainDbContext context) : ControllerBase
    {
        private readonly MainDbContext _context = context;

        [HttpGet("search")]
        public async Task<IActionResult> SearchFriend([FromQuery] string friendId)
        {

            if (string.IsNullOrEmpty(friendId))
            {
                return BadRequest("Friend Id is required");
            }
            if (!int.TryParse(friendId, out var parsedFriendId))
            {
                return BadRequest("Friend Id must be a valid integer");
            }

            var friend = await _context.Users.FirstOrDefaultAsync(u => u.Id == parsedFriendId);
            if (friend == null)
            {
                return NotFound("No user found with Id: {friendId}");
            }
            var result = new
            {
                friend.Id,
                friend.Name
            };
            return Ok(result);
        }

        [HttpGet("search-by-name")]
        public async Task<IActionResult> SearchByName([FromQuery] string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Username is required.");

            var friends = await _context.Users
                .Where(u => u.Name.ToLower().Contains(username.ToLower()))
                .Select(u => new
                {
                    u.Id,
                    u.Name
                })
                .ToListAsync();

            if (friends.Count == 0)
                return NotFound($"No users found with name: {username}");

            return Ok(friends);
        }



        [HttpPost("add-friend")]
        public async Task<IActionResult> AddFriend(int userId, int friendId)
        {
            var friend = new Friend
            {
                UserId = userId,
                FriendId = friendId
            };

            _context.Friends.Add(friend);
            await _context.SaveChangesAsync();

            return Ok("Friend added.");
        }


        [HttpPost("send-request")]
        public async Task<IActionResult> SendFriendRequest([FromQuery] int senderId, [FromQuery] int receiverId)
        {
            if (senderId == receiverId)
                return BadRequest(new { Message = "You cannot send a friend request to yourself." });

            var senderExists = await _context.Users.AnyAsync(u => u.Id == senderId);
            var receiverExists = await _context.Users.AnyAsync(u => u.Id == receiverId);

            if (!senderExists || !receiverExists)
                return NotFound(new { Message = "One or both users not found." });

            var existingRequest = await _context.FriendRequests
                .FirstOrDefaultAsync(fr =>
                    (fr.SenderId == senderId && fr.ReceiverId == receiverId) ||
                    (fr.SenderId == receiverId && fr.ReceiverId == senderId));

            if (existingRequest != null)
            {
                if (existingRequest.SenderId == senderId)
                    return BadRequest(new { Message = "Friend request already sent." });
                else
                    return BadRequest(new { Message = "A friend request has already been received from this user." });
            }

            var friendRequest = new FriendRequest
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.FriendRequests.Add(friendRequest);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Friend request sent successfully.", FriendRequest = friendRequest });
        }

        [HttpGet("get-friend-requests")]
        public async Task<IActionResult> GetFriendRequestsList([FromQuery] int userId)
        {
            var friendRequests = await _context.FriendRequests
                .Where(fr => fr.ReceiverId == userId && fr.Status == "Pending")
                .Join(
                    _context.Users, // Assuming you have a Users DbSet in your DbContext
                    fr => fr.SenderId,
                    u => u.Id,
                    (fr, u) => new
                    {
                        FriendRequestId = fr.Id,
                        SenderId = fr.SenderId,
                        SenderName = u.Name,
                        ReceiverId = fr.ReceiverId,
                        Status = fr.Status,
                        CreatedAt = fr.CreatedAt
                    }
                )
                .ToListAsync();

            return Ok(friendRequests);
        }


        [HttpPost("accept-request")]
        public async Task<IActionResult> AcceptFriendRequest([FromQuery] int userId, [FromQuery] int senderId)
        {
            Console.WriteLine($"{userId}, {senderId}");
            var friendRequest = await _context.FriendRequests.FirstOrDefaultAsync(fr => fr.SenderId == senderId && fr.ReceiverId == userId);
            if (friendRequest == null)
            {
                return NotFound(new { message = "Friend Not Found" });

            }
            if (friendRequest.ReceiverId != userId)
            {
                return BadRequest(new { Message = "You are not authorized to accept this friend request." });
            }
            friendRequest.Status = "Accepted";
            friendRequest.CreatedAt = DateTime.UtcNow;
            var sender = await _context.Users.FirstOrDefaultAsync(u => u.Id == senderId);
            var receiver = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            var friend1 = new Friend
            {
                UserId = friendRequest.ReceiverId,
                FriendId = friendRequest.SenderId,
                FriendName = sender.Name

            };
            var friend2 = new Friend
            {
                UserId = friendRequest.SenderId,
                FriendId = friendRequest.ReceiverId,
                FriendName = receiver.Name
            };
            _context.Friends.Add(friend1);
            _context.Friends.Add(friend2);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Friend request accepted successfully.", FriendRequest = friendRequest });


        }

        [HttpGet("get-friends-list")]
        public async Task<IActionResult> GetFriendsList([FromQuery] int userId)
        {
            var friends = await _context.Friends.Where(u => u.UserId == userId).ToListAsync();
            return Ok(friends);
        }

        [HttpGet("get-friend-name")]
        public async Task<IActionResult> GetFriendName([FromQuery] int receiverId)
        {

            var user = await _context.Users.Where(u => u.Id == receiverId).FirstOrDefaultAsync();
            if (user == null)
            {
                throw new Exception("user not found");
            }
            return Ok(user.Name);
        }
    }
}