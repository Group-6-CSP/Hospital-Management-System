using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using HospitalManagementSystem.DTOs;
using HospitalManagementSystem.Services;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Services
{
    public class DoctorManagementService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;
        private readonly AuthService _authService;

        public DoctorManagementService(IConfiguration config)
        {
            _config = config;
            _authService = new AuthService(config);

            // FIXED for Azure connection string handling
            _connectionString =
                Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        // Create Doctor Account
        public string CreateDoctorAccount(CreateDoctorRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                !System.Text.RegularExpressions.Regex.IsMatch(request.Name, @"^[a-zA-Z\s]+$"))
                throw new Exception("Name must contain only alphabets");

            if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains("@"))
                throw new Exception("Invalid email format");

            if (request.Password.Length < 6)
                throw new Exception("Password must be at least 6 characters");

            if (string.IsNullOrWhiteSpace(request.Contact) || request.Contact.Length != 10)
                throw new Exception("Contact must be 10 digits");

            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            // Check if email exists
            var checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Users WHERE Email=@Email", connection);
            checkCmd.Parameters.AddWithValue("@Email", request.Email);
            long emailCount = Convert.ToInt64(checkCmd.ExecuteScalar());

            if (emailCount > 0)
                throw new Exception("Email already exists");

            // Check if contact exists
            var checkContactCmd = new MySqlCommand("SELECT COUNT(*) FROM Doctors WHERE Contact=@Contact", connection);
            checkContactCmd.Parameters.AddWithValue("@Contact", request.Contact);
            long contactCount = Convert.ToInt64(checkContactCmd.ExecuteScalar());

            if (contactCount > 0)
                throw new Exception("Contact already exists");

            // Create User account
            string userId = $"U-{DateTime.Now.Year}-{Guid.NewGuid().ToString().Substring(0, 4)}";
            string hashedPassword = _authService.HashPassword(request.Password);

            var userInsertCmd = new MySqlCommand(
                @"INSERT INTO Users (UserId, FullName, Email, PasswordHash, Contact, Role, IsActive, DOB)
                  VALUES (@UserId, @FullName, @Email, @PasswordHash, @Contact, @Role, @IsActive, @DOB)",
                connection);

            userInsertCmd.Parameters.AddWithValue("@UserId", userId);
            userInsertCmd.Parameters.AddWithValue("@FullName", request.Name);
            userInsertCmd.Parameters.AddWithValue("@Email", request.Email);
            userInsertCmd.Parameters.AddWithValue("@PasswordHash", hashedPassword);
            userInsertCmd.Parameters.AddWithValue("@Contact", request.Contact);
            userInsertCmd.Parameters.AddWithValue("@Role", "Doctor");
            userInsertCmd.Parameters.AddWithValue("@IsActive", true);
            userInsertCmd.Parameters.AddWithValue("@DOB", DateTime.UtcNow);

            userInsertCmd.ExecuteNonQuery();

            // Create Doctor record
            string doctorId = GenerateDoctorId(connection);

            var doctorInsertCmd = new MySqlCommand(
                @"INSERT INTO Doctors (DoctorId, UserId, Name, Specialization, DepartmentId, Contact, Email, Availability, IsActive, CreatedAt)
                  VALUES (@DoctorId, @UserId, @Name, @Specialization, @DepartmentId, @Contact, @Email, @Availability, @IsActive, @CreatedAt)",
                connection);

            doctorInsertCmd.Parameters.AddWithValue("@DoctorId", doctorId);
            doctorInsertCmd.Parameters.AddWithValue("@UserId", userId);
            doctorInsertCmd.Parameters.AddWithValue("@Name", request.Name);
            doctorInsertCmd.Parameters.AddWithValue("@Specialization", request.Specialization);
            doctorInsertCmd.Parameters.AddWithValue("@DepartmentId", request.DepartmentId);
            doctorInsertCmd.Parameters.AddWithValue("@Contact", request.Contact);
            doctorInsertCmd.Parameters.AddWithValue("@Email", request.Email);
            doctorInsertCmd.Parameters.AddWithValue("@Availability", request.Availability ?? "");
            doctorInsertCmd.Parameters.AddWithValue("@IsActive", true);
            doctorInsertCmd.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

            doctorInsertCmd.ExecuteNonQuery();

            return doctorId;
        }

        // Get Doctors by Department
        public List<object> GetDoctorsByDepartment(string departmentId)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand(
                @"SELECT d.DoctorId, d.Name, d.Specialization, d.Availability, d.Contact
                  FROM Doctors d
                  WHERE d.DepartmentId=@DepartmentId AND d.IsActive=1
                  ORDER BY d.Name ASC",
                connection);

            cmd.Parameters.AddWithValue("@DepartmentId", departmentId);

            using var reader = cmd.ExecuteReader();
            var doctors = new List<object>();

            while (reader.Read())
            {
                doctors.Add(new
                {
                    doctorId = SafeGetString(reader, "DoctorId"),
                    name = SafeGetString(reader, "Name"),
                    specialization = SafeGetString(reader, "Specialization"),
                    availability = SafeGetString(reader, "Availability"),
                    contact = SafeGetString(reader, "Contact")
                });
            }

            return doctors;
        }

        private string GenerateDoctorId(MySqlConnection connection)
        {
            var cmd = new MySqlCommand("SELECT DoctorId FROM Doctors ORDER BY DoctorId DESC LIMIT 1", connection);
            var result = cmd.ExecuteScalar();

            if (result != null)
            {
                string lastId = result.ToString();
                int num = int.Parse(lastId.Substring(2));
                return "D-" + (num + 1).ToString("D4");
            }

            return "D-0001";
        }
    }
}
