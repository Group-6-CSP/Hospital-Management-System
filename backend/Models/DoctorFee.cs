using System;
namespace HospitalManagementSystem.Models
{
    public class DoctorFee
    {
        public string DoctorFeeId { get; set; }
        public string DoctorId { get; set; }
        public decimal ConsultationFee { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}