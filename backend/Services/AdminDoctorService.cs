// using System;
// using System.Collections.Generic;
// using MySql.Data.MySqlClient;
// using HospitalManagementSystem.DTOs;
// using HospitalManagementSystem.Models;
// using Microsoft.Extensions.Configuration;

// namespace HospitalManagementSystem.Services
// {
//     public class AdminDoctorService
//     {
//         private readonly string _connectionString;
//         private readonly IConfiguration _config;
//         private readonly AuthService _authService;

//         public AdminDoctorService(IConfiguration config)
//         {
//             _config = config;
//             _authService = new AuthService(config);
//             _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
//                                 ?? _config.GetConnectionString("DefaultConnection");
//         }

//         private string SafeGetString(MySqlDataReader reader, string columnName)
//         {
//             return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
//         }

//         // =====================================================
//         // CREATE DOCTOR ACCOUNT (By Admin)
//         // Saves to Users table + Doctors table
//         // =====================================================
//         public CreateDoctorAccountResponse CreateDoctorAccount(CreateDoctorAccountRequest request)
//         {
//             // ===== VALIDATION =====
//             ValidateDoctorInput(request);

//             using var connection = new MySqlConnection(_connectionString);
//             connection.Open();

//             // Check if email already exists in Users table
//             if (EmailExists(connection, request.Email))
//                 throw new Exception($"Email '{request.Email}' already exists in the system");

//             // Check if contact already exists in Doctors table
//             if (ContactExists(connection, request.Contact))
//                 throw new Exception($"Contact number '{request.Contact}' already registered");

//             // ===== CREATE USER RECORD =====
//             string userId = GenerateUserId();
//             string hashedPassword = _authService.HashPassword(request.Password);

//             var userInsertCmd = new MySqlCommand(
//                 @"INSERT INTO Users (UserId, FullName, DOB, Email, PasswordHash, Contact, Role, IsActive)
//                   VALUES (@UserId, @FullName, @DOB, @Email, @PasswordHash, @Contact, @Role, @IsActive)",
//                 connection);

//             userInsertCmd.Parameters.AddWithValue("@UserId", userId);
//             userInsertCmd.Parameters.AddWithValue("@FullName", request.FullName);
//             userInsertCmd.Parameters.AddWithValue("@DOB", DateTime.Now.AddYears(-30)); // Default DOB, can be updated later
//             userInsertCmd.Parameters.AddWithValue("@Email", request.Email);
//             userInsertCmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);
//             userInsertCmd.Parameters.AddWithValue("@Contact", request.Contact);
//             userInsertCmd.Parameters.AddWithValue("@Role", "Doctor");
//             userInsertCmd.Parameters.AddWithValue("@IsActive", true);

//             userInsertCmd.ExecuteNonQuery();

//             // ===== CREATE DOCTOR RECORD =====
//             string doctorId = GenerateDoctorId(connection);

//             var doctorInsertCmd = new MySqlCommand(
//                 @"INSERT INTO Doctors (DoctorId, UserId, Name, Specialization, DepartmentId, Contact, Email, Availability, IsActive, CreatedAt)
//                   VALUES (@DoctorId, @UserId, @Name, @Specialization, @DepartmentId, @Contact, @Email, @Availability, @IsActive, @CreatedAt)",
//                 connection);

//             doctorInsertCmd.Parameters.AddWithValue("@DoctorId", doctorId);
//             doctorInsertCmd.Parameters.AddWithValue("@UserId", userId);
//             doctorInsertCmd.Parameters.AddWithValue("@Name", request.FullName);
//             doctorInsertCmd.Parameters.AddWithValue("@Specialization", request.Specialization);
//             doctorInsertCmd.Parameters.AddWithValue("@DepartmentId", request.DepartmentId ?? "");
//             doctorInsertCmd.Parameters.AddWithValue("@Contact", request.Contact);
//             doctorInsertCmd.Parameters.AddWithValue("@Email", request.Email);
//             doctorInsertCmd.Parameters.AddWithValue("@Availability", request.Availability ?? "Available");
//             doctorInsertCmd.Parameters.AddWithValue("@IsActive", true);
//             doctorInsertCmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

//             doctorInsertCmd.ExecuteNonQuery();

//             return new CreateDoctorAccountResponse
//             {
//                 DoctorId = doctorId,
//                 UserId = userId,
//                 FullName = request.FullName,
//                 Email = request.Email,
//                 Contact = request.Contact,
//                 Specialization = request.Specialization,
//                 DepartmentId = request.DepartmentId,
//                 Message = "Doctor account created successfully",
//                 CreatedAt = DateTime.Now
//             };
//         }

//         // =====================================================
//         // VALIDATION METHODS
//         // =====================================================
//         private void ValidateDoctorInput(CreateDoctorAccountRequest request)
//         {
//             if (string.IsNullOrWhiteSpace(request.FullName))
//                 throw new Exception("Full name is required");

//             if (!System.Text.RegularExpressions.Regex.IsMatch(request.FullName, @"^[a-zA-Z\s]+$"))
//                 throw new Exception("Full name must contain only alphabets and spaces");

//             if (request.FullName.Length < 3)
//                 throw new Exception("Full name must be at least 3 characters");

//             // Email validation
//             if (string.IsNullOrWhiteSpace(request.Email))
//                 throw new Exception("Email is required");

//             if (!IsValidEmail(request.Email))
//                 throw new Exception("Invalid email format");

//             // Contact validation
//             if (string.IsNullOrWhiteSpace(request.Contact))
//                 throw new Exception("Contact number is required");

//             if (!System.Text.RegularExpressions.Regex.IsMatch(request.Contact, @"^\d{10}$"))
//                 throw new Exception("Contact must be exactly 10 digits");

//             // Password validation
//             if (string.IsNullOrWhiteSpace(request.Password))
//                 throw new Exception("Password is required");

//             if (request.Password.Length < 6)
//                 throw new Exception("Password must be at least 6 characters");

//             // Specialization validation
//             if (string.IsNullOrWhiteSpace(request.Specialization))
//                 throw new Exception("Specialization is required");

//             // Department validation
//             if (string.IsNullOrWhiteSpace(request.DepartmentId))
//                 throw new Exception("Department ID is required");
//         }

//         private bool IsValidEmail(string email)
//         {
//             try
//             {
//                 var addr = new System.Net.Mail.MailAddress(email);
//                 return addr.Address == email;
//             }
//             catch
//             {
//                 return false;
//             }
//         }

//         private bool EmailExists(MySqlConnection connection, string email)
//         {
//             var cmd = new MySqlCommand("SELECT COUNT(*) FROM Users WHERE Email=@Email", connection);
//             cmd.Parameters.AddWithValue("@Email", email);
//             long count = Convert.ToInt64(cmd.ExecuteScalar());
//             return count > 0;
//         }

//         private bool ContactExists(MySqlConnection connection, string contact)
//         {
//             var cmd = new MySqlCommand("SELECT COUNT(*) FROM Doctors WHERE Contact=@Contact", connection);
//             cmd.Parameters.AddWithValue("@Contact", contact);
//             long count = Convert.ToInt64(cmd.ExecuteScalar());
//             return count > 0;
//         }

//         private string GenerateUserId()
//         {
//             return $"U-{DateTime.Now.Year}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
//         }

//         private string GenerateDoctorId(MySqlConnection connection)
//         {
//             var cmd = new MySqlCommand(
//                 "SELECT COALESCE(MAX(CAST(SUBSTRING(DoctorId, 3) AS UNSIGNED)), 0) + 1 AS NextId FROM Doctors",
//                 connection);

//             var result = cmd.ExecuteScalar();
//             int nextNum = Convert.ToInt32(result);
//             return "D-" + nextNum.ToString("D4");
//         }
//     }
// }
using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.DTOs;
using HospitalManagementSystem.Models;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Services
{
    public class AdminDoctorService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;
        private readonly AuthService _authService;

        public AdminDoctorService(IConfiguration config)
        {
            _config = config;
            _authService = new AuthService(config);

            //  Correct Azure + Local fallback method
            _connectionString =
                Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        // =====================================================
        // CREATE DOCTOR ACCOUNT (By Admin)
        // Saves to Users table + Doctors table
        // =====================================================
        public CreateDoctorAccountResponse CreateDoctorAccount(CreateDoctorAccountRequest request)
        {
            // ===== VALIDATION =====
            ValidateDoctorInput(request);

            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            // Check if email already exists in Users table
            if (EmailExists(connection, request.Email))
                throw new Exception($"Email '{request.Email}' already exists in the system");

            // Check if contact already exists in Doctors table
            if (ContactExists(connection, request.Contact))
                throw new Exception($"Contact number '{request.Contact}' already registered");

            try
            {
                // ===== CREATE USER RECORD =====
                string userId = GenerateUserId();
                string hashedPassword = _authService.HashPassword(request.Password);

                var userInsertCmd = new MySqlCommand(
                    @"INSERT INTO Users (UserId, FullName, DOB, Email, PasswordHash, Contact, Role, IsActive)
                      VALUES (@UserId, @FullName, @DOB, @Email, @PasswordHash, @Contact, @Role, @IsActive)",
                    connection);

                userInsertCmd.Parameters.AddWithValue("@UserId", userId);
                userInsertCmd.Parameters.AddWithValue("@FullName", request.FullName);
                userInsertCmd.Parameters.AddWithValue("@DOB", DateTime.Now.AddYears(-30)); // Default DOB
                userInsertCmd.Parameters.AddWithValue("@Email", request.Email);
                userInsertCmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);
                userInsertCmd.Parameters.AddWithValue("@Contact", request.Contact);
                userInsertCmd.Parameters.AddWithValue("@Role", "Doctor");
                userInsertCmd.Parameters.AddWithValue("@IsActive", true);

                int userRowsAffected = userInsertCmd.ExecuteNonQuery();
                if (userRowsAffected == 0)
                    throw new Exception("Failed to create user account");

                // ===== CREATE DOCTOR RECORD =====
                string doctorId = GenerateDoctorId(connection);

                var doctorInsertCmd = new MySqlCommand(
                    @"INSERT INTO Doctors (DoctorId, UserId, Name, Specialization, DepartmentId, Contact, Email, Availability, IsActive, CreatedAt)
                      VALUES (@DoctorId, @UserId, @Name, @Specialization, @DepartmentId, @Contact, @Email, @Availability, @IsActive, @CreatedAt)",
                    connection);

                doctorInsertCmd.Parameters.AddWithValue("@DoctorId", doctorId);
                doctorInsertCmd.Parameters.AddWithValue("@UserId", userId);
                doctorInsertCmd.Parameters.AddWithValue("@Name", request.FullName);
                doctorInsertCmd.Parameters.AddWithValue("@Specialization", request.Specialization);
                doctorInsertCmd.Parameters.AddWithValue("@DepartmentId", request.DepartmentId ?? "");
                doctorInsertCmd.Parameters.AddWithValue("@Contact", request.Contact);
                doctorInsertCmd.Parameters.AddWithValue("@Email", request.Email);
                doctorInsertCmd.Parameters.AddWithValue("@Availability", request.Availability ?? "Available");
                doctorInsertCmd.Parameters.AddWithValue("@IsActive", true);
                doctorInsertCmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

                int doctorRowsAffected = doctorInsertCmd.ExecuteNonQuery();
                if (doctorRowsAffected == 0)
                    throw new Exception("Failed to create doctor profile");

                return new CreateDoctorAccountResponse
                {
                    DoctorId = doctorId,
                    UserId = userId,
                    FullName = request.FullName,
                    Email = request.Email,
                    Contact = request.Contact,
                    Specialization = request.Specialization,
                    DepartmentId = request.DepartmentId,
                    Message = "Doctor account created successfully",
                    CreatedAt = DateTime.Now
                };
            }
            catch (MySqlException sqlEx)
            {
                throw new Exception($"Database error: {sqlEx.Message}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating doctor account: {ex.Message}");
            }
        }

        // =====================================================
        // VALIDATION METHODS
        // =====================================================
        private void ValidateDoctorInput(CreateDoctorAccountRequest request)
        {
            if (request == null)
                throw new Exception("Request cannot be null");

            if (string.IsNullOrWhiteSpace(request.FullName))
                throw new Exception("Full name is required");

            if (!System.Text.RegularExpressions.Regex.IsMatch(request.FullName, @"^[a-zA-Z\s]+$"))
                throw new Exception("Full name must contain only alphabets and spaces");

            if (request.FullName.Length < 3)
                throw new Exception("Full name must be at least 3 characters");

            if (request.FullName.Length > 100)
                throw new Exception("Full name cannot exceed 100 characters");

            // Email validation
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new Exception("Email is required");

            if (!IsValidEmail(request.Email))
                throw new Exception("Invalid email format");

            if (request.Email.Length > 100)
                throw new Exception("Email cannot exceed 100 characters");

            // Contact validation
            if (string.IsNullOrWhiteSpace(request.Contact))
                throw new Exception("Contact number is required");

            if (!System.Text.RegularExpressions.Regex.IsMatch(request.Contact, @"^\d{10}$"))
                throw new Exception("Contact must be exactly 10 digits");

            // Password validation
            if (string.IsNullOrWhiteSpace(request.Password))
                throw new Exception("Password is required");

            if (request.Password.Length < 6)
                throw new Exception("Password must be at least 6 characters");

            if (request.Password.Length > 50)
                throw new Exception("Password cannot exceed 50 characters");

            // Specialization validation
            if (string.IsNullOrWhiteSpace(request.Specialization))
                throw new Exception("Specialization is required");

            if (request.Specialization.Length > 100)
                throw new Exception("Specialization cannot exceed 100 characters");

            // Department validation
            if (string.IsNullOrWhiteSpace(request.DepartmentId))
                throw new Exception("Department ID is required");

            if (request.DepartmentId.Length > 20)
                throw new Exception("Department ID format invalid");
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email && email.Contains("@") && email.Contains(".");
            }
            catch
            {
                return false;
            }
        }

        private bool EmailExists(MySqlConnection connection, string email)
        {
            var cmd = new MySqlCommand("SELECT COUNT(*) FROM Users WHERE Email=@Email", connection);
            cmd.Parameters.AddWithValue("@Email", email);
            long count = Convert.ToInt64(cmd.ExecuteScalar());
            return count > 0;
        }

        private bool ContactExists(MySqlConnection connection, string contact)
        {
            var cmd = new MySqlCommand("SELECT COUNT(*) FROM Doctors WHERE Contact=@Contact", connection);
            cmd.Parameters.AddWithValue("@Contact", contact);
            long count = Convert.ToInt64(cmd.ExecuteScalar());
            return count > 0;
        }

        private string GenerateUserId()
        {
            return $"U-{DateTime.Now.Year}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }

        private string GenerateDoctorId(MySqlConnection connection)
        {
            var cmd = new MySqlCommand(
                "SELECT COALESCE(MAX(CAST(SUBSTRING(DoctorId, 3) AS UNSIGNED)), 0) + 1 AS NextId FROM Doctors",
                connection);

            var result = cmd.ExecuteScalar();
            int nextNum = Convert.ToInt32(result);
            return "D-" + nextNum.ToString("D4");
        }
    }
}