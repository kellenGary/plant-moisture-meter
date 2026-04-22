using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlantMonitorApi.Data;
using PlantMonitorApi.Models;

namespace PlantMonitorApi.Controllers;

[ApiController]
[Route("api/sensor-data")]
public class SensorDataController : ControllerBase
{
    private readonly PlantMonitorContext _context;

    public SensorDataController(PlantMonitorContext context)
    {
        _context = context;
    }

    // POST: api/sensor-data
    [HttpPost]
    public async Task<ActionResult<SensorReading>> PostReading(SensorReadingDto dto)
    {
        var reading = new SensorReading
        {
            BoardId = dto.BoardId,
            SensorId = dto.SensorId,
            MoisturePercent = dto.MoisturePercent,
            Timestamp = DateTime.UtcNow
        };

        _context.SensorReadings.Add(reading);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLatest), new { id = reading.Id }, reading);
    }

    // GET: api/sensor-data
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SensorReading>>> GetAllReadings(
        [FromQuery] int? limit = null,
        [FromQuery] string? boardId = null,
        [FromQuery] int? sensorId = null,
        [FromQuery] DateTime? since = null)
    {
        var query = _context.SensorReadings.AsQueryable();

        if (!string.IsNullOrEmpty(boardId))
        {
            query = query.Where(r => r.BoardId == boardId);
        }

        if (sensorId.HasValue)
        {
            query = query.Where(r => r.SensorId == sensorId.Value);
        }

        if (since.HasValue)
        {
            query = query.Where(r => r.Timestamp >= since.Value);
        }

        query = query.OrderByDescending(r => r.Timestamp);

        if (limit.HasValue)
        {
            query = query.Take(limit.Value);
        }

        return await query.ToListAsync();
    }

    // GET: api/sensor-data/latest
    // Returns the latest reading for EACH unique (boardId, sensorId) pair
    [HttpGet("latest")]
    public async Task<ActionResult<IEnumerable<SensorReading>>> GetLatest()
    {
        var latestReadings = await _context.SensorReadings
            .GroupBy(r => new { r.BoardId, r.SensorId })
            .Select(g => g.OrderByDescending(r => r.Timestamp).First())
            .ToListAsync();

        return latestReadings;
    }

    // GET: api/sensor-data/boards
    // Returns all unique board IDs that have reported data
    [HttpGet("boards")]
    public async Task<ActionResult<IEnumerable<string>>> GetBoards()
    {
        var boards = await _context.SensorReadings
            .Select(r => r.BoardId)
            .Distinct()
            .ToListAsync();

        return boards;
    }

    // GET: api/sensor-data/sensors?boardId=xyz
    // Returns all unique sensor IDs for a given board
    [HttpGet("sensors")]
    public async Task<ActionResult<IEnumerable<int>>> GetSensors([FromQuery] string? boardId = null)
    {
        var query = _context.SensorReadings.AsQueryable();

        if (!string.IsNullOrEmpty(boardId))
        {
            query = query.Where(r => r.BoardId == boardId);
        }

        var sensors = await query
            .Select(r => r.SensorId)
            .Distinct()
            .ToListAsync();

        return sensors;
    }
}
