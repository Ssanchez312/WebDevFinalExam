using Microsoft.AspNetCore.Mvc;

namespace VirtualClosetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OutfitsController : ControllerBase
{
    private static List<Outfit> _outfits = new();
    private static int _nextId = 1;

    [HttpPost("create")]
    public IActionResult CreateOutfit([FromBody] Outfit newOutfit)
    {
        newOutfit.Id = _nextId++;
        _outfits.Add(newOutfit);

        return Ok(new { message = "Outfit created successfully!", outfit = newOutfit });
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetOutfitsByUser(int userId)
    {
        var userOutfits = _outfits.Where(o => o.UserId == userId).ToList();
        return Ok(userOutfits);
    }
}