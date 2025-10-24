using System.Collections.Generic;
namespace HospitalManagementSystem.DTOs
{
    public class UpdateDoctorScheduleRequest
    {
        public List<string> WorkingDays { get; set; } // ["Monday", "Tuesday", etc.]
        public List<string> TimeSlots { get; set; }   // ["09:00-12:00", "14:00-17:00"]
    }
}