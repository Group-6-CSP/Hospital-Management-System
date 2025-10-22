// using System;
// using System.Collections.Generic;
// using Microsoft.AspNetCore.Mvc;
// using HospitalManagementSystem.Services;
// using Microsoft.Extensions.Configuration;

// namespace HospitalManagementSystem.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class DepartmentsController : ControllerBase
//     {
//         private readonly IConfiguration _config;

//         public DepartmentsController(IConfiguration config)
//         {
//             _config = config;
//         }

//         [HttpGet]
//         public IActionResult GetAllDepartments()
//         {
//             try
//             {
//                 var service = new DepartmentService(_config);
//                 var departments = service.GetAllDepartments();

//                 return Ok(departments);
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
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Cors;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[EnableCors("AllowAll")]  // Add this line
    public class DepartmentsController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public DepartmentsController(IConfiguration config)
        {
            _config = config;
            _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        [HttpGet]
        public IActionResult GetAllDepartments()
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var cmd = new MySqlCommand(
                    "SELECT DepartmentId, DepartmentName, Description FROM Departments ORDER BY DepartmentName ASC",
                    connection);
                
                var reader = cmd.ExecuteReader();
                var departments = new List<object>();

                while (reader.Read())
                {
                    departments.Add(new
                    {
                        departmentId = SafeGetString(reader, "DepartmentId"),
                        departmentName = SafeGetString(reader, "DepartmentName"),
                        description = SafeGetString(reader, "Description")
                    });
                }

                return Ok(departments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}