// using System;

// namespace HospitalManagementSystem.Models
// {
//     public class Appointment
//     {
//         public string? AppointmentId { get; set; }
//         public string PatientId { get; set; } = default!;
//         public string DoctorId { get; set; } = default!;
//         public DateTime AppointmentDate { get; set; }
//         public string AppointmentTime { get; set; } = default!;
//         public string Status { get; set; } = "Scheduled";
//         public string? Reason { get; set; }
//         public DateTime CreatedAt { get; set; } = DateTime.Now;
//         public DateTime? UpdatedAt { get; set; }
        
//         // For API responses only
//         public string? DoctorName { get; set; }
//         public string? PatientName { get; set; }
//         public string? Department { get; set; }
//     }
// }
using System;
namespace HospitalManagementSystem.Models
{
    public class Appointment
    {
        public string AppointmentId { get; set; }
        public string PatientId { get; set; }
        public string DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string AppointmentTime { get; set; }
        public string Status { get; set; } = "Scheduled"; // Scheduled, Accepted, In-Progress, Completed, Cancelled, Rescheduled
        public string Reason { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public string BillId { get; set; }
        
        // Navigation properties
        public string DoctorName { get; set; }
        public string PatientName { get; set; }
        public string Department { get; set; }
    }
}