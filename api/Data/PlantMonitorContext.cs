using Microsoft.EntityFrameworkCore;
using PlantMonitorApi.Models;

namespace PlantMonitorApi.Data;

public class PlantMonitorContext : DbContext
{
    public PlantMonitorContext(DbContextOptions<PlantMonitorContext> options) : base(options)
    {
    }

    public DbSet<SensorReading> SensorReadings { get; set; }
    public DbSet<SensorLabel> SensorLabels { get; set; }
    public DbSet<BoardLabel> BoardLabels { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Index for fast queries by board + sensor
        modelBuilder.Entity<SensorReading>()
            .HasIndex(r => new { r.BoardId, r.SensorId });

        modelBuilder.Entity<SensorReading>()
            .HasIndex(r => r.Timestamp);

        // Unique constraint: one label per (boardId, sensorId)
        modelBuilder.Entity<SensorLabel>()
            .HasIndex(l => new { l.BoardId, l.SensorId })
            .IsUnique();

        // Unique constraint: one alias per boardId
        modelBuilder.Entity<BoardLabel>()
            .HasIndex(l => l.BoardId)
            .IsUnique();
    }
}
