namespace backend.Models
{
    public class Appointment
    {
        public string AppointmentId { get; set; }
        public string PatientId { get; set; }
        public string DoctorName { get; set; }
        public string Department { get; set; }
        public DateTime AppointmentDate { get; set; }

        public string Status { get; set; }
    }
}
