using System;

namespace HospitalManagementSystem.Models
{
    public class Patient
    {
        public string? PatientId { get; set; }          // not required (controller generates it)
        public string UserId { get; set; } = default!;  // required
        public string Name { get; set; } = default!;    // required
        public string? Email { get; set; }              // optional
        public DateTime Dob { get; set; }               // required
        public string Gender { get; set; } = default!;  // required
        public string Contact { get; set; } = default!; // required
        public string? MedicalNotes { get; set; }       // optional
        public string? Age { get; set; }                // not required (controller calculates it)
    }
}