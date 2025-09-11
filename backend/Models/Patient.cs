using System;

namespace HospitalManagementSystem.Models
{
    public class Patient
    {
        public string? PatientId { get; set; }   // not required (controller generates it)
        public string UserId { get; set; }       // required
        public string Name { get; set; }         // required
        public DateTime Dob { get; set; }        // required
        public string Gender { get; set; }       // required
        public string Contact { get; set; }      // required
        public string? Age { get; set; }         // not required (controller calculates it)
    }
}