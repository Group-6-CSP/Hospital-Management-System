using MySql.Data.MySqlClient;
using HospitalManagementSystem.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ======================================================
// Load environment variables (Azure connection strings, JWT, etc.)
// ======================================================
builder.Configuration.AddEnvironmentVariables();

// ======================================================
// Register Application Services (Dependency Injection)
// ======================================================
builder.Services.AddScoped<AdminDoctorService>();
builder.Services.AddScoped<DoctorService>();
builder.Services.AddScoped<DoctorManagementService>();
builder.Services.AddScoped<DoctorReportService>();
builder.Services.AddScoped<AppointmentManagementService>();
builder.Services.AddScoped<LabServiceService>();
builder.Services.AddScoped<BillingService>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<DepartmentService>();
builder.Services.AddScoped<ReportService>();
builder.Services.AddScoped<AuthService>();  // required
builder.Services.AddScoped<PatientService>(); // if you have this service
// Add any other service files if needed.

// ======================================================
// Add controllers & swagger
// ======================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ======================================================
// JWT Authentication
// ======================================================
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (!string.IsNullOrEmpty(jwtKey))
{
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            ClockSkew = TimeSpan.Zero
        };
    });
}

// ======================================================
// CORS (Azure-friendly)
// ======================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(origin => true);  // Wide-open for Azure
    });
});

// ======================================================
// Build the app
// ======================================================
var app = builder.Build();

// ======================================================
// Middleware pipeline
// ======================================================

// Swagger always ON (helpful in Azure)
app.UseSwagger();
app.UseSwaggerUI();

if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

// Authentication FIRST → Authorization SECOND
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ======================================================
// Dev-only password reset (SAFE - does not run in production)
// ======================================================
if (app.Environment.IsDevelopment() &&
    builder.Configuration.GetValue<bool>("ResetSeedPasswordsOnStart", true))
{
    try
    {
        var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrEmpty(connStr))
        {
            var authSvc = new AuthService(builder.Configuration);
            var hash = authSvc.HashPassword("Test@123");

            using var conn = new MySqlConnection(connStr);
            conn.Open();

            var sql = @"UPDATE Users 
                        SET PasswordHash=@hash, IsActive=1 
                        WHERE Email IN ('testuser@example.com','testuser2@example.com')";
            using var cmd = new MySqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@hash", hash);
            cmd.ExecuteNonQuery();
        }
    }
    catch
    {
        // Ignore dev errors
    }
}

// ======================================================
// Run application
// ======================================================
app.Run();
