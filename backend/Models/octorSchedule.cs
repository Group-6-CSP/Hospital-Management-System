using System;
namespace HospitalManagementSystem.Models
{
    public class DoctorSchedule
    {
        public string ScheduleId { get; set; }
        public string DoctorId { get; set; }
        public string WorkingDays { get; set; } // JSON: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        public string TimeSlots { get; set; }   // JSON: ["09:00-12:00", "14:00-17:00"]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}