namespace HospitalManagementSystem.DTOs;

public class RegisterRequest
{
    public string FullName { get; set; }
    public string DOB { get; set; }     // Keep DOB as string, will parse later
    public string Email { get; set; }
    public string Password { get; set; }
    public string Contact { get; set; }
    public string Role { get; set; }    // Admin, Doctor, Patient, Vendor
}