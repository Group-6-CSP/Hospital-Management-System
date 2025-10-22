namespace HospitalManagementSystem.DTOs
{
    public class CreateDoctorRequest
    {
        public string Name { get; set; }
        public string Specialization { get; set; }
        public string Contact { get; set; }
        public string Email { get; set; }
        public string Availability { get; set; }
    }
}