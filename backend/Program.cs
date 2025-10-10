using MySql.Data.MySqlClient;
using HospitalManagementSystem.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for React frontend
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000", "http://localhost:3001" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Middleware
// Enable Swagger UI in all environments for test readiness checks
app.UseSwagger();
app.UseSwaggerUI();

// Only redirect to HTTPS when an HTTPS port is configured or in Production
var httpsPort = builder.Configuration["ASPNETCORE_HTTPS_PORT"];
if (!string.IsNullOrEmpty(httpsPort) || app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Development-only: ensure seeded test users have expected password hash (Test@123)
if (app.Environment.IsDevelopment() && builder.Configuration.GetValue<bool>("ResetSeedPasswordsOnStart", true))
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
            var sql = @"UPDATE Users SET PasswordHash=@hash, IsActive=1 WHERE Email IN ('testuser@example.com','testuser2@example.com')";
            using var cmd = new MySqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@hash", hash);
            cmd.ExecuteNonQuery();
        }
    }
    catch { /* ignore in development */ }
}
app.Run();