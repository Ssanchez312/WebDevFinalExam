using Microsoft.AspNetCore.Mvc;

namespace VirtualClosetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClothingController : ControllerBase
{
    private static List<ClothingItem> _clothingItems = new();
    private static int _nextId = 1;

    [HttpPost("upload")]
    public IActionResult UploadClothing([FromBody] ClothingItem newItem)
    {
        newItem.Id = _nextId++;
        _clothingItems.Add(newItem);

        return Ok(new { message = "Clothing item uploaded!", item = newItem });
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetUserClothing(int userId)
    {
        var items = _clothingItems.Where(c => c.UserId == userId).ToList();
        return Ok(items);
    }
}