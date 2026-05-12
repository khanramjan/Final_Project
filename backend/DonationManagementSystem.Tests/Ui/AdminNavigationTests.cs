using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using DonationManagementSystem.Tests.Ui.Support;

namespace DonationManagementSystem.Tests.Ui
{
    public class AdminNavigationTests : IDisposable
    {
        private readonly IWebDriver _driver;
        private readonly WebDriverWait _wait;

        public AdminNavigationTests()
        {
            _driver = WebDriverFactory.CreateDriver();
            _wait = new WebDriverWait(_driver, UiTestConfig.DefaultTimeout);
        }

        [UiFact]
        [Trait("Category", "Ui")]
        public void Admin_can_open_all_admin_pages()
        {
            LoginAsAdmin();

            var pages = new (string Path, string ExpectedHeading)[]
            {
                ("/admin/dashboard", "LIVE Admin Dashboard"),
                ("/admin/analytics", "Analytics Dashboard"),
                ("/admin/users", "User Management"),
                ("/admin/campaigns", "Campaign Management"),
                ("/admin/donations", "Donation Oversight"),
                ("/admin/vouchers", "Voucher Management"),
                ("/admin/financial", "Financial Dashboard"),
                ("/admin/withdrawals", "Withdrawal Management"),
                ("/admin/volunteer-approvals", "Volunteer Approvals"),
                ("/admin/volunteer-review", "Volunteer Work Review"),
                ("/admin/volunteer-reports", "Volunteer Reports"),
                ("/admin/testimonials", "Testimonial Moderation"),
                ("/admin/ml-insights", "ML Insights"),
                ("/admin/settings", "System Settings"),
            };

            foreach (var (path, expectedHeading) in pages)
            {
                _driver.Navigate().GoToUrl($"{UiTestConfig.BaseUrl}{path}");
                WaitForHeading(expectedHeading, path);
            }
        }

        private void LoginAsAdmin()
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

            try
            {
                _wait.Until(driver =>
                    driver.Url.Contains("/admin", StringComparison.OrdinalIgnoreCase) ||
                    driver.Url.Contains("/dashboard", StringComparison.OrdinalIgnoreCase));
            }
            catch (WebDriverTimeoutException)
            {
                var timeoutMessage = TryReadLoginError();
                throw new InvalidOperationException(timeoutMessage ?? $"Login did not navigate away from {_driver.Url}.");
            }

            var finalUrl = _driver.Url;
            if (finalUrl.Contains("/admin", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            if (finalUrl.Contains("/dashboard", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Login succeeded, but the account is not an admin.");
            }

            var errorMessage = TryReadLoginError();
            throw new InvalidOperationException(errorMessage ?? "Login failed or did not reach the admin area.");
        }

        private void WaitForHeading(string text, string path)
        {
            try
            {
                _wait.Until(driver => driver.FindElement(By.XPath($"//*[contains(normalize-space(), '{text}')]")));
            }
            catch (WebDriverTimeoutException)
            {
                throw new WebDriverTimeoutException($"Timed out waiting for '{text}' on {path}.");
            }
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
