// using System;
// using Microsoft.AspNetCore.Mvc;
// using HospitalManagementSystem.DTOs;
// using HospitalManagementSystem.Services;
// using Microsoft.Extensions.Configuration;

// namespace HospitalManagementSystem.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class AdminController : ControllerBase
//     {
//         private readonly IConfiguration _config;
//         private readonly AdminDoctorService _adminDoctorService;

//         public AdminController(IConfiguration config)
//         {
//             _config = config;
//             _adminDoctorService = new AdminDoctorService(config);
//         }

//         // =====================================================
//         // POST /api/admin/create-doctor-account
//         // Admin creates a new doctor account
//         // =====================================================
//         [HttpPost("create-doctor-account")]
//         public IActionResult CreateDoctorAccount([FromBody] CreateDoctorAccountRequest request)
//         {
//             try
//             {
//                 if (request == null)
//                     return BadRequest(new { error = "Invalid request" });

//                 var response = _adminDoctorService.CreateDoctorAccount(request);
//                 return Ok(response);
//             }
//             catch (Exception ex)
//             {
//                 if (ex.Message.Contains("already exists") || ex.Message.Contains("already registered"))
//                     return Conflict(new { error = ex.Message, code = 409 });

//                 return BadRequest(new { error = ex.Message });
//             }
//         }
//     }
// }
using System;
using Microsoft.AspNetCore.Mvc;
using HospitalManagementSystem.DTOs;
using HospitalManagementSystem.Services;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AdminDoctorService _adminDoctorService;

        //  FIXED: Use proper DI injection
        public AdminController(AdminDoctorService adminDoctorService)
        {
            _adminDoctorService = adminDoctorService;
        }

        [HttpPost("create-doctor-account")]
        public IActionResult CreateDoctorAccount([FromBody] CreateDoctorAccountRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                var response = _adminDoctorService.CreateDoctorAccount(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("already exists") || ex.Message.Contains("already registered"))
                    return Conflict(new { error = ex.Message, code = 409 });

                return BadRequest(new { error = ex.Message });
            }
        }
    }
}