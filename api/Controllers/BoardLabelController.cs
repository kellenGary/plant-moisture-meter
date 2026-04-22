using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlantMonitorApi.Data;
using PlantMonitorApi.Models;

namespace PlantMonitorApi.Controllers;

[ApiController]
[Route("api/board-labels")]
public class BoardLabelController : ControllerBase
{
    private readonly PlantMonitorContext _context;

    public BoardLabelController(PlantMonitorContext context)
    {
        _context = context;
    }

    // GET: api/board-labels
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BoardLabel>>> GetLabels()
    {
        return await _context.BoardLabels.ToListAsync();
    }

    // PUT: api/board-labels
    // Upsert: create or update an alias for a boardId
    [HttpPut]
    public async Task<ActionResult<BoardLabel>> UpsertLabel(BoardLabelDto dto)
    {
        var existing = await _context.BoardLabels
            .FirstOrDefaultAsync(l => l.BoardId == dto.BoardId);

        if (existing != null)
        {
            existing.Alias = dto.Alias;
        }
        else
        {
            existing = new BoardLabel
            {
                BoardId = dto.BoardId,
                Alias = dto.Alias
            };
            _context.BoardLabels.Add(existing);
        }

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE: api/board-labels/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLabel(int id)
    {
        var label = await _context.BoardLabels.FindAsync(id);
        if (label == null) return NotFound();

        _context.BoardLabels.Remove(label);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
