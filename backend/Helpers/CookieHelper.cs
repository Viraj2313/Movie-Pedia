namespace MovieApiApp.Helpers
{
    public static class CookieHelper
    {
        public static void SetAuthCookie(this HttpResponse response, string token)
        {
            response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(15)
            });
        }

        public static void SetRefreshTokenCookie(this HttpResponse response, string refreshToken)
        {
            response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(7)
            });
        }

        public static void ClearAuthCookies(this HttpResponse response)
        {
            var expiredOptions = new CookieOptions
            {
                Expires = DateTime.UtcNow.AddDays(-1),
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            };

            response.Cookies.Append("jwt", "", expiredOptions);
            response.Cookies.Append("refreshToken", "", expiredOptions);
        }
    }
}
