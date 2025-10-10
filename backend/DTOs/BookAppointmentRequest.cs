namespace HospitalManagementSystem.DTOs
{
    public class BookAppointmentRequest
    {
        public string PatientId { get; set; } = default!;
        public string DoctorId { get; set; } = default!;
        public string Date { get; set; } = default!;
        public string Time { get; set; } = default!;
        public string? Reason { get; set; }
    }
}