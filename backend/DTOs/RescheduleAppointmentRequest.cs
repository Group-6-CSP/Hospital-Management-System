namespace HospitalManagementSystem.DTOs
{
    public class RescheduleAppointmentRequest
    {
        public string NewDate { get; set; } = default!;
        public string NewTime { get; set; } = default!;
    }
}