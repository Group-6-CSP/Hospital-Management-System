using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppointmentService _service;

        public AppointmentsController(AppointmentService service)
        {
            _service = service;
        }

        //  GET: /api/appointments
        [HttpGet]
        public IActionResult GetAll()
        {
            var appointments = _service.GetAll();
            return Ok(appointments);
        }

        //  GET: /api/appointments/byPatient/{patientId}
        [HttpGet("byPatient/{patientId}")]
        public IActionResult GetByPatient(string patientId)
        {
            var appointments = _service.GetByPatient(patientId);
            if (appointments == null || appointments.Count == 0)
                return NotFound(new { message = "No appointments found for this patient." });

            return Ok(appointments);
        }

        //  POST: /api/appointments
        [HttpPost]
        public IActionResult Create(Appointment appointment)
        {
            appointment.AppointmentId = Guid.NewGuid().ToString();
            _service.Create(appointment);
            return Ok(new { message = "Appointment created successfully!" });
        }

        //  PUT: /api/appointments/{id}/status
        [HttpPut("{id}/status")]
        public IActionResult UpdateStatus(string id, [FromBody] string status)
        {
            bool updated = _service.UpdateStatus(id, status);
            if (!updated)
                return NotFound(new { message = "Appointment not found or update failed." });

            return Ok(new { message = "Appointment status updated successfully!" });
        }

        //  DELETE: /api/appointments/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            _service.Delete(id);
            return Ok(new { message = "Appointment deleted successfully!" });
        }
    }
}
