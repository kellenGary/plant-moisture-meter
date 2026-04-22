namespace PlantMonitorApi.Models;

public class BoardLabel
{
    public int Id { get; set; }
    public string BoardId { get; set; } = "";
    public string Alias { get; set; } = "";
}

public class BoardLabelDto
{
    public string BoardId { get; set; } = "";
    public string Alias { get; set; } = "";
}
