using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using Microsoft.Extensions.Configuration;

namespace HospitalManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly string _connectionString;

        public PatientsController(IConfiguration config)
        {
            _config = config;
            // Ensure we never have a null connection string
            _connectionString = _config.GetConnectionString("DefaultConnection") ?? "";
        }

        // Utility: Safe string from reader (always returns string, never null)
        private string SafeGetString(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? "" : reader[columnName].ToString()!;
        }

        private DateTime SafeGetDateTime(MySqlDataReader reader, string columnName)
        {
            return reader[columnName] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(reader[columnName]);
        }

        // GET /api/patients
        [HttpGet]
        public IActionResult GetAllPatients()
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var cmd = new MySqlCommand("SELECT * FROM Patients", connection);
                var reader = cmd.ExecuteReader();

                var patients = new List<Patient>();

                while (reader.Read())
                {
                    patients.Add(new Patient
                    {
                        PatientId = SafeGetString(reader, "PatientId"),
                        UserId = SafeGetString(reader, "UserId"),
                        Name = SafeGetString(reader, "Name"),
                        Email = SafeGetString(reader, "Email"),
                        Dob = SafeGetDateTime(reader, "Dob"),
                        Gender = SafeGetString(reader, "Gender"),
                        Contact = SafeGetString(reader, "Contact"),
                        MedicalNotes = SafeGetString(reader, "MedicalNotes"),
                        Age = SafeGetString(reader, "Age")
                    });
                }

                return Ok(patients);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET /api/patients/{id}
        [HttpGet("{id}")]
        public IActionResult GetPatientById(string id)
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var cmd = new MySqlCommand("SELECT * FROM Patients WHERE PatientId=@PatientId", connection);
                cmd.Parameters.AddWithValue("@PatientId", id);
                var reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    var patient = new Patient
                    {
                        PatientId = SafeGetString(reader, "PatientId"),
                        UserId = SafeGetString(reader, "UserId"),
                        Name = SafeGetString(reader, "Name"),
                        Email = SafeGetString(reader, "Email"),
                        Dob = SafeGetDateTime(reader, "Dob"),
                        Gender = SafeGetString(reader, "Gender"),
                        Contact = SafeGetString(reader, "Contact"),
                        MedicalNotes = SafeGetString(reader, "MedicalNotes"),
                        Age = SafeGetString(reader, "Age")
                    };
                    return Ok(patient);
                }
                else
                {
                    return NotFound(new { error = "Patient not found" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST /api/patients
        [HttpPost]
        public IActionResult RegisterPatient([FromBody] Patient request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                if (string.IsNullOrWhiteSpace(request.Name) ||
                    request.Dob == default ||
                    string.IsNullOrWhiteSpace(request.Gender) ||
                    string.IsNullOrWhiteSpace(request.Contact) ||
                    string.IsNullOrWhiteSpace(request.UserId))
                {
                    return BadRequest(new { error = "All mandatory fields must be provided." });
                }

                if (request.Dob > DateTime.Now)
                    return BadRequest(new { error = "DOB cannot be in the future" });

                if (request.Contact.Length < 10)
                    return BadRequest(new { error = "Invalid contact number" });

                string age = CalculateAge(request.Dob);
                string patientId = GeneratePatientId();

                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Patients WHERE Contact=@Contact", connection);
                checkCmd.Parameters.AddWithValue("@Contact", request.Contact);
                long count = Convert.ToInt64(checkCmd.ExecuteScalar());

                if (count > 0)
                    return Conflict(new { error = "Contact already exists", code = 409 });

                var insertCmd = new MySqlCommand(
                    "INSERT INTO Patients (PatientId, UserId, Name, Email, Dob, Gender, Contact, MedicalNotes, Age) " +
                    "VALUES (@PatientId, @UserId, @Name, @Email, @Dob, @Gender, @Contact, @MedicalNotes, @Age)", connection);

                insertCmd.Parameters.AddWithValue("@PatientId", patientId);
                insertCmd.Parameters.AddWithValue("@UserId", request.UserId);
                insertCmd.Parameters.AddWithValue("@Name", request.Name);
                insertCmd.Parameters.AddWithValue("@Email", request.Email ?? "");
                insertCmd.Parameters.AddWithValue("@Dob", request.Dob);
                insertCmd.Parameters.AddWithValue("@Gender", request.Gender);
                insertCmd.Parameters.AddWithValue("@Contact", request.Contact);
                insertCmd.Parameters.AddWithValue("@MedicalNotes", request.MedicalNotes ?? "");
                insertCmd.Parameters.AddWithValue("@Age", age);

                insertCmd.ExecuteNonQuery();

                return Ok(new
                {
                    patientId,
                    message = "Patient registered successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT /api/patients/{id}
        [HttpPut("{id}")]
        public IActionResult UpdatePatient(string id, [FromBody] Patient request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var getCmd = new MySqlCommand("SELECT * FROM Patients WHERE PatientId=@PatientId", connection);
                getCmd.Parameters.AddWithValue("@PatientId", id);
                var reader = getCmd.ExecuteReader();

                if (!reader.Read())
                    return NotFound(new { error = "Patient not found" });

                string currentUserId = SafeGetString(reader, "UserId");
                string currentContact = SafeGetString(reader, "Contact");
                DateTime currentDob = SafeGetDateTime(reader, "Dob");
                string currentAge = SafeGetString(reader, "Age");

                reader.Close();

                if (!string.IsNullOrWhiteSpace(request.UserId) && request.UserId != currentUserId)
                {
                    return BadRequest(new { error = "UserId cannot be changed." });
                }

                if (request.Contact != currentContact)
                {
                    var checkContactCmd = new MySqlCommand(
                        "SELECT COUNT(*) FROM Patients WHERE Contact=@Contact AND PatientId<>@PatientId", connection);
                    checkContactCmd.Parameters.AddWithValue("@Contact", request.Contact);
                    checkContactCmd.Parameters.AddWithValue("@PatientId", id);
                    long contactCount = Convert.ToInt64(checkContactCmd.ExecuteScalar());

                    if (contactCount > 0)
                        return Conflict(new { error = "Contact already exists", code = 409 });
                }

                string updatedAge = (request.Dob != currentDob)
                    ? CalculateAge(request.Dob)
                    : currentAge;

                var updateCmd = new MySqlCommand(
                    "UPDATE Patients SET Name=@Name, Email=@Email, Dob=@Dob, Gender=@Gender, " +
                    "Contact=@Contact, MedicalNotes=@MedicalNotes, Age=@Age WHERE PatientId=@PatientId",
                    connection);

                updateCmd.Parameters.AddWithValue("@Name", request.Name);
                updateCmd.Parameters.AddWithValue("@Email", request.Email ?? "");
                updateCmd.Parameters.AddWithValue("@Dob", request.Dob);
                updateCmd.Parameters.AddWithValue("@Gender", request.Gender);
                updateCmd.Parameters.AddWithValue("@Contact", request.Contact);
                updateCmd.Parameters.AddWithValue("@MedicalNotes", request.MedicalNotes ?? "");
                updateCmd.Parameters.AddWithValue("@Age", updatedAge);
                updateCmd.Parameters.AddWithValue("@PatientId", id);

                int rowsAffected = updateCmd.ExecuteNonQuery();

                if (rowsAffected > 0)
                    return Ok(new { message = "Patient updated successfully" });

                return StatusCode(500, new { error = "Update failed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE /api/patients/{id}
        [HttpDelete("{id}")]
        public IActionResult DeletePatient(string id)
        {
            try
            {
                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                var checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Patients WHERE PatientId=@PatientId", connection);
                checkCmd.Parameters.AddWithValue("@PatientId", id);
                long count = Convert.ToInt64(checkCmd.ExecuteScalar());

                if (count == 0)
                    return NotFound(new { error = "Patient not found" });

                var deleteCmd = new MySqlCommand("DELETE FROM Patients WHERE PatientId=@PatientId", connection);
                deleteCmd.Parameters.AddWithValue("@PatientId", id);

                int rowsAffected = deleteCmd.ExecuteNonQuery();

                if (rowsAffected > 0)
                    return Ok(new { message = "Patient deleted successfully" });

                return StatusCode(500, new { error = "Delete failed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Utility: Age Calculation
        private string CalculateAge(DateTime dob)
        {
            DateTime today = DateTime.Today;

            int years = today.Year - dob.Year;
            int months = today.Month - dob.Month;
            int days = today.Day - dob.Day;

            if (days < 0)
            {
                int prevMonth = today.Month == 1 ? 12 : today.Month - 1;
                int prevMonthYear = today.Month == 1 ? today.Year - 1 : today.Year;

                days += DateTime.DaysInMonth(prevMonthYear, prevMonth);
                months--;
            }

            if (months < 0)
            {
                months += 12;
                years--;
            }

            if (years < 0)
            {
                throw new ArgumentException("DOB cannot be in the future");
            }

            return $"{years} Years {months} Months {days} Days";
        }

        // Utility: Generate PatientId (P-XXXXXXXX)
       private string GeneratePatientId()
{
    using var connection = new MySqlConnection(_connectionString);
    connection.Open();

    // Get the maximum numeric value from existing patient IDs
    var cmd = new MySqlCommand(
        @"SELECT COALESCE(MAX(CAST(SUBSTRING(PatientId, 3) AS UNSIGNED)), 0) + 1 AS NextId 
          FROM Patients", 
        connection);
    
    var result = cmd.ExecuteScalar();
    int nextNum = Convert.ToInt32(result);

    return "P-" + nextNum.ToString("D8");
}
    }
}