namespace HospitalManagementSystem.DTOs
{
    public class GetLabServicesResponse
    {
        public string LabServiceId { get; set; }
        public string ServiceName { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }
    }
}
