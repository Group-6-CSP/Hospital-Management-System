using System;
namespace HospitalManagementSystem.Models
{
    public class BillingConfig
    {
        public int ConfigId { get; set; }
        public decimal TaxPercentage { get; set; } = 6;
        public decimal ConsultationFeeBase { get; set; } = 1000;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}