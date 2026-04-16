using DonationManagementSystem.API.Controllers;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.DTOs;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;

namespace DonationManagementSystem.Tests.Unit.Controllers;

public class AuthControllerTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<IJwtService> _jwtMock;
    private readonly Mock<IEmailService> _emailMock;
    private readonly IConfiguration _config;
    private readonly AuthController _sut;

    public AuthControllerTests()
    {
        // In-memory EF context — unique name per test class instance
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);

        _jwtMock = new Mock<IJwtService>();
        _jwtMock.Setup(j => j.GenerateToken(It.IsAny<User>())).Returns("fake-jwt-token");
        _jwtMock.Setup(j => j.GenerateRefreshToken()).Returns("fake-refresh-token");

        _emailMock = new Mock<IEmailService>();
        _emailMock.Setup(e => e.SendVerificationEmailAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);
        _emailMock.Setup(e => e.SendPasswordResetEmailAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        var configValues = new Dictionary<string, string?>
        {
            ["AppSettings:FrontendUrl"] = "http://localhost:5173"
        };
        _config = new ConfigurationBuilder().AddInMemoryCollection(configValues).Build();

        _sut = new AuthController(_context, _config, _jwtMock.Object, _emailMock.Object);
    }

    public void Dispose() => _context.Dispose();

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    private RegisterDto ValidDonorDto(string email = "donor@test.com") => new()
    {
        UserType = "donor",
        FirstName = "Alice",
        LastName = "Smith",
        Email = email,
        Password = "Password123!"
    };

    private async Task<User> SeedUserAsync(
        string email = "existing@test.com",
        string userType = "donor",
        string password = "Password123!",
        bool isActive = true)
    {
        var user = new User
        {
            Email = email,
            UserType = userType,
            FirstName = "Seed",
            LastName = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            IsActive = isActive,
            IsEmailVerified = true
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    // ─── Register ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Register_WithValidDonorDto_Returns200WithToken()
    {
        var dto = ValidDonorDto();

        var result = await _sut.Register(dto);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task Register_WithValidDonorDto_SavesUserToDatabase()
    {
        var dto = ValidDonorDto("newdonor@test.com");

        await _sut.Register(dto);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        user.Should().NotBeNull();
        user!.UserType.Should().Be("donor");
    }

    [Fact]
    public async Task Register_WithExistingEmail_Returns400()
    {
        await SeedUserAsync("dup@test.com");
        var dto = ValidDonorDto("dup@test.com");

        var result = await _sut.Register(dto);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Register_WithAdminUserType_Returns400()
    {
        var dto = new RegisterDto
        {
            UserType = "admin",
            FirstName = "A",
            LastName = "B",
            Email = "admin@test.com",
            Password = "Password123!"
        };

        var result = await _sut.Register(dto);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Register_WithVolunteerUserType_Returns200()
    {
        var dto = new RegisterDto
        {
            UserType = "volunteer",
            FirstName = "Vol",
            LastName = "User",
            Email = "vol@test.com",
            Password = "Password123!"
        };

        var result = await _sut.Register(dto);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Register_WithNewUser_CallsEmailService()
    {
        var dto = ValidDonorDto("email-check@test.com");

        await _sut.Register(dto);

        _emailMock.Verify(e =>
            e.SendVerificationEmailAsync(
                dto.Email, dto.FirstName, It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }

    // ─── Login ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Login_WithValidCredentials_Returns200WithToken()
    {
        var user = await SeedUserAsync("login@test.com", password: "Password123!");
        var dto = new LoginDto { Email = "login@test.com", Password = "Password123!" };

        var result = await _sut.Login(dto);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        await SeedUserAsync("user@test.com", password: "RealPass123!");
        var dto = new LoginDto { Email = "user@test.com", Password = "WrongPassword" };

        var result = await _sut.Login(dto);

        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_Returns401()
    {
        var dto = new LoginDto { Email = "nobody@test.com", Password = "any" };

        var result = await _sut.Login(dto);

        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task Login_WithInactiveAccount_Returns401()
    {
        await SeedUserAsync("inactive@test.com", isActive: false);
        var dto = new LoginDto { Email = "inactive@test.com", Password = "Password123!" };

        var result = await _sut.Login(dto);

        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task Login_WithUnapprovedVolunteer_Returns401()
    {
        // Create a volunteer user with a volunteer profile that is NOT approved
        var user = new User
        {
            Email = "vol@test.com",
            UserType = "volunteer",
            FirstName = "V",
            LastName = "U",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            IsActive = true,
            IsEmailVerified = true
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var profile = new VolunteerProfile
        {
            UserId = user.Id,
            IsApprovedByAdmin = false,
            AdminApprovalStatus = "pending",
            Status = "pending",
            ExperienceLevel = "beginner"
        };
        _context.VolunteerProfiles.Add(profile);
        await _context.SaveChangesAsync();

        var dto = new LoginDto { Email = "vol@test.com", Password = "Password123!" };

        var result = await _sut.Login(dto);

        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    // ─── ForgotPassword ───────────────────────────────────────────────────────────

    [Fact]
    public async Task ForgotPassword_WithNonExistentEmail_ReturnsOkSilently()
    {
        var dto = new ForgotPasswordDto { Email = "ghost@test.com" };

        var result = await _sut.ForgotPassword(dto);

        // Returns 200 to prevent email enumeration
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ForgotPassword_WithExistingEmail_SendsResetEmail()
    {
        await SeedUserAsync("forgot@test.com");
        var dto = new ForgotPasswordDto { Email = "forgot@test.com" };

        await _sut.ForgotPassword(dto);

        _emailMock.Verify(e =>
            e.SendPasswordResetEmailAsync(
                dto.Email, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }

    // ─── VerifyEmail ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task VerifyEmail_WithValidToken_Returns200()
    {
        var user = new User
        {
            Email = "verify@test.com",
            UserType = "donor",
            FirstName = "V",
            LastName = "U",
            IsActive = true,
            IsEmailVerified = false,
            EmailVerificationToken = "valid-token-abc",
            EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(1)
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var result = await _sut.VerifyEmail("valid-token-abc");

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task VerifyEmail_WithExpiredToken_Returns400()
    {
        var user = new User
        {
            Email = "expired@test.com",
            UserType = "donor",
            FirstName = "E",
            LastName = "U",
            IsActive = true,
            IsEmailVerified = false,
            EmailVerificationToken = "expired-token-xyz",
            EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(-1) // already expired
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var result = await _sut.VerifyEmail("expired-token-xyz");

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task VerifyEmail_WithInvalidToken_Returns400()
    {
        var result = await _sut.VerifyEmail("completely-made-up-token");

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task VerifyEmail_WithAlreadyVerifiedUser_Returns200WithFlag()
    {
        var user = new User
        {
            Email = "alreadyverified@test.com",
            UserType = "donor",
            FirstName = "A",
            LastName = "V",
            IsActive = true,
            IsEmailVerified = true,
            EmailVerificationToken = "should-not-matter"
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var result = await _sut.VerifyEmail("should-not-matter");

        result.Should().BeOfType<OkObjectResult>();
    }

    // ─── Logout ───────────────────────────────────────────────────────────────────

    [Fact]
    public void Logout_AlwaysReturns200()
    {
        var result = _sut.Logout();

        result.Should().BeOfType<OkObjectResult>();
    }
}
