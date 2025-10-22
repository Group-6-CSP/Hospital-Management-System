namespace HospitalManagementSystem.DTOs
{
    public class DoctorReportResponse
    {
        public string DoctorId { get; set; }
        public string Name { get; set; }
        public string Specialization { get; set; }
        public string Availability { get; set; }
        public int AppointmentsHandled { get; set; }
        public decimal AverageRating { get; set; }
        public string WorkingDays { get; set; }
        public string TimeSlots { get; set; }
    }
}
