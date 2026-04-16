using System.Net;
using System.Text.Json;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DonationManagementSystem.Tests.Integration;

public class CampaignControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;

    public CampaignControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase("CampaignIntegrationDb_" + Guid.NewGuid()));
            });
        });

        _client = _factory.CreateClient();
        SeedData();
    }

    public void Dispose() => _client.Dispose();

    private void SeedData()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var creator = new User
        {
            Email = "creator@test.com",
            FirstName = "Creator",
            LastName = "User",
            UserType = "admin",
            PasswordHash = "hash",
            IsEmailVerified = true
        };

        db.Users.Add(creator);
        db.SaveChanges();

        db.Campaigns.AddRange(
            new Campaign
            {
                Title = "Active Water Campaign",
                Description = "Build clean water access",
                TargetAmount = 10000,
                RaisedAmount = 2500,
                StartDate = DateTime.UtcNow.AddDays(-5),
                EndDate = DateTime.UtcNow.AddDays(20),
                Status = "active",
                Category = "health",
                CreatedBy = creator.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new Campaign
            {
                Title = "Pending Internal Campaign",
                Description = "Should not appear publicly",
                TargetAmount = 5000,
                RaisedAmount = 0,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(10),
                Status = "pending",
                Category = "education",
                CreatedBy = creator.Id,
                CreatedAt = DateTime.UtcNow
            },
            new Campaign
            {
                Title = "Completed School Campaign",
                Description = "Completed campaign should still be visible",
                TargetAmount = 7000,
                RaisedAmount = 7000,
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow.AddDays(-1),
                Status = "completed",
                Category = "education",
                CreatedBy = creator.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-40)
            });

        db.SaveChanges();
    }

    [Fact]
    public async Task TestEndpoint_Returns200()
    {
        var response = await _client.GetAsync("/api/campaign/test");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task PublicCampaigns_ExcludesPendingCampaigns()
    {
        var response = await _client.GetAsync("/api/campaign/public?page=1&pageSize=20");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var payload = await response.Content.ReadAsStringAsync();
        payload.Should().Contain("Active Water Campaign");
        payload.Should().Contain("Completed School Campaign");
        payload.Should().NotContain("Pending Internal Campaign");
    }

    [Fact]
    public async Task PublicCampaigns_WithCategoryFilter_ReturnsMatchingRecordsOnly()
    {
        var response = await _client.GetAsync("/api/campaign/public?page=1&pageSize=20&category=health");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var payload = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(payload);
        var campaigns = doc.RootElement.GetProperty("campaigns");

        campaigns.GetArrayLength().Should().BeGreaterThan(0);
        campaigns.EnumerateArray().All(c => c.GetProperty("category").GetString() == "health").Should().BeTrue();
    }
}
