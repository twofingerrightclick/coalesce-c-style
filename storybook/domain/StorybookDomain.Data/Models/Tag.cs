namespace StorybookDomain.Data.Models;

public class Tag
{
    public int TagId { get; set; }

    [ListText, Search, Required]
    public required string Name { get; set; }

    [DataType("Color")]
    public string? Color { get; set; }
}

public class PersonTag
{
    public int PersonTagId { get; set; }

    public int PersonId { get; set; }
    public Person? Person { get; set; }

    public int TagId { get; set; }
    public Tag? Tag { get; set; }
}
