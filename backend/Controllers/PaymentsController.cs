// using System;
// using System.Collections.Generic;
// using Microsoft.AspNetCore.Mvc;
// using HospitalManagementSystem.DTOs;
// using HospitalManagementSystem.Services;
// using Microsoft.Extensions.Configuration;

// namespace HospitalManagementSystem.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class PaymentsController : ControllerBase
//     {
//         private readonly PaymentService _paymentService;
//         private readonly IConfiguration _config;

//         public PaymentsController(IConfiguration config)
//         {
//             _config = config;
//             _paymentService = new PaymentService(config);
//         }

//         // POST /api/payments/record
//         [HttpPost("record")]
//         public IActionResult RecordPayment([FromBody] RecordPaymentRequest request)
//         {
//             try
//             {
//                 if (request == null)
//                     return BadRequest(new { error = "Invalid request" });

//                 if (string.IsNullOrWhiteSpace(request.BillId))
//                     return BadRequest(new { error = "BillId is required" });

//                 if (request.AmountPaid <= 0)
//                     return BadRequest(new { error = "Amount must be greater than 0" });

//                 if (string.IsNullOrWhiteSpace(request.PaymentMode))
//                     return BadRequest(new { error = "PaymentMode is required" });

//                 var response = _paymentService.RecordPayment(request);
//                 return Ok(response);
//             }
//             catch (Exception ex)
//             {
//                 if (ex.Message.Contains("not found"))
//                     return NotFound(new { error = ex.Message });
//                 if (ex.Message.Contains("already paid") || ex.Message.Contains("Duplicate"))
//                     return Conflict(new { error = ex.Message });
//                 if (ex.Message.Contains("cannot exceed"))
//                     return BadRequest(new { error = ex.Message });

//                 return StatusCode(500, new { error = ex.Message });
//             }
//         }

//         // GET /api/payments/history/{patientId}
//         [HttpGet("history/{patientId}")]
//         public IActionResult GetPaymentHistory(string patientId)
//         {
//             try
//             {
//                 var payments = _paymentService.GetPaymentHistory(patientId);
//                 if (payments.Count == 0)
//                     return NotFound(new { error = "No payments found for this patient" });

//                 return Ok(payments);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { error = ex.Message });
//             }
//         }

//         // GET /api/payments/all
//         [HttpGet("all")]
//         public IActionResult GetAllPayments()
//         {
//             try
//             {
//                 var payments = _paymentService.GetAllPayments();
//                 if (payments.Count == 0)
//                     return NotFound(new { error = "No payments found" });

//                 return Ok(new { data = payments });
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
    public class PaymentsController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public PaymentsController(IConfiguration config)
        {
            _config = config;
            _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                                ?? _config.GetConnectionString("DefaultConnection");
        }

        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString();
        }

        private DateTime SafeGetDateTime(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(reader[columnName]);
        }

        private decimal SafeGetDecimal(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? 0 : Convert.ToDecimal(reader[columnName]);
        }

        [HttpGet("history/{patientId}")]
        public IActionResult GetPaymentHistory(string patientId)
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var cmd = new MySqlCommand(
                    @"SELECT pm.PaymentId, pm.BillId, pm.AmountPaid, pm.PaymentMode, pm.PaymentDate, pm.Status, b.TotalAmount
                      FROM Payments pm
                      JOIN Bills b ON pm.BillId = b.BillId
                      WHERE pm.PatientId=@PatientId
                      ORDER BY pm.PaymentDate DESC",
                    connection);

                cmd.Parameters.AddWithValue("@PatientId", patientId);
                var reader = cmd.ExecuteReader();
                var payments = new List<object>();

                while (reader.Read())
                {
                    payments.Add(new
                    {
                        paymentId = SafeGetString(reader, "PaymentId"),
                        billId = SafeGetString(reader, "BillId"),
                        amountPaid = SafeGetDecimal(reader, "AmountPaid"),
                        totalAmount = SafeGetDecimal(reader, "TotalAmount"),
                        paymentMode = SafeGetString(reader, "PaymentMode"),
                        paymentDate = SafeGetDateTime(reader, "PaymentDate").ToString("yyyy-MM-dd"),
                        status = SafeGetString(reader, "Status")
                    });
                }

                if (payments.Count == 0)
                    return Ok(new List<object>()); // Return empty list instead of 404

                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
