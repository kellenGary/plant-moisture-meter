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
        [FromQuery] DateTime? since = null)
    {
        var query = _context.SensorReadings.AsQueryable();

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
    [HttpGet("latest")]
    public async Task<ActionResult<SensorReading>> GetLatest()
    {
        var reading = await _context.SensorReadings
            .OrderByDescending(r => r.Timestamp)
            .FirstOrDefaultAsync();

        if (reading == null)
        {
            return NotFound();
        }

        return reading;
    }
}
