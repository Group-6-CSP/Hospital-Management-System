using System;
namespace HospitalManagementSystem.Models
{
    public class Bill
    {
        public string BillId { get; set; }
        public string AppointmentId { get; set; }
        public string PatientId { get; set; }
        public string DoctorId { get; set; }
        public decimal ConsultationFee { get; set; }
        public decimal LabCharges { get; set; } = 0;
        public decimal MedicineCharges { get; set; } = 0;
        public decimal Subtotal { get; set; }
        public decimal DiscountPercent { get; set; } = 0;
        public decimal DiscountAmount { get; set; } = 0;
        public decimal TaxPercent { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Generated"; // Generated, Paid, Pending, PartiallyPaid
        public DateTime BillDate { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}