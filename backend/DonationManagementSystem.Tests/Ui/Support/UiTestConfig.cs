using System;

namespace DonationManagementSystem.Tests.Ui.Support
{
    internal static class UiTestConfig
    {
        public static bool RunUiTests => GetBool("UI_RUN", false);
        public static string BaseUrl => GetEnv("UI_BASE_URL", "http://localhost:5173");
        public static string AdminEmail => GetArgOrEnv("--ui-email", "UI_ADMIN_EMAIL", "admin@donationmanagement.com");
        public static string AdminPassword => GetArgOrEnv("--ui-password", "UI_ADMIN_PASSWORD", "Admin@123!");
        public static string Browser => GetEnv("UI_BROWSER", "edge");
        public static bool Headless => GetBool("UI_HEADLESS", false);
        public static string EdgeDriverPath => GetEnv("UI_EDGE_DRIVER_PATH", string.Empty);
        public static string ChromeDriverPath => GetEnv("UI_CHROME_DRIVER_PATH", string.Empty);
        public static TimeSpan DefaultTimeout => TimeSpan.FromSeconds(20);

        private static string GetEnv(string name, string fallback)
        {
            var value = Environment.GetEnvironmentVariable(name);
            return string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
        }

        private static string GetArgOrEnv(string argName, string envName, string fallback)
        {
            var argValue = GetArgValue(argName);
            if (!string.IsNullOrWhiteSpace(argValue))
            {
                return argValue.Trim();
            }

            return GetEnv(envName, fallback);
        }

        private static string? GetArgValue(string name)
        {
            var args = Environment.GetCommandLineArgs();
            for (var i = 0; i < args.Length; i++)
            {
                var current = args[i];
                if (current.StartsWith(name + "=", StringComparison.OrdinalIgnoreCase))
                {
                    return current.Substring(name.Length + 1);
                }

                if (string.Equals(current, name, StringComparison.OrdinalIgnoreCase))
                {
                    var nextIndex = i + 1;
                    if (nextIndex < args.Length)
                    {
                        return args[nextIndex];
                    }
                }
            }

            return null;
        }

        private static bool GetBool(string name, bool fallback)
        {
            var value = Environment.GetEnvironmentVariable(name);
            if (string.IsNullOrWhiteSpace(value))
            {
                return fallback;
            }

            return value.Equals("1", StringComparison.OrdinalIgnoreCase)
                || value.Equals("true", StringComparison.OrdinalIgnoreCase)
                || value.Equals("yes", StringComparison.OrdinalIgnoreCase)
                || value.Equals("on", StringComparison.OrdinalIgnoreCase);
        }
    }
}
