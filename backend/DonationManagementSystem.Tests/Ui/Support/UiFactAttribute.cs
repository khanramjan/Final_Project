using Xunit;

namespace DonationManagementSystem.Tests.Ui.Support
{
    internal sealed class UiFactAttribute : FactAttribute
    {
        public UiFactAttribute()
        {
            if (!UiTestConfig.RunUiTests)
            {
                Skip = "UI tests are disabled. Set UI_RUN=true to enable.";
            }
        }
    }
}