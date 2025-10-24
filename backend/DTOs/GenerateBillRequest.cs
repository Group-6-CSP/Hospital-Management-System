namespace HospitalManagementSystem.DTOs
{
    public class GenerateBillRequest
    {
        public string AppointmentId { get; set; }
        public decimal LabCharges { get; set; } = 0;
        public decimal MedicineCharges { get; set; } = 0;
        public decimal DiscountPercent { get; set; } = 0;
        public string Notes { get; set; }
    }
}