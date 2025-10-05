using backend.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

//  Add services to the container
builder.Services.AddControllers();

//  Register AppointmentService (ADO.NET service)
builder.Services.AddScoped<AppointmentService>();

//  Enable Swagger (for testing API endpoints)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//  Configure CORS to allow your frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // React app URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

//  Configure Kestrel ports (optional if you already have these)
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5239); // HTTP
    options.ListenAnyIP(7018, listenOptions =>
    {
        listenOptions.UseHttps();
    });
});

var app = builder.Build();

//  Middleware configuration
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//  Enable HTTPS and Routing
app.UseHttpsRedirection();
app.UseRouting();

//  Enable CORS for frontend requests
app.UseCors("AllowFrontend");

//  Authorization (if AuthController added later)
app.UseAuthorization();

//  Map your controllers (like AppointmentsController)
app.MapControllers();

//  Run the backend
app.Run();
