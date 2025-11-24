// using System;
// using System.Collections.Generic;
// using Microsoft.AspNetCore.Mvc;
// using MySql.Data.MySqlClient;
// using Microsoft.Extensions.Configuration;

// namespace HospitalManagementSystem.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class DoctorsController : ControllerBase
//     {
//         private readonly IConfiguration _config;
//         private readonly string _connectionString;

//         public DoctorsController(IConfiguration config)
//         {
//             _config = config;
//             _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
//                                 ?? _config.GetConnectionString("DefaultConnection");
//         }

//         private string SafeGetString(MySqlDataReader reader, string columnName)
//         {
//             return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString()!;
//         }

//         [HttpGet]
//         public IActionResult GetAllDoctors()
//         {
//             try
//             {
//                 using var connection = new MySqlConnection(_connectionString);
//                 connection.Open();

//                 var cmd = new MySqlCommand("SELECT * FROM Doctors", connection);
//                 var reader = cmd.ExecuteReader();

//                 var doctors = new List<object>();

//                 while (reader.Read())
//                 {
//                     doctors.Add(new
//                     {
//                         doctorId = SafeGetString(reader, "DoctorId"),
//                         name = SafeGetString(reader, "Name"),
//                         department = SafeGetString(reader, "Department"),
//                         specialization = SafeGetString(reader, "Specialization"),
//                         contact = SafeGetString(reader, "Contact"),
//                         email = SafeGetString(reader, "Email")
//                     });
//                 }

//                 return Ok(doctors);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { error = ex.Message });
//             }
//         }
//     }
// }

using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.DTOs;
using HospitalManagementSystem.Services;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DoctorService _doctorService;
        private readonly string _connectionString;

        public DoctorsController(IConfiguration config)
        {
            _config = config;
            _doctorService = new DoctorService(config);

            //  Azure uses ConnectionStrings__DefaultConnection
            _connectionString =
                Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        // GET /api/doctors
        [HttpGet]
        public IActionResult GetAllDoctors()
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var cmd = new MySqlCommand("SELECT * FROM Doctors WHERE IsActive=1 ORDER BY Name ASC", connection);
                var reader = cmd.ExecuteReader();
                var doctors = new List<object>();

                while (reader.Read())
                {
                    doctors.Add(new
                    {
                        doctorId = SafeGetString(reader, "DoctorId"),
                        name = SafeGetString(reader, "Name"),
                        specialization = SafeGetString(reader, "Specialization"),
                        contact = SafeGetString(reader, "Contact"),
                        email = SafeGetString(reader, "Email"),
                        availability = SafeGetString(reader, "Availability")
                    });
                }

                return Ok(doctors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET /api/doctors/{doctorId}
        [HttpGet("{doctorId}")]
        public IActionResult GetDoctorById(string doctorId)
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var cmd = new MySqlCommand("SELECT * FROM Doctors WHERE DoctorId=@DoctorId", connection);
                cmd.Parameters.AddWithValue("@DoctorId", doctorId);
                var reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    return Ok(new
                    {
                        doctorId = SafeGetString(reader, "DoctorId"),
                        name = SafeGetString(reader, "Name"),
                        specialization = SafeGetString(reader, "Specialization"),
                        contact = SafeGetString(reader, "Contact"),
                        email = SafeGetString(reader, "Email"),
                        availability = SafeGetString(reader, "Availability")
                    });
                }

                return NotFound(new { error = "Doctor not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST /api/doctors
        [HttpPost]
        public IActionResult CreateDoctor([FromBody] CreateDoctorRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                string doctorId = _doctorService.CreateDoctor(request);

                return Ok(new
                {
                    doctorId,
                    message = "Doctor profile created successfully"
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("already exists"))
                    return Conflict(new { error = ex.Message });

                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/doctors/{doctorId}/schedule
        [HttpPut("{doctorId}/schedule")]
        public IActionResult UpdateDoctorSchedule(string doctorId, [FromBody] UpdateDoctorScheduleRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                _doctorService.UpdateDoctorSchedule(doctorId, request);

                return Ok(new
                {
                    doctorId,
                    message = "Schedule updated successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET /api/doctors/{doctorId}/schedule
        [HttpGet("{doctorId}/schedule")]
        public IActionResult GetDoctorSchedule(string doctorId)
        {
            try
            {
                var schedule = _doctorService.GetDoctorSchedule(doctorId);
                if (schedule == null)
                    return NotFound(new { error = "No schedule found for this doctor" });

                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE /api/doctors/{doctorId}
        [HttpDelete("{doctorId}")]
        public IActionResult DeleteDoctor(string doctorId)
        {
            try
            {
                _doctorService.DeleteDoctor(doctorId);
                return Ok(new
                {
                    doctorId,
                    message = "Doctor profile removed successfully"
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("scheduled appointments"))
                    return Conflict(new { error = ex.Message });

                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /api/doctors/create-account
        [HttpPost("create-account")]
        public IActionResult CreateDoctorAccount([FromBody] CreateDoctorRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                var service = new DoctorManagementService(_config);
                string doctorId = service.CreateDoctorAccount(request);

                return Ok(new
                {
                    doctorId,
                    message = "Doctor account created successfully",
                    loginEmail = request.Email,
                    loginPassword = request.Password
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("already exists"))
                    return Conflict(new { error = ex.Message });

                return BadRequest(new { error = ex.Message });
            }
        }

        // GET /api/doctors/by-department/{departmentId}
        [HttpGet("by-department/{departmentId}")]
        public IActionResult GetDoctorsByDepartment(string departmentId)
        {
            try
            {
                var service = new DoctorManagementService(_config);
                var doctors = service.GetDoctorsByDepartment(departmentId);

                return Ok(doctors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}