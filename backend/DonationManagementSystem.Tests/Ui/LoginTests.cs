using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using DonationManagementSystem.Tests.Ui.Support;
using Xunit;

namespace DonationManagementSystem.Tests.Ui
{
    public class LoginTests : IDisposable
    {
        private readonly IWebDriver _driver;
        private readonly WebDriverWait _wait;

        public LoginTests()
        {
            _driver = WebDriverFactory.CreateDriver();
            _wait = new WebDriverWait(_driver, UiTestConfig.DefaultTimeout);
        }

        [UiFact]
        [Trait("Category", "Ui")]
        public void Admin_can_log_in_and_reach_admin_dashboard()
        {
            _driver.Navigate().GoToUrl($"{UiTestConfig.BaseUrl}/login");

            var emailInput = _wait.Until(driver => driver.FindElement(By.Id("email")));
            emailInput.Clear();
            emailInput.SendKeys(UiTestConfig.AdminEmail);

            var passwordInput = _driver.FindElement(By.Id("password"));
            passwordInput.Clear();
            passwordInput.SendKeys(UiTestConfig.AdminPassword);

            var submitButton = _driver.FindElement(By.CssSelector("button[type='submit']"));
            submitButton.Click();

            var navigated = _wait.Until(driver =>
            {
                var url = driver.Url;
                if (url.Contains("/admin", StringComparison.OrdinalIgnoreCase))
                {
                    return "admin";
                }

                if (url.Contains("/dashboard", StringComparison.OrdinalIgnoreCase))
                {
                    return "dashboard";
                }

                return null;
            });

            if (string.Equals(navigated, "admin", StringComparison.OrdinalIgnoreCase))
            {
                _wait.Until(driver => driver.FindElement(By.XPath("//*[contains(text(),'LIVE Admin Dashboard')]")));
                return;
            }

            if (string.Equals(navigated, "dashboard", StringComparison.OrdinalIgnoreCase))
            {
                _wait.Until(driver => driver.FindElement(By.XPath("//*[contains(text(),'Welcome back')]")));
                return;
            }

            var errorMessage = TryReadLoginError() ?? "Login did not navigate to /admin or /dashboard.";
            throw new InvalidOperationException(errorMessage);
        }

        private string? TryReadLoginError()
        {
            try
            {
                var errorBox = _driver.FindElement(By.CssSelector("div.bg-red-50"));
                return errorBox.Text;
            }
            catch
            {
                return null;
            }
        }

        public void Dispose()
        {
            _driver.Quit();
            _driver.Dispose();
        }
    }
}
