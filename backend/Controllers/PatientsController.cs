using System;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using HospitalManagementSystem.Models;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

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
            _connectionString = _config.GetConnectionString("DefaultConnection");
        }

        // POST /api/patients
        [HttpPost]
        public IActionResult RegisterPatient([FromBody] Patient request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { error = "Invalid request" });

                // Validate mandatory fields
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

                // Calculate Age
                string age = CalculateAge(request.Dob);

                // Generate PatientId
                string patientId = GeneratePatientId();

                using var connection = new MySqlConnection(_connectionString);
                connection.Open();

                // Check duplicate contact
                var checkCmd = new MySqlCommand("SELECT COUNT(*) FROM Patients WHERE Contact=@Contact", connection);
                checkCmd.Parameters.AddWithValue("@Contact", request.Contact);
                long count = Convert.ToInt64(checkCmd.ExecuteScalar());

                if (count > 0)
                {
                    return Conflict(new { error = "Contact already exists", code = 409 });
                }

                // Insert into Patients table
                var insertCmd = new MySqlCommand(
                    "INSERT INTO Patients (PatientId, UserId, Name, Dob, Gender, Contact, Age) " +
                    "VALUES (@PatientId, @UserId, @Name, @Dob, @Gender, @Contact, @Age)",
                    connection);

                insertCmd.Parameters.AddWithValue("@PatientId", patientId);
                insertCmd.Parameters.AddWithValue("@UserId", request.UserId);
                insertCmd.Parameters.AddWithValue("@Name", request.Name);
                insertCmd.Parameters.AddWithValue("@Dob", request.Dob);
                insertCmd.Parameters.AddWithValue("@Gender", request.Gender);
                insertCmd.Parameters.AddWithValue("@Contact", request.Contact);
                insertCmd.Parameters.AddWithValue("@Age", age);

                insertCmd.ExecuteNonQuery();

                return Ok(new
                {
                    patientId,
                    age,
                    message = "Patient registered successfully"
                });
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

            var cmd = new MySqlCommand("SELECT PatientId FROM Patients ORDER BY PatientId DESC LIMIT 1", connection);
            var result = cmd.ExecuteScalar();

            if (result != null)
            {
                string lastId = result.ToString(); // e.g., P-00000005
                int num = int.Parse(lastId.Substring(2));
                return "P-" + (num + 1).ToString("D8");
            }
            else
            {
                return "P-00000001"; // first patient
            }
        }
    }
}