using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using HospitalManagementSystem.DTOs;
using HospitalManagementSystem.Services;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillingController : ControllerBase
    {
        private readonly BillingService _billingService;
        private readonly IConfiguration _config;

        public BillingController(IConfiguration config)
        {
            _config = config;
            _billingService = new BillingService(config);
        }

        // POST /api/billing/generate
        [HttpPost("generate")]
        public IActionResult GenerateBill([FromBody] GenerateBillRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                if (string.IsNullOrWhiteSpace(request.AppointmentId))
                    return BadRequest(new { error = "AppointmentId is required" });

                if (request.LabCharges < 0 || request.MedicineCharges < 0)
                    return BadRequest(new { error = "Charges cannot be negative" });

                if (request.DiscountPercent < 0 || request.DiscountPercent > 100)
                    return BadRequest(new { error = "Discount percent must be between 0-100" });

                var response = _billingService.GenerateBill(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("already exists"))
                    return Conflict(new { error = ex.Message });
                if (ex.Message.Contains("not found") || ex.Message.Contains("Appointment"))
                    return NotFound(new { error = ex.Message });
                if (ex.Message.Contains("Completed"))
                    return BadRequest(new { error = ex.Message });

                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET /api/billing/{billId}
        [HttpGet("{billId}")]
        public IActionResult GetBill(string billId)
        {
            try
            {
                var bill = _billingService.GetBillById(billId);
                if (bill == null)
                    return NotFound(new { error = "Bill not found" });

                return Ok(bill);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET /api/billing/patient/{patientId}
        [HttpGet("patient/{patientId}")]
        public IActionResult GetPatientBills(string patientId)
        {
            try
            {
                var bills = _billingService.GetBillsByPatient(patientId);
                if (bills.Count == 0)
                    return NotFound(new { error = "No bills found for this patient" });

                return Ok(bills);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET /api/billing/all
        [HttpGet("all")]
        public IActionResult GetAllBills([FromQuery] string status = "", [FromQuery] string from = "", [FromQuery] string to = "")
        {
            try
            {
                var bills = _billingService.GetAllBills(status, from, to);
                if (bills.Count == 0)
                    return NotFound(new { error = "No bills found" });

                return Ok(new { data = bills });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST /api/billing/config
        [HttpPost("config")]
        public IActionResult UpdateBillingConfig([FromBody] BillingConfigRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                if (request.TaxPercentage < 0 || request.TaxPercentage > 100)
                    return BadRequest(new { error = "Tax percentage must be between 0-100" });

                if (request.ConsultationFeeBase < 0)
                    return BadRequest(new { error = "Consultation fee cannot be negative" });

                _billingService.UpdateBillingConfig(request);
                return Ok(new { message = "Billing configuration updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}