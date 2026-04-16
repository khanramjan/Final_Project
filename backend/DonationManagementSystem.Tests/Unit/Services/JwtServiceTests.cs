using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;

namespace DonationManagementSystem.Tests.Unit.Services;

public class JwtServiceTests
{
    private readonly JwtService _sut;
    private readonly IConfiguration _config;

    private const string Secret = "super-secret-test-key-32-chars-long!!";
    private const string Issuer = "TestIssuer";
    private const string Audience = "TestAudience";

    public JwtServiceTests()
    {
        var configValues = new Dictionary<string, string?>
        {
            ["Jwt:SecretKey"] = Secret,
            ["Jwt:Issuer"] = Issuer,
            ["Jwt:Audience"] = Audience
        };

        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();

        _sut = new JwtService(_config);
    }

    private static User CreateTestUser(string userType = "donor")
    {
        return new User
        {
            Id = 42,
            Email = "test@example.com",
            FirstName = "Jane",
            LastName = "Doe",
            UserType = userType,
            IsActive = true
        };
    }

    // ─── GenerateToken ────────────────────────────────────────────────────────────

    [Fact]
    public void GenerateToken_WithValidUser_ReturnsNonEmptyString()
    {
        var user = CreateTestUser();

        var token = _sut.GenerateToken(user);

        token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void GenerateToken_ReturnsMalformedJwtString()
    {
        var user = CreateTestUser();

        var token = _sut.GenerateToken(user);

        // A JWT has 3 dot-separated segments
        token.Split('.').Should().HaveCount(3);
    }

    [Fact]
    public void GenerateToken_ContainsUserIdClaim()
    {
        var user = CreateTestUser();

        var token = _sut.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        var nameId = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        nameId.Should().Be(user.Id.ToString());
    }

    [Fact]
    public void GenerateToken_ContainsEmailClaim()
    {
        var user = CreateTestUser();

        var token = _sut.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        var email = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        email.Should().Be(user.Email);
    }

    [Fact]
    public void GenerateToken_ContainsUserTypeClaim()
    {
        var user = CreateTestUser("volunteer");

        var token = _sut.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);
        var userType = jwt.Claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
        userType.Should().Be("volunteer");
    }

    // ─── ValidateToken ────────────────────────────────────────────────────────────

    [Fact]
    public void ValidateToken_WithValidToken_ReturnsTrue()
    {
        var user = CreateTestUser();
        var token = _sut.GenerateToken(user);

        var result = _sut.ValidateToken(token);

        result.Should().BeTrue();
    }

    [Fact]
    public void ValidateToken_WithTamperedToken_ReturnsFalse()
    {
        var user = CreateTestUser();
        var token = _sut.GenerateToken(user);
        // Tamper the signature segment
        var parts = token.Split('.');
        parts[2] = "tampered_signature_xxxxxxxxxxx";
        var tamperedToken = string.Join('.', parts);

        var result = _sut.ValidateToken(tamperedToken);

        result.Should().BeFalse();
    }

    [Fact]
    public void ValidateToken_WithRandomString_ReturnsFalse()
    {
        var result = _sut.ValidateToken("not.a.jwt");

        result.Should().BeFalse();
    }

    [Fact]
    public void ValidateToken_WithEmptyString_ReturnsFalse()
    {
        var result = _sut.ValidateToken(string.Empty);

        result.Should().BeFalse();
    }

    // ─── GetUserIdFromToken ───────────────────────────────────────────────────────

    [Fact]
    public void GetUserIdFromToken_WithValidToken_ReturnsCorrectId()
    {
        var user = CreateTestUser();
        var token = _sut.GenerateToken(user);

        var userId = _sut.GetUserIdFromToken(token);

        userId.Should().Be(user.Id.ToString());
    }

    [Fact]
    public void GetUserIdFromToken_WithInvalidToken_ReturnsNull()
    {
        var userId = _sut.GetUserIdFromToken("bad.token.here");

        userId.Should().BeNull();
    }

    // ─── GenerateRefreshToken ─────────────────────────────────────────────────────

    [Fact]
    public void GenerateRefreshToken_ReturnsDifferentTokensEachCall()
    {
        var token1 = _sut.GenerateRefreshToken();
        var token2 = _sut.GenerateRefreshToken();

        token1.Should().NotBe(token2);
    }

    [Fact]
    public void GenerateRefreshToken_ReturnsBase64String()
    {
        var token = _sut.GenerateRefreshToken();

        var act = () => Convert.FromBase64String(token);
        act.Should().NotThrow();
    }
}
