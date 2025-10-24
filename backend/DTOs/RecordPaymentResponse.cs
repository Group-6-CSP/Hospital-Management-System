namespace HospitalManagementSystem.DTOs
{
    public class RecordPaymentResponse
    {
        public string PaymentId { get; set; }
        public string BillId { get; set; }
        public string PatientId { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentMode { get; set; }
        public string PaymentDate { get; set; }
        public string Status { get; set; }
        public string BillStatus { get; set; }
        public string Message { get; set; }
    }
}