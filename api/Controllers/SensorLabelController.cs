using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlantMonitorApi.Data;
using PlantMonitorApi.Models;

namespace PlantMonitorApi.Controllers;

[ApiController]
[Route("api/sensor-labels")]
public class SensorLabelController : ControllerBase
{
    private readonly PlantMonitorContext _context;

    public SensorLabelController(PlantMonitorContext context)
    {
        _context = context;
    }

    // GET: api/sensor-labels
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SensorLabel>>> GetLabels(
        [FromQuery] string? boardId = null)
    {
        var query = _context.SensorLabels.AsQueryable();

        if (!string.IsNullOrEmpty(boardId))
        {
            query = query.Where(l => l.BoardId == boardId);
        }

        return await query.ToListAsync();
    }

    // PUT: api/sensor-labels
    // Upsert: create or update a label for (boardId, sensorId)
    [HttpPut]
    public async Task<ActionResult<SensorLabel>> UpsertLabel(SensorLabelDto dto)
    {
        var existing = await _context.SensorLabels
            .FirstOrDefaultAsync(l => l.BoardId == dto.BoardId && l.SensorId == dto.SensorId);

        if (existing != null)
        {
            existing.Label = dto.Label;
        }
        else
        {
            existing = new SensorLabel
            {
                BoardId = dto.BoardId,
                SensorId = dto.SensorId,
                Label = dto.Label
            };
            _context.SensorLabels.Add(existing);
        }

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE: api/sensor-labels/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLabel(int id)
    {
        var label = await _context.SensorLabels.FindAsync(id);
        if (label == null) return NotFound();

        _context.SensorLabels.Remove(label);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
