namespace HospitalManagementSystem.DTOs
{
    public class CreateDoctorAccountResponse
    {
        public string DoctorId { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Contact { get; set; }
        public string Specialization { get; set; }
        public string DepartmentId { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}