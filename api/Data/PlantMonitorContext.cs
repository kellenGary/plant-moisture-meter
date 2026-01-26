using Microsoft.EntityFrameworkCore;
using PlantMonitorApi.Models;

namespace PlantMonitorApi.Data;

public class PlantMonitorContext : DbContext
{
    public PlantMonitorContext(DbContextOptions<PlantMonitorContext> options) : base(options)
    {
    }

    public DbSet<SensorReading> SensorReadings { get; set; }
}
