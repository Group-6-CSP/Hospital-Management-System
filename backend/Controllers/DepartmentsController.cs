using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using HospitalManagementSystem.Services;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IConfiguration _config;

        public DepartmentsController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet]
        public IActionResult GetAllDepartments()
        {
            try
            {
                var service = new DepartmentService(_config);
                var departments = service.GetAllDepartments();

                return Ok(departments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}