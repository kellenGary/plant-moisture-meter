namespace PlantMonitorApi.Models;

public class SensorLabel
{
    public int Id { get; set; }
    public string BoardId { get; set; } = "";
    public int SensorId { get; set; }
    public string Label { get; set; } = "";
}

// DTO for creating/updating sensor labels
public class SensorLabelDto
{
    public string BoardId { get; set; } = "";
    public int SensorId { get; set; }
    public string Label { get; set; } = "";
}
