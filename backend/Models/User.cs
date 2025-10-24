using System;

namespace HospitalManagementSystem.Models
{
    public class User
    {
        public string UserId { get; set; }       // e.g. U-2025-001
        public string FullName { get; set; }
        public DateTime DOB { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Contact { get; set; }
        public string Role { get; set; }         // Admin, Doctor, Patient, Vendor
        public bool IsActive { get; set; } = true;
    }
}