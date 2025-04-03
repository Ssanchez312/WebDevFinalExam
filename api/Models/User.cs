public class User {
    public int Id { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }

    public ICollection<ClothingItem>? ClothingItems { get; set; } = new List<ClothingItem>();
    public ICollection<Outfit>? Outfits { get; set; } = new List<Outfit>();
}