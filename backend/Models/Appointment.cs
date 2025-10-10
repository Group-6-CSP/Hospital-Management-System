using System;

namespace HospitalManagementSystem.Models
{
    public class Appointment
    {
        public string? AppointmentId { get; set; }
        public string PatientId { get; set; } = default!;
        public string DoctorId { get; set; } = default!;
        public DateTime AppointmentDate { get; set; }
        public string AppointmentTime { get; set; } = default!;
        public string Status { get; set; } = "Scheduled";
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        
        // For API responses only
        public string? DoctorName { get; set; }
        public string? PatientName { get; set; }
        public string? Department { get; set; }
    }
}