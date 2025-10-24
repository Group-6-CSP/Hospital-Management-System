using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public DoctorsController(IConfiguration config)
        {
            _config = config;
            _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString()!;
        }

        [HttpGet]
        public IActionResult GetAllDoctors()
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var cmd = new MySqlCommand("SELECT * FROM Doctors", connection);
                var reader = cmd.ExecuteReader();

                var doctors = new List<object>();

                while (reader.Read())
                {
                    doctors.Add(new
                    {
                        doctorId = SafeGetString(reader, "DoctorId"),
                        name = SafeGetString(reader, "Name"),
                        department = SafeGetString(reader, "Department"),
                        specialization = SafeGetString(reader, "Specialization"),
                        contact = SafeGetString(reader, "Contact"),
                        email = SafeGetString(reader, "Email")
                    });
                }

                return Ok(doctors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}