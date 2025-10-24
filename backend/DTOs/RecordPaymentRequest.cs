namespace HospitalManagementSystem.DTOs
{
    public class RecordPaymentRequest
    {
        public string BillId { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentMode { get; set; }
        public string TransactionReference { get; set; }
    }
}