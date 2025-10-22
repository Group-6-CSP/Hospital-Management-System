using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Services
{
    public class LabServiceService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;

        public LabServiceService(IConfiguration config)
        {
            _config = config;
            _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        private decimal SafeGetDecimal(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? 0 : Convert.ToDecimal(reader[columnName]);
        }

        // Get all lab services
        public List<GetLabServicesResponse> GetAllLabServices()
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand("SELECT * FROM LabServices WHERE IsActive=1 ORDER BY ServiceName ASC", connection);
            var reader = cmd.ExecuteReader();
            var services = new List<GetLabServicesResponse>();

            while (reader.Read())
            {
                services.Add(new GetLabServicesResponse
                {
                    LabServiceId = SafeGetString(reader, "LabServiceId"),
                    ServiceName = SafeGetString(reader, "ServiceName"),
                    Price = SafeGetDecimal(reader, "Price"),
                    Description = SafeGetString(reader, "Description")
                });
            }

            return services;
        }

        // Get lab service price
        public decimal GetLabServicePrice(string labServiceId)
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand("SELECT Price FROM LabServices WHERE LabServiceId=@LabServiceId", connection);
            cmd.Parameters.AddWithValue("@LabServiceId", labServiceId);

            var result = cmd.ExecuteScalar();
            return result != null ? Convert.ToDecimal(result) : 0;
        }
    }
}
