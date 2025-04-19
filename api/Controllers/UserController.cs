
using Microsoft.AspNetCore.Mvc;

namespace VirtualClosetAPI.Controllers;


[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private static string FilePath = "Data/users.json";
    private static List<User> _users = StorageService.LoadFromFile<User>(FilePath);
    private static int _nextId = _users.Count > 0 ? _users.Max(u => u.Id) + 1 : 1;


    [HttpPost("register")]
    public IActionResult Register([FromBody] User newUser)
    {
        if (_users.Any(u => u.Username == newUser.Username))
            return BadRequest("Username already taken.");

        newUser.Id = _nextId++;
        _users.Add(newUser);
        StorageService.SaveToFile(FilePath, _users);

        return Ok(new { message = "User registered successfully!", user = newUser });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] User loginUser)
    {
        var user = _users.FirstOrDefault(u =>
            u.Username == loginUser.Username && u.Password == loginUser.Password);

        if (user == null)
            return Unauthorized("Invalid username or password.");

        StorageService.SaveToFile(FilePath, _users);

        return Ok(new { message = "Login successful!", user });
    }
}