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
[RequestSizeLimit(5_000_000)]
public async Task<IActionResult> UploadClothing([FromForm] IFormFile image, [FromForm] string name, [FromForm] string type, [FromForm] string description, [FromForm] int userId)
{
    if (image == null || image.Length == 0)
        return BadRequest("No image uploaded");

    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
    var filePath = Path.Combine("wwwroot/uploads", fileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await image.CopyToAsync(stream);
    }

    var newItem = new ClothingItem
    {
        Id = _nextId++,
        Name = name,
        Type = type,
        Description = description,
        ImageUrl = $"/uploads/{fileName}",
        UserId = userId
    };

    _clothingItems.Add(newItem);
    await StorageService.SaveToFile(FilePath, _clothingItems);

    return Ok(new { message = "Clothing uploaded", item = newItem });
}


    [HttpGet("user/{userId}")]
    public IActionResult GetUserClothing(int userId)
    {
        var items = _clothingItems.Where(c => c.UserId == userId).ToList();
        return Ok(items);
    }
}