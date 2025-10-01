using Microsoft.AspNetCore.Mvc;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet("hello")]
        public IActionResult Hello()
        {
            return Ok(new { message = "Hello World", status = "working" });
        }
    }
}