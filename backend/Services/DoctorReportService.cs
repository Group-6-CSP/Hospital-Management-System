using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Services
{
    public class DoctorReportService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;

        public DoctorReportService(IConfiguration config)
        {
            _config = config;
            _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        private int SafeGetInt(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? 0 : Convert.ToInt32(reader[columnName]);
        }

        public List<DoctorReportResponse> GenerateDoctorReports(string doctorId = "", string specialization = "", string from = "", string to = "")
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            DateTime fromDate = string.IsNullOrEmpty(from) ? DateTime.MinValue : DateTime.Parse(from);
            DateTime toDate = string.IsNullOrEmpty(to) ? DateTime.MaxValue : DateTime.Parse(to);

            string whereClause = "WHERE d.IsActive = 1";
            if (!string.IsNullOrEmpty(doctorId))
                whereClause += " AND d.DoctorId=@DoctorId";
            if (!string.IsNullOrEmpty(specialization))
                whereClause += " AND d.Specialization=@Specialization";

            var cmd = new MySqlCommand(
                $@"SELECT d.DoctorId, d.Name, d.Specialization, d.Availability,
                          COUNT(a.AppointmentId) as AppointmentCount,
                          ds.WorkingDays, ds.TimeSlots
                   FROM Doctors d
                   LEFT JOIN Appointments a ON d.DoctorId = a.DoctorId 
                      AND a.Status = 'Completed' 
                      AND a.AppointmentDate >= @FromDate 
                      AND a.AppointmentDate <= @ToDate
                   LEFT JOIN DoctorSchedule ds ON d.DoctorId = ds.DoctorId
                   {whereClause}
                   GROUP BY d.DoctorId, d.Name, d.Specialization, d.Availability, ds.WorkingDays, ds.TimeSlots", 
                connection);

            cmd.Parameters.AddWithValue("@FromDate", fromDate);
            cmd.Parameters.AddWithValue("@ToDate", toDate);
            if (!string.IsNullOrEmpty(doctorId))
                cmd.Parameters.AddWithValue("@DoctorId", doctorId);
            if (!string.IsNullOrEmpty(specialization))
                cmd.Parameters.AddWithValue("@Specialization", specialization);

            var reader = cmd.ExecuteReader();
            var reports = new List<DoctorReportResponse>();

            while (reader.Read())
            {
                reports.Add(new DoctorReportResponse
                {
                    DoctorId = SafeGetString(reader, "DoctorId"),
                    Name = SafeGetString(reader, "Name"),
                    Specialization = SafeGetString(reader, "Specialization"),
                    Availability = SafeGetString(reader, "Availability"),
                    AppointmentsHandled = SafeGetInt(reader, "AppointmentCount"),
                    WorkingDays = SafeGetString(reader, "WorkingDays"),
                    TimeSlots = SafeGetString(reader, "TimeSlots"),
                    AverageRating = 0 // Future feature
                });
            }

            return reports;
        }
    }
}