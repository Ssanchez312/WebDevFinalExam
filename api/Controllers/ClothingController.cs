using Microsoft.AspNetCore.Mvc;

namespace VirtualClosetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClothingController : ControllerBase
{
    private static string FilePath = "Data/clothing.json";
    private static List<ClothingItem> _clothingItems = StorageService.LoadFromFile<ClothingItem>(FilePath);
    private static int _nextId = _clothingItems.Count > 0 ? _clothingItems.Max(c => c.Id) + 1 : 1;


    [HttpPost("upload")]
    public IActionResult UploadClothing([FromBody] ClothingItem newItem)
    {
        newItem.Id = _nextId++;
        _clothingItems.Add(newItem);
        StorageService.SaveToFile(FilePath, _clothingItems);
        return Ok(new { message = "Clothing item uploaded!", item = newItem });
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetUserClothing(int userId)
    {
        var items = _clothingItems.Where(c => c.UserId == userId).ToList();
        return Ok(items);
    }
}