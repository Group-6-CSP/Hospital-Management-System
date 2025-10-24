using System;
namespace HospitalManagementSystem.Models
{
    public class Payment
    {
        public string PaymentId { get; set; }
        public string BillId { get; set; }
        public string PatientId { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentMode { get; set; } // Cash, Card, Online, Check
        public DateTime PaymentDate { get; set; }
        public string Status { get; set; } = "Completed"; // Completed, Failed, Pending
        public string TransactionReference { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}