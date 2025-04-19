using Microsoft.AspNetCore.Mvc;

namespace VirtualClosetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OutfitsController : ControllerBase
{
    private static string FilePath = "Data/outfits.json";
    private static List<Outfit> _outfits = StorageService.LoadFromFile<Outfit>(FilePath);
    private static int _nextId = _outfits.Count > 0 ? _outfits.Max(o => o.Id) + 1 : 1;

    [HttpPost("create")]
    public IActionResult CreateOutfit([FromBody] Outfit newOutfit)
    {
        newOutfit.Id = _nextId++;
        _outfits.Add(newOutfit);
        StorageService.SaveToFile(FilePath, _outfits);
        return Ok(new { message = "Outfit created successfully!", outfit = newOutfit });
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetOutfitsByUser(int userId)
    {
        var userOutfits = _outfits.Where(o => o.UserId == userId).ToList();
        return Ok(userOutfits);
    }

    [HttpPut("update/{id}")]
    public IActionResult UpdateOutfit(int id, [FromBody] Outfit updated)
    {
        var outfit = _outfits.FirstOrDefault(o => o.Id == id);
        if (outfit == null) return NotFound("Outfit not found");

        outfit.Name = updated.Name;
        outfit.ClothingItemIds = updated.ClothingItemIds;
        StorageService.SaveToFile(FilePath, _outfits);
        return Ok(new { message = "Outfit updated!", outfit });
    }
    
    [HttpDelete("delete/{id}")]
    public IActionResult DeleteOutfit(int id)
    {
        var outfit = _outfits.FirstOrDefault(o => o.Id == id);
        if (outfit == null)
            return NotFound("Outfit not found");

        _outfits.Remove(outfit);
        StorageService.SaveToFile(FilePath, _outfits);
        return Ok(new { message = "Outfit deleted successfully" });
    }
}