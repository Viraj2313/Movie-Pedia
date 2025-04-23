using System.Security.Claims;

namespace MovieApiApp.Helpers
{
    public static class HttpContextExtensions
    {
        public static int? GetUserIdFromToken(this HttpContext httpContext)
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return 0;
            }

            return userId;
        }
    }
}
