namespace PlantMonitorApi.Models;

public class SensorReading
{
    public int Id { get; set; }
    public int MoisturePercent { get; set; }
    public DateTime Timestamp { get; set; }
}

// DTO for incoming POST requests
public class SensorReadingDto
{
    public int MoisturePercent { get; set; }
}
