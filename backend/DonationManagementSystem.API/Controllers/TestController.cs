using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TestController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("hello")]
        public IActionResult Hello()
        {
            return Ok(new { message = "Hello World", status = "working" });
        }

        [HttpGet("fix-admin")]
        public async Task<IActionResult> FixAdmin()
        {
            var password = "ramjankh08";
            var hash = BCrypt.Net.BCrypt.HashPassword(password);
            
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == "khanramjan001@gmail.com");
            if (user != null)
            {
                user.PasswordHash = hash;
                user.UserType = "admin";
                user.IsEmailVerified = true;
                user.IsActive = true;
                await _context.SaveChangesAsync();
                
                var verify = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
                return Ok(new { message = "Admin fixed", email = user.Email, password, verified = verify });
            }
            
            return NotFound(new { message = "User not found" });
        }
    }
}