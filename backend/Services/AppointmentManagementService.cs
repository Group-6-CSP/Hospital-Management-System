using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Services
{
    public class AppointmentManagementService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;

        public AppointmentManagementService(IConfiguration config)
        {
            _config = config;

            // FIXED for Azure compatibility
            _connectionString =
                Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        private DateTime SafeGetDateTime(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value
                ? DateTime.MinValue
                : Convert.ToDateTime(reader[columnName]);
        }

        // Get Doctor's Appointments (filtered by date)
        public List<object> GetDoctorAppointments(string doctorId, string fromDate = "", string toDate = "")
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            DateTime from = string.IsNullOrEmpty(fromDate) ? DateTime.MinValue : DateTime.Parse(fromDate);
            DateTime to = string.IsNullOrEmpty(toDate) ? DateTime.MaxValue : DateTime.Parse(toDate);

            var cmd = new MySqlCommand(
                @"SELECT a.AppointmentId, a.PatientId, p.Name as PatientName, p.Contact, p.Email, p.MedicalNotes,
                         a.AppointmentDate, a.AppointmentTime, a.Status, a.Reason, a.CreatedAt
                  FROM Appointments a
                  JOIN Patients p ON a.PatientId = p.PatientId
                  WHERE a.DoctorId=@DoctorId 
                  AND a.AppointmentDate >= @FromDate 
                  AND a.AppointmentDate <= @ToDate
                  AND a.Status NOT IN ('Cancelled')
                  ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC",
                connection);

            cmd.Parameters.AddWithValue("@DoctorId", doctorId);
            cmd.Parameters.AddWithValue("@FromDate", from);
            cmd.Parameters.AddWithValue("@ToDate", to);

            var reader = cmd.ExecuteReader();
            var appointments = new List<object>();

            while (reader.Read())
            {
                appointments.Add(new
                {
                    appointmentId = SafeGetString(reader, "AppointmentId"),
                    patientId = SafeGetString(reader, "PatientId"),
                    patientName = SafeGetString(reader, "PatientName"),
                    patientContact = SafeGetString(reader, "Contact"),
                    patientEmail = SafeGetString(reader, "Email"),
                    patientMedicalNotes = SafeGetString(reader, "MedicalNotes"),
                    appointmentDate = SafeGetDateTime(reader, "AppointmentDate").ToString("yyyy-MM-dd"),
                    appointmentTime = SafeGetString(reader, "AppointmentTime"),
                    status = SafeGetString(reader, "Status"),
                    reason = SafeGetString(reader, "Reason")
                });
            }

            return appointments;
        }

        // Update Appointment Status
        public void UpdateAppointmentStatus(string appointmentId, string newStatus)
        {
            if (!new[] { "Accepted", "In-Progress", "Completed" }.Contains(newStatus))
                throw new Exception("Invalid status");

            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand(
                @"UPDATE Appointments 
                  SET Status=@Status, UpdatedAt=@UpdatedAt 
                  WHERE AppointmentId=@AppointmentId",
                connection);

            cmd.Parameters.AddWithValue("@Status", newStatus);
            cmd.Parameters.AddWithValue("@UpdatedAt", DateTime.Now);
            cmd.Parameters.AddWithValue("@AppointmentId", appointmentId);

            cmd.ExecuteNonQuery();
        }
    }
}