using System;
using Microsoft.AspNetCore.Mvc;
using HospitalManagementSystem.DTOs;
using HospitalManagementSystem.Services;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly ReportService _reportService;
        private readonly IConfiguration _config;

        public ReportsController(IConfiguration config)
        {
            _config = config;
            _reportService = new ReportService(config);
        }

        // GET /api/reports/financial
        [HttpGet("financial")]
        public IActionResult GetFinancialReport([FromQuery] string startDate = "", [FromQuery] string endDate = "")
        {
            try
            {
                var report = _reportService.GenerateFinancialReport(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Invalid"))
                    return BadRequest(new { error = "Invalid date format. Use YYYY-MM-DD" });

                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET /api/reports/doctors
        [HttpGet("doctors")]
        public IActionResult GetDoctorReports(
            [FromQuery] string doctorId = "",
            [FromQuery] string specialization = "",
            [FromQuery] string from = "",
            [FromQuery] string to = "")
        {
            try
            {
                var reportService = new DoctorReportService(_config);
                var reports = reportService.GenerateDoctorReports(doctorId, specialization, from, to);

                if (reports.Count == 0)
                    return NotFound(new { error = "No reports found for given filters" });

                return Ok(reports);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Invalid"))
                    return BadRequest(new { error = "Invalid date format. Use YYYY-MM-DD" });

                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
