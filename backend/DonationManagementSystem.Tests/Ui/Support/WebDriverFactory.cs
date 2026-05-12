using System;
using System.IO;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Edge;

namespace DonationManagementSystem.Tests.Ui.Support
{
    internal static class WebDriverFactory
    {
        public static IWebDriver CreateDriver()
        {
            var browser = UiTestConfig.Browser.Trim().ToLowerInvariant();
            return browser switch
            {
                "edge" => CreateEdgeDriver(),
                "chrome" => CreateChromeDriver(),
                _ => throw new InvalidOperationException($"Unsupported UI browser: {UiTestConfig.Browser}")
            };
        }

        private static IWebDriver CreateEdgeDriver()
        {
            var options = new EdgeOptions();

            options.AddArgument("window-size=1280,900");
            options.AddArgument("disable-gpu");

            if (UiTestConfig.Headless)
            {
                options.AddArgument("headless=new");
            }

            if (!string.IsNullOrWhiteSpace(UiTestConfig.EdgeDriverPath))
            {
                var service = CreateEdgeService(UiTestConfig.EdgeDriverPath);
                var edgeDriver = new EdgeDriver(service, options);
                edgeDriver.Manage().Timeouts().ImplicitWait = TimeSpan.Zero;
                return edgeDriver;
            }

            var edgeFallback = new EdgeDriver(options);
            edgeFallback.Manage().Timeouts().ImplicitWait = TimeSpan.Zero;
            return edgeFallback;
        }

        private static IWebDriver CreateChromeDriver()
        {
            var options = new ChromeOptions();

            options.AddArgument("window-size=1280,900");
            options.AddArgument("disable-gpu");

            if (UiTestConfig.Headless)
            {
                options.AddArgument("headless=new");
            }

            if (!string.IsNullOrWhiteSpace(UiTestConfig.ChromeDriverPath))
            {
                var service = CreateChromeService(UiTestConfig.ChromeDriverPath);
                var chromeDriver = new ChromeDriver(service, options);
                chromeDriver.Manage().Timeouts().ImplicitWait = TimeSpan.Zero;
                return chromeDriver;
            }

            var chromeFallback = new ChromeDriver(options);
            chromeFallback.Manage().Timeouts().ImplicitWait = TimeSpan.Zero;
            return chromeFallback;
        }

        private static EdgeDriverService CreateEdgeService(string driverPath)
        {
            var fullPath = Path.GetFullPath(driverPath);
            if (!File.Exists(fullPath))
            {
                throw new InvalidOperationException($"EdgeDriver not found at {fullPath}");
            }

            var directory = Path.GetDirectoryName(fullPath);
            var fileName = Path.GetFileName(fullPath);

            if (string.IsNullOrWhiteSpace(directory) || string.IsNullOrWhiteSpace(fileName))
            {
                throw new InvalidOperationException("Invalid UI_EDGE_DRIVER_PATH value.");
            }

            return EdgeDriverService.CreateDefaultService(directory, fileName);
        }

        private static ChromeDriverService CreateChromeService(string driverPath)
        {
            var fullPath = Path.GetFullPath(driverPath);
            if (!File.Exists(fullPath))
            {
                throw new InvalidOperationException($"ChromeDriver not found at {fullPath}");
            }

            var directory = Path.GetDirectoryName(fullPath);
            var fileName = Path.GetFileName(fullPath);

            if (string.IsNullOrWhiteSpace(directory) || string.IsNullOrWhiteSpace(fileName))
            {
                throw new InvalidOperationException("Invalid UI_CHROME_DRIVER_PATH value.");
            }

            return ChromeDriverService.CreateDefaultService(directory, fileName);
        }
    }
}
