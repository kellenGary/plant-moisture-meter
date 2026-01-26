using Microsoft.EntityFrameworkCore;
using PlantMonitorApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Configure SQLite
builder.Services.AddDbContext<PlantMonitorContext>(options =>
    options.UseSqlite("Data Source=plant_monitor.db"));

// Add controllers
builder.Services.AddControllers();

// Configure to listen on all interfaces (needed for Raspberry Pi)
builder.WebHost.UseUrls("http://0.0.0.0:5050");

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Auto-create database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PlantMonitorContext>();
    db.Database.EnsureCreated();
}

app.UseCors("AllowAll");

app.MapControllers();

app.Run();
