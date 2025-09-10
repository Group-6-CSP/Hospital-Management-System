using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using HospitalManagementSystem.DTOs;
using HospitalManagementSystem.Services;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly AuthService _authService;
        private readonly string _connectionString;

        public AuthController(IConfiguration config)
        {
            _config = config;
            _authService = new AuthService(config);
            _connectionString = _config.GetConnectionString("DefaultConnection");
        }

        // ✅ Registration API
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                // Check duplicate email
                var checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Users WHERE Email=@Email", connection);
                checkCmd.Parameters.AddWithValue("@Email", request.Email);
                long count = (long)checkCmd.ExecuteScalar();

                if (count > 0)
                {
                    return Conflict(new { error = "Email already exists", code = 409 });
                }

                // Hash password
                string hashedPassword = _authService.HashPassword(request.Password);

                // Generate UserId
                string userId = $"U-{DateTime.Now.Year}-{Guid.NewGuid().ToString().Substring(0, 4)}";

                // Insert into DB
                var insertCmd = new MySqlCommand(
                    "INSERT INTO Users (UserId, FullName, DOB, Email, PasswordHash, Contact, Role, IsActive) " +
                    "VALUES (@UserId, @FullName, @DOB, @Email, @PasswordHash, @Contact, @Role, @IsActive)",
                    connection);

                insertCmd.Parameters.AddWithValue("@UserId", userId);
                insertCmd.Parameters.AddWithValue("@FullName", request.FullName);
                insertCmd.Parameters.AddWithValue("@DOB", DateTime.Parse(request.DOB));
                insertCmd.Parameters.AddWithValue("@Email", request.Email);
                insertCmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);
                insertCmd.Parameters.AddWithValue("@Contact", request.Contact);
                insertCmd.Parameters.AddWithValue("@Role", request.Role);
                insertCmd.Parameters.AddWithValue("@IsActive", true);

                insertCmd.ExecuteNonQuery();

                return Ok(new
                {
                    userId,
                    message = "Registration successful! Please check your email for verification."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ✅ Login API
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var cmd = new MySqlCommand("SELECT * FROM Users WHERE Email=@Email", connection);
                cmd.Parameters.AddWithValue("@Email", request.Email);

                using var reader = cmd.ExecuteReader();
                if (!reader.Read())
                {
                    return Unauthorized(new { error = "Invalid email or password", code = 401 });
                }

                var user = new User
                {
                    UserId = reader["UserId"].ToString(),
                    FullName = reader["FullName"].ToString(),
                    DOB = Convert.ToDateTime(reader["DOB"]),
                    Email = reader["Email"].ToString(),
                    PasswordHash = reader["PasswordHash"].ToString(),
                    Contact = reader["Contact"].ToString(),
                    Role = reader["Role"].ToString(),
                    IsActive = Convert.ToBoolean(reader["IsActive"])
                };

                // Verify password
                if (!_authService.VerifyPassword(request.Password, user.PasswordHash))
                {
                    return Unauthorized(new { error = "Invalid email or password", code = 401 });
                }

                // Generate JWT token
                var token = _authService.GenerateJwtToken(user);

                return Ok(new
                {
                    token,
                    role = user.Role,
                    expiresIn = 1800,
                    message = "Login successful"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
