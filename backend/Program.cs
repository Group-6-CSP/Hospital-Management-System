using System.IO;
using MySql.Data.MySqlClient;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            // Allow local dev frontends on common ports (3000 and 3001)
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Ensure the MySQL database exists and the schema/seed SQL are executed on first run
try
{
    EnsureDatabaseCreated(builder.Configuration, builder.Environment, app.Logger);
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Error while ensuring database creation");
}

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();

static void EnsureDatabaseCreated(IConfiguration configuration, IWebHostEnvironment env, ILogger logger)
{
    var defaultConn = configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(defaultConn))
    {
        logger.LogWarning("No DefaultConnection found in configuration. Skipping DB creation.");
        return;
    }

    // Use MySqlConnectionStringBuilder to parse and manipulate the connection string
    var csb = new MySqlConnectionStringBuilder(defaultConn);
    var dbName = csb.Database;
    if (string.IsNullOrWhiteSpace(dbName))
    {
        // fallback to a sensible default
        dbName = "hospitaldb";
    }

    // Create a connection string that does not specify a database so we can create it
    var adminCsb = new MySqlConnectionStringBuilder(defaultConn)
    {
        Database = string.Empty
    };

    logger.LogInformation("Ensuring database '{db}' exists on server {server}:{port}", dbName, adminCsb.Server, adminCsb.Port);

    using (var conn = new MySqlConnection(adminCsb.ConnectionString))
    {
        conn.Open();

        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = $"CREATE DATABASE IF NOT EXISTS `{dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;";
            cmd.ExecuteNonQuery();
        }

        // Switch to the created database and execute schema + seed if files exist
        conn.ChangeDatabase(dbName);

        var schemaPath = Path.Combine(env.ContentRootPath, "database", "schema.sql");
        if (File.Exists(schemaPath))
        {
            logger.LogInformation("Executing schema SQL from {path}", schemaPath);
            var sql = File.ReadAllText(schemaPath);
            var script = new MySqlScript(conn, sql);
            script.Execute();
        }

        var seedPath = Path.Combine(env.ContentRootPath, "database", "seed_data.sql");
        if (File.Exists(seedPath))
        {
            logger.LogInformation("Executing seed SQL from {path}", seedPath);
            var seedSql = File.ReadAllText(seedPath);
            var seedScript = new MySqlScript(conn, seedSql);
            seedScript.Execute();
        }
    }

    logger.LogInformation("Database ensured and initialization scripts (if any) executed.");
}