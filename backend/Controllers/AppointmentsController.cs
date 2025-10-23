// using System;
// using System.Collections.Generic;
// using Microsoft.AspNetCore.Mvc;
// using MySql.Data.MySqlClient;
// using HospitalManagementSystem.Models;
// using HospitalManagementSystem.Services;
// using HospitalManagementSystem.DTOs;
// using Microsoft.Extensions.Configuration;

// namespace HospitalManagementSystem.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class AppointmentsController : ControllerBase
//     {
//         private readonly IConfiguration _config;
//         private readonly string _connectionString;

//         public AppointmentsController(IConfiguration config)
//         {
//             _config = config;
//             _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
//                                 ?? _config.GetConnectionString("DefaultConnection");
//         }

//         // Utility methods
//         private string SafeGetString(MySqlDataReader reader, string columnName)
//         {
//             return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString()!;
//         }

//         private DateTime SafeGetDateTime(MySqlDataReader reader, string columnName)
//         {
//             return reader[columnName] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(reader[columnName]);
//         }

//         // GET /api/appointments - Get all appointments (for admin)
//         [HttpGet]
//         public IActionResult GetAllAppointments()
//         {
//             try
//             {
//                 using var connection = new MySqlConnection(_connectionString);
//                 connection.Open();

//                 var cmd = new MySqlCommand(
//                     @"SELECT a.*, 
//                              p.Name as PatientName, 
//                              d.Name as DoctorName, 
//                              d.Department
//                       FROM Appointments a
//                       LEFT JOIN Patients p ON a.PatientId = p.PatientId
//                       LEFT JOIN Doctors d ON a.DoctorId = d.DoctorId
//                       ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC",
//                     connection);

//                 var reader = cmd.ExecuteReader();
//                 var appointments = new List<object>();

//                 while (reader.Read())
//                 {
//                     appointments.Add(new
//                     {
//                         appointmentId = SafeGetString(reader, "AppointmentId"),
//                         patientId = SafeGetString(reader, "PatientId"),
//                         patientName = SafeGetString(reader, "PatientName"),
//                         doctorId = SafeGetString(reader, "DoctorId"),
//                         doctorName = SafeGetString(reader, "DoctorName"),
//                         department = SafeGetString(reader, "Department"),
//                         appointmentDate = SafeGetDateTime(reader, "AppointmentDate"),
//                         appointmentTime = SafeGetString(reader, "AppointmentTime"),
//                         status = SafeGetString(reader, "Status"),
//                         reason = SafeGetString(reader, "Reason")
//                     });
//                 }

//                 return Ok(new { data = appointments });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { error = ex.Message });
//             }
//         }

//         // USER STORY 1: Book Appointment
//         // POST /api/appointments
//         [HttpPost]
//         public IActionResult BookAppointment([FromBody] BookAppointmentRequest request)
//         {
//             try
//             {
//                 if (request == null)
//                     return BadRequest(new { error = "Invalid request" });

//                 if (string.IsNullOrWhiteSpace(request.PatientId) ||
//                     string.IsNullOrWhiteSpace(request.DoctorId) ||
//                     string.IsNullOrWhiteSpace(request.Date) ||
//                     string.IsNullOrWhiteSpace(request.Time))
//                 {
//                     return BadRequest(new { error = "All fields are required" });
//                 }

//                 if (!DateTime.TryParse(request.Date, out DateTime appointmentDate))
//                 {
//                     return BadRequest(new { error = "Invalid date format. Use YYYY-MM-DD" });
//                 }

//                 if (appointmentDate.Date < DateTime.Today)
//                 {
//                     return BadRequest(new { error = "Cannot book appointments in the past" });
//                 }

//                 if (!System.Text.RegularExpressions.Regex.IsMatch(request.Time, @"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"))
//                 {
//                     return BadRequest(new { error = "Invalid time format. Use HH:mm (e.g., 09:30)" });
//                 }

//                 using var connection = new MySqlConnection(_connectionString);
//                 connection.Open();

//                 var checkPatient = new MySqlCommand("SELECT COUNT(*) FROM Patients WHERE PatientId=@PatientId", connection);
//                 checkPatient.Parameters.AddWithValue("@PatientId", request.PatientId);
//                 long patientCount = Convert.ToInt64(checkPatient.ExecuteScalar());

//                 if (patientCount == 0)
//                     return NotFound(new { error = "Patient not found" });

//                 var checkDoctor = new MySqlCommand("SELECT COUNT(*) FROM Doctors WHERE DoctorId=@DoctorId", connection);
//                 checkDoctor.Parameters.AddWithValue("@DoctorId", request.DoctorId);
//                 long doctorCount = Convert.ToInt64(checkDoctor.ExecuteScalar());

//                 if (doctorCount == 0)
//                     return NotFound(new { error = "Doctor not found" });

//                 var checkSlot = new MySqlCommand(
//                     "SELECT COUNT(*) FROM Appointments WHERE DoctorId=@DoctorId AND AppointmentDate=@Date AND AppointmentTime=@Time AND Status NOT IN ('Cancelled')",
//                     connection);
//                 checkSlot.Parameters.AddWithValue("@DoctorId", request.DoctorId);
//                 checkSlot.Parameters.AddWithValue("@Date", appointmentDate);
//                 checkSlot.Parameters.AddWithValue("@Time", request.Time);
//                 long slotCount = Convert.ToInt64(checkSlot.ExecuteScalar());

//                 if (slotCount > 0)
//                     return Conflict(new { error = "Doctor not available for the selected time slot" });

//                 string appointmentId = GenerateAppointmentId(connection);

//                 var insertCmd = new MySqlCommand(
//                     "INSERT INTO Appointments (AppointmentId, PatientId, DoctorId, AppointmentDate, AppointmentTime, Status, Reason, CreatedAt) " +
//                     "VALUES (@AppointmentId, @PatientId, @DoctorId, @AppointmentDate, @AppointmentTime, @Status, @Reason, @CreatedAt)",
//                     connection);

//                 insertCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);
//                 insertCmd.Parameters.AddWithValue("@PatientId", request.PatientId);
//                 insertCmd.Parameters.AddWithValue("@DoctorId", request.DoctorId);
//                 insertCmd.Parameters.AddWithValue("@AppointmentDate", appointmentDate);
//                 insertCmd.Parameters.AddWithValue("@AppointmentTime", request.Time);
//                 insertCmd.Parameters.AddWithValue("@Status", "Scheduled");
//                 insertCmd.Parameters.AddWithValue("@Reason", request.Reason ?? "");
//                 insertCmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

//                 insertCmd.ExecuteNonQuery();

//                 return Ok(new
//                 {
//                     appointmentId,
//                     message = "Appointment booked successfully"
//                 });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { error = ex.Message });
//             }
//         }

//         // USER STORY 2: View Appointment History
//         // GET /api/appointments/history/{patientId}
//         [HttpGet("history/{patientId}")]
//         public IActionResult GetAppointmentHistory(string patientId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
//         {
//             try
//             {
//                 using var connection = new MySqlConnection(_connectionString);
//                 connection.Open();

//                 var checkPatient = new MySqlCommand("SELECT COUNT(*) FROM Patients WHERE PatientId=@PatientId", connection);
//                 checkPatient.Parameters.AddWithValue("@PatientId", patientId);
//                 long patientCount = Convert.ToInt64(checkPatient.ExecuteScalar());

//                 if (patientCount == 0)
//                     return NotFound(new { error = "Patient not found" });

//                 var countCmd = new MySqlCommand("SELECT COUNT(*) FROM Appointments WHERE PatientId=@PatientId", connection);
//                 countCmd.Parameters.AddWithValue("@PatientId", patientId);
//                 long totalCount = Convert.ToInt64(countCmd.ExecuteScalar());

//                 if (totalCount == 0)
//                     return NotFound(new { error = "No appointment history found" });

//                 int offset = (page - 1) * pageSize;
//                 var cmd = new MySqlCommand(
//                     @"SELECT a.*, d.Name as DoctorName, d.Department
//                       FROM Appointments a
//                       LEFT JOIN Doctors d ON a.DoctorId = d.DoctorId
//                       WHERE a.PatientId=@PatientId
//                       ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
//                       LIMIT @Limit OFFSET @Offset",
//                     connection);

//                 cmd.Parameters.AddWithValue("@PatientId", patientId);
//                 cmd.Parameters.AddWithValue("@Limit", pageSize);
//                 cmd.Parameters.AddWithValue("@Offset", offset);

//                 var reader = cmd.ExecuteReader();
//                 var appointments = new List<object>();

//                 while (reader.Read())
//                 {
//                     appointments.Add(new
//                     {
//                         appointmentId = SafeGetString(reader, "AppointmentId"),
//                         doctorName = SafeGetString(reader, "DoctorName"),
//                         department = SafeGetString(reader, "Department"),
//                         date = SafeGetDateTime(reader, "AppointmentDate").ToString("yyyy-MM-dd"),
//                         time = SafeGetString(reader, "AppointmentTime"),
//                         status = SafeGetString(reader, "Status"),
//                         reason = SafeGetString(reader, "Reason")
//                     });
//                 }

//                 return Ok(appointments);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { error = ex.Message });
//             }
//         }

//         // USER STORY 3: Reschedule Appointment
//         // PUT /api/appointments/{appointmentId}/reschedule
//         [HttpPut("{appointmentId}/reschedule")]
//         public IActionResult RescheduleAppointment(string appointmentId, [FromBody] RescheduleAppointmentRequest request)
//         {
//             try
//             {
//                 if (request == null)
//                     return BadRequest(new { error = "Invalid request" });

//                 if (!DateTime.TryParse(request.NewDate, out DateTime newDate))
//                 {
//                     return BadRequest(new { error = "Invalid date format. Use YYYY-MM-DD" });
//                 }

//                 if (newDate.Date < DateTime.Today)
//                 {
//                     return BadRequest(new { error = "Cannot reschedule to a past date" });
//                 }

//                 if (!System.Text.RegularExpressions.Regex.IsMatch(request.NewTime, @"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"))
//                 {
//                     return BadRequest(new { error = "Invalid time format. Use HH:mm" });
//                 }

//                 using var connection = new MySqlConnection(_connectionString);
//                 connection.Open();

//                 var getCmd = new MySqlCommand("SELECT * FROM Appointments WHERE AppointmentId=@AppointmentId", connection);
//                 getCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);
//                 var reader = getCmd.ExecuteReader();

//                 if (!reader.Read())
//                     return NotFound(new { error = "Appointment not found" });

//                 string doctorId = SafeGetString(reader, "DoctorId");
//                 reader.Close();

//                 var checkSlot = new MySqlCommand(
//                     "SELECT COUNT(*) FROM Appointments WHERE DoctorId=@DoctorId AND AppointmentDate=@Date AND AppointmentTime=@Time AND Status NOT IN ('Cancelled') AND AppointmentId<>@AppointmentId",
//                     connection);
//                 checkSlot.Parameters.AddWithValue("@DoctorId", doctorId);
//                 checkSlot.Parameters.AddWithValue("@Date", newDate);
//                 checkSlot.Parameters.AddWithValue("@Time", request.NewTime);
//                 checkSlot.Parameters.AddWithValue("@AppointmentId", appointmentId);
//                 long slotCount = Convert.ToInt64(checkSlot.ExecuteScalar());

//                 if (slotCount > 0)
//                     return Conflict(new { error = "Doctor not available for the new time slot" });

//                 var updateCmd = new MySqlCommand(
//                     "UPDATE Appointments SET AppointmentDate=@NewDate, AppointmentTime=@NewTime, Status=@Status, UpdatedAt=@UpdatedAt WHERE AppointmentId=@AppointmentId",
//                     connection);

//                 updateCmd.Parameters.AddWithValue("@NewDate", newDate);
//                 updateCmd.Parameters.AddWithValue("@NewTime", request.NewTime);
//                 updateCmd.Parameters.AddWithValue("@Status", "Rescheduled");
//                 updateCmd.Parameters.AddWithValue("@UpdatedAt", DateTime.Now);
//                 updateCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);

//                 int rowsAffected = updateCmd.ExecuteNonQuery();

//                 if (rowsAffected > 0)
//                     return Ok(new
//                     {
//                         appointmentId,
//                         message = "Appointment rescheduled successfully"
//                     });

//                 return StatusCode(500, new { error = "Reschedule failed" });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { error = ex.Message });
//             }
//         }

//         // DELETE /api/appointments/{appointmentId} - Cancel appointment
//         [HttpDelete("{appointmentId}")]
//         public IActionResult CancelAppointment(string appointmentId)
//         {
//             try
//             {
//                 using var connection = new MySqlConnection(_connectionString);
//                 connection.Open();

//                 var getCmd = new MySqlCommand(
//                     "SELECT Status FROM Appointments WHERE AppointmentId=@AppointmentId", 
//                     connection);
//                 getCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);
//                 var result = getCmd.ExecuteScalar();

//                 if (result == null)
//                     return NotFound(new { error = "Appointment not found" });

//                 string currentStatus = result.ToString()!;

//                 if (currentStatus == "Completed")
//                     return BadRequest(new { error = "Cannot cancel a completed appointment" });

//                 if (currentStatus == "Cancelled")
//                     return BadRequest(new { error = "Appointment is already cancelled" });

//                 var updateCmd = new MySqlCommand(
//                     "UPDATE Appointments SET Status=@Status, UpdatedAt=@UpdatedAt WHERE AppointmentId=@AppointmentId",
//                     connection);

//                 updateCmd.Parameters.AddWithValue("@Status", "Cancelled");
//                 updateCmd.Parameters.AddWithValue("@UpdatedAt", DateTime.Now);
//                 updateCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);

//                 int rowsAffected = updateCmd.ExecuteNonQuery();

//                 if (rowsAffected > 0)
//                     return Ok(new { message = "Appointment cancelled successfully" });

//                 return StatusCode(500, new { error = "Cancellation failed" });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { error = ex.Message });
//             }
//         }

//         // USER STORY 4: Generate Statistics
//         // GET /api/appointments/statistics
//         [HttpGet("statistics")]
//         public IActionResult GetStatistics([FromQuery] string? from, [FromQuery] string? to)
//         {
//             try
//             {
//                 DateTime fromDate = DateTime.MinValue;
//                 DateTime toDate = DateTime.MaxValue;

//                 if (!string.IsNullOrWhiteSpace(from))
//                 {
//                     if (!DateTime.TryParse(from, out fromDate))
//                         return BadRequest(new { error = "Invalid 'from' date format" });
//                 }

//                 if (!string.IsNullOrWhiteSpace(to))
//                 {
//                     if (!DateTime.TryParse(to, out toDate))
//                         return BadRequest(new { error = "Invalid 'to' date format" });
//                 }

//                 using var connection = new MySqlConnection(_connectionString);
//                 connection.Open();

//                 string whereClause = "";
//                 if (!string.IsNullOrWhiteSpace(from) || !string.IsNullOrWhiteSpace(to))
//                 {
//                     whereClause = "WHERE ";
//                     if (!string.IsNullOrWhiteSpace(from))
//                         whereClause += "a.AppointmentDate >= @FromDate ";
//                     if (!string.IsNullOrWhiteSpace(from) && !string.IsNullOrWhiteSpace(to))
//                         whereClause += "AND ";
//                     if (!string.IsNullOrWhiteSpace(to))
//                         whereClause += "a.AppointmentDate <= @ToDate ";
//                 }

//                 var totalCmd = new MySqlCommand($"SELECT COUNT(*) FROM Appointments a {whereClause}", connection);
//                 if (!string.IsNullOrWhiteSpace(from))
//                     totalCmd.Parameters.AddWithValue("@FromDate", fromDate);
//                 if (!string.IsNullOrWhiteSpace(to))
//                     totalCmd.Parameters.AddWithValue("@ToDate", toDate);

//                 int totalAppointments = Convert.ToInt32(totalCmd.ExecuteScalar());

//                 if (totalAppointments == 0)
//                     return NotFound(new { error = "No data available for selected date range" });

//                 var doctorCmd = new MySqlCommand(
//                     $@"SELECT d.Name, COUNT(*) as Count
//                        FROM Appointments a
//                        JOIN Doctors d ON a.DoctorId = d.DoctorId
//                        {whereClause}
//                        GROUP BY d.Name
//                        ORDER BY Count DESC",
//                     connection);

//                 if (!string.IsNullOrWhiteSpace(from))
//                     doctorCmd.Parameters.AddWithValue("@FromDate", fromDate);
//                 if (!string.IsNullOrWhiteSpace(to))
//                     doctorCmd.Parameters.AddWithValue("@ToDate", toDate);

//                 var appointmentsPerDoctor = new Dictionary<string, int>();
//                 var doctorReader = doctorCmd.ExecuteReader();

//                 while (doctorReader.Read())
//                 {
//                     appointmentsPerDoctor[SafeGetString(doctorReader, "Name")] = Convert.ToInt32(doctorReader["Count"]);
//                 }
//                 doctorReader.Close();

//                 var deptCmd = new MySqlCommand(
//                     $@"SELECT d.Department, COUNT(*) as Count
//                        FROM Appointments a
//                        JOIN Doctors d ON a.DoctorId = d.DoctorId
//                        {whereClause}
//                        GROUP BY d.Department
//                        ORDER BY Count DESC",
//                     connection);

//                 if (!string.IsNullOrWhiteSpace(from))
//                     deptCmd.Parameters.AddWithValue("@FromDate", fromDate);
//                 if (!string.IsNullOrWhiteSpace(to))
//                     deptCmd.Parameters.AddWithValue("@ToDate", toDate);

//                 var appointmentsPerDepartment = new Dictionary<string, int>();
//                 var deptReader = deptCmd.ExecuteReader();

//                 while (deptReader.Read())
//                 {
//                     appointmentsPerDepartment[SafeGetString(deptReader, "Department")] = Convert.ToInt32(deptReader["Count"]);
//                 }

//                 return Ok(new
//                 {
//                     totalAppointments,
//                     appointmentsPerDoctor,
//                     appointmentsPerDepartment
//                 });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { error = ex.Message });
//             }
//         }

//         // Utility: Generate Appointment ID
//         private string GenerateAppointmentId(MySqlConnection connection)
//         {
//             var cmd = new MySqlCommand("SELECT AppointmentId FROM Appointments ORDER BY AppointmentId DESC LIMIT 1", connection);
//             var result = cmd.ExecuteScalar();

//             if (result != null)
//             {
//                 string lastId = result.ToString()!;
//                 int num = int.Parse(lastId.Substring(2));
//                 return "A-" + (num + 1).ToString("D8");
//             }
//             else
//             {
//                 return "A-00000001";
//             }
//         }
//         [HttpGet("doctor/{doctorId}")]
//         public IActionResult GetDoctorAppointments(string doctorId, [FromQuery] string from = "", [FromQuery] string to = "")
//         {
//             try
//             {
//                 var service = new AppointmentManagementService(_config);
//                 var appointments = service.GetDoctorAppointments(doctorId, from, to);

//                 if (appointments.Count == 0)
//                     return NotFound(new { error = "No appointments found" });

//                 return Ok(appointments);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { error = ex.Message });
//             }
//         }

//         [HttpPut("{appointmentId}/status")]
//         public IActionResult UpdateAppointmentStatus(string appointmentId, [FromBody] UpdateAppointmentStatusRequest request)
//         {
//             try
//             {
//                 var service = new AppointmentManagementService(_config);
//                 service.UpdateAppointmentStatus(appointmentId, request.Status);

//                 return Ok(new
//                 {
//                     appointmentId,
//                     message = $"Appointment status updated to {request.Status}"
//                 });
//             }
//             catch (Exception ex)
//             {
//                 return BadRequest(new { error = ex.Message });
//             }
//         }

//     }
// }

using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using HospitalManagementSystem.Services;
using HospitalManagementSystem.DTOs;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public AppointmentsController(IConfiguration config)
        {
            _config = config;
            _connectionString = Environment.GetEnvironmentVariable("DefaultConnection")
                                ?? _config.GetConnectionString("DefaultConnection");
        }

        // Utility methods
        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString()!;
        }

        private DateTime SafeGetDateTime(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(reader[columnName]);
        }

        // =====================================================
        // FIXED: GET /api/appointments - Get all appointments (for admin)
        // Now properly joins with Departments table
        // =====================================================
        [HttpGet]
        public IActionResult GetAllAppointments()
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var cmd = new MySqlCommand(
                    @"SELECT a.AppointmentId, 
                             a.PatientId, 
                             p.Name as PatientName, 
                             a.DoctorId,
                             d.Name as DoctorName,
                             COALESCE(dept.DepartmentName, 'N/A') as Department,
                             a.AppointmentDate,
                             a.AppointmentTime,
                             a.Status,
                             a.Reason
                      FROM Appointments a
                      LEFT JOIN Patients p ON a.PatientId = p.PatientId
                      LEFT JOIN Doctors d ON a.DoctorId = d.DoctorId
                      LEFT JOIN Departments dept ON d.DepartmentId = dept.DepartmentId
                      ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC",
                    connection);

                var reader = cmd.ExecuteReader();
                var appointments = new List<object>();

                while (reader.Read())
                {
                    appointments.Add(new
                    {
                        appointmentId = SafeGetString(reader, "AppointmentId"),
                        patientId = SafeGetString(reader, "PatientId"),
                        patientName = SafeGetString(reader, "PatientName"),
                        doctorId = SafeGetString(reader, "DoctorId"),
                        doctorName = SafeGetString(reader, "DoctorName"),
                        department = SafeGetString(reader, "Department"),
                        appointmentDate = SafeGetDateTime(reader, "AppointmentDate"),
                        appointmentTime = SafeGetString(reader, "AppointmentTime"),
                        status = SafeGetString(reader, "Status"),
                        reason = SafeGetString(reader, "Reason")
                    });
                }

                return Ok(new { data = appointments });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // USER STORY 1: Book Appointment
        // POST /api/appointments
        [HttpPost]
        public IActionResult BookAppointment([FromBody] BookAppointmentRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                if (string.IsNullOrWhiteSpace(request.PatientId) ||
                    string.IsNullOrWhiteSpace(request.DoctorId) ||
                    string.IsNullOrWhiteSpace(request.Date) ||
                    string.IsNullOrWhiteSpace(request.Time))
                {
                    return BadRequest(new { error = "All fields are required" });
                }

                if (!DateTime.TryParse(request.Date, out DateTime appointmentDate))
                {
                    return BadRequest(new { error = "Invalid date format. Use YYYY-MM-DD" });
                }

                if (appointmentDate.Date < DateTime.Today)
                {
                    return BadRequest(new { error = "Cannot book appointments in the past" });
                }

                if (!System.Text.RegularExpressions.Regex.IsMatch(request.Time, @"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"))
                {
                    return BadRequest(new { error = "Invalid time format. Use HH:mm (e.g., 09:30)" });
                }

                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var checkPatient = new MySqlCommand("SELECT COUNT(*) FROM Patients WHERE PatientId=@PatientId", connection);
                checkPatient.Parameters.AddWithValue("@PatientId", request.PatientId);
                long patientCount = Convert.ToInt64(checkPatient.ExecuteScalar());

                if (patientCount == 0)
                    return NotFound(new { error = "Patient not found" });

                var checkDoctor = new MySqlCommand("SELECT COUNT(*) FROM Doctors WHERE DoctorId=@DoctorId", connection);
                checkDoctor.Parameters.AddWithValue("@DoctorId", request.DoctorId);
                long doctorCount = Convert.ToInt64(checkDoctor.ExecuteScalar());

                if (doctorCount == 0)
                    return NotFound(new { error = "Doctor not found" });

                var checkSlot = new MySqlCommand(
                    "SELECT COUNT(*) FROM Appointments WHERE DoctorId=@DoctorId AND AppointmentDate=@Date AND AppointmentTime=@Time AND Status NOT IN ('Cancelled')",
                    connection);
                checkSlot.Parameters.AddWithValue("@DoctorId", request.DoctorId);
                checkSlot.Parameters.AddWithValue("@Date", appointmentDate);
                checkSlot.Parameters.AddWithValue("@Time", request.Time);
                long slotCount = Convert.ToInt64(checkSlot.ExecuteScalar());

                if (slotCount > 0)
                    return Conflict(new { error = "Doctor not available for the selected time slot" });

                string appointmentId = GenerateAppointmentId(connection);

                var insertCmd = new MySqlCommand(
                    "INSERT INTO Appointments (AppointmentId, PatientId, DoctorId, AppointmentDate, AppointmentTime, Status, Reason, CreatedAt) " +
                    "VALUES (@AppointmentId, @PatientId, @DoctorId, @AppointmentDate, @AppointmentTime, @Status, @Reason, @CreatedAt)",
                    connection);

                insertCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);
                insertCmd.Parameters.AddWithValue("@PatientId", request.PatientId);
                insertCmd.Parameters.AddWithValue("@DoctorId", request.DoctorId);
                insertCmd.Parameters.AddWithValue("@AppointmentDate", appointmentDate);
                insertCmd.Parameters.AddWithValue("@AppointmentTime", request.Time);
                insertCmd.Parameters.AddWithValue("@Status", "Scheduled");
                insertCmd.Parameters.AddWithValue("@Reason", request.Reason ?? "");
                insertCmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

                insertCmd.ExecuteNonQuery();

                return Ok(new
                {
                    appointmentId,
                    message = "Appointment booked successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // =====================================================
        // FIXED: USER STORY 2: View Appointment History
        // GET /api/appointments/history/{patientId}
        // Now properly joins with Departments table
        // =====================================================
        [HttpGet("history/{patientId}")]
        public IActionResult GetAppointmentHistory(string patientId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var checkPatient = new MySqlCommand("SELECT COUNT(*) FROM Patients WHERE PatientId=@PatientId", connection);
                checkPatient.Parameters.AddWithValue("@PatientId", patientId);
                long patientCount = Convert.ToInt64(checkPatient.ExecuteScalar());

                if (patientCount == 0)
                    return NotFound(new { error = "Patient not found" });

                var countCmd = new MySqlCommand("SELECT COUNT(*) FROM Appointments WHERE PatientId=@PatientId", connection);
                countCmd.Parameters.AddWithValue("@PatientId", patientId);
                long totalCount = Convert.ToInt64(countCmd.ExecuteScalar());

                if (totalCount == 0)
                    return NotFound(new { error = "No appointment history found" });

                int offset = (page - 1) * pageSize;
                var cmd = new MySqlCommand(
                    @"SELECT a.AppointmentId,
                             a.AppointmentDate,
                             a.AppointmentTime,
                             a.Status,
                             a.Reason,
                             d.Name as DoctorName,
                             COALESCE(dept.DepartmentName, 'N/A') as Department
                      FROM Appointments a
                      LEFT JOIN Doctors d ON a.DoctorId = d.DoctorId
                      LEFT JOIN Departments dept ON d.DepartmentId = dept.DepartmentId
                      WHERE a.PatientId=@PatientId
                      ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
                      LIMIT @Limit OFFSET @Offset",
                    connection);

                cmd.Parameters.AddWithValue("@PatientId", patientId);
                cmd.Parameters.AddWithValue("@Limit", pageSize);
                cmd.Parameters.AddWithValue("@Offset", offset);

                var reader = cmd.ExecuteReader();
                var appointments = new List<object>();

                while (reader.Read())
                {
                    appointments.Add(new
                    {
                        appointmentId = SafeGetString(reader, "AppointmentId"),
                        doctorName = SafeGetString(reader, "DoctorName"),
                        department = SafeGetString(reader, "Department"),
                        date = SafeGetDateTime(reader, "AppointmentDate").ToString("yyyy-MM-dd"),
                        time = SafeGetString(reader, "AppointmentTime"),
                        status = SafeGetString(reader, "Status"),
                        reason = SafeGetString(reader, "Reason")
                    });
                }

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // USER STORY 3: Reschedule Appointment
        // PUT /api/appointments/{appointmentId}/reschedule
        [HttpPut("{appointmentId}/reschedule")]
        public IActionResult RescheduleAppointment(string appointmentId, [FromBody] RescheduleAppointmentRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                if (!DateTime.TryParse(request.NewDate, out DateTime newDate))
                {
                    return BadRequest(new { error = "Invalid date format. Use YYYY-MM-DD" });
                }

                if (newDate.Date < DateTime.Today)
                {
                    return BadRequest(new { error = "Cannot reschedule to a past date" });
                }

                if (!System.Text.RegularExpressions.Regex.IsMatch(request.NewTime, @"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"))
                {
                    return BadRequest(new { error = "Invalid time format. Use HH:mm" });
                }

                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var getCmd = new MySqlCommand("SELECT * FROM Appointments WHERE AppointmentId=@AppointmentId", connection);
                getCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);
                var reader = getCmd.ExecuteReader();

                if (!reader.Read())
                    return NotFound(new { error = "Appointment not found" });

                string doctorId = SafeGetString(reader, "DoctorId");
                reader.Close();

                var checkSlot = new MySqlCommand(
                    "SELECT COUNT(*) FROM Appointments WHERE DoctorId=@DoctorId AND AppointmentDate=@Date AND AppointmentTime=@Time AND Status NOT IN ('Cancelled') AND AppointmentId<>@AppointmentId",
                    connection);
                checkSlot.Parameters.AddWithValue("@DoctorId", doctorId);
                checkSlot.Parameters.AddWithValue("@Date", newDate);
                checkSlot.Parameters.AddWithValue("@Time", request.NewTime);
                checkSlot.Parameters.AddWithValue("@AppointmentId", appointmentId);
                long slotCount = Convert.ToInt64(checkSlot.ExecuteScalar());

                if (slotCount > 0)
                    return Conflict(new { error = "Doctor not available for the new time slot" });

                var updateCmd = new MySqlCommand(
                    "UPDATE Appointments SET AppointmentDate=@NewDate, AppointmentTime=@NewTime, Status=@Status, UpdatedAt=@UpdatedAt WHERE AppointmentId=@AppointmentId",
                    connection);

                updateCmd.Parameters.AddWithValue("@NewDate", newDate);
                updateCmd.Parameters.AddWithValue("@NewTime", request.NewTime);
                updateCmd.Parameters.AddWithValue("@Status", "Rescheduled");
                updateCmd.Parameters.AddWithValue("@UpdatedAt", DateTime.Now);
                updateCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);

                int rowsAffected = updateCmd.ExecuteNonQuery();

                if (rowsAffected > 0)
                    return Ok(new
                    {
                        appointmentId,
                        message = "Appointment rescheduled successfully"
                    });

                return StatusCode(500, new { error = "Reschedule failed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE /api/appointments/{appointmentId} - Cancel appointment
        [HttpDelete("{appointmentId}")]
        public IActionResult CancelAppointment(string appointmentId)
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var getCmd = new MySqlCommand(
                    "SELECT Status FROM Appointments WHERE AppointmentId=@AppointmentId", 
                    connection);
                getCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);
                var result = getCmd.ExecuteScalar();

                if (result == null)
                    return NotFound(new { error = "Appointment not found" });

                string currentStatus = result.ToString()!;

                if (currentStatus == "Completed")
                    return BadRequest(new { error = "Cannot cancel a completed appointment" });

                if (currentStatus == "Cancelled")
                    return BadRequest(new { error = "Appointment is already cancelled" });

                var updateCmd = new MySqlCommand(
                    "UPDATE Appointments SET Status=@Status, UpdatedAt=@UpdatedAt WHERE AppointmentId=@AppointmentId",
                    connection);

                updateCmd.Parameters.AddWithValue("@Status", "Cancelled");
                updateCmd.Parameters.AddWithValue("@UpdatedAt", DateTime.Now);
                updateCmd.Parameters.AddWithValue("@AppointmentId", appointmentId);

                int rowsAffected = updateCmd.ExecuteNonQuery();

                if (rowsAffected > 0)
                    return Ok(new { message = "Appointment cancelled successfully" });

                return StatusCode(500, new { error = "Cancellation failed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // USER STORY 4: Generate Statistics
        // GET /api/appointments/statistics
        [HttpGet("statistics")]
        public IActionResult GetStatistics([FromQuery] string? from, [FromQuery] string? to)
        {
            try
            {
                DateTime fromDate = DateTime.MinValue;
                DateTime toDate = DateTime.MaxValue;

                if (!string.IsNullOrWhiteSpace(from))
                {
                    if (!DateTime.TryParse(from, out fromDate))
                        return BadRequest(new { error = "Invalid 'from' date format" });
                }

                if (!string.IsNullOrWhiteSpace(to))
                {
                    if (!DateTime.TryParse(to, out toDate))
                        return BadRequest(new { error = "Invalid 'to' date format" });
                }

                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                string whereClause = "";
                if (!string.IsNullOrWhiteSpace(from) || !string.IsNullOrWhiteSpace(to))
                {
                    whereClause = "WHERE ";
                    if (!string.IsNullOrWhiteSpace(from))
                        whereClause += "a.AppointmentDate >= @FromDate ";
                    if (!string.IsNullOrWhiteSpace(from) && !string.IsNullOrWhiteSpace(to))
                        whereClause += "AND ";
                    if (!string.IsNullOrWhiteSpace(to))
                        whereClause += "a.AppointmentDate <= @ToDate ";
                }

                var totalCmd = new MySqlCommand($"SELECT COUNT(*) FROM Appointments a {whereClause}", connection);
                if (!string.IsNullOrWhiteSpace(from))
                    totalCmd.Parameters.AddWithValue("@FromDate", fromDate);
                if (!string.IsNullOrWhiteSpace(to))
                    totalCmd.Parameters.AddWithValue("@ToDate", toDate);

                int totalAppointments = Convert.ToInt32(totalCmd.ExecuteScalar());

                if (totalAppointments == 0)
                    return NotFound(new { error = "No data available for selected date range" });

                var doctorCmd = new MySqlCommand(
                    $@"SELECT d.Name, COUNT(*) as Count
                       FROM Appointments a
                       JOIN Doctors d ON a.DoctorId = d.DoctorId
                       {whereClause}
                       GROUP BY d.Name
                       ORDER BY Count DESC",
                    connection);

                if (!string.IsNullOrWhiteSpace(from))
                    doctorCmd.Parameters.AddWithValue("@FromDate", fromDate);
                if (!string.IsNullOrWhiteSpace(to))
                    doctorCmd.Parameters.AddWithValue("@ToDate", toDate);

                var appointmentsPerDoctor = new Dictionary<string, int>();
                var doctorReader = doctorCmd.ExecuteReader();

                while (doctorReader.Read())
                {
                    appointmentsPerDoctor[SafeGetString(doctorReader, "Name")] = Convert.ToInt32(doctorReader["Count"]);
                }
                doctorReader.Close();

                var deptCmd = new MySqlCommand(
                    $@"SELECT d.Department, COUNT(*) as Count
                       FROM Appointments a
                       JOIN Doctors d ON a.DoctorId = d.DoctorId
                       {whereClause}
                       GROUP BY d.Department
                       ORDER BY Count DESC",
                    connection);

                if (!string.IsNullOrWhiteSpace(from))
                    deptCmd.Parameters.AddWithValue("@FromDate", fromDate);
                if (!string.IsNullOrWhiteSpace(to))
                    deptCmd.Parameters.AddWithValue("@ToDate", toDate);

                var appointmentsPerDepartment = new Dictionary<string, int>();
                var deptReader = deptCmd.ExecuteReader();

                while (deptReader.Read())
                {
                    appointmentsPerDepartment[SafeGetString(deptReader, "Department")] = Convert.ToInt32(deptReader["Count"]);
                }

                return Ok(new
                {
                    totalAppointments,
                    appointmentsPerDoctor,
                    appointmentsPerDepartment
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Utility: Generate Appointment ID
        private string GenerateAppointmentId(MySqlConnection connection)
        {
            var cmd = new MySqlCommand("SELECT AppointmentId FROM Appointments ORDER BY AppointmentId DESC LIMIT 1", connection);
            var result = cmd.ExecuteScalar();

            if (result != null)
            {
                string lastId = result.ToString()!;
                int num = int.Parse(lastId.Substring(2));
                return "A-" + (num + 1).ToString("D8");
            }
            else
            {
                return "A-00000001";
            }
        }

        [HttpGet("doctor/{doctorId}")]
        public IActionResult GetDoctorAppointments(string doctorId, [FromQuery] string from = "", [FromQuery] string to = "")
        {
            try
            {
                var service = new AppointmentManagementService(_config);
                var appointments = service.GetDoctorAppointments(doctorId, from, to);

                if (appointments.Count == 0)
                    return NotFound(new { error = "No appointments found" });

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{appointmentId}/status")]
        public IActionResult UpdateAppointmentStatus(string appointmentId, [FromBody] UpdateAppointmentStatusRequest request)
        {
            try
            {
                var service = new AppointmentManagementService(_config);
                service.UpdateAppointmentStatus(appointmentId, request.Status);

                return Ok(new
                {
                    appointmentId,
                    message = $"Appointment status updated to {request.Status}"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}