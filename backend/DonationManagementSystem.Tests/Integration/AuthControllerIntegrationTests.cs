using System.Net;
using System.Net.Http.Json;
using DonationManagementSystem.API.Data;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DonationManagementSystem.Tests.Integration;

/// <summary>
/// Full HTTP integration tests using WebApplicationFactory with an in-memory database.
/// These act as end-to-end tests for the HTTP layer without spinning up a real server.
/// </summary>
public class AuthControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;

    public AuthControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the real SQL Server DB context
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                // Add in-memory DB
                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase("IntegrationTestDb_" + Guid.NewGuid()));
            });
        });

        _client = _factory.CreateClient();
    }

    public void Dispose() => _client.Dispose();

    // ─── POST /api/auth/register ──────────────────────────────────────────────────

    [Fact]
    public async Task Register_WithValidDonorData_Returns200()
    {
        var payload = new
        {
            userType = "donor",
            firstName = "Integration",
            lastName = "Tester",
            email = $"it_{Guid.NewGuid():N}@test.com",
            password = "TestPass123!"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Register_WithInvalidUserType_Returns400()
    {
        var payload = new
        {
            userType = "superadmin",
            firstName = "Bad",
            lastName = "Actor",
            email = $"bad_{Guid.NewGuid():N}@test.com",
            password = "TestPass123!"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ─── POST /api/auth/login ─────────────────────────────────────────────────────

    [Fact]
    public async Task Login_WithNonExistentUser_Returns401()
    {
        var payload = new { email = "nonexistent@test.com", password = "Any123!" };

        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ─── GET /api/auth/verify-email ───────────────────────────────────────────────

    [Fact]
    public async Task VerifyEmail_WithNoToken_Returns400()
    {
        var response = await _client.GetAsync("/api/auth/verify-email?token=");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task VerifyEmail_WithUnknownToken_Returns400()
    {
        var response = await _client.GetAsync("/api/auth/verify-email?token=totally-fake-token-xyz");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ─── POST /api/auth/forgot-password ──────────────────────────────────────────

    [Fact]
    public async Task ForgotPassword_WithUnknownEmail_ReturnsOkToPreventEnumeration()
    {
        var payload = new { email = "doesnotexist@test.com" };

        var response = await _client.PostAsJsonAsync("/api/auth/forgot-password", payload);

        // Always 200 to prevent email enumeration
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ─── POST /api/auth/logout ────────────────────────────────────────────────────

    [Fact]
    public async Task Logout_Always200()
    {
        var response = await _client.PostAsync("/api/auth/logout", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
