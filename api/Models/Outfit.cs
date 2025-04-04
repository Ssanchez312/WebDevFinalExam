public class Outfit {
    public int Id { get; set; }
    public string Name { get; set; }
    public int UserId { get; set; }

    // public User? User { get; set; }
    public List<int> ClothingItemIds { get; set; } = new List<int>();
}