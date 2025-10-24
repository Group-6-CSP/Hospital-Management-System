// namespace HospitalManagementSystem.DTOs
// {
//     public class CreateDoctorAccountRequest
//     {
//         public string FullName { get; set; }              // Doctor's full name
//         public string Email { get; set; }                 // Gmail or any email
//         public string Contact { get; set; }               // Phone number (10 digits)
//         public string Password { get; set; }              // Password (min 6 chars)
//         public string Specialization { get; set; }        // e.g., Cardiology, Neurology
//         public string DepartmentId { get; set; }          // e.g., DEPT-001
//         public string Availability { get; set; }          // Optional: availability status
//     }
// }
namespace HospitalManagementSystem.DTOs
{
    public class CreateDoctorAccountRequest
    {
        public string FullName { get; set; }         // Required
        public string Email { get; set; }            // Required (unique)
        public string Contact { get; set; }          // Required (10 digits)
        public string Password { get; set; }         // Required (min 6 chars)
        public string Specialization { get; set; }   // Required
        public string DepartmentId { get; set; }     // Required
        public string Availability { get; set; }     // Optional
    }
}