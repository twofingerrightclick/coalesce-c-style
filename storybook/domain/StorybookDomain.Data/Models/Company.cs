namespace StorybookDomain.Data.Models;

public class Company
{
    public int CompanyId { get; set; }

    [ListText, Search, Required]
    public required string Name { get; set; }

    public string? City { get; set; }

    [DataType(DataType.Url)]
    public string? Website { get; set; }

    [DataType(DataType.ImageUrl)]
    public string? LogoUrl { get; set; }

    public DateOnly? Founded { get; set; }

    public bool IsPublic { get; set; }

    public ICollection<Person>? Employees { get; set; }
}
