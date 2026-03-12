using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add database context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Register JWT Service
builder.Services.AddScoped<IJwtService, JwtService>();

// Register Email Service
builder.Services.AddScoped<IEmailService, EmailService>();

// Register SMS Service
builder.Services.AddScoped<ISmsService, SmsService>();

// Register Volunteer Rank Service
builder.Services.AddScoped<IVolunteerRankService, VolunteerRankService>();

// Register Payment Gateway Service
builder.Services.AddScoped<IPaymentGatewayService, SSLCommerzPaymentService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Apply any pending migrations (adds new columns automatically on startup)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_NAME='Users' AND COLUMN_NAME='PasswordResetToken')
            BEGIN
                ALTER TABLE Users ADD PasswordResetToken NVARCHAR(MAX) NULL;
                ALTER TABLE Users ADD PasswordResetTokenExpiry DATETIME2 NULL;
            END");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Column migration warning: {ex.Message}");
    }
}

// Use CORS
app.UseCors("AllowFrontend");

// Serve static files from wwwroot folder (default)
app.UseStaticFiles();

// Serve static files from Uploads folder
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "Uploads")),
    RequestPath = "/Uploads"
});

// Use Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
