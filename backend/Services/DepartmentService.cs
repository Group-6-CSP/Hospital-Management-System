using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Services
{
    public class DepartmentService
    {
        private readonly string _connectionString;
        private readonly IConfiguration _config;

        public DepartmentService(IConfiguration config)
        {
            _config = config;
            _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        // Get all departments
        public List<Department> GetAllDepartments()
        {
            using var connection = new MySqlConnection(_connectionString);
            connection.Open();

            var cmd = new MySqlCommand("SELECT * FROM Departments ORDER BY DepartmentName ASC", connection);
            var reader = cmd.ExecuteReader();
            var departments = new List<Department>();

            while (reader.Read())
            {
                departments.Add(new Department
                {
                    DepartmentId = SafeGetString(reader, "DepartmentId"),
                    DepartmentName = SafeGetString(reader, "DepartmentName"),
                    Description = SafeGetString(reader, "Description")
                });
            }

            return departments;
        }
        
    }
}