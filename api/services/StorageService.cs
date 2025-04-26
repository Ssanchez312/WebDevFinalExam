// Services/StorageService.cs
using System.Text.Json;

public static class StorageService
{
    public static async Task SaveToFile<T>(string path, List<T> data)
    {
        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(path, json);
    }


    public static List<T> LoadFromFile<T>(string path)
    {
        if (!File.Exists(path)) return new List<T>();
        var json = File.ReadAllText(path);
        return JsonSerializer.Deserialize<List<T>>(json) ?? new List<T>();
    }
}
