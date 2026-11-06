using System.ComponentModel;

namespace StorybookDomain.Data.Models;

/// <summary>Carries one property per c-input dispatch row.</summary>
[Description("A person in the directory. Covers every property type Coalesce renders.")]
public class Person
{
    public int PersonId { get; set; }

    [ListText, Search, Required, MaxLength(100)]
    [DefaultOrderBy(FieldOrder = 0)]
    public required string Name { get; set; }

    [Description("A few sentences about this person.")]
    [DataType(DataType.MultilineText)]
    public string? Bio { get; set; }

    [DataType(DataType.EmailAddress), Search]
    public string? Email { get; set; }

    [DataType(DataType.PhoneNumber)]
    public string? Phone { get; set; }

    [DataType(DataType.Url)]
    public string? Website { get; set; }

    [DataType(DataType.ImageUrl)]
    public string? AvatarUrl { get; set; }

    [DataType("Color")]
    public string? FavoriteColor { get; set; }

    [DataType(DataType.Password)]
    public string? Password { get; set; }

    [Range(0, 130)]
    public int? Age { get; set; }

    [Display(Name = "Salary (USD)")]
    public decimal? Salary { get; set; }

    public double? Rating { get; set; }

    public bool IsActive { get; set; }

    public PersonStatus Status { get; set; }

    public ICollection<Skill>? Skills { get; set; }

    [DateType(DateTypeAttribute.DateTypes.DateOnly)]
    public DateOnly? BirthDate { get; set; }

    public TimeOnly? StartTime { get; set; }

    public DateTimeOffset? LastLogin { get; set; }

    public DateTime CreatedAt { get; set; }

    public byte[]? Resume { get; set; }

    public int? CompanyId { get; set; }
    public Company? Company { get; set; }

    public int? ManagerId { get; set; }
    public Person? Manager { get; set; }

    [ManyToMany("Tags")]
    public ICollection<PersonTag>? PersonTags { get; set; }

    public ICollection<string>? Nicknames { get; set; }

    public ICollection<int>? LuckyNumbers { get; set; }

    [Coalesce, Description("Raises this person's level and returns a summary.")]
    public string Promote(string reason, int levels = 1, bool notify = false)
        => $"{Name} promoted {levels} level(s): {reason}";

    [Coalesce]
    public void Archive() => IsActive = false;

    [Coalesce]
    public ItemResult<Person> ChangeCompany(Company company)
    {
        Company = company;
        return this;
    }

    [Coalesce]
    public IFile DownloadCard() => new IntelliTect.Coalesce.Models.File(Resume ?? []) { Name = $"{Name}.vcf" };

    [Coalesce]
    public void UploadResume(IFile file) { }

    [Coalesce]
    public static ICollection<string> NicknameSuggestions(int page, string? search) => [];

    [Coalesce]
    public static ItemResult<int> CountActive(AppDbContext db) => db.People.Count(p => p.IsActive);

    [Coalesce]
    public static ItemResult<DateTimeOffset> ScheduleReview(DateOnly date, TimeOnly? time, PersonStatus status)
        => new DateTimeOffset(date.ToDateTime(time ?? TimeOnly.MinValue));

    [Coalesce]
    public static ItemResult FailingMethod() => "This method always fails.";
}

public enum PersonStatus
{
    [Description("Currently employed.")]
    Active,
    [Description("Away for a fixed period.")]
    OnLeave,
    [Display(Name = "Contractor (external)")]
    Contractor,
    Former,
}

public enum Skill
{
    Design,
    Engineering,
    Writing,
    Research,
    Sales,
    Support,
}
