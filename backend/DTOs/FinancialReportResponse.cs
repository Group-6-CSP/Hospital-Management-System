namespace HospitalManagementSystem.DTOs
{
    public class FinancialReportResponse
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal TotalTax { get; set; }
        public decimal OutstandingPayments { get; set; }
        public decimal PaidAmount { get; set; }
        public int TotalBills { get; set; }
        public string ReportPeriod { get; set; }
    }
}