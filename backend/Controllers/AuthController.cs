using System;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using HospitalManagementSystem.DTOs;
using HospitalManagementSystem.Services;
using Microsoft.Extensions.Configuration;

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
            _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                                ?? _config.GetConnectionString("DefaultConnection");
        }

        // Registration API
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                // Validate DOB string -> parse
                if (!DateTime.TryParse(request.DOB, out DateTime dob))
                {
                    return BadRequest(new { error = "Invalid DOB format" });
                }

                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                // Check duplicate email
                var checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Users WHERE Email=@Email", connection);
                checkCmd.Parameters.AddWithValue("@Email", request.Email);
                long count = Convert.ToInt64(checkCmd.ExecuteScalar());

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
                insertCmd.Parameters.AddWithValue("@DOB", dob);
                insertCmd.Parameters.AddWithValue("@Email", request.Email);
                insertCmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);
                insertCmd.Parameters.AddWithValue("@Contact", request.Contact);
                insertCmd.Parameters.AddWithValue("@Role", request.Role);
                insertCmd.Parameters.AddWithValue("@IsActive", true);

                insertCmd.ExecuteNonQuery();

                // Calculate Age (Years, Months, Days) robustly
                DateTime today = DateTime.Today;

                int years = today.Year - dob.Year;
                int months = today.Month - dob.Month;
                int days = today.Day - dob.Day;

                if (days < 0)
                {
                    // borrow days from previous month
                    int prevMonth, prevMonthYear;
                    if (today.Month == 1)
                    {
                        prevMonth = 12;
                        prevMonthYear = today.Year - 1;
                    }
                    else
                    {
                        prevMonth = today.Month - 1;
                        prevMonthYear = today.Year;
                    }

                    days += DateTime.DaysInMonth(prevMonthYear, prevMonth);
                    months--;
                }

                if (months < 0)
                {
                    months += 12;
                    years--;
                }

                if (years < 0)
                {
                    // DOB is in the future
                    return BadRequest(new { error = "DOB cannot be in the future" });
                }

                string age = $"{years} Years {months} Months {days} Days";

                return Ok(new
                {
                    userId,
                    age,
                    message = "Registration successful! Please check your email for verification."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Login API
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