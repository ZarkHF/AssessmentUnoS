using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using TA_API.Models;
using TA_API.Services.Data;
using TA_API.Attributes;

namespace TA_API.Controllers
{
    [ApiController]
    [Route("api/login")]
    public class LoginController : ControllerBase
    {
        private readonly AssessmentDbContext _context;

        public LoginController(AssessmentDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        [ApiKey]
        public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
        {
            // Validate request
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { error = "Username and password are required." });
            }

            // Check if username already exists
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(new { error = "Username already exists." });
            }

            // Hash password
            var hashedPassword = HashPassword(request.Password);

            // Create new user
            var user = new User
            {
                Username = request.Username,
                Password = hashedPassword
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new LoginResponse 
            { 
                Username = user.Username,
                Message = "Registration successful"
            });
        }

        [HttpPost("login")]
        [ApiKey]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            // Validate request
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { error = "Username and password are required." });
            }

            // Find user
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null)
            {
                return Unauthorized(new { error = "Invalid username or password." });
            }

            // Verify password
            var hashedPassword = HashPassword(request.Password);
            if (user.Password != hashedPassword)
            {
                return Unauthorized(new { error = "Invalid username or password." });
            }

            return Ok(new LoginResponse
            {
                Username = user.Username,
                Message = "Login successful"
            });
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
    }
}
