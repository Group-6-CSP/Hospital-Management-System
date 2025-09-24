using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Enable Swagger (optional, but useful for testing)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // frontend URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Configure Kestrel ports (5239 for HTTP, 7018 for HTTPS)
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5239); // HTTP
    options.ListenAnyIP(7018, listenOptions =>
    {
        listenOptions.UseHttps();
    });
});

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();

// Enable CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();