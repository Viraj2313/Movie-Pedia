using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MovieApiApp.Data;
using MovieApiApp.Models;

namespace MovieApiApp.Hubs
{
    public class ChatHub(MainDbContext context) : Hub
    {
        private static readonly ConcurrentDictionary<int, string> UserConnections = new();
        private readonly MainDbContext _context = context;

        public async Task GetChatHistory(int senderId, int receiverId)
        {
            Console.WriteLine($"Fetching chat history for: {senderId} and {receiverId}");

            var messages = await _context.ChatMessages
                .Where(m => m.SenderId == senderId && m.ReceiverId == receiverId ||
                            m.SenderId == receiverId && m.ReceiverId == senderId)
                .OrderBy(m => m.Timestamp)  // Ensure correct order by timestamp
                .ToListAsync();

            Console.WriteLine($"Found {messages.Count} messages");

            // Send the combined and sorted messages to the client
            await Clients.Caller.SendAsync("ReceiveChatHistory", messages);
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var httpContext = Context.GetHttpContext();
                if (httpContext != null && httpContext.Request.Query.TryGetValue("userId", out var userIdStr)
                    && int.TryParse(userIdStr, out int userId))
                {
                    UserConnections[userId] = Context.ConnectionId;
                    Console.WriteLine($"User {userId} connected with Connection ID: {Context.ConnectionId}");

                    var pendingMessages = await _context.ChatMessages
                        .Where(m => m.ReceiverId == userId)
                        .OrderBy(m => m.Timestamp)
                        .ToListAsync();

                    foreach (var msg in pendingMessages)
                    {
                        await Clients.Client(Context.ConnectionId).SendAsync("ReceiveMessage", msg.SenderId, msg.MessageText);
                    }
                }
                else
                {
                    Console.WriteLine("Connection failed: Invalid or missing userId.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during connection: {ex.Message}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var user = UserConnections.FirstOrDefault(x => x.Value == Context.ConnectionId);

                if (!user.Equals(default(KeyValuePair<int, string>)))
                {
                    UserConnections.TryRemove(user.Key, out _);
                    Console.WriteLine($"User {user.Key} disconnected");
                }

                if (exception != null)
                {
                    Console.WriteLine($"Disconnection due to error: {exception.Message}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during disconnection: {ex.Message}");
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(int senderId, int receiverId, string message)
        {
            try
            {
                Console.WriteLine($"Message from {senderId} to {receiverId}: {message}");

                var chatMessage = new ChatMessage
                {
                    SenderId = senderId,
                    ReceiverId = receiverId,
                    MessageText = message,
                    Timestamp = DateTime.UtcNow
                };

                _context.ChatMessages.Add(chatMessage);
                await _context.SaveChangesAsync();

                if (UserConnections.TryGetValue(receiverId, out var receiverConnectionId))
                {
                    await Clients.Client(receiverConnectionId).SendAsync("ReceiveMessage", senderId, message);
                }
                else
                {
                    Console.WriteLine($"User {receiverId} is offline. Message saved.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending message: {ex.Message}");
            }
        }
    }
}