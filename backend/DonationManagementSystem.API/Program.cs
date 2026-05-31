using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Linq;
using System.Diagnostics;
using DonationManagementSystem.API;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Services;
using DonationManagementSystem.API.Services.ML;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add database context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// Register testimonial moderation policy and service
builder.Services.Configure<TestimonialModerationOptions>(builder.Configuration.GetSection("TestimonialModeration"));
builder.Services.AddSingleton<ITestimonialModerationService, TestimonialModerationService>();

// Register Payment Gateway Service
builder.Services.AddScoped<IPaymentGatewayService, SSLCommerzPaymentService>();

// Register ML Prediction Service (Singleton — models are trained once and cached)
builder.Services.AddSingleton<IMLPredictionService, MLPredictionService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var runMigrationsOnStartup = builder.Configuration.GetValue("AppSettings:RunMigrationsOnStartup", true);
var runSeederOnStartup = builder.Configuration.GetValue("AppSettings:RunSeederOnStartup", true);
var slowRequestThresholdMs = builder.Configuration.GetValue("AppSettings:SlowRequestThresholdMs", 1500);

var app = builder.Build();

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI();

if (slowRequestThresholdMs > 0)
{
    app.Use(async (context, next) =>
    {
        var timer = Stopwatch.StartNew();
        await next();
        if (timer.ElapsedMilliseconds >= slowRequestThresholdMs)
        {
            app.Logger.LogWarning(
                "Slow request {Method} {Path} took {ElapsedMs}ms",
                context.Request.Method,
                context.Request.Path,
                timer.ElapsedMilliseconds);
        }
    });
}

// Initialize database and seed data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (runMigrationsOnStartup)
    {
        try
        {
            await db.Database.MigrateAsync();
            Console.WriteLine("✅ Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Database migration warning: {ex.Message}");
        }
    }
    else
    {
        app.Logger.LogWarning("Skipping database migrations (RunMigrationsOnStartup=false)");
    }

    // Seed database with default admin and sample data
    if (runSeederOnStartup)
    {
        try
        {
            await DbSeeder.SeedAsync(db);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Seeding warning: {ex.Message}");
        }
    }
    else
    {
        app.Logger.LogWarning("Skipping database seeding (RunSeederOnStartup=false)");
    }
}

// Use CORS
app.UseCors("AllowFrontend");

// Serve static files from wwwroot folder (default)
app.UseStaticFiles();

// Serve static files from Uploads folder
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/Uploads"
});

// Use Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

// Block write operations for demo accounts (must be after UseAuthentication so JWT claims are available)
app.UseMiddleware<DemoAccountReadOnlyMiddleware>();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
