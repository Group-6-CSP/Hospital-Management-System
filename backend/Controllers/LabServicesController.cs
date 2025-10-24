using System;
using Microsoft.AspNetCore.Mvc;
using HospitalManagementSystem.Services;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LabServicesController : ControllerBase
    {
        private readonly IConfiguration _config;

        public LabServicesController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet]
        public IActionResult GetAllLabServices()
        {
            try
            {
                var service = new LabServiceService(_config);
                var services = service.GetAllLabServices();

                return Ok(services);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}