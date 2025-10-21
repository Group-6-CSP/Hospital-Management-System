namespace HospitalManagementSystem.DTOs
{
    public class BillingConfigRequest
    {
        public decimal TaxPercentage { get; set; }
        public decimal ConsultationFeeBase { get; set; }
    }
}