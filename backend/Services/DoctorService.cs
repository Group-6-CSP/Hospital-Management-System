using System;
using System.Collections.Generic;
using System.Text.Json;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Services
{
    public class DoctorService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;

        public DoctorService(IConfiguration config)
        {
            _config = config;

            // FIXED for Azure
            _connectionString =
                Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        // Create Doctor
        public string CreateDoctor(CreateDoctorRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                !System.Text.RegularExpressions.Regex.IsMatch(request.Name, @"^[a-zA-Z\s]+$"))
                throw new Exception("Name must contain only alphabets");

            if (string.IsNullOrWhiteSpace(request.Contact) ||
                request.Contact.Length != 10 ||
                !System.Text.RegularExpressions.Regex.IsMatch(request.Contact, @"^\d{10}$"))
                throw new Exception("Contact must be 10 digits");

            if (string.IsNullOrWhiteSpace(request.Specialization))
                throw new Exception("Specialization is required");

            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            // Check contact existence
            var checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Doctors WHERE Contact=@Contact", connection);
            checkCmd.Parameters.AddWithValue("@Contact", request.Contact);
            long count = Convert.ToInt64(checkCmd.ExecuteScalar());

            if (count > 0)
                throw new Exception("Contact already exists");

            // Generate Doctor ID
            string doctorId = GenerateDoctorId(connection);

            // Insert doctor
            var insertCmd = new MySqlCommand(
                @"INSERT INTO Doctors (DoctorId, Name, Specialization, Contact, Email, Availability, IsActive, CreatedAt)
                  VALUES (@DoctorId, @Name, @Specialization, @Contact, @Email, @Availability, @IsActive, @CreatedAt)",
                connection);

            insertCmd.Parameters.AddWithValue("@DoctorId", doctorId);
            insertCmd.Parameters.AddWithValue("@Name", request.Name);
            insertCmd.Parameters.AddWithValue("@Specialization", request.Specialization);
            insertCmd.Parameters.AddWithValue("@Contact", request.Contact);
            insertCmd.Parameters.AddWithValue("@Email", request.Email ?? "");
            insertCmd.Parameters.AddWithValue("@Availability", request.Availability ?? "");
            insertCmd.Parameters.AddWithValue("@IsActive", true);
            insertCmd.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

            insertCmd.ExecuteNonQuery();

            return doctorId;
        }

        // Update Doctor Schedule
        public void UpdateDoctorSchedule(string doctorId, UpdateDoctorScheduleRequest request)
        {
            if (request.WorkingDays == null || request.WorkingDays.Count == 0)
                throw new Exception("Working days are required");

            if (request.TimeSlots == null || request.TimeSlots.Count == 0)
                throw new Exception("Time slots are required");

            string workingDaysJson = JsonSerializer.Serialize(request.WorkingDays);
            string timeSlotsJson = JsonSerializer.Serialize(request.TimeSlots);

            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            // Check doctor exists
            var checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Doctors WHERE DoctorId=@DoctorId", connection);
            checkCmd.Parameters.AddWithValue("@DoctorId", doctorId);
            long count = Convert.ToInt64(checkCmd.ExecuteScalar());

            if (count == 0)
                throw new Exception("Doctor not found");

            // Check if schedule exists
            var checkScheduleCmd = new MySqlCommand("SELECT COUNT(*) FROM DoctorSchedule WHERE DoctorId=@DoctorId", connection);
            checkScheduleCmd.Parameters.AddWithValue("@DoctorId", doctorId);
            long scheduleExists = Convert.ToInt64(checkScheduleCmd.ExecuteScalar());

            if (scheduleExists > 0)
            {
                var updateCmd = new MySqlCommand(
                    @"UPDATE DoctorSchedule 
                      SET WorkingDays=@WorkingDays, TimeSlots=@TimeSlots, UpdatedAt=@UpdatedAt 
                      WHERE DoctorId=@DoctorId",
                    connection);

                updateCmd.Parameters.AddWithValue("@WorkingDays", workingDaysJson);
                updateCmd.Parameters.AddWithValue("@TimeSlots", timeSlotsJson);
                updateCmd.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow);
                updateCmd.Parameters.AddWithValue("@DoctorId", doctorId);

                updateCmd.ExecuteNonQuery();
            }
            else
            {
                string scheduleId = GenerateScheduleId(connection);

                var insertCmd = new MySqlCommand(
                    @"INSERT INTO DoctorSchedule (ScheduleId, DoctorId, WorkingDays, TimeSlots, CreatedAt)
                      VALUES (@ScheduleId, @DoctorId, @WorkingDays, @TimeSlots, @CreatedAt)",
                    connection);

                insertCmd.Parameters.AddWithValue("@ScheduleId", scheduleId);
                insertCmd.Parameters.AddWithValue("@DoctorId", doctorId);
                insertCmd.Parameters.AddWithValue("@WorkingDays", workingDaysJson);
                insertCmd.Parameters.AddWithValue("@TimeSlots", timeSlotsJson);
                insertCmd.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

                insertCmd.ExecuteNonQuery();
            }
        }

        // Get Doctor Schedule
        public DoctorSchedule GetDoctorSchedule(string doctorId)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand(
                "SELECT * FROM DoctorSchedule WHERE DoctorId=@DoctorId",
                connection);

            cmd.Parameters.AddWithValue("@DoctorId", doctorId);

            using var reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                return new DoctorSchedule
                {
                    ScheduleId = SafeGetString(reader, "ScheduleId"),
                    DoctorId = SafeGetString(reader, "DoctorId"),
                    WorkingDays = SafeGetString(reader, "WorkingDays"),
                    TimeSlots = SafeGetString(reader, "TimeSlots")
                };
            }

            return null;
        }

        // Delete Doctor
        public void DeleteDoctor(string doctorId)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            // Check for active appointments
            var checkCmd = new MySqlCommand(
                "SELECT COUNT(*) FROM Appointments WHERE DoctorId=@DoctorId AND Status NOT IN ('Cancelled', 'Completed')",
                connection);

            checkCmd.Parameters.AddWithValue("@DoctorId", doctorId);
            long appointmentCount = Convert.ToInt64(checkCmd.ExecuteScalar());

            if (appointmentCount > 0)
                throw new Exception("Doctor has scheduled appointments and cannot be deleted");

            // Delete doctor
            var deleteCmd = new MySqlCommand("DELETE FROM Doctors WHERE DoctorId=@DoctorId", connection);
            deleteCmd.Parameters.AddWithValue("@DoctorId", doctorId);
            deleteCmd.ExecuteNonQuery();

            // Delete schedule
            var deleteScheduleCmd = new MySqlCommand("DELETE FROM DoctorSchedule WHERE DoctorId=@DoctorId", connection);
            deleteScheduleCmd.Parameters.AddWithValue("@DoctorId", doctorId);
            deleteScheduleCmd.ExecuteNonQuery();
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

        private string GenerateScheduleId(MySqlConnection connection)
        {
            var cmd = new MySqlCommand("SELECT ScheduleId FROM DoctorSchedule ORDER BY ScheduleId DESC LIMIT 1", connection);
            var result = cmd.ExecuteScalar();

            if (result != null)
            {
                string lastId = result.ToString();
                int num = int.Parse(lastId.Substring(3));
                return "SCH-" + (num + 1).ToString("D4");
            }

            return "SCH-0001";
        }
    }
}