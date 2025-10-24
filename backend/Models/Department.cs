using System;
namespace HospitalManagementSystem.Models
{
    public class Department
    {
        public string DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}